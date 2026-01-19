import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pino from 'pino';
import { BlingIntegration } from '@/lib/bling';
import { authOptions } from '@/lib/next-auth';

const logger = pino().child({ module: 'bling-homologation-route' });

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const integration = await BlingIntegration.getBlingIntegration(userId);
    if (!integration) {
      return NextResponse.json({ error: 'Integração com Bling não encontrada' }, { status: 400 });
    }

    logger.info('Iniciando homologação do Bling para o usuário %s', userId);

    const baseUrl = 'https://api.bling.com.br/Api/v3';

    // Helper to safely parse JSON or return text/empty
    const parseJsonOrText = async (res: Response): Promise<unknown> => {
      const contentType = res.headers.get('content-type') ?? '';
      const isJson = contentType.includes('application/json');
      const text = await res.text();
      if (!text) return isJson ? {} : '';
      try {
        return isJson ? JSON.parse(text) : text;
      } catch {
        return isJson ? { parseError: true, raw: text } : text;
      }
    };

    // Step 1: GET homologation product (use current valid token)
    const { access_token: tokenGet } = await BlingIntegration.getValidBlingTokens(userId);
    const getRes = await fetch(`${baseUrl}/homologacao/produtos`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenGet}`,
        Accept: 'application/json',
      },
    });
    const getJson = await parseJsonOrText(getRes);
    const xHomolog = getRes.headers.get('x-bling-homologacao');
    logger.info({ response: getJson }, 'Produto de homologação obtido com sucesso');

    // Refresh token after GET, per requirement
    const { access_token: tokenPost } = await BlingIntegration.fetchAndRefreshBlingTokens(userId);

    // Step 2: POST homologation
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      typeof v === 'object' && v !== null && !Array.isArray(v);
    const payload =
      isRecord(getJson) && 'data' in getJson ? (getJson as { data?: unknown }).data : undefined;
    const postRes = await fetch(`${baseUrl}/homologacao/produtos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPost}`,
        ...(xHomolog ? { 'x-bling-homologacao': xHomolog } : {}),
      },
      body: JSON.stringify(payload ?? {}),
    });
    const postJson = await parseJsonOrText(postRes);
    const xHomologPost = postRes.headers.get('x-bling-homologacao');
    logger.info({ response: postJson }, 'POST de homologação enviado com sucesso');

    // Refresh token after POST
    const { access_token: tokenPut } = await BlingIntegration.fetchAndRefreshBlingTokens(userId);

    // Step 3: PUT homologation
    const extractProductId = (v: unknown): string | number | undefined => {
      if (isRecord(v)) {
        const data = 'data' in v ? (v as Record<string, unknown>).data : undefined;
        if (isRecord(data) && 'id' in data) {
          const id = (data as Record<string, unknown>).id;
          if (typeof id === 'string' || typeof id === 'number') return id;
        }
        if ('id' in v) {
          const id = (v as Record<string, unknown>).id;
          if (typeof id === 'string' || typeof id === 'number') return id;
        }
      }
      return undefined;
    };
    const productId = extractProductId(postJson);
    if (productId === undefined) {
      logger.error({ postJson }, 'Não foi possível extrair o ID do produto de homologação');
      return NextResponse.json(
        { success: false, error: 'Falha ao extrair ID do produto de homologação' },
        { status: 502 }
      );
    }
    const putRes = await fetch(`${baseUrl}/homologacao/produtos/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPut}`,
        ...(xHomologPost ? { 'x-bling-homologacao': xHomologPost } : {}),
      },
      body: JSON.stringify({
        nome: 'Copo',
        preco: 32.56,
        codigo: 'COD-4587',
      }),
    });
    const putJson = await parseJsonOrText(putRes);
    const xHomologPut = putRes.headers.get('x-bling-homologacao');
    logger.info({ response: putJson }, 'PUT de homologação enviado com sucesso');

    // Refresh token after PUT
    const { access_token: tokenPatch } = await BlingIntegration.fetchAndRefreshBlingTokens(userId);

    // Step 4: PATCH homologation
    const patchRes = await fetch(`${baseUrl}/homologacao/produtos/${productId}/situacoes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPatch}`,
        ...(xHomologPut ? { 'x-bling-homologacao': xHomologPut } : {}),
      },
      body: JSON.stringify({ situacao: 'I' }),
    });
    const patchJson = await parseJsonOrText(patchRes);
    const xHomologPatch = patchRes.headers.get('x-bling-homologacao');
    logger.info({ response: patchJson }, 'PATCH de homologação enviado com sucesso');

    // Refresh token after PATCH
    const { access_token: tokenDelete } = await BlingIntegration.fetchAndRefreshBlingTokens(userId);

    // Step 5: DELETE homologation
    const deleteRes = await fetch(`${baseUrl}/homologacao/produtos/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenDelete}`,
        ...(xHomologPatch ? { 'x-bling-homologacao': xHomologPatch } : {}),
      },
    });
    const deleteJson = await parseJsonOrText(deleteRes);
    logger.info({ response: deleteJson }, 'DELETE de homologação enviado com sucesso');

    const steps = {
      get: { status: getRes.status, data: getJson },
      post: { status: postRes.status, data: postJson },
      put: { status: putRes.status, data: putJson },
      patch: { status: patchRes.status, data: patchJson },
      delete: { status: deleteRes.status, data: deleteJson },
    };

    const success = [getRes, postRes, putRes, patchRes, deleteRes].every((r) => r.ok);

    return NextResponse.json({ success, steps });
  } catch (error) {
    const err = error instanceof Error ? error : { error };
    logger.error(err, 'Erro ao executar homologação do Bling:');
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
