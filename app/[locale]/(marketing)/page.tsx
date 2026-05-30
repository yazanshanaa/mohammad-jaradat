
export const dynamic = 'force-dynamic';

import { HeroSection } from '@/components/sections/HeroSection';
import { StatsCounter } from '@/components/sections/StatsCounter';
import { SystemsPreview } from '@/components/sections/SystemsPreview';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { ProjectsGrid } from '@/components/sections/ProjectsGrid';
import { TestimonialsSlider } from '@/components/sections/TestimonialsSlider';
import { CTASection } from '@/components/sections/CTASection';
import { getSettings } from '@/lib/settings';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getSettings();
  const showProjects = settings['section_projects_visible'] !== 'false';

  return (
    <>
      <HeroSection />
      <StatsCounter locale={locale} />
      <SystemsPreview locale={locale} />
      <ServicesSection locale={locale} />
      {showProjects && <ProjectsGrid locale={locale} />}
      <TestimonialsSlider locale={locale} />
      <CTASection locale={locale} />
    </>
  );
}
