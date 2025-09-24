import React, { useMemo } from 'react';
import { Order, User, OrderStatus } from '../../types';
import DashboardCard from '../DashboardCard';
import { CurrencyEuroIcon, ShoppingCartIcon, UsersIcon } from '../Icons';
import AffiliatePerformanceTable from '../AffiliatePerformanceTable';

interface ManagerDashboardProps {
  currentUser: User;
  teamAffiliates: User[];
  teamOrders: Order[];
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ currentUser, teamAffiliates, teamOrders }) => {

  const totalRevenue = useMemo(() =>
    teamOrders
      .filter(o => o.status === OrderStatus.DELIVERED)
      .reduce((sum, order) => sum + order.totalPrice, 0),
  [teamOrders]);

  const totalOrders = useMemo(() => teamOrders.length, [teamOrders]);

  const affiliateCount = useMemo(() => teamAffiliates.length, [teamAffiliates]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Ciao, {currentUser.name}!</h1>
        <p className="text-slate-500 mt-1">Ecco il riepilogo del tuo team: <strong>{currentUser.team}</strong>.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Fatturato Team" value={`€${totalRevenue.toFixed(2)}`} icon={<CurrencyEuroIcon className="h-8 w-8 text-green-600"/>} color="bg-green-100" />
        <DashboardCard title="Ordini Team" value={totalOrders} icon={<ShoppingCartIcon className="h-8 w-8 text-blue-600"/>} color="bg-blue-100" />
        <DashboardCard title="Affiliati nel Team" value={affiliateCount} icon={<UsersIcon className="h-8 w-8 text-orange-600"/>} color="bg-orange-100" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Performance del Tuo Team</h2>
        <AffiliatePerformanceTable affiliates={teamAffiliates} orders={teamOrders} />
      </div>
    </div>
  );
};

export default React.memo(ManagerDashboard);