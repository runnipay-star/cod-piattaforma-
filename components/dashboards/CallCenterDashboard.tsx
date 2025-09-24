import React, { useState } from 'react';
import { Order, UserRole, OrderStatus, User, Product } from '../../types';
import DashboardCard from '../DashboardCard';
import OrderTable from '../OrderTable';
import { PhoneIcon } from '../Icons';
import OrderDetailModal from '../OrderDetailModal';

interface CallCenterDashboardProps {
  orders: Order[];
  users: User[];
  products: Product[];
  currentUser: User;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const CallCenterDashboard: React.FC<CallCenterDashboardProps> = ({ orders, users, products, currentUser, onUpdateStatus }) => {
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    
  return (
    <div className="space-y-8">
      <div className="max-w-sm">
         <DashboardCard title="Ordini da Chiamare" value={orders.length} icon={<PhoneIcon className="h-8 w-8 text-yellow-600"/>} color="bg-yellow-100" />
      </div>

      <OrderTable 
        title="Coda Chiamate" 
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

export default React.memo(CallCenterDashboard);