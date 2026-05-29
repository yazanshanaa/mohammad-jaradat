import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SolarPro',
  description: 'SolarPro - Solar Energy Solutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
