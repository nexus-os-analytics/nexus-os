import { IntegrationProvider } from '@prisma/client';
import type { InventoryProvider } from './types';
import { BlingInventoryProvider } from './bling-provider';
import { MeliInventoryProvider } from './meli-provider';

/**
 * Factory function that returns the appropriate InventoryProvider implementation
 * based on the IntegrationProvider enum value.
 *
 * This implements the Strategy pattern, allowing the application to work with
 * different inventory providers through a common interface.
 *
 * @param provider - The integration provider enum value
 * @returns An instance of the corresponding InventoryProvider implementation
 * @throws Error if the provider is not supported
 */
export function getInventoryProvider(
  provider: IntegrationProvider
): InventoryProvider {
  switch (provider) {
    case IntegrationProvider.BLING:
      return new BlingInventoryProvider();

    case IntegrationProvider.MERCADO_LIVRE:
      return new MeliInventoryProvider();

    default:
      throw new Error(`Unsupported integration provider: ${provider}`);
  }
}
