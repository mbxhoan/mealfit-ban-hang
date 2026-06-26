import type { Metadata } from 'next';
import LegacyLandingPage from '@/components/home/LegacyLandingPage';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Về Chúng Tôi',
  description: 'Khám phá thực đơn, combo và câu chuyện thương hiệu MealFit.',
};

export default function AboutUsPage() {
  return <LegacyLandingPage />;
}
