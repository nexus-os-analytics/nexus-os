import { Group, Text } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 64 }: LogoProps) {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <Group>
        <Image src="/img/logo.png" alt="Nexus OS" width={size} height={size} />
        <Text>Nexus OS</Text>
      </Group>
    </Link>
  );
}
