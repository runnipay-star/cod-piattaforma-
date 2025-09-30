import React, { useState, useEffect, useMemo, useRef } from 'react';
import { type User, type Sale, type Product, UserRole, OrderStatus } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../LanguageContext';
import { Icons } from '../constants';
import OrderDetailModal from './OrderDetailModal';

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

interface ConversionsProps {
    currentUser: User;
    allUsers: User[];
}

const getStatusColorClasses = (status: OrderStatus): string => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-block";
    switch (status) {
        case OrderStatus.PENDING:
            return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case OrderStatus.CONFIRMED:
            return `${baseClasses} bg-blue-100 text-blue-800`;
        case OrderStatus.SHIPPED:
            return `${baseClasses} bg-purple-100 text-purple-800`;
        case OrderStatus.DELIVERED:
            return `${baseClasses} bg-green-100 text-green-800`;
        case OrderStatus.RELEASED:
            return `${baseClasses} bg-teal-100 text-teal-800`;
        case OrderStatus.USER_CANCELLED:
            return `${baseClasses} bg-gray-100 text-gray-800`;
        case OrderStatus.ADMIN_CANCELLED:
            return `${baseClasses} bg-red-100 text-red-800`;
        default:
            return `${baseClasses} bg-gray-200 text-gray-900`;
    }
};

