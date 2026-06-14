'use client';

import { useRouter } from 'next/navigation';
import Dashboard from '@/src/components/Dashboard';
import { useData } from '@/contexts/DataContext';

export default function DashboardPage() {
  const router = useRouter();
  const { orders, meals, customers } = useData();
  return (
    <Dashboard
      orders={orders}
      meals={meals}
      customersCount={customers.length}
      onNavigate={(tab) => router.push(tab === 'meals' ? '/products' : `/${tab}`)}
    />
  );
}
