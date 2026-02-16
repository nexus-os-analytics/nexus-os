# PRD: Stripe Webhook Resilience & Plan Tier Update Reliability

## Introduction

Improve the reliability of Stripe webhook payment processing to ensure subscription upgrades complete successfully even when external services (email, notifications) fail. Currently, email delivery failures during the checkout.session.completed webhook can impact the critical flow of updating user plan tiers, potentially leaving users in an inconsistent state where payment succeeded but their account wasn't upgraded.

**Problem Statement:**
During payment confirmation, a Brevo email delivery failure (401 Unauthorized - IP restriction) occurred. While the email error was caught and logged, the synchronous email operation within the database transaction creates unnecessary coupling between critical database operations and non-critical external service calls. This architectural pattern introduces risk: if email failures throw exceptions or if the transaction context is disrupted, the user's planTier update could fail despite successful payment.

**Root Causes Identified from Logs:**

1. Email sending (external service) executed synchronously within database transaction
2. External service failures can impact the critical path of subscription updates
3. No retry mechanism for failed email deliveries
4. Insufficient structured logging to track planTier state changes
5. Missing background job queue for non-critical operations

## Goals

- **Guarantee** planTier updates succeed when Stripe confirms payment, regardless of external service status
- Decouple critical database operations from non-critical external service calls (emails, notifications)
- Implement reliable asynchronous email delivery with automatic retry
- Improve observability with structured logging for payment flow debugging
- Reduce webhook processing time by offloading non-critical work to background jobs
- Maintain data consistency through proper transaction boundaries

## User Stories

### US-001: Separate Critical Database Updates from External Services

**Description:** As a system architect, I want database updates (planTier, subscription status) to complete independently of email delivery, so that payment confirmations always result in account upgrades.

**Acceptance Criteria:**

- [ ] Database transaction in `handleCheckoutSessionCompleted` only includes data persistence
- [ ] Email delivery moved outside transaction boundary
- [ ] planTier update completes even if email service is down
- [ ] Webhook response time reduced by 30%+ (email moved to background)
- [ ] Typecheck and lint pass
- [ ] Test webhook with Brevo unreachable - verify planTier still updates

### US-002: Implement Async Email Delivery via Inngest

**Description:** As a developer, I want payment confirmation emails delivered via background jobs, so that email failures don't block critical payment processing.

**Acceptance Criteria:**

- [ ] Create `billing/send-payment-confirmation-email` Inngest function
- [ ] Emit `billing/payment-confirmed` event after database update
- [ ] Email function accepts userId, subscriptionId, email, name as event data
- [ ] Function uses `step.run` for Brevo API call (built-in retry)
- [ ] Typecheck and lint pass
- [ ] Test: verify email sent within 5 seconds of webhook completion

### US-003: Add Automatic Retry for Email Delivery Failures

**Description:** As a user, I want the system to retry sending my confirmation email if initial delivery fails, so I eventually receive important account notifications.

**Acceptance Criteria:**

- [ ] Configure Inngest retry policy: 3 attempts with exponential backoff (2s, 10s, 60s)
- [ ] Log each retry attempt with structured context (attempt number, error)
- [ ] After 3 failures, log final error and mark email as permanently failed
- [ ] Store failed email events in database for manual review/resend
- [ ] Typecheck and lint pass

### US-004: Implement Structured Logging for Payment Flow

**Description:** As an operations engineer, I want comprehensive structured logs for payment events, so I can quickly diagnose issues when users report upgrade problems.

**Acceptance Criteria:**

- [ ] Log webhook received with: eventId, eventType, subscriptionId, userId
- [ ] Log before database update: userId, oldPlanTier, newPlanTier, subscriptionStatus
- [ ] Log after database update: userId, updatedFields (planTier, stripeCustomerId, etc.)
- [ ] Log Inngest event emission: eventName, userId, subscriptionId
- [ ] All logs include correlation ID (eventId) for tracing
- [ ] Typecheck and lint pass

### US-005: Add Idempotency for Individual Operations

**Description:** As a system architect, I want database updates and email sends to be individually idempotent, so that webhook retries don't cause duplicate emails or inconsistent state.

