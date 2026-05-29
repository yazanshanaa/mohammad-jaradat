'use client';

import { signOut } from 'next-auth/react';
import { LogOut, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  user?: { name?: string | null; email?: string | null };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-6 shrink-0"
      style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}
      dir="rtl"
    >
      <div>
        <p className="text-sm font-semibold text-gray-800">مرحباً، {user?.name || 'Admin'}</p>
        <p className="text-xs text-gray-400">{user?.email}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-xs gap-1.5"
        >
          <a href="/ar" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" />
            عرض الموقع
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-3 w-3" />
          خروج
        </Button>
      </div>
    </header>
  );
}
