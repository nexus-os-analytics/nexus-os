import { Container } from '@mantine/core';

export function Terms() {
  return (
    <Container size="md" px="md">
      <article>
        <header>
          <h1>Termos de Uso — Nexus OS</h1>
          <p>
            <strong>Última atualização:</strong> Janeiro 2026
          </p>
        </header>

        <section aria-labelledby="aceitacao">
          <h2 id="aceitacao">1. Aceitação dos Termos</h2>
          <p>
            Ao utilizar o <strong>Nexus OS</strong>, você concorda com estes Termos de Uso. Caso não
            concorde com qualquer condição aqui descrita, não utilize o serviço.
          </p>
        </section>

        <section aria-labelledby="descricao">
          <h2 id="descricao">2. Descrição do Serviço</h2>
          <p>
            O <strong>Nexus OS</strong> é um <em>CFO Digital inteligente</em> que analisa dados de
            estoque e vendas do Bling ERP para gerar <strong>alertas</strong> e{' '}
            <strong>recomendações acionáveis</strong> sobre reposição, capital parado e
            oportunidades de crescimento.
          </p>
          <p>
            O Nexus OS <strong>não realiza operações de escrita</strong> no Bling: não cria pedidos,
            não altera preços e não modifica estoque. A integração é{' '}
            <strong>somente leitura</strong> e utiliza <strong>OAuth 2.0</strong>
            para autorização segura.
          </p>
        </section>

        <section aria-labelledby="integracoes">
          <h2 id="integracoes">3. Integrações e Permissões</h2>
          <ul>
            <li>
              <strong>Produtos:</strong> leitura de nome, SKU, preço e estoque.
            </li>
            <li>
              <strong>Pedidos de Venda:</strong> leitura de histórico de vendas.
            </li>
            <li>
              <strong>Dados da Empresa:</strong> leitura de informações cadastrais (ex.: nome e
              CNPJ).
            </li>
          </ul>
          <p>
            A autorização pode ser revogada a qualquer momento nas configurações do Bling ou do
            próprio Nexus OS.
          </p>
        </section>

        <section aria-labelledby="conta">
          <h2 id="conta">4. Conta, Segurança e Responsabilidades</h2>
          <ul>
            <li>Você é responsável por manter suas credenciais de acesso em sigilo.</li>
            <li>Informe-nos imediatamente sobre qualquer uso não autorizado da sua conta.</li>
            <li>Você se compromete a fornecer informações verdadeiras e atualizadas.</li>
          </ul>
        </section>

        <section aria-labelledby="planos">
          <h2 id="planos">5. Planos, Pagamentos e Cancelamento</h2>
          <p>
            O acesso ao serviço pode exigir <strong>assinatura paga</strong>. Os valores,
            periodicidade e condições de cobrança serão apresentados no momento da contratação.
          </p>
          <p>
            O cancelamento pode ser solicitado a qualquer tempo, com efeitos ao final do período
            vigente. Políticas de reembolso, quando existentes, serão informadas nas ofertas
            específicas ou na área de <strong>Preços</strong>.
          </p>
        </section>

        <section aria-labelledby="disponibilidade">
          <h2 id="disponibilidade">6. Disponibilidade, Manutenção e Suporte</h2>
          <p>
            Buscar-se-á alta disponibilidade do serviço, podendo ocorrer{' '}
            <strong>janelas de manutenção</strong> ou
            <strong> interrupções</strong> por motivos técnicos, atualizações ou fatores externos.
          </p>
          <p>
            O suporte é disponibilizado por e-mail em dias úteis e horário comercial, conforme
            divulgado nos canais oficiais.
          </p>
        </section>

        <section aria-labelledby="privacidade">
          <h2 id="privacidade">7. Privacidade e Proteção de Dados</h2>
          <p>
            Tratamos dados conforme a <strong>LGPD</strong> e nossa{' '}
            <a href="/politica-de-privacidade">Política de Privacidade</a>. Os dados coletados são
            utilizados para análise e geração de recomendações, sem venda ou compartilhamento com
            terceiros não autorizados.
          </p>
        </section>

        <section aria-labelledby="propriedade">
          <h2 id="propriedade">8. Propriedade Intelectual</h2>
          <p>
            O Nexus OS, suas marcas, código, conteúdos e materiais associados são protegidos por
            leis de propriedade intelectual. É vedado copiar, modificar, distribuir ou criar obras
            derivadas sem autorização.
          </p>
        </section>

        <section aria-labelledby="limites">
          <h2 id="limites">9. Limitação de Responsabilidade</h2>
          <p>
            O Nexus OS fornece <strong>análises e recomendações</strong> baseadas em dados, sem
            garantia de resultados financeiros específicos. Decisões de negócio são de
            responsabilidade do usuário.
          </p>
          <p>
            Na medida permitida pela legislação, o Nexus OS não se responsabiliza por perdas
            indiretas, lucros cessantes, danos consequenciais ou eventos fora do seu controle
            razoável.
          </p>
        </section>

        <section aria-labelledby="rescisao">
          <h2 id="rescisao">10. Rescisão</h2>
          <p>
            Podemos suspender ou encerrar o acesso ao serviço em caso de violação destes Termos, uso
            indevido ou determinação legal.
          </p>
        </section>

        <section aria-labelledby="alteracoes">
          <h2 id="alteracoes">11. Alterações destes Termos</h2>
          <p>
            Podemos atualizar estes Termos para refletir mudanças no serviço, requisitos legais ou
            melhorias. A versão vigente será publicada nesta página com a data de atualização.
          </p>
        </section>

        <section aria-labelledby="contato">
          <h2 id="contato">12. Contato</h2>
          <p>
            Dúvidas sobre estes Termos? Entre em contato em{' '}
            <a href="mailto:contato@nexusos.com.br">contato@nexusos.com.br</a>.
          </p>
        </section>
      </article>
    </Container>
  );
}
