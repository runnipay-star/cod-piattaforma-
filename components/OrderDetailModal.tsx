import React from 'react';
import { type Sale, type Product, type User, OrderStatus } from '../types';
import { useTranslation } from '../LanguageContext';

interface OrderDetailModalProps {
  sale: Sale;
  product: Product;
  affiliate: User;
  onClose: () => void;
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


const DetailRow: React.FC<{ label: string; value: React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
    <div className={fullWidth ? 'col-span-2' : ''}>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 font-semibold">{value}</dd>
    </div>
);


const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ sale, product, affiliate, onClose }) => {
    const { t } = useTranslation();
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-gray-800">{t('orderDetails')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Order Summary */}
                    <div className="border-b pb-4">
                        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                            <DetailRow label={t('orderId')} value={sale.id} />
                            <DetailRow label={t('orderDate')} value={new Date(sale.date).toLocaleString()} />
                            <DetailRow label={t('status')} value={<span className={getStatusColorClasses(sale.status)}>{t(sale.status.replace(/\s/g, ''))}</span>} />
                            {sale.trackingCode && <DetailRow label={t('trackingCode')} value={sale.trackingCode} />}
                        </dl>
                    </div>

                    {/* Product & Affiliate */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('productInformation')}</h3>
                            <div className="flex items-start space-x-4">
                                <img src={(product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : 'https://placehold.co/100x100?text=No+Image'} alt={product.name} className="w-24 h-24 rounded-md object-cover flex-shrink-0" />
                                <dl className="space-y-2">
                                    <DetailRow label={t('productName')} value={product.name} />
                                    <DetailRow label={t('productSku')} value={product.sku} />
                                </dl>
                            </div>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('affiliateInformation')}</h3>
                             <dl className="space-y-2">
                                <DetailRow label={t('affiliateName')} value={`${affiliate.firstName} ${affiliate.lastName}`} />
                                <DetailRow label={t('subId')} value={sale.subId || 'N/A'} />
                            </dl>
                        </div>
                    </div>

                    {/* Customer */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('customerInformation')}</h3>
                         <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
                            <DetailRow label={t('name')} value={sale.customerName} />
                            <DetailRow label={t('customerPhone')} value={sale.customerPhone} />
                            <DetailRow label={t('customerAddress')} value={sale.customerAddress} fullWidth={true}/>
                         </dl>
                    </div>

                    {/* Financial */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('orderSummary')}</h3>
                         <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
                            <DetailRow label={t('quantity')} value={sale.quantity} />
                            <DetailRow label={t('totalPrice')} value={`€${sale.totalPrice.toFixed(2)}`} />
                            <DetailRow label={t('commissionValue')} value={`€${sale.commissionValue.toFixed(2)}`} />
                         </dl>
                    </div>

                </div>
                 <div className="sticky bottom-0 bg-gray-50 px-6 py-3 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">{t('close')}</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;