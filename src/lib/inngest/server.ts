import { serve } from 'inngest/next';
import { inngest } from './client';
import * as billingHandlers from './handlers/billing';
import * as blingHandlers from './handlers/bling';
import * as meliHandlers from './handlers/meli';

// Cada função precisa ter um nome único e um trigger/evento
export const { GET, POST, PUT } = serve({
  client: inngest,
  signingKey: process.env.INNGEST_SIGNING_KEY!,
  functions: [
    ...Object.values(blingHandlers),
    ...Object.values(meliHandlers),
    ...Object.values(billingHandlers),
  ],
});
