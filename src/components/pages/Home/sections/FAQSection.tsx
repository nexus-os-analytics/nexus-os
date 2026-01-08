'use client';
import { Accordion, Container, Stack, Title } from '@mantine/core';

export function FAQSection() {
  return (
    <Container id="faq" size="lg" py="xl">
      <Stack align="center" gap="sm">
        <Title ta="center">FAQ</Title>
      </Stack>
      <Accordion mt="md" multiple>
        <Accordion.Item value="bling-dados">
          <Accordion.Control>O Nexus altera dados no Bling?</Accordion.Control>
          <Accordion.Panel>
            Não. Nunca alteramos dados no Bling — apenas lemos e analisamos.
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="precisa-bling">
          <Accordion.Control>Preciso pagar pelo Bling?</Accordion.Control>
          <Accordion.Panel>
            Sim, o Nexus integra ao Bling, que é um serviço à parte.
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="teste">
          <Accordion.Control>Posso testar antes?</Accordion.Control>
          <Accordion.Panel>Sim. Plano Free e 14 dias de PRO para avaliar.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="seguranca">
          <Accordion.Control>Meus dados estão seguros?</Accordion.Control>
          <Accordion.Panel>
            Sim. LGPD e infraestrutura AWS com boas práticas de segurança.
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
