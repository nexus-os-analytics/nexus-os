'use client';
import { Container, Table, Title } from '@mantine/core';

export function ComparisonSection() {
  return (
    <Container id="comparativo" size="lg" py="xl">
      <Title ta="center" mb="md">
        Por que o Nexus OS?
      </Title>
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Funcionalidade</Table.Th>
            <Table.Th>Excel</Table.Th>
            <Table.Th>Bling</Table.Th>
            <Table.Th>
              <div
                style={{
                  border: '2px solid var(--mantine-color-yellow-5)',
                  borderRadius: 8,
                  padding: 6,
                }}
              >
                Nexus OS ⭐
              </div>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Alertas automáticos</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>⚠️ Básico</Table.Td>
            <Table.Td>
              <div
                style={{
                  border: '2px solid var(--mantine-color-yellow-5)',
                  borderRadius: 8,
                  padding: 6,
                }}
              >
                ✅ Inteligente
              </div>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Detecta capital parado</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>
              <div
                style={{
                  border: '2px solid var(--mantine-color-yellow-5)',
                  borderRadius: 8,
                  padding: 6,
                }}
              >
                ✅ Automático
              </div>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Considera fornecedor</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>
              <div
                style={{
                  border: '2px solid var(--mantine-color-yellow-5)',
                  borderRadius: 8,
                  padding: 6,
                }}
              >
                ✅ Sim
              </div>
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Recomendações acionáveis</Table.Td>
            <Table.Td>❌</Table.Td>
            <Table.Td>⚠️</Table.Td>
            <Table.Td>
              <div
                style={{
                  border: '2px solid var(--mantine-color-yellow-5)',
                  borderRadius: 8,
                  padding: 6,
                }}
              >
                ✅ Específicas
              </div>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Container>
  );
}
