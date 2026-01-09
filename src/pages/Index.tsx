import { MarketingLayout } from '@/components/layout';
import {
  HeroSection,
  HowItWorksSection,
  ServicesSection,
  FeaturesSection,
  CTASection,
} from '@/components/marketing';

const Index = () => {
  return (
    <MarketingLayout>
      <HeroSection />
      <HowItWorksSection />
      <ServicesSection />
      <FeaturesSection />
      <CTASection />
    </MarketingLayout>
  );
};

export default Index;
