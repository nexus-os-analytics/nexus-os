import { Button, Card, Divider, Group, Select, Stack, Switch, Text, Title } from '@mantine/core';

export default function PreferencesForm() {
  return (
    <Card shadow="sm">
      <Title id="preferences" order={4}>
        Preferências
      </Title>
      <Divider my="sm" />
      <Stack>
        <Group>
          <Text>Idioma</Text>
          <Select
            data={[
              { value: 'pt-BR', label: 'Português (BR)' },
              { value: 'en-US', label: 'English (US)' },
            ]}
            defaultValue="pt-BR"
          />
        </Group>
        <Group>
          <Text>Receber e-mails de produto</Text>
          <Switch defaultChecked />
        </Group>
        <Group>
          <Text>Cookie preferences</Text>
          <Button variant="outline">Gerenciar cookies</Button>
        </Group>
      </Stack>
    </Card>
  );
}
