
export const dynamic = 'force-dynamic';

import { HeroSection } from '@/components/sections/HeroSection';
import { StatsCounter } from '@/components/sections/StatsCounter';
import { SystemsPreview } from '@/components/sections/SystemsPreview';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { ProjectsGrid } from '@/components/sections/ProjectsGrid';
import { TestimonialsSlider } from '@/components/sections/TestimonialsSlider';
import { CTASection } from '@/components/sections/CTASection';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <HeroSection />
      <StatsCounter locale={locale} />
      <SystemsPreview locale={locale} />
      <ServicesSection locale={locale} />
      <ProjectsGrid locale={locale} />
      <TestimonialsSlider locale={locale} />
      <CTASection locale={locale} />
    </>
  );
}
