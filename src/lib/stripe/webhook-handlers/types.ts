import type { Prisma } from '@prisma/client';
import type Stripe from 'stripe';

/**
 * Standard webhook handler signature
 * All handlers receive the Stripe event and a Prisma transaction client
 */
export type WebhookHandler = (event: Stripe.Event, tx: Prisma.TransactionClient) => Promise<void>;

/**
 * Helper type for extracting customer ID from various Stripe objects
 */
export type StripeCustomer = string | Stripe.Customer | Stripe.DeletedCustomer | null;

/**
 * Helper type for extracting subscription ID from various Stripe objects
 */
export type StripeSubscription = string | Stripe.Subscription | null;
