import React from 'react';
import { Product, ProductStatus } from '../types';
import { PencilSquareIcon, TrashIcon, PhotoIcon } from './Icons';

interface ProductTableProps {
  products: Product[];
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const statusColorMap: Record<ProductStatus, string> = {
  [ProductStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ProductStatus.APPROVED]: 'bg-green-100 text-green-800',
  [ProductStatus.REJECTED]: 'bg-red-100 text-red-800',
};

const StatusBadge: React.FC<{ status: ProductStatus }> = ({ status }) => (
  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorMap[status]}`}>
    {status}
  </span>
);

const ProductTable: React.FC<ProductTableProps> = ({ products, onEditProduct, onDeleteProduct }) => {
  if (products.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Elenco Prodotti</h3>
        <p className="text-slate-500">Nessun prodotto da visualizzare.</p>
      </div>
    );
  }

  const showActions = onEditProduct && onDeleteProduct;

  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Immagine</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prodotto</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prezzo</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Commissione</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paese</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stato</th>
              {showActions && <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Azioni</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-200 flex items-center justify-center flex-shrink-0">
                      {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                          <PhotoIcon className="h-6 w-6 text-slate-400" />
                      )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{product.name}</div>
                  <div className="text-xs text-slate-500">{product.sku}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">€{(product.price || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">€{(product.commission || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.country}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <StatusBadge status={product.status} />
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => onEditProduct(product)} className="text-orange-600 hover:text-orange-900 focus:outline-none" title="Modifica">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => window.confirm('Sei sicuro di voler eliminare questo prodotto?') && onDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 focus:outline-none" title="Elimina">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(ProductTable);