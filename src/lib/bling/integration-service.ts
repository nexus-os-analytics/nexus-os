/** biome-ignore-all lint/complexity/noStaticOnlyClass: <explanation> */
import prisma from '@/lib/prisma';

export interface BlingIntegration {
  id: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
  scope: string;
  connected_at: Date;
}

export class IntegrationService {
  /**
   * Conectar conta Bling
   *
   * @param userId
   * @param tokens
   * @returns {Promise<BlingIntegration>}
   */
  static async connectBling(
    userId: string,
    tokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      scope: string;
    }
  ): Promise<BlingIntegration> {
    const integration = await prisma.blingIntegration.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        tokenType: tokens.token_type,
        scope: tokens.scope,
        connectedAt: new Date(),
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        tokenType: tokens.token_type,
        scope: tokens.scope,
        connectedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'BLING_CONNECTED',
        resource: 'Integration',
      },
    });

    return IntegrationService.mapToBlingIntegration(integration);
  }

  /**
   * Desconectar conta Bling
   *
   * @param userId
   * @returns {Promise<void>}
   */
  static async disconnectBling(userId: string): Promise<void> {
    await prisma.blingIntegration.delete({
      where: { userId },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'BLING_DISCONNECTED',
        resource: 'Integration',
      },
    });
  }

  /**
   * Obter integração Bling do usuário
   * @param userId
   * @returns {Promise<BlingIntegration | null>}
   */
  static async getBlingIntegration(userId: string): Promise<BlingIntegration | null> {
    const integration = await prisma.blingIntegration.findUnique({
      where: { userId },
    });

    return integration ? IntegrationService.mapToBlingIntegration(integration) : null;
  }

  /**
   * Verificar se o token Bling é válido
   * @param userId
   * @returns {Promise<boolean>}
   */
  static async isBlingTokenValid(userId: string): Promise<boolean> {
    const integration = await prisma.blingIntegration.findUnique({
      where: { userId },
    });

    if (!integration) return false;

    // Verifica se o token expira em pelo menos 5 minutos
    return integration.expiresAt > new Date(Date.now() + 5 * 60 * 1000);
  }

  /**
   * Obter tokens válidos, atualizando se necessário
   * @param userId
   * @returns {Promise<BlingIntegration>}
   */
  static async getValidBlingTokens(userId: string): Promise<BlingIntegration> {
    const integration = await IntegrationService.getBlingIntegration(userId);
    if (!integration) throw new Error('Bling integration not found');

    const expiresIn = integration.expires_at * 1000 - Date.now();
    if (expiresIn < 5 * 60 * 1000) {
      return IntegrationService.fetchAndRefreshBlingTokens(userId);
    }

    return integration;
  }

  /**
   * Obter integração Bling do usuário
   * @param userId - ID do usuário da sessão atual
   * @param endpoint - Endpoint da API do Bling (ex: /produtos)
   * @param options - Opções da requisição (método, headers, body, etc.)
   * @returns {Promise<any>}
   */
  static async request(userId: string, endpoint: string, options: RequestInit = {}) {
    const { access_token } = await IntegrationService.getValidBlingTokens(userId);

    const res = await fetch(`https://www.bling.com.br/Api/v3${endpoint}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bling API Error (${res.status}): ${text}`);
    }

    return res.json();
  }

  /**
   * Atualizar os tokens Bling no banco de dados
   * @param userId
   * @param newTokens
   * @returns
   */
  static async refreshBlingTokens(
    userId: string,
    newTokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      scope: string;
    }
  ): Promise<BlingIntegration> {
    const integration = await prisma.blingIntegration.update({
      where: { userId },
      data: {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
        expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
        tokenType: newTokens.token_type,
        scope: newTokens.scope,
      },
    });

    return IntegrationService.mapToBlingIntegration(integration);
  }

  /**
   * Buscar e atualizar tokens Bling usando o refresh token
   * @param userId
   * @returns
   */
  static async fetchAndRefreshBlingTokens(userId: string): Promise<BlingIntegration> {
    const integration = await prisma.blingIntegration.findUnique({ where: { userId } });
    if (!integration) throw new Error('Integration not found');

    const basicAuth = Buffer.from(
      `${process.env.BLING_CLIENT_ID}:${process.env.BLING_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: integration.refreshToken,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to refresh Bling token: ${text}`);
    }

    const data = await response.json();

    return IntegrationService.refreshBlingTokens(userId, {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? integration.refreshToken,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
    });
  }

  /**
   * Mapear integração do Prisma para o formato BlingIntegration
   * @param integration
   * @returns
   */
  private static mapToBlingIntegration(integration: any): BlingIntegration {
    return {
      id: integration.id,
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
      expires_at: Math.floor(integration.expiresAt.getTime() / 1000),
      token_type: integration.tokenType,
      scope: integration.scope,
      connected_at: integration.connectedAt,
    };
  }
}
