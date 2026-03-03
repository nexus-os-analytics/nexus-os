import type {
  MeliApiCategory,
  MeliApiItem,
  MeliApiOrder,
  MeliCategoryType,
  MeliProductType,
  MeliSalesHistoryType,
  MeliStockBalanceType,
} from './meli-types';

/**
 * Adapt Mercado Livre API item response to internal product type
 */
export function adaptProductsResponse(items: MeliApiItem[]): MeliProductType[] {
  return items.map((item) => {
    const imageUrl = item.pictures?.[0]?.url ?? item.thumbnail ?? null;
    const sku = item.seller_custom_field ?? item.id;

    return {
      id: '', // Will be set by database
      meliItemId: item.id,
      meliCategoryId: item.category_id,
      title: item.title,
      sku,
      costPrice: 0, // ML API doesn't expose cost - must be set by user or estimated
      salePrice: item.price,
      currentStock: item.available_quantity,
      thumbnail: imageUrl,
      permalink: null,
      listingType: null,
      status: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

/**
 * Adapt Mercado Livre API category response to internal category type
 */
export function adaptCategoryResponse(categories: MeliApiCategory[]): MeliCategoryType[] {
  return categories.map((cat) => ({
    id: '', // Will be set by database
    name: cat.name,
    meliCategoryId: cat.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

/**
 * Adapt Mercado Livre API order response to internal sales history type
 */
export function adaptSalesHistoryResponse(order: MeliApiOrder): MeliSalesHistoryType[] {
  return order.order_items.map((orderItem) => ({
    id: '', // Will be set by database
    meliOrderId: order.id.toString(),
    meliItemId: orderItem.item.id,
    date: new Date(order.date_closed ?? order.date_created),
    quantity: orderItem.quantity,
    totalValue: orderItem.quantity * orderItem.unit_price,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

/**
 * Adapt Mercado Livre item stock to internal stock balance type
 */
export function adaptStockBalanceResponse(
  itemId: string,
  availableQuantity: number
): MeliStockBalanceType {
  return {
    id: '', // Will be set by database
    meliItemId: itemId,
    stock: availableQuantity,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
