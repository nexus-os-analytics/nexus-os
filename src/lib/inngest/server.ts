import { serve } from 'inngest/next';
import { inngest } from './client';
import { generateAlerts } from './handlers/generate-alerts';
import { syncAllUsers, syncUserProducts } from './handlers/sync-products';

// Cada função precisa ter um nome único e um trigger/evento
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncAllUsers, syncUserProducts, generateAlerts],
});
