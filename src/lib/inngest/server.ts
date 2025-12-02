import { serve } from 'inngest/next';
import { inngest } from './client';
import * as blingHandlers from './handlers/bling';

// Cada função precisa ter um nome único e um trigger/evento
export const { GET, POST, PUT } = serve({
  client: inngest,
  signingKey: process.env.INNGEST_SIGNING_KEY!,
  functions: [...Object.values(blingHandlers)],
});
