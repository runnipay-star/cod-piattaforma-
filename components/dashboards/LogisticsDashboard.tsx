import React, { useMemo, useState } from 'react';
import { Order, UserRole, OrderStatus, User, Product } from '../../types';
import DashboardCard from '../DashboardCard';
import OrderTable from '../OrderTable';
import { TruckIcon, ShoppingCartIcon } from '../Icons';
import OrderDetailModal from '../OrderDetailModal';

interface LogisticsDashboardProps {
  orders: Order[];
  users: User[];
  products: Product[];
  currentUser: User;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const LogisticsDashboard: React.FC<LogisticsDashboardProps> = ({ orders, users, products, currentUser, onUpdateStatus }) => {
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const toShipCount = useMemo(() => 
    orders.filter(o => o.status === OrderStatus.READY_FOR_SHIPPING).length,
  [orders]);
  
  const inTransitCount = useMemo(() => 
    orders.filter(o => o.status === OrderStatus.SHIPPED).length,
  [orders]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DashboardCard title="Ordini da Spedire" value={toShipCount} icon={<ShoppingCartIcon className="h-8 w-8 text-orange-600"/>} color="bg-orange-100" />
        <DashboardCard title="In Transito" value={inTransitCount} icon={<TruckIcon className="h-8 w-8 text-purple-600"/>} color="bg-purple-100" />
      </div>

      <OrderTable 
        title="Gestione Spedizioni" 
        orders={orders} 
        currentUser={currentUser}
        users={users}
        products={products}
        onUpdateStatus={onUpdateStatus}
        onViewDetails={setViewingOrder}
      />
      
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

export default React.memo(LogisticsDashboard);