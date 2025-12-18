import { z } from 'zod';

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 120;
const EMAIL_MAX_LENGTH = 254;

export const InviteUserSchema = z.object({
  name: z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
  email: z.string().email({ message: 'E-mail inválido' }).max(EMAIL_MAX_LENGTH),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).default('USER'),
});

export type InviteUserInput = z.infer<typeof InviteUserSchema>;
