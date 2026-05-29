'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sun, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } else {
      router.push('/dashboard/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#0A2540' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ backgroundColor: 'rgba(245,166,35,0.2)' }}>
            <Sun className="h-8 w-8" style={{ color: '#F5A623' }} />
          </div>
          <h1 className="text-2xl font-bold text-white">SolarPro Admin</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>لوحة التحكم</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-5"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="space-y-2">
            <Label className="text-white text-sm">البريد الإلكتروني</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@solarpro.ps"
              required
              className="h-11 text-white placeholder:text-white/30 border-white/20 focus:border-yellow-400"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">كلمة المرور</Label>
            <div className="relative">
              <Input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 text-white placeholder:text-white/30 border-white/20 focus:border-yellow-400 pe-10"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute end-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
              >
                {showPass ? <EyeOff className="h-4 w-4 text-white" /> : <Eye className="h-4 w-4 text-white" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm text-red-300" style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 font-bold text-white"
            style={{ backgroundColor: '#F5A623' }}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 me-2 animate-spin" />جاري الدخول...</>
            ) : (
              'تسجيل الدخول'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
