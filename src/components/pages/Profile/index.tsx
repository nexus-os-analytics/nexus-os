'use client';
import { Badge, Box, Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { lazy } from 'react';
import { openCheckout, openPortal } from '@/features/billing/services/stripeClient';

const ProfileForm = lazy(() => import('./ProfileForm'));
const BlingIntegrationForm = lazy(() => import('./BlingIntegrationForm'));
const SecurityForm = lazy(() => import('./SecurityForm'));
// const ApiKeysForm = lazy(() => import('./ApiKeysForm'));
// const PrivacyDataForm = lazy(() => import('./PrivacyDataForm'));
// const PreferencesForm = lazy(() => import('./PreferencesForm'));

export default function Profile() {
  const router = useRouter();
  const { data } = useSession();
  const plan = data?.user?.planTier ?? 'FREE';
  const isPro = plan === 'PRO';

  return (
    <Container size="md">
      <Stack gap="xl">
        <Group h="100%">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<ArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            Voltar
          </Button>
        </Group>
        <Card padding="xl" radius="md" withBorder shadow="sm">
          <Stack>
            {/* Header */}
            <Box>
              <Title order={2} mb="xs">
                Configurações do Perfil
              </Title>
              <Group gap="sm" mb="md">
                <Text size="sm">
                  Gerencie suas informações pessoais, segurança da conta e preferências aqui.
                </Text>
                <Badge color={isPro ? 'green' : 'gray'} variant={isPro ? 'light' : 'outline'}>
                  Plano {plan}
                </Badge>
              </Group>
              <Group gap="sm">
                {!isPro && (
                  <Button onClick={openCheckout} color="brand">
                    Fazer upgrade para PRO
                  </Button>
                )}
                <Button variant="light" onClick={openPortal}>
                  Gerenciar assinatura
                </Button>
              </Group>
            </Box>
            <ProfileForm />
            <SecurityForm />
            <BlingIntegrationForm />
            {/* <ApiKeysForm /> */}
            {/* <PrivacyDataForm /> */}
            {/* <PreferencesForm /> */}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

/*

  BACKEND CONTRACT (recommended endpoints)

  GET  /api/user                         -> returns user (exclude sensitive tokens)
  PATCH /api/user                        -> update profile (validate & audit)
  POST  /api/user/change-password        -> change password (require current password)
  POST  /api/user/2fa/enable             -> generate secret + return qr + recovery codes
  POST  /api/user/2fa/verify             -> verify TOTP + enable
  POST  /api/user/2fa/disable            -> disable 2FA (require password or OTP)
  GET   /api/user/login-activities       -> paginated login activities
  POST  /api/sessions/revoke-all         -> invalidate all sessions
  GET   /api/api-keys                    -> list keys
  POST  /api/api-keys                    -> create key (return plaintext once)
  POST  /api/api-keys/:id/revoke         -> revoke key
  POST  /api/user/export-data            -> create data export job (GDPR/LGPD)
  DELETE /api/user?soft=true&days=30     -> schedule soft-delete + retentionUntil
  POST  /api/user/erase                  -> immediate irreversible erase (admin/manual)
  GET   /api/admin/audit-logs            -> admin-only audit log access

  SECURITY & COMPLIANCE NOTES
  - Always store API keys hashed (e.g. HMAC or bcrypt-like) and show plaintext only once on creation.
  - Map every user action that touches personal data to an AuditLog row (who, what, why).
  - Implement rate limits and CORS properly on data export endpoints to avoid abuse.
  - For export links: create signed, short-lived URLs and require re-authentication to download.
  - For deletion: prefer soft-delete then background anonymization; keep retentionUntil and reason.
  - Consent toggles must be persisted with timestamps and versioned terms reference.
  - For TOTP secrets: encrypt at rest and only deliver QR/secret upon generation.
  - For password resets: tokens must be single-use, expire (e.g. 1h), and be stored hashed.

  LGPD/GDPR checklist (minimum):
  - Right of access: export data endpoint, logged and rate-limited.
  - Right to rectification: profile edit with audit.
  - Right to erasure: schedule deletion, anonymize on completion.
  - Right to restriction & portability: export, and ability to restrict processing (consents).
  - Data minimization: store only fields required; keep retention policies.
  - Legal basis / consent: maintain consent records with timestamps and terms version.
  - DPIA & risk logs: store security incidents and audit trails (SecurityIncident model).

  DEPLOYMENT & OPERATIONAL NOTES
  - Use background workers (e.g. BullMQ) to generate exports and anonymization tasks.
  - Exports should be zipped, encrypted, and available through signed URLs valid for a short time.
  - Anonymization should be idempotent and reversible only by admin (if policy requires) until retention.
  - Keep a separate archival store for logs and backups subject to retention rules.

  QUICK REMARKS
  - Este componente é um scaffolding: implemente validações e limites no backend. Não confie só no frontend.
  - Mostre QR/secret one-time only. For extra safety, require re-authentication for high-risk actions.
*/
