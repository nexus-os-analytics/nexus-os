'use client';

import { useState } from 'react';
import { Box, Group, Indicator, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { ShopeeLogo } from './shopee-logo';

interface IntegrationSwitcherProps {
  value: string | null;
  onChange: (value: string) => void;
  availableProviders: string[];
  connectionState: string;
}

const PROVIDER_CONFIG = {
  BLING: { label: 'Bling', color: 'blue', logoSrc: '/img/bling-logo.png', logoAlt: 'Bling' },
  MERCADO_LIVRE: {
    label: 'Mercado Livre',
    color: 'yellow',
    logoSrc: '/img/meli-logo.png',
    logoAlt: 'Mercado Livre',
  },
  SHOPEE: { label: 'Shopee', color: 'orange', logoSrc: null, logoAlt: 'Shopee' },
} as const;

type ProviderKey = keyof typeof PROVIDER_CONFIG;

function ProviderLogo({
  provider,
  imgErrorState,
  onImgError,
}: {
  provider: ProviderKey;
  imgErrorState: Record<string, boolean>;
  onImgError: (provider: string) => void;
}) {
  const config = PROVIDER_CONFIG[provider];

  if (provider === 'SHOPEE') {
    return <ShopeeLogo width={18} height={18} />;
  }

  if (imgErrorState[provider]) {
    return (
      <Box
        style={{
          width: 18,
          height: 18,
          borderRadius: 3,
          backgroundColor: `var(--mantine-color-${config.color}-6)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: 'white',
        }}
      >
        {config.label[0]}
      </Box>
    );
  }

  return (
    <img
      src={config.logoSrc!}
      alt={config.logoAlt}
      height={18}
      style={{ objectFit: 'contain' }}
      onError={() => onImgError(provider)}
    />
  );
}

export function IntegrationSwitcher({
  value,
  onChange,
  availableProviders,
  connectionState,
}: IntegrationSwitcherProps) {
  const [opened, setOpened] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const handleImgError = (provider: string) => {
    setImgErrors((prev) => ({ ...prev, [provider]: true }));
  };

  const selectedKey = value as ProviderKey | null;
  const selectedConfig = selectedKey
    ? (PROVIDER_CONFIG[selectedKey] ?? {
        label: value!,
        color: 'gray',
        logoSrc: null,
        logoAlt: value!,
      })
    : null;

  const isConnected = connectionState === 'connected';

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      withinPortal
      shadow="md"
      width={220}
    >
      <Menu.Target>
        <UnstyledButton
          onClick={() => setOpened((o) => !o)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            paddingInline: 12,
            paddingBlock: 7,
            borderRadius: 'var(--mantine-radius-sm)',
            border: '1px solid var(--mantine-color-default-border)',
            backgroundColor: 'var(--mantine-color-default)',
            cursor: 'pointer',
            fontSize: 'var(--mantine-font-size-sm)',
            fontWeight: 500,
            color: 'var(--mantine-color-text)',
          }}
        >
          {selectedKey ? (
            <ProviderLogo
              provider={selectedKey}
              imgErrorState={imgErrors}
              onImgError={handleImgError}
            />
          ) : null}
          <Text size="sm" fw={500} style={{ lineHeight: 1 }}>
            {selectedConfig ? selectedConfig.label : 'Selecionar integração'}
          </Text>
          <IconChevronDown size={14} style={{ marginLeft: 2, opacity: 0.6 }} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setOpened(false);
            router.push('/integracao');
          }}
        >
          Nova integração
        </Menu.Item>

        {availableProviders.length > 0 && <Menu.Divider />}

        {availableProviders.map((provider) => {
          const key = provider as ProviderKey;
          const config = PROVIDER_CONFIG[key] ?? {
            label: provider,
            color: 'gray',
            logoSrc: null,
            logoAlt: provider,
          };
          const isActive = value === provider;

          return (
            <Menu.Item
              key={provider}
              onClick={() => {
                onChange(provider);
                setOpened(false);
              }}
              style={
                isActive ? { backgroundColor: 'var(--mantine-color-default-hover)' } : undefined
              }
              rightSection={
                isActive && isConnected ? (
                  <Indicator
                    color="green"
                    size={8}
                    processing={false}
                    position="middle-end"
                    style={{ position: 'static', display: 'inline-block' }}
                  >
                    <Box w={8} h={8} />
                  </Indicator>
                ) : undefined
              }
            >
              <Group gap={8} wrap="nowrap">
                <ProviderLogo
                  provider={key}
                  imgErrorState={imgErrors}
                  onImgError={handleImgError}
                />
                <Text size="sm">{config.label}</Text>
              </Group>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
