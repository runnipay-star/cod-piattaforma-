import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, User, Product, UserRole } from '../types';
import { PencilSquareIcon, TrashIcon } from './Icons';

interface AllOrdersTableProps {
  orders: Order[];
  users: User[];
  products: Product[];
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onViewDetails: (order: Order) => void;
}

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

const ITEMS_PER_PAGE = 10;

const AllOrdersTable: React.FC<AllOrdersTableProps> = ({ orders, users, products, onEditOrder, onDeleteOrder, onViewDetails }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [orders, currentPage]);

    const getUserName = (userId: string | undefined) => {
        if (!userId) return 'N/A';
        return users.find(u => u.id === userId)?.name || 'Sconosciuto';
    };
    
    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    if (orders.length === 0) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Nessun Ordine Trovato</h3>
                <p className="text-slate-500">Non ci sono ordini che corrispondono ai filtri selezionati.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordine</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prodotto</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Affiliato</th>
                             <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Totale</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stato</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {paginatedOrders.map((order) => (
                            <tr key={order.id} onClick={() => onViewDetails(order)} className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">#{order.conversionId}</div>
                                    <div className="text-xs text-slate-500 font-mono truncate" title={order.id}>{order.id}</div>
                                    <div className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString('it-IT')}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-800">{order.customerName}</div>
                                    <div className="text-xs text-slate-500">{order.customerPhone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{order.productName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-800">{getUserName(order.affiliateId)}</div>
                                    {order.subId && <div className="text-xs text-slate-500">SubID: {order.subId}</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">€{(order.totalPrice || 0).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={(e) => handleActionClick(e, () => onEditOrder(order))} className="text-orange-600 hover:text-orange-900 focus:outline-none" title="Modifica">
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={(e) => handleActionClick(e, () => window.confirm('Sei sicuro di voler eliminare questo ordine?') && onDeleteOrder(order.id))} className="text-red-600 hover:text-red-900 focus:outline-none" title="Elimina">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm text-slate-600">
                    Pagina {currentPage} di {totalPages}
                </span>
                <div className="space-x-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Precedente
                    </button>
                     <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Successiva
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(AllOrdersTable);