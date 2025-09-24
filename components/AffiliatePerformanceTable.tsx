import React, { useMemo } from 'react';
import { User, Order, OrderStatus } from '../types';

interface AffiliatePerformanceTableProps {
  affiliates: User[];
  orders: Order[];
}

interface AffiliateStat {
  id: string;
  name: string;
  team: string;
  totalRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
}

const AffiliatePerformanceTable: React.FC<AffiliatePerformanceTableProps> = ({ affiliates, orders }) => {

  const affiliateStats: AffiliateStat[] = useMemo(() => {
    // Group orders by affiliateId once for efficiency
    const ordersByAffiliate = new Map<string, Order[]>();
    for (const order of orders) {
        if (order.affiliateId) {
            if (!ordersByAffiliate.has(order.affiliateId)) {
                ordersByAffiliate.set(order.affiliateId, []);
            }
            ordersByAffiliate.get(order.affiliateId)!.push(order);
        }
    }

    return affiliates.map(affiliate => {
      const affiliateOrders = ordersByAffiliate.get(affiliate.id) || [];
      const totalOrders = affiliateOrders.length;
      
      const deliveredOrders = affiliateOrders.filter(o => o.status === OrderStatus.DELIVERED);
      const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      return {
        id: affiliate.id,
        name: affiliate.name,
        team: affiliate.team || 'N/A',
        totalOrders,
        deliveredOrders: deliveredOrders.length,
        totalRevenue,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [affiliates, orders]);
  
  if (affiliates.length === 0) {
    return (
       <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Performance Affiliati</h3>
        <p className="text-slate-500">Nessun affiliato da visualizzare.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900">Performance Affiliati</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Affiliato</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Team</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordini Totali</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordini Consegnati</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fatturato</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {affiliateStats.map((stat) => (
              <tr key={stat.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{stat.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{stat.team}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{stat.totalOrders}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{stat.deliveredOrders}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">€{stat.totalRevenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(AffiliatePerformanceTable);