**Acceptance Criteria:**

- [ ] Database update checks current planTier before updating (skip if already PRO)
- [ ] Email function checks if email already sent for this subscription/event combination
- [ ] Create `emailDeliveryLog` table tracking: userId, subscriptionId, eventId, templateName, sentAt, status
- [ ] Log successful email deliveries to prevent duplicates on retry
- [ ] Typecheck and lint pass

### US-006: Implement Graceful Degradation for Email Service

**Description:** As a site reliability engineer, I want the system to continue functioning when Brevo is down, so that payment processing never fails due to email service outages.

**Acceptance Criteria:**

- [ ] Webhook returns 200 OK even if email event emission fails (log error only)
- [ ] Inngest function uses try-catch with specific error handling for Brevo API errors
- [ ] Distinguish between retryable errors (500, timeout) and permanent errors (401, 403)
- [ ] Set max retry count to 3 for retryable errors, 0 for permanent errors
- [ ] Typecheck and lint pass

### US-007: Create Email Delivery Monitoring Dashboard Data

**Description:** As a product manager, I want to track email delivery success rates, so I can identify patterns in failures and take corrective action.

**Acceptance Criteria:**

- [ ] Store email delivery metrics: timestamp, templateName, status, errorCode, retryCount
- [ ] Query helper function: `getEmailDeliveryStats(startDate, endDate, templateName?)`
- [ ] Returns: total sent, successful, failed, average delivery time, failure reasons
- [ ] Typecheck and lint pass

## Functional Requirements

**FR-1:** The `handleCheckoutSessionCompleted` function MUST complete database updates (planTier, stripeCustomerId, stripeSubscriptionId, subscriptionStatus, currentPeriodEnd, cancelAtPeriodEnd) within a single atomic transaction.

**FR-2:** After successful database update, the webhook handler MUST emit a `billing/payment-confirmed` Inngest event with payload: `{ userId, subscriptionId, userEmail, userName, planTier, timestamp }`.

**FR-3:** The webhook handler MUST return HTTP 200 OK to Stripe after database transaction commits, regardless of email event emission status.

**FR-4:** A new Inngest function `sendPaymentConfirmationEmail` MUST subscribe to `billing/payment-confirmed` events and handle email delivery asynchronously.

**FR-5:** The email delivery function MUST use Inngest's `step.run` API to enable automatic retry with exponential backoff.

**FR-6:** Email delivery failures MUST be logged with structured context including: userId, subscriptionId, errorType, errorMessage, attemptNumber, timestamp.

**FR-7:** The system MUST distinguish between temporary email failures (network errors, 5xx responses) and permanent failures (401, 403 authentication errors) and retry only temporary failures.

**FR-8:** A new `EmailDeliveryLog` database model MUST track: id, userId, subscriptionId, eventId, templateName, status (pending|sent|failed), errorMessage, sentAt, createdAt.

**FR-9:** Before sending an email, the system MUST check `EmailDeliveryLog` for existing successful delivery to prevent duplicate emails on webhook retry.

**FR-10:** All webhook processing logs MUST include the Stripe eventId as a correlation identifier for distributed tracing.

**FR-11:** Logs for planTier updates MUST explicitly state old and new values: `{ oldPlanTier: 'FREE', newPlanTier: 'PRO', userId: '...' }`.

**FR-12:** The webhook handler MUST validate subscription status before updating planTier using `getPlanTierFromStatus(status)` and log the mapping: `{ subscriptionStatus: 'active', resolvedPlanTier: 'PRO' }`.

## Non-Goals (Out of Scope)

- **Email template redesign** - This PRD focuses on delivery reliability, not content
- **Real-time email delivery guarantees** - Async delivery may have 5-10 second delay, which is acceptable
- **Custom retry policies per email template** - Initial implementation uses single retry policy for all payment emails
- **Email delivery SLA monitoring/alerting** - Monitoring infrastructure setup is separate work
- **Stripe webhook signature validation improvements** - Current validation is adequate
- **Migration script for existing users** - This PRD only addresses future payment flows
- **Email preference management** - Users cannot opt-out of transactional payment emails
- **Multi-region email failover** - Single Brevo account sufficient for current scale

