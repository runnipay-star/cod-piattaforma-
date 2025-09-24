import React, { useMemo } from 'react';
import { Product, Order, OrderStatus } from '../types';

interface ProductPerformanceTableProps {
  products: Product[];
  orders: Order[];
}

interface ProductStat {
    id: string;
    name: string;
    sku: string;
    unitsSold: number;
    totalRevenue: number;
}

const ProductPerformanceTable: React.FC<ProductPerformanceTableProps> = ({ products, orders }) => {
    const productStats: ProductStat[] = useMemo(() => {
        return products.map(product => {
            const productOrders = orders.filter(o => o.productId === product.id && o.status === OrderStatus.DELIVERED);
            const unitsSold = productOrders.reduce((sum, order) => sum + order.quantity, 0);
            const totalRevenue = productOrders.reduce((sum, order) => sum + order.totalPrice, 0);
            
            return {
                id: product.id,
                name: product.name,
                sku: product.sku,
                unitsSold,
                totalRevenue,
            };
        }).sort((a,b) => b.totalRevenue - a.totalRevenue);
    }, [products, orders]);
    
    if (products.length === 0) {
        return (
           <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Performance Prodotti</h3>
            <p className="text-slate-500">Nessun prodotto da visualizzare.</p>
          </div>
        )
    }

    return (
        <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Performance Prodotti</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prodotto</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unità Vendute</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fatturato</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                    {productStats.map((stat) => (
                        <tr key={stat.id} className="hover:bg-slate-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{stat.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{stat.sku}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{stat.unitsSold}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">€{stat.totalRevenue.toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default React.memo(ProductPerformanceTable);