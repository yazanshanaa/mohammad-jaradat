'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sun, LayoutDashboard, Users, Zap, FolderOpen,
  Wrench, FileText, Settings, Calculator, ChevronRight,
  Star, ImageIcon, Home, Phone, Search,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard/dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/dashboard/leads', labelAr: 'العملاء المحتملون', icon: Users },
  { href: '/dashboard/systems', labelAr: 'الأنظمة الشمسية', icon: Zap },
  { href: '/dashboard/projects', labelAr: 'المشاريع', icon: FolderOpen },
  { href: '/dashboard/services', labelAr: 'الخدمات', icon: Wrench },
  { href: '/dashboard/blog', labelAr: 'المقالات', icon: FileText },
  { href: '/dashboard/testimonials', labelAr: 'التقييمات', icon: Star },
  { href: '/dashboard/media', labelAr: 'مكتبة الوسائط', icon: ImageIcon },
  { href: '/dashboard/calculator-config', labelAr: 'إعدادات الحاسبة', icon: Calculator },
  { href: '/dashboard/settings', labelAr: 'إعدادات الموقع', icon: Settings, sub: true },
  { href: '/dashboard/settings/homepage', labelAr: 'إعدادات الرئيسية', icon: Home, indent: true },
  { href: '/dashboard/settings/contact', labelAr: 'إعدادات التواصل', icon: Phone, indent: true },
  { href: '/dashboard/settings/seo', labelAr: 'إعدادات SEO', icon: Search, indent: true },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 shrink-0 flex flex-col min-h-screen"
      style={{ backgroundColor: '#0A2540' }}
      dir="rtl"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(245,166,35,0.2)' }}>
          <Sun className="h-5 w-5" style={{ color: '#F5A623' }} />
        </div>
        <span className="font-bold text-white text-lg">SolarPro</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, labelAr, icon: Icon, indent }) => {
          const isActive = indent
            ? pathname === href
            : pathname === href || (pathname.startsWith(href + '/') && !indent);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl transition-all duration-150 group ${indent ? 'px-3 py-2 mr-4' : 'px-3 py-2.5'}`}
              style={{
                backgroundColor: isActive ? 'rgba(245,166,35,0.15)' : 'transparent',
                color: isActive ? '#F5A623' : indent ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.6)',
              }}
            >
              <Icon className={`shrink-0 ${indent ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
              <span className={`font-medium flex-1 ${indent ? 'text-xs' : 'text-sm'}`}>{labelAr}</span>
              {isActive && <ChevronRight className="h-4 w-4 opacity-60 rotate-180" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>SolarPro v1.0 © 2025</p>
      </div>
    </aside>
  );
}
