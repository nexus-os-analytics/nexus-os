import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 64 }: LogoProps) {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <Image src="/img/logo.png" alt="Nexus OS" width={size} height={size} />
    </Link>
  );
}
