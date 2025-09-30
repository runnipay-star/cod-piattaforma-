import React, { useState, useEffect, useMemo } from 'react';
import { type User, type Sale, type Product, UserRole, OrderStatus } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../LanguageContext';
import { Icons } from '../constants';

type Period = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth';

interface Filters {
    period: Period;
    productId: string; // 'all' or a product ID
    subId: string;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-blue-100 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
    </div>
);


const LiveStatistics: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const { t } = useTranslation();
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState<Filters>({
        period: 'thisWeek',
        productId: 'all',
        subId: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [salesData, productsData] = await Promise.all([api.getSales(), api.getProducts()]);
                setSales(salesData);
                setProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const { summary, productStats } = useMemo(() => {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = new Date();

        switch (filters.period) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'yesterday':
                startDate = new Date(new Date().setDate(now.getDate() - 1));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'thisWeek':
                const firstDayOfWeek = new Date(now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)));
                firstDayOfWeek.setHours(0, 0, 0, 0);
                startDate = firstDayOfWeek;
                endDate = new Date();
                endDate.setHours(23,59,59,999);
                break;
            case 'lastWeek':
                const lastWeekEnd = new Date();
                lastWeekEnd.setDate(now.getDate() - (now.getDay() === 0 ? 0 : now.getDay()));
                lastWeekEnd.setHours(23,59,59,999);
                const lastWeekStart = new Date(lastWeekEnd);
                lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
                lastWeekStart.setHours(0,0,0,0);
                startDate = lastWeekStart;
                endDate = lastWeekEnd;
                break;
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate.setHours(23,59,59,999);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                break;
        }

        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            const isAffiliateMatch = currentUser.role === UserRole.AFFILIATE ? sale.affiliateId === currentUser.id : true;
            const isDateMatch = saleDate >= startDate && saleDate <= endDate;
            const isProductMatch = filters.productId === 'all' || sale.productId === parseInt(filters.productId);
            const isSubIdMatch = filters.subId.trim() === '' || (sale.subId && sale.subId.toLowerCase().includes(filters.subId.trim().toLowerCase()));
            return isAffiliateMatch && isDateMatch && isProductMatch && isSubIdMatch;
        });

        // Fix: Explicitly type the accumulator to resolve type inference issues with `productSales`.
        const salesByProduct = filteredSales.reduce((acc: Record<number, Sale[]>, sale) => {
            const { productId } = sale;
            if (!acc[productId]) {
                acc[productId] = [];
            }
            acc[productId].push(sale);
            return acc;
        }, {});

        const payableStatuses = [OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.RELEASED, OrderStatus.SHIPPED];

        const stats = Object.entries(salesByProduct).map(([productIdStr, productSales]) => {
            const productId = parseInt(productIdStr, 10);
            const product = products.find(p => p.id === productId);
            if (!product) return null;

            const totalConversions = productSales.length;
            const approvedConversions = productSales.filter(s => payableStatuses.includes(s.status)).length;
            const approvalRate = totalConversions > 0 ? (approvedConversions / totalConversions) * 100 : 0;
            
            let payableCommission = 0;
            if (productSales.length > 0) {
                 if (typeof product.tolerance !== 'undefined' && product.tolerance !== null) {
                    const requiredRate = 100 - product.tolerance;
                    if (approvalRate >= requiredRate) {
                        payableCommission = productSales.reduce((sum, s) => sum + s.commissionValue, 0);
                    } else {
                        payableCommission = productSales.filter(s => payableStatuses.includes(s.status)).reduce((sum, s) => sum + s.commissionValue, 0);
                    }
                } else {
                    payableCommission = productSales.filter(s => payableStatuses.includes(s.status)).reduce((sum, s) => sum + s.commissionValue, 0);
                }
            }

            return {
                productId: product.id,
                productName: product.name,
                imageUrl: product.imageUrls[0] || '',
                totalConversions,
                approvedConversions,
                approvalRate,
                payableCommission
            };
        }).filter((p): p is NonNullable<typeof p> => p !== null).sort((a,b) => b.totalConversions - a.totalConversions);

        const summaryData = {
            totalConversions: stats.reduce((sum, s) => sum + s.totalConversions, 0),
            payableCommissions: stats.reduce((sum, s) => sum + s.payableCommission, 0),
        };
        
        return { summary: summaryData, productStats: stats };
    }, [sales, products, filters, currentUser]);

    const periodOptions: { key: Period; label: string }[] = [
        { key: 'today', label: t('today') },
        { key: 'yesterday', label: t('yesterday') },
        { key: 'thisWeek', label: t('thisWeek') },
        { key: 'lastWeek', label: t('lastWeek') },
        { key: 'thisMonth', label: t('thisMonth') },
        { key: 'lastMonth', label: t('lastMonth') },
    ];

    if (loading) return <div className="text-center p-8">{t('loadingData')}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">{t('liveStatistics')}</h2>
                <p className="text-gray-500 mt-1">{t('liveStatisticsDescription')}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="period" className="block text-sm font-medium text-gray-700">{t('period')}</label>
                        <select id="period" name="period" value={filters.period} onChange={e => setFilters(f => ({...f, period: e.target.value as Period}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            {periodOptions.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700">{t('filterByProduct')}</label>
                        <select id="product" name="product" value={filters.productId} onChange={e => setFilters(f => ({...f, productId: e.target.value}))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="all">{t('allProducts')}</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="subId" className="block text-sm font-medium text-gray-700">{t('filterBySubId')}</label>
                        <input type="text" id="subId" name="subId" value={filters.subId} onChange={e => setFilters(f => ({...f, subId: e.target.value}))} placeholder={t('subIdPlaceholder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title={t('totalConversions')} value={summary.totalConversions.toString()} icon={<Icons.Conversions className="w-6 h-6 text-blue-600"/>} />
                <StatCard title={t('payableCommissions')} value={`€${summary.payableCommissions.toFixed(2)}`} icon={<Icons.CommissionBag className="w-6 h-6 text-blue-600"/>} />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {productStats.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">{t('noLiveStats')}</div>
                    ) : (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('product')}</th>
                                    <th scope="col" className="px-6 py-3 text-center">{t('tableHeaderConversions')}</th>
                                    <th scope="col" className="px-6 py-3 text-center">{t('approvedConversions')}</th>
                                    <th scope="col" className="px-6 py-3 text-center">{t('tableHeaderApprovalRate')}</th>
                                    <th scope="col" className="px-6 py-3 text-right">{t('tableHeaderPayableCommission')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productStats.map(stat => (
                                    <tr key={stat.productId} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <img src={stat.imageUrl || 'https://placehold.co/100x100?text=N/A'} alt={stat.productName} className="h-10 w-10 rounded-md object-cover" />
                                                <span>{stat.productName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold">{stat.totalConversions}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-green-600">{stat.approvedConversions}</td>
                                        <td className="px-6 py-4 text-center font-semibold">{stat.approvalRate.toFixed(1)}%</td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-600">€{stat.payableCommission.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveStatistics;