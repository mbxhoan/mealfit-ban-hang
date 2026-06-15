'use client';

import StatisticsView from '@/src/components/StatisticsView';
import { useData } from '@/contexts/DataContext';

export default function StatisticsPage() {
  const { orders, meals } = useData();
  return <StatisticsView orders={orders} meals={meals} />;
}
