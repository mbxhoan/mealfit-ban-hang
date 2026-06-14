'use client';

import ReportView from '@/src/components/ReportView';
import { useData } from '@/contexts/DataContext';

export default function ReportsPage() {
  const { orders, meals } = useData();
  return <ReportView orders={orders} meals={meals} />;
}
