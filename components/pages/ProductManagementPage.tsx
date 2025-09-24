import React, { useState, useMemo, useEffect } from 'react';
import { Product, Niche, User, UserRole, ProductStatus } from '../../types';
import ProductCard from '../ProductCard';
import ProductDetailPage from './ProductDetailPage';
import CreateProductModal from '../CreateProductModal';
import { PlusIcon } from '../Icons';
import NicheTable from '../NicheTable';
import CreateNicheModal from '../CreateNicheModal';
import EditNicheModal from '../EditNicheModal';

interface ProductManagementPageProps {
  products: Product[];
  niches: Niche[];
  suppliers: User[];
  affiliates: User[];
  currentUser: User;
  onCreateProduct: (product: Omit<Product, 'id' | 'status' | 'created_at'>, creatorRole: UserRole) => Promise<boolean>;
  onUpdateProduct: (productId: string, updateData: Partial<Product>) => Promise<boolean>;
  onDeleteProduct: (productId: string) => void;
  onCreateNiche: (niche: Omit<Niche, 'id'>) => Promise<boolean>;
  onUpdateNiche: (niche: Niche) => void;
  onDeleteNiche: (nicheId: string) => void;
}

const ProductManagementPage: React.FC<ProductManagementPageProps> = (props) => {
    const { products, niches, suppliers, affiliates, currentUser, onCreateProduct, onUpdateProduct, onDeleteProduct, onCreateNiche, onUpdateNiche, onDeleteNiche } = props;

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNicheId, setSelectedNicheId] = useState('all');

    const [isCreateNicheOpen, setCreateNicheOpen] = useState(false);
    const [editingNiche, setEditingNiche] = useState<Niche | null>(null);

    const canCreateProduct = [UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPLIER].includes(currentUser.role);
    const isAdmin = currentUser.role === UserRole.ADMIN;
    
    // Effetto per aggiornare il prodotto selezionato se la lista dei prodotti cambia (es. dopo una modifica)
    useEffect(() => {
        if (selectedProduct) {
            const updatedProduct = products.find(p => p.id === selectedProduct.id);
            if (updatedProduct) {
                setSelectedProduct(updatedProduct);
            } else {
                // Il prodotto potrebbe essere stato eliminato
                setSelectedProduct(null);
            }
        }
    }, [products, selectedProduct]);

    const availableProducts = useMemo(() => {
        if (currentUser.role === UserRole.AFFILIATE) {
            return products.filter(p => p.status === ProductStatus.APPROVED);
        }
        if (currentUser.role === UserRole.SUPPLIER) {
            return products.filter(p => p.supplier_id === currentUser.id);
        }
        return products;
    }, [products, currentUser.role, currentUser.id]);

    const filteredProducts = useMemo(() => {
        return availableProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesNiche = selectedNicheId === 'all' || product.niche_id === selectedNicheId;
            return matchesSearch && matchesNiche;
        });
    }, [availableProducts, searchTerm, selectedNicheId]);

    if (selectedProduct) {
        const niche = niches.find(n => n.id === selectedProduct.niche_id);
        const supplier = suppliers.find(s => s.id === selectedProduct.supplier_id);
        return (
            <ProductDetailPage 
                product={selectedProduct}
                niche={niche}
                supplier={supplier}
                currentUser={currentUser}
                onBack={() => setSelectedProduct(null)}
                onUpdateProduct={onUpdateProduct}
                onDeleteProduct={onDeleteProduct}
                niches={niches}
                suppliers={suppliers}
                affiliates={affiliates}
            />
        );
    }
    
    const handleCreateProduct = (product: Omit<Product, 'id' | 'status' | 'created_at'>): Promise<boolean> => {
      return onCreateProduct(product, currentUser.role);
    }

    // FIX: Updated handleCreateNiche to return a Promise<boolean> to match the expected prop type in CreateNicheModal.
    const handleCreateNiche = async (niche: Omit<Niche, 'id'>): Promise<boolean> => {
        const success = await onCreateNiche(niche);
        if (success) {
            setCreateNicheOpen(false);
        }
        return success;
    };

    const handleUpdateNiche = (niche: Niche) => {
        onUpdateNiche(niche);
        setEditingNiche(null);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Sezione Catalogo Prodotti */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Catalogo Prodotti</h1>
                        <p className="text-slate-500 mt-1">Esplora i prodotti disponibili per la vendita.</p>
                    </div>
                    {canCreateProduct && (
                        <button
                            onClick={() => setIsCreatingProduct(true)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Aggiungi Prodotto
                        </button>
                    )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Cerca per nome o SKU..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                    <select
                        value={selectedNicheId}
                        onChange={e => setSelectedNicheId(e.target.value)}
                        className="w-full sm:w-48 px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    >
                        <option value="all">Tutte le Nicchie</option>
                        {niches.map(niche => (
                            <option key={niche.id} value={niche.id}>{niche.name}</option>
                        ))}
                    </select>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} currentUser={currentUser} onViewDetails={() => setSelectedProduct(product)} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200 mt-8">
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nessun Prodotto Trovato</h3>
                        <p className="text-slate-500">Prova a modificare i filtri di ricerca o controlla più tardi.</p>
                    </div>
                )}
            </div>

            {/* Sezione Gestione Nicchie (solo per Admin) */}
            {isAdmin && (
                <div className="pt-8 border-t border-slate-200 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Gestione Nicchie</h2>
                        <button
                            onClick={() => setCreateNicheOpen(true)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Crea Nicchia
                        </button>
                    </div>
                    <NicheTable niches={niches} onEditNiche={setEditingNiche} onDeleteNiche={onDeleteNiche} />
                </div>
            )}
            
            {/* Modali */}
            <CreateProductModal
              isOpen={isCreatingProduct}
              onCreateProduct={handleCreateProduct}
              onClose={() => setIsCreatingProduct(false)}
              niches={niches}
              suppliers={suppliers}
              affiliates={affiliates}
              currentUser={currentUser}
            />
            <CreateNicheModal 
                isOpen={isCreateNicheOpen}
                onCreateNiche={handleCreateNiche}
                onClose={() => setCreateNicheOpen(false)}
            />
            <EditNicheModal 
                niche={editingNiche}
                onUpdateNiche={handleUpdateNiche}
                onClose={() => setEditingNiche(null)}
            />
        </div>
    );
};

export default React.memo(ProductManagementPage);