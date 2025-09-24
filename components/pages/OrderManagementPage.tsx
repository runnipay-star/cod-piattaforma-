import React, { useState, useMemo } from 'react';
import { Order, User, Product, OrderStatus, UserRole } from '../../types';
import AllOrdersTable from '../AllOrdersTable';
import CreateOrderModal from '../CreateOrderModal';
import EditOrderModal from '../EditOrderModal';
import OrderDetailModal from '../OrderDetailModal';
import { PlusIcon, ArrowDownTrayIcon } from '../Icons';

interface OrderManagementPageProps {
  orders: Order[];
  users: User[];
  products: Product[];
  currentUser: User;
  onCreateOrder: (orderData: Omit<Order, 'id' | 'date' | 'createdAt' | 'status' | 'conversionId'>) => Promise<boolean>;
  onUpdateOrder: (order: Order) => Promise<boolean>;
  onDeleteOrder: (orderId: string) => void;
}

const OrderManagementPage: React.FC<OrderManagementPageProps> = (props) => {
    const { orders, users, products, currentUser, onCreateOrder, onUpdateOrder, onDeleteOrder } = props;

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const affiliates = useMemo(() => users.filter(u => u.role === UserRole.AFFILIATE), [users]);
    const canManageOrders = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;
    
    const affiliatesMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const statusMatch = statusFilter === 'all' || order.status === statusFilter;
            
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = !searchLower ||
                (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
                (order.productName && order.productName.toLowerCase().includes(searchLower)) ||
                (affiliatesMap.get(order.affiliateId)?.toLowerCase().includes(searchLower))

            return statusMatch && searchMatch;
        });
    }, [orders, statusFilter, searchTerm, affiliatesMap]);
    
    const handleExportCsv = () => {
        const canSeeLeadDetails = [UserRole.ADMIN, UserRole.MANAGER, UserRole.CALL_CENTER].includes(currentUser.role);

        const headers = [
            "ID Conversione", "ID Ordine", "Data", "Stato",
            "Nome Cliente", "Telefono Cliente", "Indirizzo Cliente",
            "Nome Prodotto", "Quantità", "Prezzo Totale",
            "ID Affiliato", "Nome Affiliato", "Sub ID"
        ];

        const rows = filteredOrders.map(order => {
            const affiliateName = affiliatesMap.get(order.affiliateId) || 'N/A';
            return [
                order.conversionId,
                order.id,
                new Date(order.date).toLocaleDateString('it-IT'),
                order.status,
                canSeeLeadDetails ? order.customerName : 'N/D',
                canSeeLeadDetails ? order.customerPhone : 'N/D',
                canSeeLeadDetails ? order.customerAddress : 'N/D',
                order.productName,
                order.quantity,
                (order.totalPrice || 0).toFixed(2),
                order.affiliateId,
                affiliateName,
                order.subId || ''
            ].map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `export_ordini_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Gestione Ordini</h1>
                    <p className="text-slate-500 mt-1">Visualizza e gestisci tutti gli ordini della piattaforma.</p>
                </div>
                {canManageOrders && (
                    <div className="flex items-center gap-2">
                         <button
                            onClick={handleExportCsv}
                            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Esporta CSV
                        </button>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Crea Ordine Manuale
                        </button>
                    </div>
                )}
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row gap-4">
                 <input
                    type="text"
                    placeholder="Cerca per cliente, prodotto, affiliato..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                 />
                 <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
                    className="w-full sm:w-56 px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                 >
                     <option value="all">Tutti gli Stati</option>
                     {Object.values(OrderStatus).map(status => (
                         <option key={status} value={status}>{status}</option>
                     ))}
                 </select>
            </div>
            
            <AllOrdersTable
                orders={filteredOrders}
                users={users}
                products={products}
                onEditOrder={setEditingOrder}
                onDeleteOrder={onDeleteOrder}
                onViewDetails={setViewingOrder}
            />

            <CreateOrderModal
                isOpen={isCreateModalOpen}
                onCreateOrder={onCreateOrder}
                onClose={() => setCreateModalOpen(false)}
                products={products}
                affiliates={affiliates}
            />

            <EditOrderModal
                order={editingOrder}
                onUpdateOrder={onUpdateOrder}
                onClose={() => setEditingOrder(null)}
                products={products}
                affiliates={affiliates}
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

export default React.memo(OrderManagementPage);