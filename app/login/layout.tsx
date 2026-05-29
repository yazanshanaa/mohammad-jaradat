import { Toaster } from 'sonner';
import '../globals.css';

export const metadata = {
  title: 'تسجيل الدخول | SolarPro',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
