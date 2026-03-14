/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */

import { ShopeeSyncStatus } from '@prisma/client';
import crypto from 'node:crypto';
import pino from 'pino';
import prisma from '@/lib/prisma';

const logger = pino();

const PARTNER_ID = Number(process.env.SHOPEE_PARTNER_ID ?? '0');
const PARTNER_KEY = process.env.SHOPEE_PARTNER_KEY ?? '';

export type ShopeeIntegrationType = {
  id: string;
  shopId: string;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  connected_at: Date;
};

export class ShopeeIntegration {
  /**
   * Connect Shopee shop account
   */
  static async connectShopee(
    userId: string,
    tokens: {
      access_token: string;
      refresh_token: string;
      expire_in: number;
      shop_id: string;
    }
  ): Promise<ShopeeIntegrationType> {
    const integration = await prisma.shopeeIntegration.upsert({
      where: { userId },
      create: {
        userId,
        shopId: tokens.shop_id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expire_in * 1000),
        connectedAt: new Date(),
      },
      update: {
        shopId: tokens.shop_id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expire_in * 1000),
        connectedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SHOPEE_CONNECTED',
        resource: 'Integration',
      },
    });

    return ShopeeIntegration.mapToShopeeIntegration(integration);
  }

  /**
   * Disconnect Shopee account
   */
  static async disconnectShopee(userId: string): Promise<void> {
    await prisma.shopeeIntegration.deleteMany({ where: { userId } });

    await prisma.user.update({
      where: { id: userId },
      data: { shopeeSyncStatus: ShopeeSyncStatus.IDLE },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SHOPEE_DISCONNECTED',
        resource: 'Integration',
      },
    });
  }

  /**
   * Get user's Shopee integration
   */
  static async getShopeeIntegration(userId: string): Promise<ShopeeIntegrationType | null> {
    const integration = await prisma.shopeeIntegration.findUnique({ where: { userId } });
    return integration ? ShopeeIntegration.mapToShopeeIntegration(integration) : null;
  }

  /**
   * Check if Shopee token is still valid (expires > 5 min)
   */
  static async isShopeeTokenValid(userId: string): Promise<boolean> {
    const integration = await prisma.shopeeIntegration.findUnique({ where: { userId } });
    if (!integration) return false;
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return integration.expiresAt > fiveMinutesFromNow;
  }

  /**
   * Get valid Shopee tokens, auto-refreshing if expired
   */
  static async getValidShopeeTokens(
    userId: string
  ): Promise<{ access_token: string; shop_id: string }> {
    const isValid = await ShopeeIntegration.isShopeeTokenValid(userId);

    if (!isValid) {
      const integration = await prisma.shopeeIntegration.findUnique({ where: { userId } });
      if (!integration) throw new Error(`Shopee integration not found for user ${userId}`);

      const refreshed = await ShopeeIntegration.fetchAndRefreshShopeeTokens(
        integration.refreshToken,
        integration.shopId
      );

      await prisma.shopeeIntegration.update({
        where: { userId },
        data: {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token,
          expiresAt: new Date(Date.now() + refreshed.expire_in * 1000),
        },
      });

      return { access_token: refreshed.access_token, shop_id: integration.shopId };
    }

    const integration = await prisma.shopeeIntegration.findUnique({ where: { userId } });
    if (!integration) throw new Error(`Shopee integration not found for user ${userId}`);

    return { access_token: integration.accessToken, shop_id: integration.shopId };
  }

  /**
   * Refresh Shopee access token
   */
  static async fetchAndRefreshShopeeTokens(
    refreshToken: string,
    shopId: string
  ): Promise<{ access_token: string; refresh_token: string; expire_in: number }> {
    const path = '/auth/access_token/get';
    const timestamp = Math.floor(Date.now() / 1000);
    const baseString = `${PARTNER_ID}${path}${timestamp}`;
    const sign = crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');

    const baseUrl =
      process.env.SHOPEE_API_BASE_URL?.replace(/\/$/, '') ??
      'https://partner.shopeemobile.com/api/v2';

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partner_id: PARTNER_ID,
        refresh_token: refreshToken,
        shop_id: Number(shopId),
        sign,
        timestamp,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error(
        { status: response.status, body: text },
        '[ShopeeIntegration] Token refresh failed'
      );
      throw new Error('Failed to refresh Shopee token');
    }

    const data = await response.json();

    if (data.error) {
      logger.error(
        { error: data.error, message: data.message },
        '[ShopeeIntegration] Token refresh API error'
      );
      throw new Error(`Shopee token refresh error: ${data.message}`);
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expire_in: data.expire_in,
    };
  }

  private static mapToShopeeIntegration(integration: {
    id: string;
    shopId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    connectedAt: Date;
  }): ShopeeIntegrationType {
    return {
      id: integration.id,
      shopId: integration.shopId,
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
      expires_at: integration.expiresAt,
      connected_at: integration.connectedAt,
    };
  }
}
