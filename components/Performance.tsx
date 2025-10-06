import React from 'react';
import { Sale, Product, User, Role } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface PerformanceProps {
    sales: Sale[];
    products: Product[];
    affiliates: User[];
    currentUser: User | null;
}

export const Performance: React.FC<PerformanceProps> = ({ sales, products, affiliates, currentUser }) => {
    const { t } = useLocalization();
    const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

    const relevantSales = React.useMemo(() => {
        let filteredSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (currentUser?.role === Role.AFFILIATE) {
            return filteredSales.filter(s => s.affiliateId === currentUser.id);
        }
        return filteredSales;
    }, [sales, currentUser]);

    const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'N/A';
    const getAffiliateName = (id: string) => {
        const user = affiliates.find(a => a.id === id);
        return user?.name || 'N/A';
    }
    
    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-neutral mb-6">{t('performance')}</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-xl font-bold text-neutral">{t('salesLog')}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('date')}</th>
                                <th scope="col" className="px-6 py-3">{t('product')}</th>
                                {currentUser?.role !== Role.AFFILIATE && <th scope="col" className="px-6 py-3">{t('affiliate')}</th>}
                                <th scope="col" className="px-6 py-3">{t('amount')}</th>
                                <th scope="col" className="px-6 py-3">{t('commission')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {relevantSales.map((sale, index) => (
                                <tr key={`${sale.productId}-${sale.date}-${index}`} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString('it-IT')}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{getProductName(sale.productId)}</td>
                                    {currentUser?.role !== Role.AFFILIATE && <td className="px-6 py-4">{getAffiliateName(sale.affiliateId)}</td>}
                                    <td className="px-6 py-4">{currencyFormatter.format(sale.amount)}</td>
                                    <td className="px-6 py-4 text-green-600 font-semibold">{currencyFormatter.format(sale.affiliateCommission)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};