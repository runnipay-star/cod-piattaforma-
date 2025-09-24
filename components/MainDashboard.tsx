import React, { useState, useMemo } from 'react';
import { Order, User, Product, OrderStatus, UserRole } from '../types';
import DashboardCard from './DashboardCard';
import ManagerPerformanceTable from './ManagerPerformanceTable';
import ProductPerformanceTable from './ProductPerformanceTable';
import { CurrencyEuroIcon, ShoppingCartIcon, UsersIcon } from './Icons';

interface MainDashboardProps {
  orders: Order[];
  users: User[];
  products: Product[];
}

type TimeRange = 'today' | 'yesterday' | 'last7' | 'last14' | 'thisMonth' | 'lastMonth' | 'allTime';

const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Oggi' },
    { value: 'yesterday', label: 'Ieri' },
    { value: 'last7', label: 'Ultimi 7g' },
    { value: 'last14', label: 'Ultimi 14g' },
    { value: 'thisMonth', label: 'Questo Mese' },
    { value: 'lastMonth', label: 'Mese Scorso' },
    { value: 'allTime', label: 'Sempre' },
];


const MainDashboard: React.FC<MainDashboardProps> = ({ orders, users, products }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('allTime');

    const filteredOrders = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (timeRange === 'allTime') {
          return orders;
        }

        return orders.filter(order => {
            const orderDate = new Date(order.date);
            orderDate.setHours(0, 0, 0, 0);

            let startDate: Date;
            let endDate: Date;

            switch (timeRange) {
                case 'today':
                    startDate = new Date(today);
                    endDate = new Date(today);
                    break;
                case 'yesterday':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 1);
                    endDate = new Date(startDate);
                    break;
                case 'last7':
                    endDate = new Date(today);
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 6);
                    break;
                case 'last14':
                    endDate = new Date(today);
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 13);
                    break;
                case 'thisMonth':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today);
                    break;
                case 'lastMonth':
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
                    endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
                    break;
                default:
                    return true;
            }
            
            return orderDate >= startDate && orderDate <= endDate;
        });
    }, [orders, timeRange]);
    
    const totalRevenue = useMemo(() =>
        filteredOrders
        .filter(o => o.status === OrderStatus.DELIVERED)
        .reduce((sum, order) => sum + order.totalPrice, 0),
    [filteredOrders]);

    const totalOrders = useMemo(() => filteredOrders.length, [filteredOrders]);

    const totalAffiliates = useMemo(() => users.filter(u => u.role === UserRole.AFFILIATE).length, [users]);

    const managers = useMemo(() => users.filter(u => u.role === UserRole.MANAGER), [users]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Dashboard Generale</h1>
                <div className="flex items-center bg-slate-200/75 p-1 rounded-lg space-x-1 flex-wrap justify-center">
                    {timeRanges.map(range => (
                        <button
                            key={range.value}
                            onClick={() => setTimeRange(range.value)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-100 ${
                                timeRange === range.value
                                    ? 'bg-white text-orange-600 shadow'
                                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard title="Fatturato Totale" value={`€${totalRevenue.toFixed(2)}`} icon={<CurrencyEuroIcon className="h-8 w-8 text-green-600"/>} color="bg-green-100" />
                <DashboardCard title="Ordini Totali" value={totalOrders} icon={<ShoppingCartIcon className="h-8 w-8 text-blue-600"/>} color="bg-blue-100" />
                <DashboardCard title="Affiliati Attivi" value={totalAffiliates} icon={<UsersIcon className="h-8 w-8 text-orange-600"/>} color="bg-orange-100" />
            </div>

            <ManagerPerformanceTable managers={managers} users={users} orders={filteredOrders} />
            <ProductPerformanceTable products={products} orders={filteredOrders} />
        </div>
    );
}

export default React.memo(MainDashboard);