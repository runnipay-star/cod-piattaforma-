import React from 'react';
import { Order, OrderStatus, UserRole, User, Product } from '../types';

const statusColorMap: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [OrderStatus.READY_FOR_SHIPPING]: 'bg-orange-100 text-orange-800',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.RETURNED]: 'bg-slate-100 text-slate-800',
};

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[status]}`}>
    {status}
  </span>
);

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant: 'confirm' | 'cancel' | 'prepare' | 'ship' | 'deliver';
}

const ActionButton: React.FC<ActionButtonProps> = ({ variant, children, ...props }) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150";
    const variantClasses = {
        confirm: 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500',
        cancel: 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500',
        prepare: 'text-orange-700 bg-orange-100 hover:bg-orange-200 focus:ring-orange-500',
        ship: 'text-purple-700 bg-purple-100 hover:bg-purple-200 focus:ring-purple-500',
        deliver: 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500',
    };
    return <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>{children}</button>
}


interface OrderTableProps {
  title: string;
  orders: Order[];
  currentUser: User;
  users: User[];
  products: Product[];
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  onViewDetails?: (order: Order) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ title, orders, currentUser, users, products, onUpdateStatus, onViewDetails }) => {
  
  const getActions = (order: Order) => {
    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    switch (currentUser.role) {
      case UserRole.CALL_CENTER:
        return (
          <div className="flex space-x-2">
            <ActionButton variant="confirm" onClick={(e) => handleActionClick(e, () => onUpdateStatus?.(order.id, OrderStatus.CONFIRMED))}>Conferma</ActionButton>
            <ActionButton variant="cancel" onClick={(e) => handleActionClick(e, () => onUpdateStatus?.(order.id, OrderStatus.CANCELLED))}>Annulla</ActionButton>
          </div>
        );
      case UserRole.SUPPLIER:
        return order.status === OrderStatus.CONFIRMED && (
            <ActionButton variant="prepare" onClick={(e) => handleActionClick(e, () => onUpdateStatus?.(order.id, OrderStatus.READY_FOR_SHIPPING))}>Prepara</ActionButton>
        );
      case UserRole.LOGISTICS:
        return (
          <div className="flex space-x-2">
            {order.status === OrderStatus.READY_FOR_SHIPPING && <ActionButton variant="ship" onClick={(e) => handleActionClick(e, () => onUpdateStatus?.(order.id, OrderStatus.SHIPPED))}>Spedisci</ActionButton>}
            {order.status === OrderStatus.SHIPPED && <ActionButton variant="deliver" onClick={(e) => handleActionClick(e, () => onUpdateStatus?.(order.id, OrderStatus.DELIVERED))}>Consegnato</ActionButton>}
          </div>
        );
      case UserRole.ADMIN:
        return <span className="font-medium text-orange-600 hover:text-orange-800">Dettagli</span>;
      default:
        return null;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500">Nessun ordine da visualizzare.</p>
      </div>
    );
  }

  const checkCanSeeLeadDetails = (order: Order): boolean => {
      if ([UserRole.ADMIN, UserRole.MANAGER, UserRole.CALL_CENTER].includes(currentUser.role)) {
          return true;
      }
      if (currentUser.role === UserRole.LOGISTICS) {
          const product = products.find(p => p.id === order.productId);
          const supplier = users.find(u => u.id === product?.supplier_id);
          if (product && supplier && supplier.team && currentUser.team === supplier.team) {
              return true;
          }
      }
      return false;
  };

  const isClickable = !!onViewDetails;

  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordine</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prodotto</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Totale</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stato</th>
            {currentUser.role !== UserRole.MANAGER && currentUser.role !== UserRole.AFFILIATE && <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Azioni</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {orders.map((order) => {
            const canSeeDetails = checkCanSeeLeadDetails(order);
            return (
              <tr key={order.id} onClick={() => isClickable && onViewDetails(order)} className={`hover:bg-slate-50 transition-colors duration-150 ${isClickable ? 'cursor-pointer' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">#{order.conversionId}</div>
                  <div className="text-xs text-slate-500 font-mono truncate" title={order.id}>{order.id}</div>
                  <div className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString('it-IT')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-800">{canSeeDetails ? order.customerName : 'Dato Protetto'}</div>
                  <div className="text-xs text-slate-500">{canSeeDetails ? order.customerAddress : 'Indirizzo Protetto'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.productName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">€{(order.totalPrice || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <StatusBadge status={order.status} />
                </td>
                {currentUser.role !== UserRole.MANAGER && currentUser.role !== UserRole.AFFILIATE && <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">{getActions(order)}</td>}
              </tr>
            );
            })}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default React.memo(OrderTable);