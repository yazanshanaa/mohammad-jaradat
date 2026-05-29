'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  phone?: string;
  message?: string;
}

export function FloatingWhatsApp({
  phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '972591234567',
  message = 'مرحباً! أريد الاستفسار عن أنظمة الطاقة الشمسية.',
}: FloatingWhatsAppProps) {
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 left-6 z-50" style={{ direction: 'ltr' }}>
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white relative"
        style={{ backgroundColor: '#25D366' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="تواصل عبر واتساب"
      >
        <MessageCircle className="h-7 w-7" />
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: '#25D366' }}
        />
      </motion.a>
    </div>
  );
}

export function ScrollToTop() {
  return null;
}
