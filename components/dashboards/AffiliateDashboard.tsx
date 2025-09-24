import React, { useMemo, useState } from 'react';
import { Order, Product, User, OrderStatus } from '../../types';
import DashboardCard from '../DashboardCard';
import { CurrencyEuroIcon, ShoppingCartIcon } from '../Icons';
import OrderTable from '../OrderTable';
import OrderDetailModal from '../OrderDetailModal';

interface AffiliateDashboardProps {
  orders: Order[];
  products: Product[];
  currentUser: User;
  users: User[];
}

const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ orders, products, currentUser, users }) => {
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const totalRevenue = useMemo(() =>
    orders
      .filter(o => o.status === OrderStatus.DELIVERED)
      .reduce((sum, order) => sum + order.totalPrice, 0),
  [orders]);

  const totalCommission = useMemo(() => {
      const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
      return deliveredOrders.reduce((sum, order) => {
          const product = products.find(p => p.id === order.productId);
          if (product) {
              const customCommissionOverride = product.affiliate_penalties?.find(c => c.affiliate_id === currentUser.id);
              const commissionToApply = customCommissionOverride ? customCommissionOverride.commission : product.commission;
              return sum + (commissionToApply * order.quantity);
          }
          return sum;
      }, 0);
  }, [orders, products, currentUser.id]);

  const totalOrders = useMemo(() => orders.length, [orders]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Ciao, {currentUser.name}!</h1>
        <p className="text-slate-500 mt-1">Ecco il riepilogo delle tue performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Fatturato" value={`€${totalRevenue.toFixed(2)}`} icon={<CurrencyEuroIcon className="h-8 w-8 text-green-600"/>} color="bg-green-100" />
        <DashboardCard title="Commissioni Totali" value={`€${totalCommission.toFixed(2)}`} icon={<CurrencyEuroIcon className="h-8 w-8 text-yellow-600"/>} color="bg-yellow-100" />
        <DashboardCard title="Ordini Generati" value={totalOrders} icon={<ShoppingCartIcon className="h-8 w-8 text-blue-600"/>} color="bg-blue-100" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">I tuoi ordini recenti</h2>
        <OrderTable
          title="Ultimi 20 Ordini"
          orders={orders.slice(0, 20)}
          currentUser={currentUser}
          users={users}
          products={products}
          onViewDetails={setViewingOrder}
        />
      </div>

      <OrderDetailModal
        order={viewingOrder}
        users={users}
        products={products}
        onClose={() => setViewingOrder(null)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default React.memo(AffiliateDashboard);