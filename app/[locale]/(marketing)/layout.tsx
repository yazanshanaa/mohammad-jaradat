import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChatWidget } from '@/components/layout/ChatWidget';
import { getSettings } from '@/lib/settings';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const showServices = settings['section_services_visible'] !== 'false';
  const showProjects = settings['section_projects_visible'] !== 'false';
  const showStore = settings['store_enabled'] !== 'false';
  const whatsapp = settings['whatsapp'] || '970591234567';
  const phone = settings['phone'] || '';
  const brandName = settings['site_name_ar'] || 'فريق الطاقة الشمسية';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showServices={showServices} showProjects={showProjects} showStore={showStore} whatsapp={whatsapp} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget whatsapp={whatsapp} phone={phone} brandName={brandName} />
    </div>
  );
}
