'use client';
import {
  Anchor,
  Container,
  Divider,
  List,
  Table,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';

export default function PrivacyPolicy() {
  const theme = useMantineTheme();

  const dataCollectionTable = (
    <Table striped withTableBorder mt="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Finalidade</Table.Th>
          <Table.Th>Dados coletados</Table.Th>
          <Table.Th>Base legal</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>Criação de conta e autenticação</Table.Td>
          <Table.Td>Nome, e-mail, senha (hash), CPF (quando aplicável)</Table.Td>
          <Table.Td>Execução de contrato</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Comunicação com o usuário</Table.Td>
          <Table.Td>E-mail, nome</Table.Td>
          <Table.Td>Consentimento</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Pagamentos e emissão de notas fiscais</Table.Td>
          <Table.Td>Nome, CPF/CNPJ, endereço, dados de cobrança</Table.Td>
          <Table.Td>Execução de contrato</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Suporte técnico e segurança</Table.Td>
          <Table.Td>Logs de acesso, IP, navegador, ações no sistema</Table.Td>
          <Table.Td>Legítimo interesse</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Marketing e melhorias</Table.Td>
          <Table.Td>Cookies analíticos, preferências de uso</Table.Td>
          <Table.Td>Consentimento</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );

  const cookiesTable = (
    <Table striped withTableBorder mt="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Tipo</Table.Th>
          <Table.Th>Finalidade</Table.Th>
          <Table.Th>Exemplo</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>Essenciais</Table.Td>
          <Table.Td>Necessários para login e navegação</Table.Td>
          <Table.Td>Sessão de autenticação</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Analíticos</Table.Td>
          <Table.Td>Medem o uso da plataforma</Table.Td>
          <Table.Td>Google Analytics</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Funcionais</Table.Td>
          <Table.Td>Guardam preferências do usuário</Table.Td>
          <Table.Td>Tema escuro/claro</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Marketing</Table.Td>
          <Table.Td>Personalizam anúncios e campanhas</Table.Td>
          <Table.Td>Meta Pixel, Google Ads</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );

  return (
    <Container size="md" py="xl" mb="xl">
      <Title order={1} ta="center" c={theme.primaryColor}>
        🛡️ Política de Privacidade, Termos de Uso e Informações Legais
      </Title>
      <Text ta="center" c="dimmed" mt="xs">
        Última atualização: <strong>07 de outubro de 2025</strong>
      </Text>

      <Divider my="lg" />

      <Text>
        Bem-vindo(a)! Esta Política descreve como tratamos seus dados pessoais, o uso de cookies, os
        termos de uso da plataforma e os meios de contato para dúvidas ou solicitações relacionadas
        à privacidade e conformidade com a{' '}
        <strong>Lei Geral de Proteção de Dados Pessoais (LGPD)</strong>.
      </Text>

      <Divider my="xl" label="1. Coleta e uso de dados pessoais" />

      <Text>
        Coletamos apenas os dados necessários para o funcionamento adequado da plataforma, conforme
        as finalidades descritas abaixo:
      </Text>

      {dataCollectionTable}

      <Text mt="sm">
        Nunca vendemos, alugamos ou compartilhamos seus dados com terceiros fora das finalidades
        descritas acima.
      </Text>

      <Divider my="xl" label="2. Armazenamento e segurança dos dados" />

      <List withPadding spacing="sm">
        <List.Item>Utilizamos criptografia (TLS/SSL) em todas as comunicações.</List.Item>
        <List.Item>Senhas são armazenadas de forma irreversível (hash + salt).</List.Item>
        <List.Item>Servidores seguem padrões ISO/IEC 27001.</List.Item>
        <List.Item>Backups regulares e autenticação de múltiplos fatores.</List.Item>
      </List>

      <Divider my="xl" label="3. Direitos do titular" />

      <Text>Você pode, a qualquer momento:</Text>
      <List withPadding spacing="xs" mt="sm">
        <List.Item>
          Solicitar <strong>acesso</strong> aos seus dados pessoais.
        </List.Item>
        <List.Item>
          Pedir <strong>correção</strong> de dados incorretos.
        </List.Item>
        <List.Item>
          Solicitar <strong>exclusão</strong> dos dados.
        </List.Item>
        <List.Item>
          Solicitar <strong>portabilidade</strong> dos dados.
        </List.Item>
        <List.Item>
          Revogar o <strong>consentimento</strong> dado.
        </List.Item>
      </List>

      <Text mt="sm">
        Basta enviar sua solicitação conforme descrito na seção{' '}
        <Anchor href="#contato" fw={500}>
          📬 Contato e DPO
        </Anchor>
        .
      </Text>

      <Divider my="xl" label="4. Política de Cookies" />

      <Text>Usamos cookies para melhorar sua experiência. Os tipos de cookies utilizados são:</Text>

      {cookiesTable}

      <Text mt="sm">
        Você pode gerenciar os cookies diretamente no seu navegador ou pelo banner de consentimento.
      </Text>

      <Divider my="xl" label="5. Termos de Uso" />

      <Title order={3}>5.1 Condições gerais</Title>
      <Text>
        Ao criar uma conta e utilizar nossos serviços, você declara ter lido, compreendido e
        aceitado este documento.
      </Text>

      <Title order={3} mt="lg">
        5.2 Responsabilidades do usuário
      </Title>
      <List withPadding>
        <List.Item>Manter suas credenciais de acesso seguras.</List.Item>
        <List.Item>Utilizar a plataforma apenas para fins legais.</List.Item>
        <List.Item>Fornecer informações verdadeiras e atualizadas.</List.Item>
      </List>

      <Title order={3} mt="lg">
        5.3 Responsabilidades da plataforma
      </Title>
      <List withPadding>
        <List.Item>Garantir a confidencialidade e integridade dos dados.</List.Item>
        <List.Item>Notificar o usuário em caso de incidente de segurança relevante.</List.Item>
        <List.Item>Atualizar esta política conforme necessário.</List.Item>
      </List>

      <Title order={3} mt="lg">
        5.4 Suspensão e encerramento
      </Title>
      <Text>
        Contas que violem estes termos podem ser suspensas ou encerradas sem aviso prévio.
      </Text>

      <Divider my="xl" label="6. Compartilhamento com terceiros" />

      <Text>
        Podemos compartilhar informações com prestadores de serviço, autoridades legais e parceiros
        de integração — sempre sob contrato de confidencialidade e com base legal adequada.
      </Text>

      <Divider my="xl" label="7. Retenção e exclusão de dados" />

      <Text>
        Os dados são mantidos pelo período necessário à execução dos serviços ou conforme exigido
        por lei. Após o término, são anonimizados ou excluídos de forma segura.
      </Text>

      <Divider my="xl" label="8. Contato e DPO" id="contato" />

      <Text>Em caso de dúvidas, entre em contato com nosso Encarregado de Proteção de Dados:</Text>

      <List withPadding>
        <List.Item>
          <strong>Nome:</strong> Encarregado de Dados
        </List.Item>
        <List.Item>
          <strong>E-mail:</strong>{' '}
          <Anchor href="mailto:dpo@seudominio.com.br">dpo@seudominio.com.br</Anchor>
        </List.Item>
        <List.Item>
          <strong>Endereço:</strong> [Informe o endereço físico ou CNPJ da empresa]
        </List.Item>
        <List.Item>
          <strong>Assunto:</strong> LGPD / Privacidade
        </List.Item>
      </List>

      <Divider my="xl" label="9. Disposições legais" />

      <List withPadding>
        <List.Item>
          Este documento é regido pelas leis da <strong>República Federativa do Brasil</strong>.
        </List.Item>
        <List.Item>
          Qualquer controvérsia será resolvida no foro da comarca da sede da empresa.
        </List.Item>
        <List.Item>Atualizações relevantes serão comunicadas por e-mail ou notificação.</List.Item>
      </List>

      <Divider my="xl" label="10. Versão e histórico" />

      <Table withTableBorder striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Data</Table.Th>
            <Table.Th>Versão</Table.Th>
            <Table.Th>Alterações</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>07/10/2025</Table.Td>
            <Table.Td>1.0</Table.Td>
            <Table.Td>Criação inicial da política</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>

      <Divider my="xl" />

      <Text ta="center" mt="md" c="dimmed" fs="italic">
        Ao continuar navegando ou utilizar os serviços, você declara estar ciente e de acordo com os
        termos desta Política de Privacidade e Uso.
      </Text>
    </Container>
  );
}
