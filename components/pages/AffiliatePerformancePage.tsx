import React from 'react';
import { User, Order, UserRole } from '../../types';
import AffiliatePerformanceTable from '../AffiliatePerformanceTable';

interface AffiliatePerformancePageProps {
  users: User[];
  orders: Order[];
}

const AffiliatePerformancePage: React.FC<AffiliatePerformancePageProps> = ({ users, orders }) => {
  const affiliates = users.filter(u => u.role === UserRole.AFFILIATE);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Performance Affiliati</h1>
      <p className="text-slate-500">Analizza le performance di vendita di tutti gli affiliati della piattaforma.</p>
      <AffiliatePerformanceTable affiliates={affiliates} orders={orders} />
    </div>
  );
};

export default AffiliatePerformancePage;
