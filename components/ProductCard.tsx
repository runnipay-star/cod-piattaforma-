
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
    const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

    return (
        <div
            onClick={() => onSelect(product)}
            className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-all duration-300 group"
        >
            <div className="relative h-48">
                <img
                    src={product.images[0] || 'https://picsum.photos/600/400'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                 <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-neutral truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1 h-10 overflow-hidden">{product.description}</p>
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-xl font-black text-primary">{currencyFormatter.format(product.price)}</p>
                    <p className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        +{currencyFormatter.format(product.affiliateCommission)}
                    </p>
                </div>
            </div>
        </div>
    );
};
