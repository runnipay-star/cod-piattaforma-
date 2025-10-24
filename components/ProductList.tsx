import React, { useState, useMemo } from 'react';
import { Product, UserRole } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { CogIcon } from './icons/CogIcon';

interface ProductListProps {
  products: Product[];
  userRole: UserRole;
  niches: string[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onViewProduct: (product: Product) => void;
  onOpenNicheManager: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, userRole, niches, onAddProduct, onEditProduct, onDeleteProduct, onViewProduct, onOpenNicheManager }) => {
  const isAffiliate = userRole === UserRole.AFFILIATE;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => selectedNiche === 'all' || p.niche === selectedNiche)
      .filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.refNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [products, searchQuery, selectedNiche]);

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-on-surface">Prodotti</h2>
        {!isAffiliate && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNicheManager}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
              title="Gestisci Nicchie"
            >
              <CogIcon />
              <span className="hidden sm:inline">Gestisci Nicchie</span>
            </button>
            <button
              onClick={onAddProduct}
              className="bg-primary text-on-primary font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Aggiungi Prodotto</span>
            </button>
          </div>
        )}
      </div>

      {/* Search and Filter bar */}
      <div className="bg-surface rounded-xl shadow-md p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search-product" className="sr-only">Cerca Prodotto</label>
            <input
              type="text"
              id="search-product"
              placeholder="Cerca per nome o REF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="niche-filter" className="sr-only">Filtra per nicchia</label>
            <select
              id="niche-filter"
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="all">Tutte le Nicchie</option>
              {niches.sort((a,b) => a.localeCompare(b)).map(niche => (
                <option key={niche} value={niche}>
                  {niche}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Product Gallery */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-surface rounded-xl shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="relative">
                <img className="h-48 w-full object-cover" src={product.imageUrl} alt={product.name} />
                <span className={`absolute top-2 right-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {product.isActive ? 'Attivo' : 'In Pausa'}
                </span>
                 <span className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-full bg-secondary text-primary">
                  {product.niche}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-on-surface flex-grow">{product.name}</h3>
                <div className="mt-2 flex justify-between items-center text-on-surface">
                  <p className="text-xl font-bold">€{product.price.toFixed(2)}</p>
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    €{product.commissionValue.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
                    <span>REF: {product.refNumber}</span>
                    {product.freeShipping && (
                        <span className="font-semibold text-green-700 flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 0 1 3.375-3.375h9.75a3.375 3.375 0 0 1 3.375 3.375v1.875M10.5 6h3M12 3v3M3.75 6H7.5m3 12h-3" />
                            </svg>
                            Gratuita
                        </span>
                    )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
                  <button
                    onClick={() => onViewProduct(product)}
                    className="flex-1 text-center bg-primary text-on-primary font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 text-sm"
                  >
                    Vedi Dettagli
                  </button>
                  {!isAffiliate && (
                    <>
                      <button onClick={() => onEditProduct(product)} className="p-2 text-primary hover:bg-gray-200 rounded-md" aria-label="Modifica prodotto">
                        <PencilIcon />
                      </button>
                      <button onClick={() => onDeleteProduct(product.id)} className="p-2 text-red-600 hover:text-red-800" aria-label="Elimina prodotto">
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-700">Nessun prodotto trovato</h3>
          <p className="text-gray-500 mt-2">Prova a modificare i filtri di ricerca o ad aggiungere un nuovo prodotto.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;