import { AuthGuard } from '@/components/commons/AuthGuard';
import { ManualPixPaymentsList } from '@/features/billing/components/ManualPixPaymentsList';

export default function PagamentosPixPage() {
  return (
    <AuthGuard roles={['SUPER_ADMIN']}>
      <ManualPixPaymentsList />
    </AuthGuard>
  );
}
