import React from 'react';
import { Product, ProductStatus } from '../types';
import { PhotoIcon } from './Icons';

interface ProductApprovalTableProps {
  products: Product[];
  onUpdateProductStatus: (productId: string, status: ProductStatus) => void;
}

const ProductApprovalTable: React.FC<ProductApprovalTableProps> = ({ products, onUpdateProductStatus }) => {
  if (products.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Prodotti in Attesa di Approvazione</h3>
        <p className="text-slate-500">Nessun nuovo prodotto da revisionare.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900">Prodotti in Attesa di Approvazione</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prodotto</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prezzo</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Commissione</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paese</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-slate-200 flex-shrink-0 mr-4 flex items-center justify-center">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <PhotoIcon className="h-5 w-5 text-slate-400" />
                        )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">€{(product.price || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">€{(product.commission || 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.country}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button 
                    onClick={() => onUpdateProductStatus(product.id, ProductStatus.APPROVED)} 
                    className="px-3 py-1 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approva
                  </button>
                  <button 
                    onClick={() => onUpdateProductStatus(product.id, ProductStatus.REJECTED)} 
                    className="px-3 py-1 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Rifiuta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(ProductApprovalTable);