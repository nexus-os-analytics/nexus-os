import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'nexus-os',
  name: 'Nexus OS Inngest',
  eventKey: process.env.INNGEST_EVENT_KEY!,
});
