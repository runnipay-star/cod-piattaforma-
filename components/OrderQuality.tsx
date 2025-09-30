import React, { useState, useEffect, useMemo, useRef } from 'react';
import { type User, type Sale, type Product, UserRole, OrderStatus } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../LanguageContext';
import { Icons } from '../constants';

type Period = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';

interface FilterState {
    productId: string;
    period: Period;
    subId: string;
    country: string;
    startDate: string | null;
    endDate: string | null;
    affiliateId: string;
}

interface OrderQualityProps {
    currentUser: User;
    allUsers: User[];
}

const statusConfig: Record<string, { color: string, order: number }> = {
    [OrderStatus.PENDING]: { color: '#f59e0b', order: 1 },
    [OrderStatus.CONFIRMED]: { color: '#3b82f6', order: 2 },
    [OrderStatus.SHIPPED]: { color: '#8b5cf6', order: 3 },
    [OrderStatus.RELEASED]: { color: '#14b8a6', order: 4 },
    [OrderStatus.DELIVERED]: { color: '#22c55e', order: 5 },
    [OrderStatus.RETURNED]: { color: '#f43f5e', order: 6 },
    'cancelled': { color: '#6b7280', order: 7 },
};


const StatusCard: React.FC<{ title: string; orderCount: number; commission: number; percentage: number; color?: string }> = ({ title, orderCount, commission, percentage, color = '#6b7280' }) => (
    <div className="bg-white p-5 rounded-lg shadow-md flex flex-col justify-between">
        <div>
            <h3 className="text-md font-bold text-gray-800">{title}</h3>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{orderCount}</p>
            <p className="text-sm font-semibold text-green-600">€{commission.toFixed(2)}</p>
        </div>
        <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold" style={{ color }}>{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
            </div>
        </div>
    </div>
);


