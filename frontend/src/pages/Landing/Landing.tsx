import { HeroSection } from '../../components/landing/HeroSection';
import { TrustSection } from '../../components/landing/TrustSection';
import { FeatureShowcase } from '../../components/landing/FeatureShowcase';
import { IntegrationsMarquee } from '../../components/landing/IntegrationsMarquee';
import { Testimonials } from '../../components/landing/Testimonials';

export function Landing() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <FeatureShowcase />
      <IntegrationsMarquee />
      <Testimonials />
    </>
  );
}
