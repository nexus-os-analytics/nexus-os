import { Stack } from '@mantine/core';
import { ComparisonSection } from './sections/ComparisonSection';
import { FAQSection } from './sections/FAQSection';
import { FeaturesTabsSection } from './sections/FeaturesTabsSection';
import { FinalCTASection } from './sections/FinalCTASection';
import { HeroSection } from './sections/HeroSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { PricingSection } from './sections/PricingSection';
import { ProblemSection } from './sections/ProblemSection';
import { SocialProofSection } from './sections/SocialProofSection';

export function Home() {
  return (
    <Stack gap={64}>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesTabsSection />
      <SocialProofSection />
      <ComparisonSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
    </Stack>
  );
}
