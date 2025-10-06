
import React from 'react';
import { Product, User, Role } from '../types';
import { ProductCard } from './ProductCard';
import { PlusIcon } from './icons';
import { useLocalization } from '../hooks/useLocalization';

interface ProductListProps {
  products: Product[];
  currentUser: User | null;
  onSelectProduct: (product: Product) => void;
  onAddProduct: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, currentUser, onSelectProduct, onAddProduct }) => {
    const { t } = useLocalization();
    const canManage = currentUser?.role === Role.ADMIN || currentUser?.role === Role.MANAGER;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-neutral">{t('productManagement')}</h2>
                {canManage && (
                    <button
                        onClick={onAddProduct}
                        className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition duration-300 shadow-lg"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>{t('addProduct')}</span>
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
                ))}
            </div>
        </div>
    );
};
