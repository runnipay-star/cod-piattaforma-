import React, { useMemo } from 'react';
import { User, Product } from '../types';

interface SupplierListTableProps {
  suppliers: User[];
  products: Product[];
}

interface SupplierStat {
  id: string;
  name: string;
  email: string;
  productCount: number;
}

const SupplierListTable: React.FC<SupplierListTableProps> = ({ suppliers, products }) => {

  const supplierStats: SupplierStat[] = useMemo(() => {
    return suppliers.map(supplier => {
      // FIX: Corrected property access from 'supplierId' to 'supplier_id' to match the Product type definition.
      const productCount = products.filter(p => p.supplier_id === supplier.id).length;
      return {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        productCount,
      };
    }).sort((a, b) => b.productCount - a.productCount);
  }, [suppliers, products]);
  
  if (suppliers.length === 0) {
    return (
       <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Elenco Fornitori</h3>
        <p className="text-slate-500">Nessun fornitore da visualizzare.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome Fornitore</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prodotti Caricati</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {supplierStats.map((stat) => (
              <tr key={stat.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{stat.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{stat.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{stat.productCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(SupplierListTable);