const OrderQuality: React.FC<OrderQualityProps> = ({ currentUser, allUsers }) => {
    const { t } = useTranslation();
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        productId: 'all',
        period: 'last30days',
        subId: '',
        country: 'all',
        startDate: null,
        endDate: null,
        affiliateId: 'all',
    });
    const [tempFilters, setTempFilters] = useState<FilterState>(filters);
    const filterButtonRef = useRef<HTMLDivElement>(null);
    const affiliateUsers = useMemo(() => allUsers.filter(u => u.role === UserRole.AFFILIATE), [allUsers]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setIsFilterOpen(false);
    };

    const statsData = useMemo(() => {
        const { startDate, endDate } = (() => {
            const now = new Date();
            if (filters.period === 'custom' && filters.startDate && filters.endDate) {
                const start = new Date(filters.startDate); start.setHours(0, 0, 0, 0);
                const end = new Date(filters.endDate); end.setHours(23, 59, 59, 999);
                return { startDate: start, endDate: end };
            }
            let start = new Date(), end = new Date();
            switch (filters.period) {
                case 'today': start.setHours(0,0,0,0); break;
                case 'yesterday': start.setDate(now.getDate() - 1); start.setHours(0,0,0,0); end.setDate(now.getDate() - 1); end.setHours(23,59,59,999); break;
                case 'last7days': start.setDate(now.getDate() - 6); start.setHours(0,0,0,0); break;
                case 'last30days': start.setDate(now.getDate() - 29); start.setHours(0,0,0,0); break;
                case 'thisMonth': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
                case 'lastMonth': start = new Date(now.getFullYear(), now.getMonth() - 1, 1); end = new Date(now.getFullYear(), now.getMonth(), 0); end.setHours(23,59,59,999); break;
            }
            return { startDate: start, endDate: end };
        })();

        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            const isUserMatch = currentUser.role === UserRole.AFFILIATE
                ? sale.affiliateId === currentUser.id
                : filters.affiliateId === 'all'
                    ? true
                    : sale.affiliateId === parseInt(filters.affiliateId);
            const isDateMatch = saleDate >= startDate && saleDate <= endDate;
            const isProductMatch = filters.productId === 'all' || sale.productId === parseInt(filters.productId);
            const isSubIdMatch = !filters.subId || (sale.subId && sale.subId.toLowerCase().includes(filters.subId.toLowerCase()));
            const isCountryMatch = filters.country === 'all' || sale.country === filters.country;
            return isUserMatch && isDateMatch && isProductMatch && isSubIdMatch && isCountryMatch;
        });
        
        const totalOrders = filteredSales.length;
        const totalCommissions = filteredSales.reduce((sum, sale) => sum + sale.commissionValue, 0);

        // Fix: Explicitly type the accumulator to resolve type inference issues.
        const statusSummary = filteredSales.reduce((acc: Record<string, { orderCount: number; commission: number }>, sale) => {
            let statusKey: string = sale.status;
            if (sale.status === OrderStatus.USER_CANCELLED || sale.status === OrderStatus.ADMIN_CANCELLED) {
                statusKey = 'cancelled';
            }

            if (!acc[statusKey]) {
                acc[statusKey] = { orderCount: 0, commission: 0 };
            }
            acc[statusKey].orderCount += 1; // Count each sale as one order
            acc[statusKey].commission += sale.commissionValue;
            return acc;
        }, {});
        
        const statusCards = Object.entries(statusSummary).map(([status, data]) => ({
            status,
            ...data,
            percentage: totalOrders > 0 ? (data.orderCount / totalOrders) * 100 : 0,
        }));

        statusCards.sort((a, b) => (statusConfig[a.status]?.order || 99) - (statusConfig[b.status]?.order || 99));

        return { totalOrders, totalCommissions, statusCards };
    }, [sales, filters, currentUser]);

    const periodLabel = useMemo(() => {
        if (filters.period === 'custom' && filters.startDate && filters.endDate) {
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
            const startStr = new Date(filters.startDate + 'T00:00:00').toLocaleDateString(undefined, options);
            const endStr = new Date(filters.endDate + 'T00:00:00').toLocaleDateString(undefined, options);
            return `${startStr} - ${endStr}`;
        }
        return t({ today: 'today', yesterday: 'yesterday', last7days: 'last7Days', last30days: 'last30Days', thisMonth: 'thisMonth', lastMonth: 'lastMonth' }[filters.period] || '');
    }, [filters, t]);

    const affiliateLabel = useMemo(() => {
        if (currentUser.role === UserRole.AFFILIATE) {
            return `${currentUser.firstName} ${currentUser.lastName}`;
        }
        if (filters.affiliateId === 'all') {
            return t('allAffiliates');
        }
        const user = allUsers.find(u => u.id === parseInt(filters.affiliateId));
        return user ? `${user.firstName} ${user.lastName}` : '';
    }, [filters.affiliateId, currentUser, t, allUsers]);

    const presetPeriods: {key: Period, label: string}[] = [
        { key: 'today', label: t('today') }, { key: 'yesterday', label: t('yesterday') },
        { key: 'last7days', label: t('last7Days') }, { key: 'last30days', label: t('last30Days') },
        { key: 'thisMonth', label: t('thisMonth') }, { key: 'lastMonth', label: t('lastMonth') },
    ];

    if (loading) return <div className="text-center p-8">{t('loadingData')}</div>;
    
    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-semibold text-gray-500 tracking-widest">{t('results')}</p>
                <h2 className="text-3xl font-bold text-gray-800">{t('orderQuality')}</h2>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg shadow-sm">
                        {t('period')}: {periodLabel}
                    </div>
                     {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
                        <div className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-semibold rounded-lg shadow-sm">
                            {t('affiliateLabel')}: {affiliateLabel}
                        </div>
                    )}
                </div>
                <div className="relative" ref={filterButtonRef}>
                    <button onClick={() => { setTempFilters(filters); setIsFilterOpen(p => !p); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center space-x-2">
                        <Icons.Filter className="w-4 h-4" />
                        <span>{t('filters')}</span>
                    </button>
                    {isFilterOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl z-20 border">
                            <div className="p-4 space-y-4">
                                 {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
                                    <div>
                                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                            <Icons.Affiliate className="w-4 h-4 mr-2 text-gray-400"/>
                                            {t('filterByAffiliate')}
                                        </label>
                                        <select name="affiliateId" value={tempFilters.affiliateId} onChange={e => setTempFilters(p => ({...p, affiliateId: e.target.value}))} className="w-full mt-1 border-gray-300 rounded-md text-sm">
                                            <option value="all">{t('allAffiliates')}</option>
                                            {affiliateUsers.map(user => <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1">{t('period')}</label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {presetPeriods.map(({key, label}) => (
                                            <button key={key} onClick={() => setTempFilters(p => ({...p, period: key, startDate: null, endDate: null}))} className={`px-2 py-1.5 text-xs font-semibold rounded-md ${tempFilters.period === key ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t">
                                        <label className="text-xs font-semibold text-gray-500">{t('customRange')}</label>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <input type="date" name="startDate" value={tempFilters.startDate || ''} onChange={e => setTempFilters(p => ({...p, startDate: e.target.value, period: 'custom'}))} className="w-full border-gray-300 rounded-md text-sm" />
                                            <input type="date" name="endDate" value={tempFilters.endDate || ''} onChange={e => setTempFilters(p => ({...p, endDate: e.target.value, period: 'custom'}))} className="w-full border-gray-300 rounded-md text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">{t('filterByProduct')}</label>
                                    <select name="productId" value={tempFilters.productId} onChange={e => setTempFilters(p => ({...p, productId: e.target.value}))} className="w-full mt-1 border-gray-300 rounded-md text-sm">
                                        <option value="all">{t('allProducts')}</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">{t('filterBySubId')}</label>
                                    <input type="text" name="subId" value={tempFilters.subId} onChange={e => setTempFilters(p => ({...p, subId: e.target.value}))} placeholder={t('subIdPlaceholder')} className="w-full mt-1 border-gray-300 rounded-md text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">{t('filterByCountry')}</label>
                                    <select name="country" value={tempFilters.country} onChange={e => setTempFilters(p => ({...p, country: e.target.value}))} className="w-full mt-1 border-gray-300 rounded-md text-sm">
                                        <option value="all">{t('allCountries')}</option>
                                        <option value="IT">Italia</option> <option value="GB">United Kingdom</option> <option value="RO">Romania</option> <option value="DE">Germany</option> <option value="FR">France</option> <option value="ES">Spain</option>
                                    </select>
                                </div>
                            </div>
                            <div className="p-2 border-t bg-gray-50">
                                <button onClick={handleApplyFilters} className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">{t('applyFilters')}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-blue-600 text-white p-5 rounded-lg shadow-lg flex flex-col justify-between">
                    <h3 className="text-md font-bold">{t('totalOrders')}</h3>
                    <p className="text-4xl font-extrabold mt-2">{statsData.totalOrders}</p>
                    <p className="text-lg font-semibold mt-auto">€{statsData.totalCommissions.toFixed(2)}</p>
                </div>
                {statsData.statusCards.map(card => (
                    <StatusCard 
                        key={card.status}
                        title={t(card.status.replace(/\s/g, ''))}
                        orderCount={card.orderCount}
                        commission={card.commission}
                        percentage={card.percentage}
                        color={statusConfig[card.status]?.color}
                    />
                ))}
            </div>
        </div>
    );
};

export default OrderQuality;