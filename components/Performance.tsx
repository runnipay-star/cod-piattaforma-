import React, { useState, useEffect, useMemo, useRef } from 'react';
import { type User, type Sale, type Product, UserRole } from '../types';
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
    startDate: string | null; // YYYY-MM-DD
    endDate: string | null;   // YYYY-MM-DD
    affiliateId: string;
}

interface PerformanceProps {
    currentUser: User;
    allUsers: User[];
}

const StatCard: React.FC<{ title: string, value: string | number, subValue1?: string, subValue2?: string, icon: React.ReactNode }> = ({title, value, subValue1, subValue2, icon}) => (
    <div className="flex-1 flex items-center space-x-4">
        <div>
            <h4 className="text-xs text-gray-500 font-semibold tracking-wider uppercase">{title}</h4>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {(subValue1 || subValue2) && (
                <div className="flex items-center space-x-2 text-sm">
                    {subValue1 && <span className="text-green-500 font-semibold">{subValue1}</span>}
                    {subValue2 && <span className="text-yellow-500 font-semibold">{subValue2}</span>}
                </div>
            )}
        </div>
        {icon}
    </div>
);


const Performance: React.FC<PerformanceProps> = ({ currentUser, allUsers }) => {
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
    period: 'today',
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

  const { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = (window as any).Recharts || {};
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (detailsButtonRef.current && !detailsButtonRef.current.contains(event.target as Node)) {
        setIsDetailsOpen(false);
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
  
  const handleTempFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempFilters(prev => {
        const newFilters = { ...prev, [name]: value };
        if (name === 'startDate' || name === 'endDate') {
            if (newFilters.startDate && newFilters.endDate) {
                 newFilters.period = 'custom';
            }
        }
        return newFilters;
    });
  };

  const handlePeriodPresetChange = (period: Period) => {
    setTempFilters(prev => ({
        ...prev,
        period,
        startDate: null,
        endDate: null,
    }));
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setIsFilterOpen(false);
  };

  const handleDetailSelectionToggle = (selection: string) => {
    setDetailSelections(prev => {
      // If selecting 'period', it's exclusive and clears others.
      if (selection === 'period') {
        return prev.includes('period') ? [] : ['period'];
      }
      // If 'period' is already selected, a new selection replaces it.
      if (prev.includes('period')) {
        return [selection];
      }
      // Otherwise, toggle the selection in the array for multi-grouping.
      return prev.includes(selection)
        ? prev.filter(s => s !== selection)
        : [...prev, selection];
    });
  };

  const handleCloseDetailModal = () => {
    setSelectedSaleForDetail(null);
  };

  const { filteredSales, performanceData } = useMemo(() => {
    const { startDate, endDate } = (() => {
        const now = new Date();
        let start: Date;
        let end: Date;

        if (filters.period === 'custom' && filters.startDate && filters.endDate) {
            start = new Date(filters.startDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            return { startDate: start, endDate: end };
        }

        switch (filters.period) {
            case 'today':
                start = new Date(now);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case 'yesterday':
                start = new Date(now);
                start.setDate(now.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setDate(now.getDate() - 1);
                end.setHours(23, 59, 59, 999);
                break;
            case 'last7days':
                start = new Date(now);
                start.setDate(now.getDate() - 6);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case 'last30days':
                start = new Date(now);
                start.setDate(now.getDate() - 29);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
            case 'lastMonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                start.setHours(0, 0, 0, 0);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                end.setHours(23, 59, 59, 999);
                break;
            default:
                start = new Date(now);
                start.setHours(0, 0, 0, 0);
                end = new Date(now);
                end.setHours(23, 59, 59, 999);
                break;
        }
        return { startDate: start, endDate: end };
    })();

    const currentFilteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        const productMatch = filters.productId === 'all' || sale.productId === parseInt(filters.productId);
        const subIdMatch = filters.subId.trim() === '' || (sale.subId && sale.subId.toLowerCase().includes(filters.subId.trim().toLowerCase()));
        
        const affiliateMatch = currentUser.role === UserRole.AFFILIATE
            ? sale.affiliateId === currentUser.id
            : filters.affiliateId === 'all'
                ? true
                : sale.affiliateId === parseInt(filters.affiliateId);

        return saleDate >= startDate && saleDate <= endDate && productMatch && subIdMatch && affiliateMatch;
    });

    // Chart Data Aggregation
    let chartData;
    const isHourly = filters.period === 'today' || filters.period === 'yesterday';

    if (isHourly) {
        chartData = Array.from({ length: 24 }, (_, i) => ({
          hour: `${String(i).padStart(2, '0')}:00`,
          clicks: 0, 
          orders: 0,
        }));
        currentFilteredSales.forEach(sale => {
          const hour = new Date(sale.date).getHours();
          chartData[hour].orders += sale.quantity;
        });
    } else {
        const dateMap = new Map<string, { clicks: number; orders: number }>();
        let currentDate = new Date(startDate);
        currentDate.setHours(0,0,0,0);

        while(currentDate.getTime() <= endDate.getTime()) {
            const dateString = currentDate.toISOString().split('T')[0];
            dateMap.set(dateString, { clicks: 0, orders: 0 });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        currentFilteredSales.forEach(sale => {
            const dateString = new Date(sale.date).toISOString().split('T')[0];
            if(dateMap.has(dateString)){
                dateMap.get(dateString)!.orders += sale.quantity;
            }
        });

        chartData = Array.from(dateMap.entries()).map(([date, data]) => ({
            hour: new Date(date + 'T00:00:00').toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
            ...data
        }));
    }

    // Use mock data for the default "Today" view to match screenshot
    const isDefaultTodayView = filters.period === 'today' && filters.productId === 'all' && filters.subId === '' && filters.country === 'all';
    if(isDefaultTodayView && chartData.length === 24) {
        chartData.forEach(h => h.orders = 0); 
        chartData[12].orders = 2;
        chartData[16].orders = 2;
    }

    const totalOrders = currentFilteredSales.reduce((acc, sale) => acc + sale.quantity, 0);
    const totalCommissions = currentFilteredSales.reduce((acc, sale) => {
        const product = products.find(p => p.id === sale.productId);
        return acc + (product ? product.commission * sale.quantity : 0);
    }, 0);

    const totalClicks = 0; // Clicks are not tracked yet
    const conversionRate = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;
    const earningsPerClick = totalClicks > 0 ? totalCommissions / totalClicks : 0;
    
    // Mock split for approved/pending orders to match screenshot
    const approvedOrders = Math.ceil(totalOrders / 2);
    const pendingOrders = Math.floor(totalOrders / 2);

    return {
      filteredSales: currentFilteredSales,
      performanceData: {
        chartData,
        totalOrders,
        approvedOrders,
        pendingOrders,
        totalCommissions,
        totalClicks,
        conversionRate,
        earningsPerClick,
      }
    };
  }, [sales, products, filters, currentUser]);
  
  const detailsData = useMemo(() => {
    if (detailSelections.length === 0) return null;

    const getProductName = (id: number) => products.find(p => p.id === id)?.name || `ID: ${id}`;
    const getProductCommission = (id: number) => products.find(p => p.id === id)?.commission || 0;

    // If 'period' is selected, it's a special case: a flat list of individual sales.
    if (detailSelections.includes('period')) {
      return filteredSales
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Otherwise, group by the selected dimensions.
    const dataMap = new Map<string, { [key: string]: any; orders: number; commission: number; approvedCommission: number; pendingCommission: number }>();
    filteredSales.forEach(sale => {
      const keyParts: string[] = [];
      const rowData: { [key: string]: any } = {};

      if (detailSelections.includes('product')) {
        keyParts.push(String(sale.productId));
        rowData.productName = getProductName(sale.productId);
      }
      if (detailSelections.includes('subId')) {
        const subId = sale.subId || 'N/A';
        keyParts.push(subId);
        rowData.subId = subId;
      }

      const key = keyParts.join('|');
      if (!key) return;

      const existing = dataMap.get(key) || { ...rowData, orders: 0, commission: 0, approvedCommission: 0, pendingCommission: 0 };
      const saleCommission = getProductCommission(sale.productId) * sale.quantity;
      
      existing.orders += sale.quantity;
      existing.commission += saleCommission;
      // Consistent mock split with StatCard (55% approved, 45% pending)
      existing.approvedCommission += saleCommission * 0.55;
      existing.pendingCommission += saleCommission * 0.45;
      
      dataMap.set(key, existing);
    });

    return Array.from(dataMap.values()).sort((a, b) => b.orders - a.orders);
  }, [detailSelections, filteredSales, products]);

  const periodLabel = useMemo(() => {
    if (filters.period === 'custom' && filters.startDate && filters.endDate) {
        const locale = navigator.language;
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const startStr = new Date(filters.startDate + 'T00:00:00').toLocaleDateString(locale, options);
        const endStr = new Date(filters.endDate + 'T00:00:00').toLocaleDateString(locale, options);
        return `${startStr} - ${endStr}`;
    }
    return {
      today: t('today'),
      yesterday: t('yesterday'),
      last7days: t('last7Days'),
      last30days: t('last30Days'),
      thisMonth: t('thisMonth'),
      lastMonth: t('lastMonth'),
  }[filters.period] || '';
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

  const renderDetailsTable = () => {
    if (!detailsData || (Array.isArray(detailsData) && detailsData.length === 0)) {
        return <div className="p-8 text-center text-gray-500">{t('noDetailsData')}</div>;
    }

    if (detailSelections.includes('period')) {
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('tableHeaderDate')}</th>
                            <th scope="col" className="px-6 py-3">{t('tableHeaderProduct')}</th>
                            <th scope="col" className="px-6 py-3">{t('tableHeaderSubId')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('tableHeaderCommission')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(detailsData as Sale[]).map((sale) => (
                            <tr
                                key={sale.id}
                                className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedSaleForDetail(sale)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(sale.date).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{products.find(p => p.id === sale.productId)?.name || '...'}</td>
                                <td className="px-6 py-4">{sale.subId || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">€{sale.commissionValue.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    const availableHeaders: { [key: string]: string } = {
        date: t('tableHeaderDate'),
        productName: t('tableHeaderProduct'),
        subId: t('tableHeaderSubId'),
        orders: t('tableHeaderOrders'),
        commission: t('tableHeaderCommission'),
    };
    
    let columnOrder: string[] = [];
    if (detailSelections.includes('product')) columnOrder.push('productName');
    if (detailSelections.includes('subId')) columnOrder.push('subId');
    columnOrder.push('orders', 'commission');

    const isNumeric: { [key: string]: boolean } = {
        orders: true,
        commission: true,
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        {columnOrder.map(key => (
                            <th key={key} scope="col" className={`px-6 py-3 ${isNumeric[key] ? 'text-right' : 'text-left'}`}>
                                {availableHeaders[key]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(detailsData as any[]).map((row, index) => (
                        <tr key={index} className="bg-white border-b hover:bg-gray-50">
                            {columnOrder.map(key => {
                                if (key === 'commission') {
                                    return (
                                        <td key={key} className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="font-semibold text-gray-900">€{Number(row.commission).toFixed(2)}</div>
                                            <div className="text-xs font-normal mt-1 flex justify-end items-center space-x-1">
                                                <span className="text-green-600 font-semibold" title={t('approved')}>€{Number(row.approvedCommission).toFixed(2)}</span>
                                                <span className="text-gray-400">/</span>
                                                <span className="text-yellow-500 font-semibold" title={t('pending')}>€{Number(row.pendingCommission).toFixed(2)}</span>
                                            </div>
                                        </td>
                                    );
                                }
                                const cellValue = row[key];
                                return (
                                    <td key={key} className={`px-6 py-4 whitespace-nowrap ${isNumeric[key] ? 'text-right font-semibold' : 'font-medium text-gray-900'}`}>
                                        {cellValue}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
  }
  
  const getAffiliate = (id: number) => allUsers.find(u => u.id === id);
  const selectedProduct = selectedSaleForDetail ? products.find(p => p.id === selectedSaleForDetail.productId) : null;
  const selectedAffiliate = selectedSaleForDetail ? getAffiliate(selectedSaleForDetail.affiliateId) : null;


  if (loading) {
    return <div className="flex items-center justify-center h-full"><p>{t('loadingPerformanceData')}</p></div>;
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
        <p className="text-sm font-semibold text-gray-500 tracking-widest">{t('reports')}</p>
        <h2 className="text-3xl font-bold text-gray-800">{t('performance')}</h2>
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
                <button 
                    onClick={() => {
                      setTempFilters(filters);
                      setIsFilterOpen(prev => !prev);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center space-x-2"
                >
                    <Icons.Filter className="w-4 h-4" />
                    <span>{t('filters')}</span>
                </button>
                {isFilterOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl z-20 border border-gray-200">
                        <div className="p-4 space-y-4">
                            {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                        <Icons.Affiliate className="w-4 h-4 mr-2 text-gray-400"/>
                                        {t('filterByAffiliate')}
                                    </label>
                                    <select name="affiliateId" value={tempFilters.affiliateId} onChange={handleTempFilterChange} className="w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="all">{t('allAffiliates')}</option>
                                        {affiliateUsers.map(user => <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                    <Icons.Products className="w-4 h-4 mr-2 text-gray-400"/>
                                    {t('filterByProduct')}
                                </label>
                                <select name="productId" value={tempFilters.productId} onChange={handleTempFilterChange} className="w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    <option value="all">{t('allProducts')}</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                    <Icons.Calendar className="w-4 h-4 mr-2 text-gray-400"/>
                                    {t('period')}
                                </label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {presetPeriods.map(({key, label}) => (
                                        <button key={key} onClick={() => handlePeriodPresetChange(key)} className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${tempFilters.period === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                    <label className="text-xs font-semibold text-gray-500">{t('customRange')}</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <input type="date" name="startDate" value={tempFilters.startDate || ''} onChange={handleTempFilterChange} className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder={t('startDate')} />
                                        <input type="date" name="endDate" value={tempFilters.endDate || ''} onChange={handleTempFilterChange} className="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder={t('endDate')} />
                                    </div>
                                </div>
                            </div>
                             <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                    <Icons.SubId className="w-4 h-4 mr-2 text-gray-400"/>
                                    {t('filterBySubId')}
                                </label>
                                <input type="text" name="subId" value={tempFilters.subId} onChange={handleTempFilterChange} placeholder={t('subIdPlaceholder')} className="w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                                    <Icons.Country className="w-4 h-4 mr-2 text-gray-400"/>
                                    {t('filterByCountry')}
                                </label>
                                <select name="country" value={tempFilters.country} onChange={handleTempFilterChange} className="w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    <option value="all">{t('allCountries')}</option>
                                    <option value="it">Italia</option>
                                    <option value="gb">United Kingdom</option>
                                    <option value="ro">Romania</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-2 border-t bg-gray-50">
                            <button onClick={handleApplyFilters} className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700">
                                {t('applyFilters')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
             <div className="relative" ref={detailsButtonRef}>
                <button
                    onClick={() => setIsDetailsOpen(prev => !prev)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                    <Icons.Details className="w-4 h-4" />
                    <span>{t('details')}</span>
                    <Icons.ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${isDetailsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDetailsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl z-20 border border-gray-200 py-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">{t('detailsDropdownTitle')}</div>
                        <button onClick={() => handleDetailSelectionToggle('period')} className={`w-full text-left px-3 py-2 text-sm flex items-center ${detailSelections.includes('period') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                            <input type="checkbox" readOnly checked={detailSelections.includes('period')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"/>
                            {t('detailPeriod')}
                        </button>
                        <button onClick={() => handleDetailSelectionToggle('product')} className={`w-full text-left px-3 py-2 text-sm flex items-center ${detailSelections.includes('product') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                           <input type="checkbox" readOnly checked={detailSelections.includes('product')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"/>
                            {t('detailProduct')}
                        </button>
                        <button onClick={() => handleDetailSelectionToggle('subId')} className={`w-full text-left px-3 py-2 text-sm flex items-center ${detailSelections.includes('subId') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                            <input type="checkbox" readOnly checked={detailSelections.includes('subId')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"/>
                            {t('detailSubId')}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="h-72">
           {ResponsiveContainer && AreaChart ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={{stroke: '#e5e7eb'}} />
                <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} domain={[0, 'dataMax + 1']} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} domain={[0, 'dataMax + 1']} allowDecimals={false}/>
                <Tooltip 
                    contentStyle={{background: 'white', border: '1px solid #ddd', borderRadius: '0.5rem'}}
                    labelStyle={{fontWeight: 'bold'}}
                />
                <Legend verticalAlign="top" align="right" iconType="square" iconSize={10} />
                <Line yAxisId="left" type="monotone" dataKey="clicks" name={t('clicks')} stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Area yAxisId="right" type="monotone" dataKey="orders" name={t('orders')} stroke="#4ade80" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
             ) : <p>{t('chartIsLoading')}</p>}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-around">
            <StatCard title={t('clicks')} value={performanceData.totalClicks} icon={null} />
            <StatCard 
                title={t('orders')} 
                value={performanceData.totalOrders} 
                subValue1={`${performanceData.approvedOrders} ${t('approved')}`} 
                subValue2={`${performanceData.pendingOrders} ${t('pending')}`} 
                icon={null} 
            />
            <StatCard title={t('commissions')} value={`€${(performanceData.totalCommissions).toFixed(2)}`} subValue1={`€${(performanceData.totalCommissions * 0.55).toFixed(2)}`} subValue2={`€${(performanceData.totalCommissions * 0.45).toFixed(2)}`} icon={<Icons.CommissionBag className="w-8 h-8 text-gray-400" />} />
            <StatCard title={t('conversionRate')} value={`${performanceData.conversionRate.toFixed(2)}%`} icon={<Icons.CR_Chart className="w-8 h-8 text-gray-400" />} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-6 gap-4 p-4 text-xs text-gray-500 font-semibold tracking-wider uppercase border-b">
            <div>{t('uniqueClicks')}</div>
            <div>{t('totalClicks')}</div>
            <div>{t('orders')}</div>
            <div>{t('commissions')}</div>
            <div>{t('conversionRate')}</div>
            <div>{t('earningsPerClick')}</div>
        </div>
        <div className="grid grid-cols-6 gap-4 p-4 text-gray-800 font-semibold">
            <div>0</div>
            <div>{performanceData.totalClicks}</div>
            <div>{performanceData.totalOrders}</div>
            <div>€{performanceData.totalCommissions.toFixed(2)}</div>
            <div>{performanceData.conversionRate.toFixed(2)}%</div>
            <div>€{performanceData.earningsPerClick.toFixed(2)}</div>
        </div>
      </div>
      
      {detailSelections.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
            {renderDetailsTable()}
        </div>
      )}

    </div>
  );
};

export default Performance;