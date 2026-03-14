'use client';

import React, { useState } from 'react';
import { Select, Group, Text, Box } from '@mantine/core';
import type { SelectProps } from '@mantine/core';
import { IntegrationProvider } from '@prisma/client';
import { ShopeeLogo } from './shopee-logo';

interface SourceSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  availableProviders: string[];
}

interface ProviderOption {
  value: IntegrationProvider;
  label: string;
  logoSrc: string | null;
}

const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    value: IntegrationProvider.BLING,
    label: 'Bling',
    logoSrc: '/img/bling-logo.png',
  },
  {
    value: IntegrationProvider.MERCADO_LIVRE,
    label: 'Mercado Livre',
    logoSrc: '/img/meli-logo.png',
  },
  {
    value: IntegrationProvider.SHOPEE,
    label: 'Shopee',
    logoSrc: null,
  },
];

function ProviderLogo({ provider }: { provider?: ProviderOption }) {
  const [error, setError] = useState(false);

  if (!provider || !provider.logoSrc || error) {
    if (provider?.value === IntegrationProvider.SHOPEE || !provider) {
      return <ShopeeLogo width={20} height={20} />;
    }
    return <Box w={20} h={20} bg="gray.3" style={{ borderRadius: 4 }} />;
  }

  return (
    <img
      src={provider.logoSrc}
      alt={provider.label}
      width={20}
      height={20}
      style={{ objectFit: 'contain' }}
      onError={() => setError(true)}
    />
  );
}

const renderSelectOption: SelectProps['renderOption'] = ({ option }) => {
  const provider = PROVIDER_OPTIONS.find((p) => p.value === option.value);

  return (
    <Group gap="sm" wrap="nowrap">
      <ProviderLogo provider={provider} />
      <Text size="sm">{option.label}</Text>
    </Group>
  );
};

export function SourceSelector({ value, onChange, availableProviders }: SourceSelectorProps) {
  const filteredOptions = PROVIDER_OPTIONS.filter((p) =>
    availableProviders.includes(p.value as IntegrationProvider)
  );

  const data = filteredOptions.map((p) => ({ value: p.value, label: p.label }));

  const selectedProvider = PROVIDER_OPTIONS.find((p) => p.value === value);
  const onlyOne = data.length === 1;

  const leftSection = selectedProvider ? (
    <Box ml="xs" style={{ display: 'flex', alignItems: 'center' }}>
      <ProviderLogo provider={selectedProvider} />
    </Box>
  ) : null;

  return (
    <Select
      data={data}
      value={value}
      onChange={onChange}
      renderOption={renderSelectOption}
      placeholder="Selecionar fonte..."
      leftSection={leftSection}
      w={200}
      disabled={onlyOne}
      searchable={false}
      allowDeselect={false}
      styles={{
        input: {
          paddingLeft: selectedProvider ? 40 : undefined,
        },
      }}
    />
  );
}
