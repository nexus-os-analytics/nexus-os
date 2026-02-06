import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 6;
// const MIN_TOKEN_LENGTH = 6;

export const SignInSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
  password: z.string().min(MIN_PASSWORD_LENGTH, 'A senha deve ter pelo menos 6 caracteres'),
  remember: z.boolean().optional(),
});

export const SignUpSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.email({ message: 'E-mail inválido' }),
    password: z.string().min(MIN_PASSWORD_LENGTH, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, 'A confirmação de senha deve ter pelo menos 6 caracteres'),
    terms: z.literal(true, { message: 'Você deve aceitar os termos e condições' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const ForgotPasswordSchema = z.object({
  email: z.email({ message: 'E-mail inválido' }),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z.string().min(MIN_PASSWORD_LENGTH, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, 'A confirmação de senha deve ter pelo menos 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type SignInRequest = z.infer<typeof SignInSchema>;
export type SignUpRequest = z.infer<typeof SignUpSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