## Design Considerations

### Database Schema Changes

**New Table: `EmailDeliveryLog`**

```prisma
model EmailDeliveryLog {
  id             String   @id @default(cuid())
  userId         String
  subscriptionId String?
  eventId        String   // Stripe event ID for correlation
  templateName   String   // e.g., 'paymentConfirmed'
  status         EmailDeliveryStatus @default(PENDING)
  errorMessage   String?
  retryCount     Int      @default(0)
  sentAt         DateTime?
  createdAt      DateTime @default(now())

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, templateName]) // Prevent duplicate emails for same event
  @@index([userId, createdAt])
  @@index([status, createdAt])
}

enum EmailDeliveryStatus {
  PENDING
  SENT
  FAILED
}
```

### Architecture Pattern: Transactional Outbox

1. **Webhook Handler (Critical Path)**
   - Validate webhook signature
   - Check idempotency (existing WebhookEvent)
   - Begin database transaction
   - Update user subscription data
   - Record WebhookEvent as processed
   - Commit transaction
   - Emit Inngest event (fire-and-forget, log errors)
   - Return 200 OK

2. **Background Job (Non-Critical Path)**
   - Inngest receives `billing/payment-confirmed` event
   - Check EmailDeliveryLog for existing delivery
   - If not sent, call Brevo API via step.run (auto-retry)
   - Record successful delivery in EmailDeliveryLog
   - On permanent failure, log to EmailDeliveryLog with FAILED status

### Error Handling Strategy

**Retryable Errors (3 retries with backoff):**

- Network timeouts
- HTTP 500, 502, 503, 504
- DNS resolution failures
- Connection refused

**Non-Retryable Errors (fail immediately):**

- HTTP 401, 403 (authentication/authorization)
- HTTP 400 (invalid request - bad email format)
- Missing environment variables (BREVO_API_KEY)
- Invalid template name

### Logging Standards

All payment-related logs must include:

```typescript
{
  level: number,        // 20=debug, 30=info, 40=warn, 50=error
  time: number,         // Unix timestamp in milliseconds
  eventId: string,      // Stripe event ID
  userId: string,
  subscriptionId?: string,
  operation: string,    // e.g., 'updateUserSubscription', 'sendPaymentEmail'
  result?: 'success' | 'failed',
  duration?: number,    // milliseconds
  error?: object,
  metadata?: object     // operation-specific context
}
```

### UI Components (Existing - Reuse)

- No UI changes required
- Use existing Mantine notification system for internal admin alerts if needed
- Email templates already exist in `src/lib/brevo/templates/`

## Technical Considerations

### Dependencies

- **Inngest** - Already integrated, add new billing event handlers
- **Prisma** - Add EmailDeliveryLog model, run migration
- **Pino** - Enhance with structured logging helpers
- **Brevo API** - No changes, existing integration adequate

### Performance Impact

- **Webhook response time:** Expected reduction from ~1500ms to ~300ms (email moved to background)
- **Email delivery time:** Slight increase of 2-5 seconds due to async processing (acceptable tradeoff)
- **Database load:** Minimal increase (one additional EmailDeliveryLog insert per email)

### Rollout Strategy

1. Deploy database migration (EmailDeliveryLog table)
2. Deploy new Inngest email handler (inactive, no events yet)
3. Test Inngest handler in staging with manual event trigger
4. Deploy updated webhook handler (emits events)
5. Monitor logs for 24 hours, verify planTier updates and email deliveries
6. Create runbook for handling failed email deliveries

### Known Constraints

- **Brevo IP Whitelist:** Must ensure production IPs are authorized (operational concern, not code fix)
- **Inngest Rate Limits:** Free tier supports 1000 events/month - monitor usage as MAU grows
- **Database IOPS:** EmailDeliveryLog writes add ~5% to webhook transaction volume
- **Event Ordering:** Inngest doesn't guarantee FIFO - acceptable for email delivery

### Testing Strategy

1. **Unit Tests:**
   - `getPlanTierFromStatus` with all Stripe status values
   - Email idempotency check logic
   - Error classification (retryable vs. permanent)

