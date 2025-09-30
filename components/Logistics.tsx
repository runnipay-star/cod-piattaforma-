import React, { useState, useEffect } from 'react';
import { type User, type Sale, type Product, OrderStatus } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../LanguageContext';
import OrderDetailModal from './OrderDetailModal';

interface LogisticsProps {
    currentUser: User;
    allUsers: User[];
}

const getStatusColorClasses = (status: OrderStatus): string => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-block";
    switch (status) {
        case OrderStatus.PENDING: return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case OrderStatus.CONFIRMED: return `${baseClasses} bg-blue-100 text-blue-800`;
        case OrderStatus.SHIPPED: return `${baseClasses} bg-purple-100 text-purple-800`;
        case OrderStatus.DELIVERED: return `${baseClasses} bg-green-100 text-green-800`;
        case OrderStatus.RELEASED: return `${baseClasses} bg-teal-100 text-teal-800`;
        case OrderStatus.USER_CANCELLED: return `${baseClasses} bg-gray-100 text-gray-800`;
        case OrderStatus.ADMIN_CANCELLED: return `${baseClasses} bg-red-100 text-red-800`;
        case OrderStatus.RETURNED: return `${baseClasses} bg-orange-100 text-orange-800`;
        default: return `${baseClasses} bg-gray-200 text-gray-900`;
    }
};

interface StatusUpdateModalProps {
    sale: Sale;
    onClose: () => void;
    onSave: (saleId: string, updates: { status: OrderStatus; trackingCode?: string }) => Promise<void>;
    isSaving: boolean;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ sale, onClose, onSave, isSaving }) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<OrderStatus>(sale.status);
    const [trackingCode, setTrackingCode] = useState(sale.trackingCode || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (status === OrderStatus.SHIPPED && !trackingCode.trim()) {
            setError(t('trackingCodeRequired'));
            return;
        }
        onSave(sale.id, { status, trackingCode: trackingCode.trim() || undefined });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('updateStatus')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">{t('status')}</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as OrderStatus)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Object.values(OrderStatus).map(s => (
                                <option key={s} value={s}>{t(s.replace(/\s/g, ''))}</option>
                            ))}
                        </select>
                    </div>
                    {status === OrderStatus.SHIPPED && (
                        <div>
                            <label htmlFor="trackingCode" className="block text-sm font-medium text-gray-700">{t('trackingCode')}</label>
                            <input
                                type="text"
                                id="trackingCode"
                                value={trackingCode}
                                onChange={(e) => setTrackingCode(e.target.value)}
                                placeholder={t('addTrackingCode')}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50">{t('cancel')}</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {isSaving ? t('saving') : t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Logistics: React.FC<LogisticsProps> = ({ currentUser, allUsers }) => {
    const { t } = useTranslation();
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [salesData, productsData] = await Promise.all([
                    api.getSales(),
                    api.getProducts(),
                ]);
                setSales(salesData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenUpdateModal = (sale: Sale) => {
        setSelectedSale(sale);
        setIsUpdateModalOpen(true);
    };

    const handleOpenDetailModal = (sale: Sale) => {
        setSelectedSale(sale);
    };

    const handleCloseModal = () => {
        setSelectedSale(null);
        setIsUpdateModalOpen(false);
    };

    const handleStatusSave = async (saleId: string, updates: { status: OrderStatus; trackingCode?: string }) => {
        setIsSaving(true);
        try {
            const updatedSale = await api.updateSale(saleId, updates);
            setSales(prev => prev.map(s => s.id === saleId ? updatedSale : s));
            setSuccessMessage(t('statusUpdated'));
            setTimeout(() => setSuccessMessage(''), 3000);
            handleCloseModal();
        } catch (error) {
            console.error("Failed to update sale status:", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) return <div className="text-center p-8">{t('loadingData')}</div>;
    
    const getProductName = (id: number) => products.find(p => p.id === id)?.name || `ID: ${id}`;
    
    const selectedProduct = selectedSale ? products.find(p => p.id === selectedSale.productId) : null;
    const selectedAffiliate = selectedSale ? allUsers.find(u => u.id === selectedSale.affiliateId) : null;


    return (
        <div className="space-y-6">
            {isUpdateModalOpen && selectedSale && (
                <StatusUpdateModal
                    sale={selectedSale}
                    onClose={handleCloseModal}
                    onSave={handleStatusSave}
                    isSaving={isSaving}
                />
            )}
            
            {selectedSale && !isUpdateModalOpen && selectedProduct && selectedAffiliate && (
                 <OrderDetailModal
                    sale={selectedSale}
                    product={selectedProduct}
                    affiliate={selectedAffiliate}
                    onClose={handleCloseModal}
                />
            )}

            <div>
                <h2 className="text-3xl font-bold text-gray-800">{t('leads')}</h2>
                <p className="text-gray-500 mt-1">{t('leadsDescription')}</p>
            </div>

            {successMessage && (
                <div className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg shadow-sm">
                    {successMessage}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('tableHeaderDate')}</th>
                                <th scope="col" className="px-6 py-3">{t('tableHeaderProduct')}</th>
                                <th scope="col" className="px-6 py-3">{t('customerDetails')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('status')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr 
                                    key={sale.id} 
                                    className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleOpenDetailModal(sale)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(sale.date).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{getProductName(sale.productId)}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-800">{sale.customerName}</p>
                                        <p className="text-gray-600">{sale.customerAddress}</p>
                                        <p className="text-gray-600">{sale.customerPhone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={getStatusColorClasses(sale.status)}>{t(sale.status.replace(/\s/g, ''))}</span>
                                        {sale.status === OrderStatus.SHIPPED && sale.trackingCode && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {t('trackingCode')}: <span className="font-semibold">{sale.trackingCode}</span>
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenUpdateModal(sale);
                                            }}
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            {t('updateStatus')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Logistics;