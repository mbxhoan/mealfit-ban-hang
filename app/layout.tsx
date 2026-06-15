import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Home-page typography: editorial serif display + friendly body. Exposed as CSS
// vars; only the public landing opts in (admin keeps its Avenir Next body font).
const fraunces = Fraunces({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const title = 'MealFit — Healthy Meal Prep';
const description =
  'MealFit: thực đơn eat-clean & combo dinh dưỡng giao tận nơi. Hệ thống quản lý bán hàng, đơn hàng và báo cáo doanh thu chuyên nghiệp.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: '%s · MealFit' },
  description,
  applicationName: 'MealFit',
  openGraph: {
    type: 'website',
    title,
    description,
    siteName: 'MealFit',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#10b981',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
