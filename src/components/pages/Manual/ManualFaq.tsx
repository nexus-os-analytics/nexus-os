'use client';
import { Accordion } from '@mantine/core';

export function ManualFaq() {
  return (
    <Accordion multiple variant="separated">
      <Accordion.Item value="altera-dados">
        <Accordion.Control>O Nexus OS altera dados no Bling?</Accordion.Control>
        <Accordion.Panel>
          <p>
            <strong>Não.</strong> Trabalha apenas com leitura — sem alterar produtos, preços ou
            estoque.
          </p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="frequencia">
        <Accordion.Control>Com que frequência os dados são atualizados?</Accordion.Control>
        <Accordion.Panel>
          <p>
            Sincronização <strong>automática diária</strong> (geralmente de madrugada). Pode ser
            forçada manualmente pelo botão <strong>“Sincronizar Agora”</strong>.
          </p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="desconectar">
        <Accordion.Control>Posso desconectar o Bling?</Accordion.Control>
        <Accordion.Panel>
          <ul>
            <li>
              <strong>Nexus OS:</strong> Configurações → Integrações → Desconectar Bling
            </li>
            <li>
              <strong>Bling:</strong> Configurações → Aplicativos Conectados → Revogar Nexus OS
            </li>
          </ul>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="seguranca">
        <Accordion.Control>Meus dados estão seguros?</Accordion.Control>
        <Accordion.Panel>
          <p>
            Sim. Utilizamos <strong>SSL/TLS</strong>, <strong>armazenamento AWS</strong> e seguimos
            práticas de <strong>segurança LGPD</strong>.
          </p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="conta-bling">
        <Accordion.Control>Preciso ter conta paga no Bling?</Accordion.Control>
        <Accordion.Panel>
          <p>Sim, a API do Bling requer plano ativo.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="onde-alertas">
        <Accordion.Control>Onde vejo meus alertas?</Accordion.Control>
        <Accordion.Panel>
          <p>
            No <strong>Dashboard</strong>, com priorização visual e recomendações específicas.
          </p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
