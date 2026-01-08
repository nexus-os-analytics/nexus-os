import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <Image src="/img/logo.png" alt="Nexus OS" width={64} height={64} />
    </Link>
  );
}