const Conversions: React.FC<ConversionsProps> = ({ currentUser, allUsers }) => {
    const { t } = useTranslation();
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [detailSelections, setDetailSelections] = useState<string[]>([]);
    const [selectedSaleForDetail, setSelectedSaleForDetail] = useState<Sale | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        productId: 'all',
        period: 'last7days',
        subId: '',
        country: 'all',
        startDate: null,
        endDate: null,
        affiliateId: 'all',
    });
    const [tempFilters, setTempFilters] = useState<FilterState>(filters);

    const filterButtonRef = useRef<HTMLDivElement>(null);
    const detailsButtonRef = useRef<HTMLDivElement>(null);

    const affiliateUsers = useMemo(() => allUsers.filter(u => u.role === UserRole.AFFILIATE), [allUsers]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)) setIsFilterOpen(false);
            if (detailsButtonRef.current && !detailsButtonRef.current.contains(event.target as Node)) setIsDetailsOpen(false);
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
    
    const handleCloseDetailModal = () => {
        setSelectedSaleForDetail(null);
    };

    const handleDetailSelectionToggle = (selection: string) => {
        setDetailSelections(prev => {
            if (prev.includes(selection)) return prev.filter(s => s !== selection);
            return [...prev, selection];
        });
    };

    const filteredData = useMemo(() => {
        const { startDate, endDate } = (() => {
            const now = new Date();
            if (filters.period === 'custom' && filters.startDate && filters.endDate) {
                const start = new Date(filters.startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                return { startDate: start, endDate: end };
            }
            let start = new Date(), end = new Date();
            switch (filters.period) {
                case 'today': start.setHours(0,0,0,0); end.setHours(23,59,59,999); break;
                case 'yesterday':
                    start.setDate(now.getDate() - 1); start.setHours(0,0,0,0);
                    end.setDate(now.getDate() - 1); end.setHours(23,59,59,999);
                    break;
                case 'last7days': start.setDate(now.getDate() - 6); start.setHours(0,0,0,0); end.setHours(23,59,59,999); break;
                case 'last30days': start.setDate(now.getDate() - 29); start.setHours(0,0,0,0); end.setHours(23,59,59,999); break;
                case 'thisMonth': start = new Date(now.getFullYear(), now.getMonth(), 1); end = now; break;
                case 'lastMonth':
                    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    end = new Date(now.getFullYear(), now.getMonth(), 0);
                    end.setHours(23,59,59,999);
                    break;
            }
            return { startDate: start, endDate: end };
        })();
        
        return sales
            .filter(sale => {
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
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, filters, currentUser]);
    
    const periodLabel = useMemo(() => {
        if (filters.period === 'custom' && filters.startDate && filters.endDate) {
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
            const startStr = new Date(filters.startDate + 'T00:00:00').toLocaleDateString(undefined, options);
            const endStr = new Date(filters.endDate + 'T00:00:00').toLocaleDateString(undefined, options);
            return `${startStr} - ${endStr}`;
        }
        return t({
            today: 'today',
            yesterday: 'yesterday',
            last7days: 'last7Days',
            last30days: 'last30Days',
            thisMonth: 'thisMonth',
            lastMonth: 'lastMonth',
        }[filters.period] || '');
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
        { key: 'today', label: t('today') },
        { key: 'yesterday', label: t('yesterday') },
        { key: 'last7days', label: t('last7Days') },
        { key: 'last30days', label: t('last30Days') },
        { key: 'thisMonth', label: t('thisMonth') },
        { key: 'lastMonth', label: t('lastMonth') },
    ];
    
    if (loading) return <div className="text-center p-8">{t('loadingData')}</div>;

    const getProductName = (id: number) => products.find(p => p.id === id)?.name || `ID: ${id}`;
    const getAffiliate = (id: number) => allUsers.find(u => u.id === id);
    const getAffiliateName = (id: number) => {
        const user = allUsers.find(u => u.id === id);
        return user ? `${user.firstName} ${user.lastName}` : `ID: ${id}`;
    };

    const selectedProduct = selectedSaleForDetail ? products.find(p => p.id === selectedSaleForDetail.productId) : null;
    const selectedAffiliate = selectedSaleForDetail ? getAffiliate(selectedSaleForDetail.affiliateId) : null;
    
    const renderTable = () => {
        if (filteredData.length === 0) return <div className="p-8 text-center text-gray-500">{t('noConversionsData')}</div>;
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('tableHeaderDate')}</th>
                            <th scope="col" className="px-6 py-3">{t('tableHeaderProduct')}</th>
                            {currentUser.role !== UserRole.AFFILIATE && <th scope="col" className="px-6 py-3">{t('affiliate')}</th>}
                            <th scope="col" className="px-6 py-3">{t('tableHeaderSubId')}</th>
                            <th scope="col" className="px-6 py-3">{t('country')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('totalPrice')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('tableHeaderCommission')}</th>
                            <th scope="col" className="px-6 py-3 text-center">{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(sale => (
                            <tr
                                key={sale.id}
                                className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedSaleForDetail(sale)}
                            >
                                <td className="px-6 py-4">{new Date(sale.date).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{getProductName(sale.productId)}</td>
                                {currentUser.role !== UserRole.AFFILIATE && <td className="px-6 py-4">{getAffiliateName(sale.affiliateId)}</td>}
                                <td className="px-6 py-4">{sale.subId || '-'}</td>
                                <td className="px-6 py-4">{sale.country}</td>
                                <td className="px-6 py-4 text-right font-semibold">€{sale.totalPrice.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-semibold text-green-600">€{sale.commissionValue.toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={getStatusColorClasses(sale.status)}>{t(sale.status.replace(/\s/g, ''))}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {selectedSaleForDetail && selectedProduct && selectedAffiliate && (
                <OrderDetailModal
                    sale={selectedSaleForDetail}
                    product={selectedProduct}
                    affiliate={selectedAffiliate}
                    onClose={handleCloseDetailModal}
                />
            )}
            <div>
                <p className="text-sm font-semibold text-gray-500 tracking-widest">{t('results')}</p>
                <h2 className="text-3xl font-bold text-gray-800">{t('conversions')}</h2>
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
                 <div className="flex items-center space-x-2">
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
                                            <option value="IT">Italia</option>
                                            <option value="GB">United Kingdom</option>
                                            <option value="RO">Romania</option>
                                            <option value="DE">Germany</option>
                                            <option value="FR">France</option>
                                            <option value="ES">Spain</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="p-2 border-t bg-gray-50">
                                    <button onClick={handleApplyFilters} className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">{t('applyFilters')}</button>
                                </div>
                            </div>
                        )}
                    </div>
                     <div className="relative" ref={detailsButtonRef}>
                        <button onClick={() => setIsDetailsOpen(p => !p)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50 flex items-center space-x-2">
                            <Icons.Details className="w-4 h-4" />
                            <span>{t('details')}</span>
                            <Icons.ChevronDown className={`w-4 h-4 transform transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                        </button>
                         {isDetailsOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl z-20 border py-1">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500">{t('detailsDropdownTitle')}</div>
                                 {['product', 'subId'].map(detail => (
                                     <button key={detail} onClick={() => handleDetailSelectionToggle(detail)} className={`w-full text-left px-3 py-2 text-sm flex items-center ${detailSelections.includes(detail) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}>
                                        <input type="checkbox" readOnly checked={detailSelections.includes(detail)} className="h-4 w-4 rounded border-gray-300 text-blue-600 mr-3"/>
                                        {t(`detail${detail.charAt(0).toUpperCase() + detail.slice(1)}`)}
                                    </button>
                                 ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {renderTable()}
            </div>
        </div>
    );
};

export default Conversions;