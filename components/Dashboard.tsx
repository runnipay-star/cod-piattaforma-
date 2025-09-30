import React, { useState, useEffect, useMemo } from 'react';
import { type User, type Sale, type Product } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../LanguageContext';

type Period = '7' | '30' | '90';

interface DashboardProps {
  currentUser: User;
}

// Helper components defined outside the main component to prevent re-creation on re-renders
const StatsCard: React.FC<{ title: string; value: string; subtext?: string }> = ({ title, value, subtext }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const { t } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30');

  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = (window as any).Recharts || {};

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

  const filteredData = useMemo(() => {
    const now = new Date();
    const periodInDays = parseInt(period);
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const diffTime = Math.abs(now.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= periodInDays;
    });

    const totalRevenue = filteredSales.reduce((acc, sale) => {
      const product = products.find(p => p.id === sale.productId);
      return acc + (product ? (product.price || 0) * (sale.quantity || 0) : 0);
    }, 0);

    const totalCommissions = filteredSales.reduce((acc, sale) => {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
          let commission = product.commission || 0;
          if (product.penalties && typeof product.penalties === 'object' && product.penalties[sale.affiliateId]) {
              const reductionPercent = product.penalties[sale.affiliateId];
              if(typeof reductionPercent === 'number') {
                commission *= (1 - reductionPercent / 100);
              }
          }
          return acc + (commission * (sale.quantity || 0));
      }
      return acc;
    }, 0);
    
    const totalSales = filteredSales.reduce((acc, sale) => acc + (sale.quantity || 0), 0);

    const topProducts = filteredSales
      .reduce((acc, sale) => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
          const existing = acc.find(item => item.id === product.id);
          const saleRevenue = (product.price || 0) * (sale.quantity || 0);
          const saleUnits = sale.quantity || 0;

          if (existing) {
            existing.unitsSold += saleUnits;
            existing.revenue += saleRevenue;
          } else {
            acc.push({
              id: product.id,
              name: product.name,
              imageUrl: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '',
              unitsSold: saleUnits,
              revenue: saleRevenue,
            });
          }
        }
        return acc;
      }, [] as { id: number; name: string; imageUrl: string; unitsSold: number; revenue: number }[])
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const chartData = filteredSales.reduce((acc, sale) => {
        const dateStr = sale.date.toISOString().split('T')[0];
        if(!acc[dateStr]) {
            acc[dateStr] = 0;
        }
        const product = products.find(p => p.id === sale.productId);
        if(product) {
             acc[dateStr] += (product.price || 0) * (sale.quantity || 0);
        }
        return acc;
    }, {} as Record<string, number>);

    const sortedChartData = Object.entries(chartData)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, revenue]) => ({ name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue }));

    return { totalRevenue, totalCommissions, totalSales, topProducts, sortedChartData };
  }, [sales, products, period]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p>{t('loadingDashboard')}</p></div>;
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">{t('dashboard')}</h2>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-sm">
            <button 
                onClick={() => setPeriod('7')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${period === '7' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
                {t('last7Days')}
            </button>
            <button 
                onClick={() => setPeriod('30')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${period === '30' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
                {t('last30Days')}
            </button>
            <button 
                onClick={() => setPeriod('90')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${period === '90' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
                {t('last90Days')}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title={t('totalRevenue')} value={`€${filteredData.totalRevenue.toFixed(2)}`} />
        <StatsCard title={t('totalSales')} value={filteredData.totalSales.toString()} />
        <StatsCard title={t('totalCommissions')} value={`€${filteredData.totalCommissions.toFixed(2)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('salesPerformance')}</h3>
           <div style={{ width: '100%', height: 300 }}>
             {ResponsiveContainer && BarChart ? (
               <ResponsiveContainer>
                 <BarChart data={filteredData.sortedChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                   <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} contentStyle={{background: 'white', border: '1px solid #ddd', borderRadius: '0.5rem'}} formatter={(value: number) => `€${value.toFixed(2)}`} />
                   <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             ) : <p>{t('chartIsLoading')}</p>}
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('topSellingProducts')}</h3>
            <ul className="space-y-4">
              {filteredData.topProducts.map(product => (
                 <li key={product.id} className="flex items-center space-x-4">
                    <img src={product.imageUrl || 'https://placehold.co/100x100?text=No+Image'} alt={product.name} className="w-12 h-12 rounded-md object-cover"/>
                    <div>
                        <p className="font-semibold text-sm text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.unitsSold} {t('unitsSold')}</p>
                    </div>
                    <p className="ml-auto font-bold text-sm text-blue-600">€{product.revenue.toFixed(2)}</p>
                 </li>
              ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;