2. **Integration Tests:**
   - Webhook handler with mocked Stripe event + mocked Inngest
   - Inngest function with mocked Brevo API (success and failure cases)
   - Database transaction rollback on error

3. **Manual Testing:**
   - Trigger Stripe test webhook with checkout.session.completed
   - Verify planTier updated in database
   - Verify Inngest event emitted (check Inngest dashboard)
   - Verify email sent (check Brevo dashboard)
   - Simulate Brevo 401 error (temporarily change API key)
   - Verify planTier still updated despite email failure
   - Check EmailDeliveryLog for FAILED entry

## Success Metrics

**Primary Metrics (Must Achieve):**

- **100% planTier update success rate** for successful Stripe payments (webhook receives confirmed payment)
- **Zero payment confirmations blocked** by email service failures

**Secondary Metrics (Target):**

- Email delivery success rate: >99% within 10 seconds of payment
- Webhook processing time: <500ms p95 (down from ~1500ms)
- Email delivery retry success rate: >80% (failures resolved on retry)

**Monitoring Queries:**

```sql
-- Check planTier update success rate
SELECT
  DATE(we."processedAt") as date,
  COUNT(*) as total_webhooks,
  COUNT(*) FILTER (WHERE u."planTier" = 'PRO') as successful_upgrades
FROM "WebhookEvent" we
JOIN "User" u ON u."stripeSubscriptionId" = (we.payload->>'subscription_id')
WHERE we.type = 'checkout.session.completed'
  AND we.processed = true
GROUP BY date
ORDER BY date DESC;

-- Check email delivery health
SELECT
  "templateName",
  "status",
  COUNT(*) as count,
  AVG("retryCount") as avg_retries
FROM "EmailDeliveryLog"
WHERE "templateName" = 'paymentConfirmed'
  AND "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY "templateName", "status";
```

## Open Questions

1. **Should we implement email fallback?** If Brevo is down for >1 hour, should we queue emails for later batch send or switch to backup provider (e.g., SendGrid)?
   - **Decision needed:** Define SLA for email delivery (e.g., 24 hours acceptable)

2. **Do we need webhook replay UI?** If a webhook fails badly and Stripe stops retrying, should admins be able to manually replay from database?
   - **Decision needed:** Add to backlog or rely on Stripe dashboard replay

3. **Should subscription updates also use Inngest?** Currently only checkout.session.completed moved to async email - should we apply same pattern to subscription.updated, subscription.deleted, etc.?
   - **Recommendation:** Yes, but separate PRD to avoid scope creep

4. **What's the retention policy for EmailDeliveryLog?** Should we prune old records after 90 days?
   - **Recommendation:** Add cleanup job, but separate task

5. **Do we need dead-letter queue?** If Inngest retries fail 3 times, where should failed events go?
   - **Recommendation:** EmailDeliveryLog with FAILED status is sufficient for v1, DLQ can be added later

## Implementation Sequence

**Phase 1: Database & Infrastructure (Day 1)**

- Create EmailDeliveryLog model in schema.prisma
- Run migration
- Deploy to staging

**Phase 2: Inngest Email Handler (Day 2)**

- Create `src/lib/inngest/handlers/billing/send-payment-confirmation-email.ts`
- Implement idempotency check
- Implement retry logic
- Add structured logging
- Test in isolation with manual event trigger

**Phase 3: Webhook Handler Updates (Day 3)**

- Refactor `handleCheckoutSessionCompleted` to emit Inngest event
- Remove `sendNotificationEmail` call from transaction
- Add enhanced logging
- Update tests

**Phase 4: Testing & Monitoring (Day 4)**

- Integration testing in staging
- Load testing (50 concurrent webhooks)
- Deploy to production with feature flag
- Monitor for 24 hours
- Roll out to 100%

**Phase 5: Documentation & Runbooks (Day 5)**

- Update webhook documentation
- Create runbook for email delivery failures
- Document Brevo IP whitelist procedure
- Add dashboard queries to internal wiki

---

**Estimated Effort:** 3-5 days (1 senior fullstack engineer)
**Priority:** **HIGH** - Blocks revenue recognition and creates support burden
**Risk Level:** **Medium** - Requires careful transaction boundary management and thorough testing
