'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/systems', label: t('systems') },
    { href: '/services', label: t('services') },
    { href: '/projects', label: t('projects') },
    { href: '/calculator', label: t('calculator') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'shadow-lg'
            : 'bg-transparent'
        )}
        style={{
          backgroundColor: scrolled ? 'var(--bg-card)' : undefined,
          borderBottom: scrolled ? '1px solid var(--border)' : undefined,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--solar-gold), var(--solar-gold-dark))' }}
              >
                <Sun className="h-5 w-5 text-white" />
              </div>
              <span
                className="text-xl font-black tracking-tight"
                style={{ color: scrolled ? 'var(--text-primary)' : 'white' }}
              >
                Solar<span style={{ color: 'var(--solar-gold)' }}>Pro</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                    isActive(link.href)
                      ? 'font-semibold'
                      : 'hover:opacity-80'
                  )}
                  style={{
                    color: isActive(link.href)
                      ? 'var(--solar-gold)'
                      : scrolled
                      ? 'var(--text-primary)'
                      : 'rgba(255,255,255,0.9)',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side Controls */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              <Button
                asChild
                size="sm"
                className="font-semibold text-white"
                style={{ backgroundColor: 'var(--solar-gold)' }}
              >
                <a href="https://wa.me/970591234567" target="_blank" rel="noopener noreferrer">{t('getQuote')}</a>
              </Button>
            </div>

            {/* Mobile: Controls + Hamburger */}
            <div className="lg:hidden flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md"
                style={{ color: scrolled ? 'var(--text-primary)' : 'white' }}
                aria-label={t('menu')}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'block px-4 py-3 rounded-lg text-sm font-medium transition-all',
                        isActive(link.href) ? 'font-semibold' : ''
                      )}
                      style={{
                        color: isActive(link.href) ? 'var(--solar-gold)' : 'var(--text-primary)',
                        backgroundColor: isActive(link.href) ? 'rgba(245, 166, 35, 0.1)' : undefined,
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-2">
                  <Button
                    asChild
                    className="w-full font-semibold text-white"
                    style={{ backgroundColor: 'var(--solar-gold)' }}
                  >
                    <a href="https://wa.me/970591234567" target="_blank" rel="noopener noreferrer">{t('getQuote')}</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
