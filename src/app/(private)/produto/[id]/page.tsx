import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/features/products/components/ProductDetails';
import type { BlingProductType } from '@/lib/bling';

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;

  // Forward auth cookies so the API can see the session
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Build absolute URL based on current request
  const hdrs = await headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host') ?? 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
  const product = await res.json();

  if (product.error) {
    return notFound();
  }

  return <ProductDetails product={product as unknown as BlingProductType} />;
}
