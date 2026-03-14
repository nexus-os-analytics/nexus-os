import type {
  ShopeeApiCategory,
  ShopeeApiItem,
  ShopeeApiOrder,
  ShopeeCategoryType,
  ShopeeProductType,
  ShopeeSalesHistoryType,
  ShopeeStockBalanceType,
} from './shopee-types';

/**
 * Adapt Shopee API item response to internal product type
 */
export function adaptProductsResponse(items: ShopeeApiItem[]): ShopeeProductType[] {
  return items.map((item) => {
    const imageUrl = item.image?.image_url_list?.[0] ?? null;
    const priceInfo = item.price_info?.[0];
    const salePrice = priceInfo?.current_price ?? priceInfo?.original_price ?? 0;
    const availableStock = item.stock_info_v2?.summary_info?.total_available_stock ?? 0;

    return {
      id: '',
      shopeeItemId: String(item.item_id),
      shopeeCategoryId: item.category_id ? String(item.category_id) : null,
      title: item.item_name,
      sku: item.item_sku || null,
      costPrice: 0, // Shopee API does not expose cost price — must be set by user
      salePrice,
      currentStock: availableStock,
      thumbnail: imageUrl,
      permalink: null,
      status: item.item_status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

/**
 * Adapt Shopee API category response to internal category type
 */
export function adaptCategoryResponse(categories: ShopeeApiCategory[]): ShopeeCategoryType[] {
  return categories.map((cat) => ({
    id: '',
    name: cat.display_category_name,
    shopeeCategoryId: String(cat.category_id),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

/**
 * Adapt a Shopee order to internal sales history entries (one per item)
 */
export function adaptSalesHistoryResponse(order: ShopeeApiOrder): ShopeeSalesHistoryType[] {
  const date = new Date(order.create_time * 1000);

  return order.item_list.map((item) => ({
    id: '',
    shopeeOrderSn: order.order_sn,
    shopeeItemId: String(item.item_id),
    date,
    quantity: item.model_quantity_purchased,
    totalValue: item.model_quantity_purchased * item.model_discounted_price,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

/**
 * Adapt Shopee item stock to internal stock balance type
 */
export function adaptStockBalanceResponse(
  itemId: string,
  availableQuantity: number
): ShopeeStockBalanceType {
  return {
    id: '',
    shopeeItemId: itemId,
    stock: availableQuantity,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
