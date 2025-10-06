import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sale, Product, User, Role } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface DashboardProps {
  sales: Sale[];
  products: Product[];
  currentUser: User | null;
}

type Period = '7d' | '30d' | 'all';

export const Dashboard: React.FC<DashboardProps> = ({ sales, products, currentUser }) => {
  const [period, setPeriod] = useState<Period>('30d');
  const { t } = useLocalization();

  const filteredSales = useMemo(() => {
    const now = new Date();
    if (period === 'all') return sales;
    const daysToSubtract = period === '7d' ? 7 : 30;
    const startDate = new Date(now.setDate(now.getDate() - daysToSubtract));
    return sales.filter(sale => new Date(sale.date) >= startDate);
  }, [sales, period]);
  
  const relevantSales = useMemo(() => {
     if (!currentUser || currentUser.role === Role.ADMIN || currentUser.role === Role.MANAGER) {
        return filteredSales;
     }
     return filteredSales.filter(s => s.affiliateId === currentUser.id);
  }, [filteredSales, currentUser]);

  const salesData = useMemo(() => {
    const data: { [key: string]: { sales: number, commission: number } } = {};
    relevantSales.forEach(sale => {
      const date = new Date(sale.date).toISOString().split('T')[0];
      if (!data[date]) {
        data[date] = { sales: 0, commission: 0 };
      }
      data[date].sales += sale.amount;
      data[date].commission += sale.affiliateCommission;
    });
    return Object.entries(data).map(([date, values]) => ({ date, ...values })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [relevantSales]);

  const kpis = useMemo(() => {
    return relevantSales.reduce(
      (acc, sale) => {
        acc.totalSales += sale.amount;
        acc.totalCommission += sale.affiliateCommission;
        return acc;
      },
      { totalSales: 0, totalCommission: 0 }
    );
  }, [relevantSales]);

  const bestSellers = useMemo(() => {
    // FIX: The initial value for reduce was not correctly typed, causing `productSales` to be inferred as an empty object.
    // This led to a type error in the `sort` function. Using a generic on `reduce` ensures the accumulator
    // and the result have the correct type of `Record<string, number>`.
    const productSales = relevantSales.reduce<Record<string, number>>((acc, sale) => {
      acc[sale.productId] = (acc[sale.productId] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, salesCount]) => {
        const product = products.find(p => p.id === productId);
        return { ...product, salesCount };
      });
  }, [relevantSales, products]);
  
  const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-neutral">{t('salesOverview')}</h2>
        <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
          {(['7d', '30d', 'all'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1 text-sm font-semibold rounded-md transition ${period === p ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-300'}`}
            >
              {p === '7d' ? t('last7Days') : p === '30d' ? t('last30Days') : t('allTime')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-center items-center">
              <h3 className="text-lg font-semibold text-gray-500">{t('totalSales')}</h3>
              <p className="text-4xl font-bold text-neutral mt-2">{currencyFormatter.format(kpis.totalSales)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-center items-center">
              <h3 className="text-lg font-semibold text-gray-500">{t('yourCommissions')}</h3>
              <p className="text-4xl font-bold text-success mt-2">{currencyFormatter.format(kpis.totalCommission)}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-neutral mb-4">{t('salesOverview')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `€${value}`} tick={{ fontSize: 12 }}/>
              <Tooltip formatter={(value: number) => currencyFormatter.format(value)} />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" name={t('totalSales')} />
              <Bar dataKey="commission" fill="#36d399" name={t('yourCommissions')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-neutral mb-4">{t('bestSellingProducts')}</h3>
          <ul className="space-y-4">
            {bestSellers.map((product, index) => (
              <li key={product.id} className="flex items-center space-x-4">
                <span className="text-lg font-bold text-gray-400">{index + 1}</span>
                <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-semibold text-neutral">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.salesCount} vendite</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
