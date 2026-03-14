'use client';

import { useState } from 'react';
import { Box, Button, Indicator, Tooltip } from '@mantine/core';
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
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  if (availableProviders.length === 0) {
    return null;
  }

  const handleImgError = (provider: string) => {
    setImgErrors((prev) => ({ ...prev, [provider]: true }));
  };

  const isSingle = availableProviders.length === 1;

  return (
    <Button.Group>
      {availableProviders.map((provider) => {
        const key = provider as ProviderKey;
        const config = PROVIDER_CONFIG[key] ?? {
          label: provider,
          color: 'gray',
          logoSrc: null,
          logoAlt: provider,
        };
        const isActive = value === provider;
        const isConnected = connectionState === 'connected';

        const button = (
          <Tooltip key={provider} label={config.label} withArrow>
            <Button
              size="sm"
              variant={isActive ? 'light' : 'default'}
              color={isActive ? config.color : undefined}
              onClick={isSingle ? undefined : () => onChange(provider)}
              style={
                isSingle
                  ? { cursor: 'default', letterSpacing: 'normal' }
                  : { letterSpacing: 'normal' }
              }
              leftSection={
                <ProviderLogo
                  provider={key}
                  imgErrorState={imgErrors}
                  onImgError={handleImgError}
                />
              }
            >
              <Box component="span" visibleFrom="sm">
                {config.label}
              </Box>
            </Button>
          </Tooltip>
        );

        if (isActive) {
          return (
            <Indicator key={provider} color="green" size={8} offset={4} disabled={!isConnected}>
              {button}
            </Indicator>
          );
        }

        return button;
      })}
    </Button.Group>
  );
}
