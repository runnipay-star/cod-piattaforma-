import React, { useMemo } from 'react';
import { User, Order, OrderStatus, UserRole } from '../types';

interface ManagerPerformanceTableProps {
  managers: User[];
  users: User[];
  orders: Order[];
}

interface ManagerStat {
  id: string;
  name: string;
  team: string;
  affiliateCount: number;
  totalRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
}

const ManagerPerformanceTable: React.FC<ManagerPerformanceTableProps> = ({ managers, users, orders }) => {

  const managerStats: ManagerStat[] = useMemo(() => {
    // Pre-calculate affiliates per team for efficiency
    const affiliatesByTeam = new Map<string, User[]>();
    for (const user of users) {
        if (user.role === UserRole.AFFILIATE && user.team) {
            if (!affiliatesByTeam.has(user.team)) {
                affiliatesByTeam.set(user.team, []);
            }
            affiliatesByTeam.get(user.team)!.push(user);
        }
    }
    
    // Pre-calculate orders per affiliate
    const ordersByAffiliate = new Map<string, Order[]>();
    for (const order of orders) {
        if (order.affiliateId) {
             if (!ordersByAffiliate.has(order.affiliateId)) {
                ordersByAffiliate.set(order.affiliateId, []);
            }
            ordersByAffiliate.get(order.affiliateId)!.push(order);
        }
    }

    return managers.map(manager => {
      if (!manager.team) {
          return {
              id: manager.id,
              name: manager.name,
              team: 'N/A',
              affiliateCount: 0,
              totalOrders: 0,
              deliveredOrders: 0,
              totalRevenue: 0,
          };
      }
      
      const teamAffiliates = affiliatesByTeam.get(manager.team) || [];
      const teamOrders: Order[] = teamAffiliates.flatMap(affiliate => ordersByAffiliate.get(affiliate.id) || []);
      const totalOrders = teamOrders.length;
      
      const deliveredOrders = teamOrders.filter(o => o.status === OrderStatus.DELIVERED);
      const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      return {
        id: manager.id,
        name: manager.name,
        team: manager.team || 'N/A',
        affiliateCount: teamAffiliates.length,
        totalOrders,
        deliveredOrders: deliveredOrders.length,
        totalRevenue,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [managers, users, orders]);
  
  if (managers.length === 0) {
    return (
       <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Performance Manager</h3>
        <p className="text-slate-500">Nessun manager da visualizzare.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Performance Manager</h3>
        </div>
        <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Manager</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Team</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"># Affiliati</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordini Totali</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordini Consegnati</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fatturato</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {managerStats.map((stat) => (
            <tr key={stat.id} className="hover:bg-slate-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{stat.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{stat.team}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{stat.affiliateCount}</td>
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

export default React.memo(ManagerPerformanceTable);