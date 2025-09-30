import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage, useTranslation } from '../LanguageContext';
import { type Locale, type User, type Sale, OrderStatus, UserRole } from '../types';
import { api } from '../services/api';

interface HeaderProps {
  currentUser: User;
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const salesData = await api.getSales();
        setSales(salesData);
      } catch (error) {
        console.error("Failed to fetch sales for header:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    firstDayOfMonth.setHours(0, 0, 0, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);

    const relevantSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const isAffiliateMatch = (currentUser.role === UserRole.AFFILIATE)
        ? sale.affiliateId === currentUser.id
        : true;
      return isAffiliateMatch && saleDate >= firstDayOfMonth && saleDate <= lastDayOfMonth;
    });

    const pendingRevenue = relevantSales
      .filter(sale => sale.status === OrderStatus.PENDING)
      .reduce((sum, sale) => sum + sale.commissionValue, 0);

    const confirmedRevenue = relevantSales
      .filter(sale => sale.status === OrderStatus.CONFIRMED)
      .reduce((sum, sale) => sum + sale.commissionValue, 0);

    return { pendingRevenue, confirmedRevenue };
  }, [sales, currentUser]);


  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale);
  };
  
  const languages: { code: Locale; name: string; flag: string }[] = [
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'ro', name: 'Română', flag: '🇷🇴' },
  ];

  return (
    <header className="fixed top-0 left-64 right-0 bg-white shadow-md z-40 h-16 flex items-center justify-between px-8">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-800">MWS Platform</h1>
      </div>
      
      <div className="flex-grow flex items-center justify-center space-x-8">
        {loading ? (
          <div className="text-sm text-gray-400">Loading stats...</div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-xs text-gray-500 font-medium">{t('pendingCurrentMonth')}</p>
                <p className="text-lg font-bold text-yellow-600">€{monthlyStats.pendingRevenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="h-8 border-l border-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-xs text-gray-500 font-medium">{t('confirmedCurrentMonth')}</p>
                <p className="text-lg font-bold text-green-600">€{monthlyStats.confirmedRevenue.toFixed(2)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-shrink-0">
        <label htmlFor="language-select" className="sr-only">Select Language</label>
         <div className="relative">
            <select
              id="language-select"
              value={locale}
              onChange={handleLanguageChange}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;