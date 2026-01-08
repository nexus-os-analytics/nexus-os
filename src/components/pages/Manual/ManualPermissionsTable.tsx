'use client';
import { Table } from '@mantine/core';

export function ManualPermissionsTable() {
  return (
    <Table withTableBorder highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Permissão</Table.Th>
          <Table.Th>Finalidade</Table.Th>
          <Table.Th>Tipo de Acesso</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>
            <strong>Produtos</strong>
          </Table.Td>
          <Table.Td>Ler informações (nome, SKU, preço, estoque)</Table.Td>
          <Table.Td>Somente Leitura</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>
            <strong>Pedidos de Venda</strong>
          </Table.Td>
          <Table.Td>Ler histórico de vendas (30–90 dias)</Table.Td>
          <Table.Td>Somente Leitura</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>
            <strong>Dados da Empresa</strong>
          </Table.Td>
          <Table.Td>Identificar nome e CNPJ</Table.Td>
          <Table.Td>Somente Leitura</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
