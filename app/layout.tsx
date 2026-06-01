import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AFAQ افاق',
  description: 'افاق - حلول الطاقة الشمسية في فلسطين',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
