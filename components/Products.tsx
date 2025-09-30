import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type Product, type User, UserRole } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../LanguageContext';

const AddProductModal: React.FC<{
  onClose: () => void;
  onSave: (newProductData: Omit<Product, 'id' | 'endpointUrl'>) => void;
  isSaving: boolean;
}> = ({ onClose, onSave, isSaving }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        price: 0,
        purchasePrice: 0,
        commission: 0,
        platformCommission: 0,
        codShippingCost: 0,
        logisticsCommission: 0,
        tolerance: 0,
        imageUrls: [] as string[],
        trackingCode: '',
    });
    const [newImageUrl, setNewImageUrl] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddImageUrl = () => {
        const trimmedUrl = newImageUrl.trim();
        if (trimmedUrl && !formData.imageUrls.includes(trimmedUrl)) {
            // The URL constructor is too strict for user input (e.g., requires a protocol).
            // We will skip strict validation and let the <img> tag handle rendering.
            setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, trimmedUrl] }));
            setNewImageUrl('');
        }
    };

    const handleRemoveImageUrl = (urlToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter(url => url !== urlToRemove)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newProductData = {
            ...formData,
            price: parseFloat(String(formData.price)) || 0,
            purchasePrice: parseFloat(String(formData.purchasePrice)) || 0,
            commission: parseFloat(String(formData.commission)) || 0,
            platformCommission: parseFloat(String(formData.platformCommission)) || 0,
            codShippingCost: parseFloat(String(formData.codShippingCost)) || 0,
            logisticsCommission: parseFloat(String(formData.logisticsCommission)) || 0,
            tolerance: parseFloat(String(formData.tolerance)) || 0,
            imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : [`https://picsum.photos/seed/${formData.name.toLowerCase().replace(/\s+/g, '-')}/400/400`],
            trackingCode: formData.trackingCode.trim() || undefined,
        };
        onSave(newProductData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('addProduct')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('name')}</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">{t('sku')}</label>
                            <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">{t('imageUrls')}</label>
                        <div className="flex items-center space-x-2 mt-1">
                           <input 
                              type="text" 
                              id="imageUrl" 
                              value={newImageUrl} 
                              onChange={(e) => setNewImageUrl(e.target.value)} 
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); }}}
                              placeholder="https://example.com/image.png" 
                              className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button type="button" onClick={handleAddImageUrl} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">{t('addImage')}</button>
                        </div>
                         <div className="mt-2 space-y-1">
                            {formData.imageUrls.map((url, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                    <span className="text-xs text-gray-600 truncate pr-2">{url}</span>
                                    <button type="button" onClick={() => handleRemoveImageUrl(url)} className="text-xs text-red-500 hover:text-red-700 font-semibold flex-shrink-0">{t('remove')}</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('description')}</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">{t('priceEur')}</label>
                            <input type="number" step="0.01" min="0" id="price" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">{t('purchasePriceEur')}</label>
                            <input type="number" step="0.01" min="0" id="purchasePrice" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="commission" className="block text-sm font-medium text-gray-700">{t('commissionEur')}</label>
                            <input type="number" step="0.01" min="0" id="commission" name="commission" value={formData.commission} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="platformCommission" className="block text-sm font-medium text-gray-700">{t('platformCommissionEur')}</label>
                            <input type="number" step="0.01" min="0" id="platformCommission" name="platformCommission" value={formData.platformCommission} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="codShippingCost" className="block text-sm font-medium text-gray-700">{t('codShippingCostEur')}</label>
                            <input type="number" step="0.01" min="0" id="codShippingCost" name="codShippingCost" value={formData.codShippingCost} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="logisticsCommission" className="block text-sm font-medium text-gray-700">{t('logisticsCommissionEur')}</label>
                            <input type="number" step="0.01" min="0" id="logisticsCommission" name="logisticsCommission" value={formData.logisticsCommission} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="trackingCode" className="block text-sm font-medium text-gray-700">{t('trackingCode')}</label>
                            <input type="text" id="trackingCode" name="trackingCode" value={formData.trackingCode} onChange={handleChange} placeholder={t('trackingCodePlaceholder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="tolerance" className="flex items-center text-sm font-medium text-gray-700">
                                {t('tolerancePercentage')}
                                <span className="ml-1 text-gray-400 cursor-help" title={t('toleranceDescription')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </label>
                            <input type="number" step="1" min="0" max="100" id="tolerance" name="tolerance" value={formData.tolerance} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50">{t('cancel')}</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {isSaving ? t('creating') : t('create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Products: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const productsData = await api.getProducts();
        setProducts(productsData);
      } catch (err) {
        setError(t('failedToFetchProducts'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [t]);

  const handleSaveNewProduct = async (newProductData: Omit<Product, 'id' | 'endpointUrl'>) => {
    setIsSaving(true);
    try {
        const newProduct = await api.createProduct(newProductData);
        setProducts(prev => [...prev, newProduct].sort((a,b) => a.id - b.id));
        setIsAdding(false);
    } catch(err) {
        console.error("Failed to create product", err);
        setError(t('failedToCreateProduct'));
    } finally {
        setIsSaving(false);
    }
  };

  const getEffectiveCommission = (product: Product) => {
    if (currentUser.role === UserRole.AFFILIATE && product.penalties && product.penalties[currentUser.id]) {
      const reduction = product.penalties[currentUser.id];
      return product.commission * (1 - reduction / 100);
    }
    return product.commission;
  };

  const canAddProducts = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;

  if (loading) {
    return <div className="text-center p-8">{t('loadingProducts')}</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {isAdding && (
        <AddProductModal
          onClose={() => setIsAdding(false)}
          onSave={handleSaveNewProduct}
          isSaving={isSaving}
        />
       )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">{t('products')}</h2>
        {canAddProducts && (
            <button
                onClick={() => setIsAdding(true)}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
             </svg>
              {t('addProduct')}
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => {
            const effectiveCommission = getEffectiveCommission(product);
            const hasPenalty = effectiveCommission !== product.commission;
            const imageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://placehold.co/400x400?text=No+Image';
            return (
              <Link to={`/products/${product.id}`} key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <img src={imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{product.description.substring(0, 60)}...</p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xl font-bold text-blue-600">€{product.price.toFixed(2)}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${hasPenalty ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      €{effectiveCommission.toFixed(2)} comm.
                    </span>
                  </div>
                </div>
              </Link>
            )
        })}
      </div>
    </div>
  );
};

export default Products;