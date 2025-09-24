import React from 'react';
import { Product, User, UserRole } from '../types';
import { PhotoIcon } from './Icons';

interface ProductCardProps {
  product: Product;
  currentUser: User;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, currentUser, onViewDetails }) => {
  const customCommissionOverride = currentUser.role === UserRole.AFFILIATE
    ? product.affiliate_penalties?.find(c => c.affiliate_id === currentUser.id)
    : undefined;
  
  const commissionToDisplay = customCommissionOverride ? customCommissionOverride.commission : product.commission;
  const isCustomCommission = !!customCommissionOverride;

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full aspect-square bg-slate-100">
        {product.image_url ? (
            <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center">
                <PhotoIcon className="h-16 w-16 text-slate-400" />
            </div>
        )}
        <div className="absolute top-2 right-2 bg-slate-800/60 text-white text-xs font-bold px-2 py-1 rounded-full">
          {product.country}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-slate-800 truncate group-hover:text-orange-600 transition-colors">{product.name}</h3>
        <p className="text-sm text-slate-500 mb-4">{product.sku}</p>
        
        <div className="mt-auto space-y-3">
            <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-slate-500">Prezzo</span>
                <span className="text-xl font-bold text-slate-800">€{(product.price || 0).toFixed(2)}</span>
            </div>
            { [UserRole.AFFILIATE, UserRole.ADMIN, UserRole.MANAGER].includes(currentUser.role) && (
                <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-slate-500">Commissione</span>
                    <span className={`text-xl font-bold ${isCustomCommission ? 'text-yellow-600' : 'text-green-600'}`}>€{(commissionToDisplay || 0).toFixed(2)}</span>
                </div>
            )}
            {product.tolerance != null && (
                <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-slate-500 flex items-center">
                        Tolleranza
                        <span className="ml-1.5" title="Se la % di ordini approvati di un affiliato è uguale o superiore a (100% - Tolleranza), l'affiliato viene pagato per il 100% delle lead generate.">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 hover:text-slate-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                            </svg>
                        </span>
                    </span>
                    <span className="text-xl font-bold text-orange-600">{product.tolerance}%</span>
                </div>
            )}
        </div>
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <button
          onClick={() => onViewDetails(product)}
          className="w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Vedi Dettagli
        </button>
      </div>
    </div>
  );
};

export default ProductCard;