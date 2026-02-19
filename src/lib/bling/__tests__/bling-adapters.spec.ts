import { describe, expect, it } from 'vitest';
import {
  adaptCategoryResponse,
  adaptProductsResponse,
  adaptSalesHistoryResponse,
  adaptStockBalanceResponse,
} from '@/lib/bling/bling-adapters';

describe('adaptProductsResponse', () => {
  it('returns empty array for non-array input', () => {
    expect(adaptProductsResponse(null as unknown as unknown[])).toEqual([]);
    expect(adaptProductsResponse(undefined as unknown as unknown[])).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(adaptProductsResponse([])).toEqual([]);
  });

  it('maps valid Bling product payload to BlingProductType', () => {
    const blingPayload = [
      {
        id: 1001,
        nome: 'Mouse Gamer RGB',
        codigo: 'SKU-001',
        precoCusto: 80,
        preco: 159.9,
        estoque: { saldoVirtualTotal: 25 },
        imagemURL: 'https://example.com/mouse.jpg',
        descricaoCurta: 'Mouse gamer',
      },
      {
        id: 1002,
        nome: 'Teclado',
        codigo: 'SKU-002',
        precoCusto: 150,
        preco: 299,
        estoque: {},
      },
    ];

    const result = adaptProductsResponse(blingPayload);

    expect(result).toHaveLength(2);

    expect(result[0].blingProductId).toBe(blingPayload[0].id);
    expect(result[0].name).toBe('Mouse Gamer RGB');
    expect(result[0].sku).toBe('SKU-001');
    expect(result[0].costPrice).toBe(80);
    expect(result[0].salePrice).toBe(159.9);
    expect(result[0].currentStock).toBe(25);
    expect(result[0].image).toBe('https://example.com/mouse.jpg');
    expect(result[0].shortDescription).toBe('Mouse gamer');
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].updatedAt).toBeInstanceOf(Date);

    expect(result[1].blingProductId).toBe(blingPayload[1].id);
    expect(result[1].name).toBe('Teclado');
    expect(result[1].currentStock).toBe(0);
    expect(result[1].image).toBeNull();
    expect(result[1].shortDescription).toBeNull();
  });
});

describe('adaptCategoryResponse', () => {
  it('returns empty array for non-array input', () => {
    expect(adaptCategoryResponse(null)).toEqual([]);
    expect(adaptCategoryResponse(undefined)).toEqual([]);
    expect(adaptCategoryResponse({})).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(adaptCategoryResponse([])).toEqual([]);
  });

  it('maps valid Bling categories to BlingCategoryType', () => {
    const blingPayload = [
      { id: 1, descricao: 'Eletrônicos', categoriaPai: null },
      { id: 2, descricao: 'Periféricos', categoriaPai: { id: 1 } },
    ];

    const result = adaptCategoryResponse(blingPayload);

    expect(result).toHaveLength(2);
    expect(result[0].blingCategoryId).toBe(blingPayload[0].id);
    expect(result[0].name).toBe('Eletrônicos');
    expect(result[0].blingParentId).toBeNull();
    expect(result[1].blingCategoryId).toBe(blingPayload[1].id);
    expect(result[1].name).toBe('Periféricos');
    expect(result[1].blingParentId).toBe(blingPayload[1].categoriaPai?.id ?? null);
  });

  it('uses "Sem categoria" when descricao is missing', () => {
    const result = adaptCategoryResponse([{ id: 99 }]);
    expect(result[0].name).toBe('Sem categoria');
  });
});

describe('adaptSalesHistoryResponse', () => {
  it('maps Bling sale payload to BlingSalesHistoryType[]', () => {
    const blingSale = {
      id: 5001,
      data: '2024-01-15T14:30:00',
      itens: [
        { produto: { id: 1001 }, quantidade: 2, valor: 180, desconto: 0 },
        { produto: { id: 1002 }, quantidade: 1, valor: 299, desconto: 10 },
      ],
    };

    const result = adaptSalesHistoryResponse(blingSale);

    expect(result).toHaveLength(2);
    expect(result[0].blingSaleId).toBe(5001);
    expect(result[0].blingProductId).toBe(1001);
    expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result[0].quantity).toBe(2);
    expect(result[0].totalValue).toBe(360);

    expect(result[1].blingProductId).toBe(1002);
    expect(result[1].quantity).toBe(1);
    expect(result[1].totalValue).toBe(289);
  });
});

describe('adaptStockBalanceResponse', () => {
  it('returns empty array for non-array input', () => {
    expect(adaptStockBalanceResponse(null as unknown as unknown[])).toEqual([]);
    expect(adaptStockBalanceResponse(undefined as unknown as unknown[])).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(adaptStockBalanceResponse([])).toEqual([]);
  });

  it('maps valid Bling stock balance payload to BlingStockBalanceType[]', () => {
    const blingPayload = [
      { produto: { id: 1001 }, saldoFisicoTotal: 10, saldoVirtualTotal: 12 },
      { produto: { id: 1002 }, saldoVirtualTotal: 5 },
    ];

    const result = adaptStockBalanceResponse(blingPayload);

    expect(result).toHaveLength(2);
    expect(result[0].blingProductId).toBe(1001);
    expect(result[0].stock).toBe(10);
    expect(result[1].blingProductId).toBe(1002);
    expect(result[1].stock).toBe(5);
  });

  it('uses saldoVirtualTotal when saldoFisicoTotal is missing', () => {
    const result = adaptStockBalanceResponse([
      { produto: { id: 99 }, saldoVirtualTotal: 7 },
    ]);
    expect(result[0].stock).toBe(7);
  });
});
