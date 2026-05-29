import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { Sun, Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

export async function Footer() {
  const settings = await getSettings();

  const phone = settings.phone || '+970591234567';
  const email = settings.email || 'info@solarpro.ps';
  const addressAr = settings.address_ar || 'رام الله، فلسطين';
  const hoursAr = settings.working_hours_ar || 'الأحد - الخميس: 8:00 - 17:00';

  const socialLinks = [
    { icon: Facebook, href: settings.facebook, label: 'Facebook' },
    { icon: Instagram, href: settings.instagram, label: 'Instagram' },
    { icon: Youtube, href: settings.youtube, label: 'YouTube' },
    { icon: Linkedin, href: settings.linkedin, label: 'LinkedIn' },
  ].filter(s => s.href);

  const quickLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/systems', label: 'الأنظمة' },
    { href: '/services', label: 'الخدمات' },
    { href: '/projects', label: 'المشاريع' },
    { href: '/calculator', label: 'الحاسبة' },
  ];

  const serviceLinks = [
    { href: '/services', label: 'تركيب الأنظمة الشمسية' },
    { href: '/services', label: 'الصيانة الدورية' },
    { href: '/services', label: 'الاستشارة الفنية' },
    { href: '/services', label: 'المراقبة الذكية' },
    { href: '/calculator', label: 'حاسبة الطاقة' },
  ];

  return (
    <footer
      className="mt-auto"
      style={{ backgroundColor: 'var(--navy)', color: 'rgba(255,255,255,0.85)' }}
    >
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--solar-gold), var(--solar-gold-dark))' }}
              >
                <Sun className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">
                Solar<span style={{ color: 'var(--solar-gold)' }}>Pro</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
              الشركة الرائدة في حلول الطاقة الشمسية في فلسطين
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 social-icon"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white flex items-center gap-2"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--solar-gold)' }}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">خدماتنا</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white flex items-center gap-2"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--eco-green)' }}
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--solar-gold)' }} />
                <a
                  href={`tel:${phone}`}
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--solar-gold)' }} />
                <a
                  href={`mailto:${email}`}
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--solar-gold)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {addressAr}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--solar-gold)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {hoursAr}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <p>© {new Date().getFullYear()} SolarPro. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
