'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sun } from 'lucide-react';

// ─── شعار واتساب ───────────────────────────────────────────────────────────────
function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── أنواع الرسائل ─────────────────────────────────────────────────────────────
type Sender = 'bot' | 'user';
interface ChatMessage {
  id: number;
  from: Sender;
  text: string;
  cta?: { label: string; href: string; external?: boolean };
}

interface QuickReply {
  label: string;
  answer: string;
  cta?: { label: string; href: string; external?: boolean };
}

interface ChatWidgetProps {
  whatsapp?: string;
  phone?: string;
  brandName?: string;
}

// ─── محتوى البوت (فصحى) ────────────────────────────────────────────────────────
const GREETING =
  'أهلاً بك في فريق الطاقة الشمسية 👋 كيف نساعدك اليوم؟ اختر من الأسئلة السريعة أو اكتب سؤالك مباشرة.';

function buildQuickReplies(): QuickReply[] {
  return [
    {
      label: '☀️ احسب حجم نظامي وتكلفته',
      answer:
        'حاسبتنا الذكية تعطيك حجم النظام المناسب وعدد الألواح والسعر التقريبي خلال أقل من دقيقة، فقط أدخل قيمة فاتورتك الشهرية.',
      cta: { label: 'افتح الحاسبة ←', href: '/calculator' },
    },
    {
      label: '🔌 ما الفرق بين أنواع الأنظمة؟',
      answer:
        'لدينا ثلاثة أنواع: «شبكي» (الأقل تكلفة، متصل بالشبكة)، «مستقل» (يعمل على بطاريات دون شبكة)، و«هجين» (شبكة + بطاريات احتياطية تعمل وقت الانقطاع). الحاسبة تشرحها وتختار الأنسب لك.',
      cta: { label: 'تعرّف على الأنظمة ←', href: '/calculator' },
    },
    {
      label: '💰 كم تكلفة نظام منزلي؟',
      answer:
        'للأنظمة الشبكية المنزلية (3 إلى 6 كيلوواط) تتراوح التكلفة الكاملة عادةً بين ₪12,500 و₪22,000 شاملة الألواح والإنفيرتر والتركيب الكامل. للسعر الدقيق لحالتك استخدم الحاسبة.',
      cta: { label: 'احسب سعرك الآن ←', href: '/calculator' },
    },
    {
      label: '📞 أريد التحدث مع مختص',
      answer:
        'بكل سرور! فريقنا جاهز للرد على استفساراتك ومساعدتك في اختيار النظام الأنسب. تواصل معنا مباشرة عبر واتساب.',
    },
  ];
}

let msgId = 0;
const nextId = () => ++msgId;

