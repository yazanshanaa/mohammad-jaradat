import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Zap, FolderOpen, Mail, TrendingUp, Wrench } from 'lucide-react';
import Link from 'next/link';

async function getStats() {
  try {
    const [totalProjects, totalSystems, totalSubscribers, totalServices] = await Promise.all([
      prisma.project.count({ where: { isActive: true } }),
      prisma.solarSystem.count({ where: { isActive: true } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.service.count({ where: { isActive: true } }),
    ]);
    return { totalProjects, totalSystems, totalSubscribers, totalServices };
  } catch {
    return { totalProjects: 0, totalSystems: 0, totalSubscribers: 0, totalServices: 0 };
  }
}

export default async function DashboardPage() {
  const _session = await auth();
  const stats = await getStats();

  const cards = [
    { label: 'المشاريع النشطة', value: stats.totalProjects, sub: 'مشروع منجز', icon: FolderOpen, color: '#8B5CF6', href: '/dashboard/projects' },
    { label: 'الأنظمة الشمسية', value: stats.totalSystems, sub: 'نظام متاح', icon: Zap, color: '#F5A623', href: '/dashboard/systems' },
    { label: 'الخدمات النشطة', value: stats.totalServices, sub: 'خدمة مفعّلة', icon: Wrench, color: '#10B981', href: '/dashboard/services' },
    { label: 'مشتركو النشرة', value: stats.totalSubscribers, sub: 'مشترك نشط', icon: Mail, color: '#3B82F6', href: '/dashboard/settings' },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-sm text-gray-500 mt-0.5">نظرة عامة على أداء الموقع</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/systems', label: 'إدارة الأنظمة الشمسية', icon: Zap, color: '#F5A623' },
          { href: '/dashboard/projects', label: 'إضافة مشروع جديد', icon: FolderOpen, color: '#8B5CF6' },
          { href: '/dashboard/calculator-config', label: 'ضبط إعدادات الحاسبة', icon: TrendingUp, color: '#10B981' },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <span className="font-medium text-gray-800 text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
