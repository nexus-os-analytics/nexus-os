'use server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import { BlingIntegration } from '@/lib/bling/bling-integration';

interface HomologationStepResult {
  step: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  status: number | null;
  ok: boolean;
  durationMs: number;
  body?: unknown;
  error?: string;
}

interface HomologationRunResult {
  success: boolean;
  startedAt: string;
  finishedAt: string;
  steps: HomologationStepResult[];
}

function withHash(endpoint: string): string {
  const hash = process.env.BLING_HOMOLOGATION_HASH;
  if (!hash) return endpoint;
  const hasQuery = endpoint.includes('?');
  const sep = hasQuery ? '&' : '?';
  return `${endpoint}${sep}hash=${encodeURIComponent(hash)}`;
}

async function doRequest(
  userId: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: unknown
): Promise<{ status: number; json: unknown }> {
  const { access_token } = await BlingIntegration.getValidBlingTokens(userId);
  const url = `https://www.bling.com.br/Api/v3${withHash(endpoint)}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      ...(process.env.BLING_HOMOLOGATION_HASH
        ? { 'X-Homologation-Hash': process.env.BLING_HOMOLOGATION_HASH }
        : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = await res.text();
  }
  return { status: res.status, json };
}

function buildTestProductPayload() {
  const ts = Date.now();
  return {
    descricao: `Homologação Nexus OS ${ts}`,
    codigo: `NXS-HOMO-${ts}`,
    tipo: 'P',
    preco: 10.0,
    precoCusto: 5.0,
    situacao: 'A',
    formato: 'SIMPLES',
    unidade: 'UN',
    pesoBruto: 0.2,
    pesoLiquido: 0.18,
    volumes: 1,
    estoqueMinimo: 1,
  };
}

export async function runBlingHomologation(): Promise<HomologationRunResult> {
  const startedAt = new Date();
  const steps: HomologationStepResult[] = [];

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      success: false,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      steps: [
        {
          step: 'auth',
          method: 'GET',
          endpoint: '/oauth/token',
          status: 401,
          ok: false,
          durationMs: 0,
          error: 'Não autorizado',
        },
      ],
    };
  }

  const userId = session.user.id;
  let createdProductId: string | number | null = null;

  // 1) POST /produtos
  {
    const t0 = performance.now();
    try {
      const payload = buildTestProductPayload();
      const { status, json } = await doRequest(userId, 'POST', '/produtos', payload);
      const t1 = performance.now();
      // Try to extract ID from typical Bling response shape
      const id = (json as any)?.data?.id ?? (json as any)?.id ?? null;
      createdProductId = id;
      steps.push({
        step: 'create-product',
        method: 'POST',
        endpoint: '/produtos',
        status,
        ok: status >= 200 && status < 300,
        durationMs: Math.round(t1 - t0),
        body: json,
      });
    } catch (err: any) {
      const t1 = performance.now();
      steps.push({
        step: 'create-product',
        method: 'POST',
        endpoint: '/produtos',
        status: null,
        ok: false,
        durationMs: Math.round(t1 - t0),
        error: err?.message ?? String(err),
      });
    }
  }

  // 2) GET /produtos/{id}
  if (createdProductId) {
    const t0 = performance.now();
    try {
      const { status, json } = await doRequest(
        userId,
        'GET',
        `/produtos/${encodeURIComponent(String(createdProductId))}`
      );
      const t1 = performance.now();
      steps.push({
        step: 'get-product',
        method: 'GET',
        endpoint: `/produtos/${encodeURIComponent(String(createdProductId))}`,
        status,
        ok: status >= 200 && status < 300,
        durationMs: Math.round(t1 - t0),
        body: json,
      });
    } catch (err: any) {
      const t1 = performance.now();
      steps.push({
        step: 'get-product',
        method: 'GET',
        endpoint: `/produtos/${encodeURIComponent(String(createdProductId))}`,
        status: null,
        ok: false,
        durationMs: Math.round(t1 - t0),
        error: err?.message ?? String(err),
      });
    }
  }

  // 3) PUT /produtos/{id}
  if (createdProductId) {
    const t0 = performance.now();
    try {
      const { status, json } = await doRequest(
        userId,
        'PUT',
        `/produtos/${encodeURIComponent(String(createdProductId))}`,
        { preco: 12.5, descricao: `Homologação Nexus OS (put)` }
      );
      const t1 = performance.now();
      steps.push({
        step: 'update-product-put',
        method: 'PUT',
        endpoint: `/produtos/${encodeURIComponent(String(createdProductId))}`,
        status,
        ok: status >= 200 && status < 300,
        durationMs: Math.round(t1 - t0),
        body: json,
      });
    } catch (err: any) {
      const t1 = performance.now();
      steps.push({
        step: 'update-product-put',
        method: 'PUT',
        endpoint: `/produtos/${encodeURIComponent(String(createdProductId))}`,
        status: null,
        ok: false,
        durationMs: Math.round(t1 - t0),
        error: err?.message ?? String(err),
      });
    }
  }

  // 4) PATCH /produtos/{id}
  if (createdProductId) {
    const t0 = performance.now();
    try {
      const { status, json } = await doRequest(
        userId,
        'PATCH',
        `/produtos/${encodeURIComponent(String(createdProductId))}`,
        { descricao: `Homologação Nexus OS (patch)` }
      );
      const t1 = performance.now();
      steps.push({
        step: 'update-product-patch',
        method: 'PATCH',
        endpoint: `/produtos/${encodeURIComponent(String(createdProductId))}`,
        status,
        ok: status >= 200 && status < 300,
        durationMs: Math.round(t1 - t0),
        body: json,
      });
    } catch (err: any) {
      const t1 = performance.now();
      steps.push({
        step: 'update-product-patch',
        method: 'PATCH',
        endpoint: `/produtos/${encodeURIComponent(String(createdProductId))}`,
        status: null,
        ok: false,
        durationMs: Math.round(t1 - t0),
        error: err?.message ?? String(err),
      });
    }
  }

  // 5) DELETE /produtos/{id}
  if (createdProductId) {
    const t0 = performance.now();
    try {
      const { status, json } = await doRequest(
        userId,
        'DELETE',
        `/produtos/${encodeURIComponent(String(createdProductId))}`
      );
      const t1 = performance.now();
      steps.push({
        step: 'delete-product',
        method: 'DELETE',
        endpoint: `/produtos/${encodeURIComponent(String(createdProductId))}`,
        status,
        ok: status >= 200 && status < 300,
        durationMs: Math.round(t1 - t0),
        body: json,
      });
    } catch (err: any) {
      const t1 = performance.now();
      steps.push({
        step: 'delete-product',
        method: 'DELETE',
        endpoint: `/produtos/${encodeURIComponent(String(createdProductId))}`,
        status: null,
        ok: false,
        durationMs: Math.round(t1 - t0),
        error: err?.message ?? String(err),
      });
    }
  }

  const finishedAt = new Date();
  const success = steps.every((s) => s.ok);
  return {
    success,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    steps,
  };
}
