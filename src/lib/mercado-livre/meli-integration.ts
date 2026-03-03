/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */

import { MeliSyncStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export type MeliIntegrationType = {
  id: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
  meliUserId: string;
  connected_at: Date;
};

export class MeliIntegration {
  /**
   * Connect Mercado Livre account
   */
  static async connectMeli(
    userId: string,
    tokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      user_id: number;
      scope: string;
    }
  ): Promise<MeliIntegrationType> {
    const integration = await prisma.meliIntegration.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        tokenType: tokens.token_type,
        meliUserId: tokens.user_id.toString(),
        scope: tokens.scope,
        connectedAt: new Date(),
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        tokenType: tokens.token_type,
        meliUserId: tokens.user_id.toString(),
        scope: tokens.scope,
        connectedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'MELI_CONNECTED',
        resource: 'Integration',
      },
    });

    return MeliIntegration.mapToMeliIntegration(integration);
  }

  /**
   * Disconnect Mercado Livre account
   */
  static async disconnectMeli(userId: string): Promise<void> {
    await prisma.meliIntegration.deleteMany({
      where: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { meliSyncStatus: MeliSyncStatus.IDLE },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'MELI_DISCONNECTED',
        resource: 'Integration',
      },
    });
  }

  /**
   * Get user's Mercado Livre integration
   */
  static async getMeliIntegration(userId: string): Promise<MeliIntegrationType | null> {
    const integration = await prisma.meliIntegration.findUnique({
      where: { userId },
    });

    return integration ? MeliIntegration.mapToMeliIntegration(integration) : null;
  }

  /**
   * Check if Mercado Livre token is valid
   */
  static async isMeliTokenValid(userId: string): Promise<boolean> {
    const integration = await prisma.meliIntegration.findUnique({
      where: { userId },
    });

    if (!integration) return false;

    // Check if token expires in at least 5 minutes
    return integration.expiresAt > new Date(Date.now() + 5 * 60 * 1000);
  }

  /**
   * Get valid tokens, refreshing if necessary
   */
  static async getValidMeliTokens(userId: string): Promise<MeliIntegrationType> {
    const integration = await MeliIntegration.getMeliIntegration(userId);
    if (!integration) throw new Error('Mercado Livre integration not found');

    const expiresIn = integration.expires_at * 1000 - Date.now();
    if (expiresIn < 5 * 60 * 1000) {
      return MeliIntegration.fetchAndRefreshMeliTokens(userId);
    }

    return integration;
  }

  /**
   * Make authenticated request to Mercado Livre API
   */
  static async request(userId: string, endpoint: string, options: RequestInit = {}) {
    const { access_token } = await MeliIntegration.getValidMeliTokens(userId);

    const baseUrl = process.env.MELI_API_BASE_URL ?? 'https://api.mercadolibre.com';
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Mercado Livre API Error (${res.status}): ${text}`);
    }

    return res.json();
  }

  /**
   * Refresh Mercado Livre tokens in database
   */
  static async refreshMeliTokens(
    userId: string,
    newTokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      user_id: number;
      scope: string;
    }
  ): Promise<MeliIntegrationType> {
    const integration = await prisma.meliIntegration.update({
      where: { userId },
      data: {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
        expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
        tokenType: newTokens.token_type,
        meliUserId: newTokens.user_id.toString(),
        scope: newTokens.scope,
      },
    });

    return MeliIntegration.mapToMeliIntegration(integration);
  }

  /**
   * Fetch and refresh Mercado Livre tokens using refresh token
   */
  static async fetchAndRefreshMeliTokens(userId: string): Promise<MeliIntegrationType> {
    const integration = await prisma.meliIntegration.findUnique({ where: { userId } });
    if (!integration) throw new Error('Integration not found');

    const tokenUrl = process.env.MELI_TOKEN_URL ?? 'https://api.mercadolibre.com/oauth/token';

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.MELI_CLIENT_ID!,
        client_secret: process.env.MELI_CLIENT_SECRET!,
        refresh_token: integration.refreshToken,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to refresh Mercado Livre token: ${text}`);
    }

    const data = await response.json();

    return MeliIntegration.refreshMeliTokens(userId, {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? integration.refreshToken,
      expires_in: data.expires_in,
      token_type: data.token_type,
      user_id: parseInt(integration.meliUserId),
      scope: data.scope ?? integration.scope,
    });
  }

  /**
   * Map Prisma integration to MeliIntegrationType format
   */
  private static mapToMeliIntegration(integration: any): MeliIntegrationType {
    return {
      id: integration.id,
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
      expires_at: Math.floor(integration.expiresAt.getTime() / 1000),
      token_type: integration.tokenType,
      meliUserId: integration.meliUserId,
      connected_at: integration.connectedAt,
    };
  }
}
