import React from 'react';
import { Product } from '../types';
import { XMarkIcon } from './Icons';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">{product.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <XMarkIcon className="h-6 w-6" />
            <span className="sr-only">Chiudi</span>
          </button>
        </div>
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img 
                        src={product.image_url || 'https://placehold.co/600x600/e2e8f0/e2e8f0/png'} 
                        alt={product.name}
                        className="w-full h-auto object-cover rounded-lg shadow-md"
                    />
                </div>
                <div className="space-y-4">
                    <p className="text-slate-600">{product.description}</p>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Prezzo</p>
                                <p className="text-2xl font-bold text-slate-800">€{(product.price || 0).toFixed(2)}</p>
                            </div>
                             <div>
                                <p className="text-sm font-medium text-slate-500">Commissione</p>
                                <p className="text-2xl font-bold text-green-600">€{(product.commission || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">SKU</p>
                        <p className="text-lg font-mono text-slate-800">{product.sku}</p>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">Paese</p>
                        <p className="text-lg text-slate-800">{product.country}</p>
                    </div>
                </div>
            </div>
        </div>
         <div className="bg-slate-50 px-6 py-4 flex justify-end items-center rounded-b-xl flex-shrink-0 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Chiudi
            </button>
          </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;