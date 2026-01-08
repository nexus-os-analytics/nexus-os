export const metadata = {
  title: 'Manual de Integração — Nexus OS + Bling',
  description:
    'Guia de integração segura e prática entre Nexus OS e Bling ERP: funcionamento, permissões e recomendações.',
};

import { Container } from '@mantine/core';
import { ManualConfigurations } from '@/components/pages/Manual/ManualConfigurations';
import { ManualCta } from '@/components/pages/Manual/ManualCta';
import { ManualData } from '@/components/pages/Manual/ManualData';
import { ManualFaq } from '@/components/pages/Manual/ManualFaq';
import { ManualFeatures } from '@/components/pages/Manual/ManualFeatures';
import { ManualHeader } from '@/components/pages/Manual/ManualHeader';
import { ManualHowItWorks } from '@/components/pages/Manual/ManualHowItWorks';
import { ManualIntro } from '@/components/pages/Manual/ManualIntro';
import { ManualPermissions } from '@/components/pages/Manual/ManualPermissions';
import { ManualStepByStep } from '@/components/pages/Manual/ManualStepByStep';
import { ManualSupport } from '@/components/pages/Manual/ManualSupport';

export default function ManualPage() {
  return (
    <Container size="md" px="md">
      <article>
        <ManualHeader />
        <ManualIntro id="sobre" />
        <ManualHowItWorks id="como-funciona" />
        <ManualStepByStep id="passo-a-passo" />
        <ManualPermissions id="permissoes" />
        <ManualData id="dados" />
        <ManualFeatures id="funcionalidades" />
        <ManualConfigurations id="configuracoes" />
        <section id="faq" aria-labelledby="faq">
          <ManualFaq />
        </section>
        <ManualSupport id="suporte" />
        <ManualCta id="cta" />
      </article>
    </Container>
  );
}
