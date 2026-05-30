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

  return (
    <footer
      className="mt-auto"
      style={{ backgroundColor: 'var(--navy)', color: 'rgba(255,255,255,0.85)' }}
    >
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
          {/* Brand */}
          <div>
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
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              الشركة الرائدة في حلول الطاقة الشمسية في فلسطين
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 flex-wrap">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 social-icon"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">تواصل معنا</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(245,166,35,0.15)' }}>
                    <Phone className="h-4 w-4" style={{ color: 'var(--solar-gold)' }} />
                  </div>
                  <span>{phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(245,166,35,0.15)' }}>
                    <Mail className="h-4 w-4" style={{ color: 'var(--solar-gold)' }} />
                  </div>
                  <span>{email}</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(245,166,35,0.15)' }}>
                  <MapPin className="h-4 w-4" style={{ color: 'var(--solar-gold)' }} />
                </div>
                <span>{addressAr}</span>
              </li>
              <li className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(245,166,35,0.15)' }}>
                  <Clock className="h-4 w-4" style={{ color: 'var(--solar-gold)' }} />
                </div>
                <span>{hoursAr}</span>
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
