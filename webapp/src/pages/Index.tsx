import { GraphCanvas } from '@/components/landing/GraphCanvas';
import { Nav } from '@/components/landing/Nav';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureSections } from '@/components/landing/FeatureSections';
import { DataLayerSection } from '@/components/landing/DataLayerSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default function Index() {
  return (
    <div className="relative min-h-screen" style={{ background: 'hsl(0 0% 4%)' }}>
      {/* Animated graph canvas — fixed, full-page background */}
      <GraphCanvas />

      {/* Content layer */}
      <div className="relative" style={{ zIndex: 1 }}>
        <Nav />
        <ProblemSection />
        <HeroSection />
        <FeatureSections />
        <DataLayerSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
