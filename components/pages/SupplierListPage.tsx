import React from 'react';
import { User, Product } from '../../types';
import SupplierListTable from '../SupplierListTable';

interface SupplierListPageProps {
  suppliers: User[];
  products: Product[];
}

const SupplierListPage: React.FC<SupplierListPageProps> = ({ suppliers, products }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Elenco Fornitori</h1>
      <p className="text-slate-500">Visualizza tutti i fornitori e il numero di prodotti che gestiscono.</p>
      <SupplierListTable suppliers={suppliers} products={products} />
    </div>
  );
};

export default SupplierListPage;