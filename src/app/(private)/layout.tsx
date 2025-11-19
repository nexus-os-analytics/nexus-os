import { AdminLayout } from '@/components/layout/AdminLayout';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
