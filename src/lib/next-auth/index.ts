import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { authenticator } from 'otplib';
import {
  LOCK_OUT_DURATION_MINUTES,
  LOCK_OUT_THRESHOLD,
  ONE_DAY_IN_SECONDS,
  THIRTY_MINUTES_IN_SECONDS,
} from '@/lib/constants';
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/sign-in',
    error: '/sign-in?error=invalid_credentials',
  },

  session: {
    strategy: 'jwt',
    maxAge: ONE_DAY_IN_SECONDS,
    updateAge: THIRTY_MINUTES_IN_SECONDS,
  },

  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        code: { label: '2FA Code', type: 'text' },
      },
      authorize: async (credentials, req) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciais inválidas');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error('Credenciais inválidas');
        }

        if (user.deletedAt) {
          throw new Error('Conta desativada. Entre em contato com o suporte.');
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error('Conta bloqueada. Tente novamente mais tarde.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isValid) {
          // Atualiza tentativas e bloqueios
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: { increment: 1 },
              lockedUntil:
                user.failedAttempts + 1 >= LOCK_OUT_THRESHOLD
                  ? new Date(Date.now() + LOCK_OUT_DURATION_MINUTES)
                  : user.lockedUntil,
            },
          });

          // Registra incidente de segurança
          await prisma.securityIncident.create({
            data: {
              userId: user.id,
              type: 'FAILED_LOGIN',
              details: `Failed login from IP ${req?.headers?.['x-forwarded-for'] || 'unknown'}`,
            },
          });

          throw new Error('Credenciais inválidas');
        }

        // Se o usuário tem 2FA ativo, o código deve estar presente
        if (user.isTwoFactorEnabled) {
          if (!credentials.code) {
            return { id: user.id, role: UserRole.GUEST, required2FA: true };
          }

          const isCodeValid = authenticator.verify({
            token: credentials.code,
            secret: user.twoFactorSecret!,
          });

          if (!isCodeValid) {
            await prisma.securityIncident.create({
              data: {
                userId: user.id,
                type: 'FAILED_2FA',
                details: `Invalid 2FA token from IP ${req?.headers?.['x-forwarded-for'] || 'unknown'}`,
              },
            });

            throw new Error('Código de verificação inválido');
          }
        }

        // Login bem-sucedido — resetar contadores
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: 0,
            lockedUntil: null,
          },
        });

        // Registrar atividade de login
        const ipHeader = req?.headers?.['x-forwarded-for'];
        const ip = Array.isArray(ipHeader) ? ipHeader[0] : ipHeader || 'unknown';

        await prisma.loginActivity.create({
          data: {
            userId: user.id,
            ip,
            device: req?.headers?.['user-agent'] || 'unknown',
            successful: true,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          onboardingCompleted: user.onboardingCompleted,
          required2FA: false,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: UserRole.USER,
          onboardingCompleted: false,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Bloquear login se o email não for verificado pelo Google
      if (account?.provider === 'google' && !profile?.email) {
        throw new Error('Email não verificado pelo Google');
      }

      // Para usuários OAuth (Google)
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // Verificar se usuário existe e está ativo
          if (existingUser) {
            if (existingUser.deletedAt) {
              throw new Error('Conta desativada. Entre em contato com o suporte.');
            }

            if (existingUser.lockedUntil && existingUser.lockedUntil > new Date()) {
              throw new Error('Conta bloqueada. Tente novamente mais tarde.');
            }

            // Atualizar dados do usuário existente
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: new Date(),
                failedAttempts: 0,
                lockedUntil: null,
              },
            });

            // Registrar auditoria
            await prisma.auditLog.create({
              data: {
                userId: existingUser.id,
                action: 'OAUTH_LOGIN',
                resource: 'User',
              },
            });
          } else {
            // Novo usuário será criado pelo adapter do NextAuth
            // O audit log será criado no jwt callback
          }

          return true;
        } catch (error) {
          console.error('Error in Google signIn:', error);
          return false;
        }
      }

      // Para credentials, permitir login normalmente
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // Primeiro login com OAuth
      if (account?.provider === 'google' && user) {
        try {
          // Buscar usuário completo (já criado pelo adapter)
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.image = dbUser.image;
            token.onboardingCompleted = dbUser.onboardingCompleted;

            // Criar audit log para novo usuário OAuth
            if (!token.auditCreated) {
              await prisma.auditLog.create({
                data: {
                  userId: dbUser.id,
                  action: 'SIGN_UP',
                  resource: 'User',
                },
              });
              token.auditCreated = true;
            }
          }
        } catch (error) {
          console.error('Error in JWT callback for OAuth:', error);
        }
      }
      // Login com credentials
      else if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.image = user.image;
        token.onboardingCompleted = user.onboardingCompleted;
        token.required2FA = user.required2FA;
      }

      // Atualizar sessão se necessário
      if (trigger === 'update') {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        if (updatedUser) {
          token.name = updatedUser.name;
          token.image = updatedUser.image;
          token.role = updatedUser.role;
          token.onboardingCompleted = updatedUser.onboardingCompleted;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name,
          email: token.email,
          role: token.role as UserRole,
          image: token.image as string,
          onboardingCompleted: token.onboardingCompleted as boolean,
        };
        session.required2FA = token.required2FA as boolean;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, account }) {
      // Registrar login activity para OAuth (não capturado no authorize)
      if (account?.provider === 'google') {
        await prisma.loginActivity.create({
          data: {
            userId: user.id,
            ip: 'unknown', // NextAuth não fornece IP no evento
            device: 'unknown',
            successful: true,
          },
        });
      }
    },
    async createUser({ user }) {
      // Audit log para novo usuário OAuth será criado no JWT callback
      // para garantir que temos o ID do usuário
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'SIGN_UP',
          resource: 'User',
        },
      });
    },
  },
};