export function ChatWidget({
  whatsapp = '970591234567',
  phone = '',
  brandName = 'فريق الطاقة الشمسية',
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const quickReplies = buildQuickReplies();

  const waUrl = useCallback(
    (text: string) =>
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`,
    [whatsapp],
  );

  // تلميح جذب بعد قليل من تحميل الصفحة
  useEffect(() => {
    const t = setTimeout(() => setShowNudge(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // رسالة ترحيب عند أول فتح
  useEffect(() => {
    if (open && messages.length === 0) {
      setShowNudge(false);
      setTyping(true);
      const t = setTimeout(() => {
        setMessages([{ id: nextId(), from: 'bot', text: GREETING }]);
        setTyping(false);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [open, messages.length]);

  // تمرير لأسفل عند كل رسالة
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  function pushUser(text: string) {
    setMessages(prev => [...prev, { id: nextId(), from: 'user', text }]);
  }

  function pushBot(text: string, cta?: ChatMessage['cta']) {
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: nextId(), from: 'bot', text, cta }]);
      setTyping(false);
    }, 650);
  }

  function handleQuickReply(q: QuickReply) {
    pushUser(q.label);
    if (q.cta) {
      pushBot(q.answer, q.cta);
    } else {
      // "أريد التحدث مع مختص" → زر واتساب
      pushBot(q.answer, {
        label: 'افتح واتساب 💬',
        href: waUrl('أهلاً، أريد التحدث مع مختص بخصوص نظام طاقة شمسية'),
        external: true,
      });
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput('');
    pushBot(
      'شكراً لتواصلك! لإجابة دقيقة وسريعة على سؤالك، تابع معنا مباشرة على واتساب وسيرد عليك أحد المختصين.',
      {
        label: 'أكمل على واتساب 💬',
        href: waUrl(`أهلاً، لدي استفسار: ${text}`),
        external: true,
      },
    );
  }

  return (
    <>
      {/* ───── لوحة المحادثة ───── */}
      <AnimatePresence>
        {open && (
          <motion.div
            dir="rtl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed z-[60] flex flex-col overflow-hidden shadow-2xl
                       bottom-24 left-4 right-4 sm:right-auto sm:left-6 sm:w-[380px]
                       rounded-3xl"
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border, #e5e7eb)',
              maxHeight: 'min(560px, calc(100vh - 140px))',
            }}
          >
            {/* الترويسة */}
            <div
              className="flex items-center gap-3 p-4"
              style={{ background: 'linear-gradient(135deg, var(--solar-gold, #f5a623), #e8890b)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 text-white">
                <Sun className="h-6 w-6" />
              </div>
              <div className="flex-1 text-white">
                <p className="font-bold leading-tight">{brandName}</p>
                <p className="text-xs flex items-center gap-1 opacity-90">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  متصل الآن — عادةً نرد خلال دقائق
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="إغلاق المحادثة"
                className="text-white/90 hover:text-white p-1 rounded-full hover:bg-white/15 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* الرسائل */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ background: 'var(--bg-primary, #f9fafb)' }}
            >
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[85%]">
                    <div
                      className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                      style={
                        m.from === 'user'
                          ? { background: 'var(--solar-gold, #f5a623)', color: '#fff', borderBottomRightRadius: 6 }
                          : { background: 'var(--bg-card, #fff)', color: 'var(--text-primary, #1f2937)', border: '1px solid var(--border, #e5e7eb)', borderBottomLeftRadius: 6 }
                      }
                    >
                      {m.text}
                    </div>
                    {m.cta && (
                      <a
                        href={m.cta.href}
                        target={m.cta.external ? '_blank' : undefined}
                        rel={m.cta.external ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-1 mt-2 text-sm font-semibold px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(245,166,35,0.12)', color: 'var(--solar-gold, #c9780a)' }}
                      >
                        {m.cta.label}
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {/* مؤشر الكتابة */}
              {typing && (
                <div className="flex justify-end">
                  <div
                    className="rounded-2xl px-4 py-3 flex items-center gap-1"
                    style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderBottomLeftRadius: 6 }}
                  >
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: 'var(--text-secondary, #9ca3af)', animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* الردود السريعة (تظهر بعد الترحيب) */}
              {!typing && messages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {quickReplies.map(q => (
                    <button
                      key={q.label}
                      onClick={() => handleQuickReply(q)}
                      className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                      style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text-primary, #374151)' }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* زر واتساب الدائم + الإدخال */}
            <div style={{ borderTop: '1px solid var(--border, #e5e7eb)', background: 'var(--bg-card, #fff)' }}>
              <a
                href={waUrl('أهلاً، أريد الاستفسار عن أنظمة الطاقة الشمسية')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(145deg, #25D366, #128C7E)' }}
              >
                <WhatsAppLogo className="h-5 w-5" />
                تواصل مباشر عبر واتساب
              </a>
              <div className="flex items-center gap-2 p-2.5">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 text-sm px-3 py-2 rounded-full outline-none"
                  style={{ background: 'var(--bg-primary, #f3f4f6)', color: 'var(--text-primary, #1f2937)', border: '1px solid var(--border, #e5e7eb)' }}
                />
                <button
                  onClick={handleSend}
                  aria-label="إرسال"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ background: 'var(--solar-gold, #f5a623)' }}
                >
                  <Send className="h-4 w-4" style={{ transform: 'scaleX(-1)' }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── تلميح الجذب ───── */}
      <AnimatePresence>
        {showNudge && !open && (
          <motion.button
            dir="rtl"
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed z-[55] bottom-7 left-24 max-w-[220px] text-right rounded-2xl px-4 py-2.5 shadow-lg text-sm hidden sm:block"
            style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text-primary, #1f2937)' }}
          >
            <span className="font-semibold">عندك سؤال عن الطاقة الشمسية؟</span>
            <br />
            <span style={{ color: 'var(--text-secondary, #6b7280)' }}>احسب نظامك أو اسألنا الآن 👇</span>
            <span
              onClick={(e) => { e.stopPropagation(); setShowNudge(false); }}
              className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'var(--border, #e5e7eb)', color: 'var(--text-secondary, #6b7280)' }}
            >
              ✕
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ───── الزر العائم ───── */}
      <div className="fixed bottom-6 left-6 z-[56]">
        <motion.button
          onClick={() => setOpen(v => !v)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl text-white relative"
          style={{
            background: open
              ? 'linear-gradient(145deg, #6b7280, #4b5563)'
              : 'linear-gradient(145deg, var(--solar-gold, #f5a623), #e8890b)',
            boxShadow: '0 4px 20px rgba(245,166,35,0.45)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={open ? 'إغلاق المحادثة' : 'افتح المحادثة'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="h-7 w-7" />
              </motion.span>
            ) : (
              <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle className="h-7 w-7" />
              </motion.span>
            )}
          </AnimatePresence>
          {!open && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: 'var(--solar-gold, #f5a623)' }} />
          )}
        </motion.button>
      </div>
    </>
  );
}
