'use client';
import { Container, Table, Title } from '@mantine/core';

export function ComparisonSection() {
  return (
    <Container id="comparativo" size="lg" py="xl">
      <Title ta="center" mb="md">
        Por que o Nexus OS?
      </Title>
      <Table withTableBorder highlightOnHover w="100%" maw={800} mx="auto">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Funcionalidade</Table.Th>
            <Table.Th>Excel</Table.Th>
            <Table.Th>Bling</Table.Th>
            <Table.Th>Nexus OS ⭐</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Alertas automáticos</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>⚠️ Básico</Table.Td>
            <Table.Td>✅ Inteligente</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Detecta capital parado</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>✅ Automático</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Considera fornecedor</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>✅ Sim</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Recomendações acionáveis</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>⚠️</Table.Td>
            <Table.Td>✅ Específicas</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Container>
  );
}
