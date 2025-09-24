import React, { useState, useEffect } from 'react';
import { Product, Niche, User, UserRole, ProductCustomerField, AffiliateCommissionOverride } from '../types';
import { XMarkIcon, TrashIcon, PhotoIcon } from './Icons';
import { DEFAULT_CUSTOMER_FIELDS } from '../constants';
import { supabase } from '../supabaseClient';

interface EditProductModalProps {
  product: Product | null;
  onUpdateProduct: (productId: string, updateData: Partial<Product>) => Promise<boolean>;
  onClose: () => void;
  niches: Niche[];
  suppliers: User[];
  affiliates: User[];
  currentUser: User;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onUpdateProduct, onClose, niches, suppliers, affiliates, currentUser }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [commission, setCommission] = useState('');
  const [platformFee, setPlatformFee] = useState('');
  const [country, setCountry] = useState('');
  const [niche_id, setNiche_id] = useState('');
  const [supplier_id, setSupplier_id] = useState('');
  const [tolerance, setTolerance] = useState('');
  const [customerFields, setCustomerFields] = useState<ProductCustomerField[]>(DEFAULT_CUSTOMER_FIELDS);
  const [affiliatePenalties, setAffiliatePenalties] = useState<AffiliateCommissionOverride[]>([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState('');
  const [customCommission, setCustomCommission] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputStyle = "block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm";

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setSku(product.sku);
      setPrice(product.price.toString());
      setCommission(product.commission.toString());
      setPlatformFee(product.platform_fee?.toString() || '0');
      setCountry(product.country);
      setImageFile(null);
      setImagePreview(product.image_url || '');
      setNiche_id(product.niche_id);
      setSupplier_id(product.supplier_id);
      setTolerance(product.tolerance?.toString() || '');
      setCustomerFields(product.customer_fields || DEFAULT_CUSTOMER_FIELDS);
      setAffiliatePenalties(product.affiliate_penalties || []);
      setSelectedAffiliate('');
      setCustomCommission('');
      setErrors({});
    }
  }, [product]);

  if (!product) {
    return null;
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
         if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert("L'immagine è troppo grande. Il limite è 10MB.");
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFieldChange = (id: ProductCustomerField['id'], key: 'enabled' | 'required', value: boolean) => {
    setCustomerFields(prevFields =>
        prevFields.map(field => {
            if (field.id === id) {
                const newField = { ...field, [key]: value };
                if (key === 'enabled' && !value) {
                    newField.required = false;
                }
                return newField;
            }
            return field;
        })
    );
  };
  
  const handleAddOverride = () => {
    const affiliateId = selectedAffiliate;
    const commissionValue = parseFloat(customCommission);
    const priceValue = parseFloat(price);

    if (!affiliateId) {
        alert("Seleziona un affiliato.");
        return;
    }
    if (affiliatePenalties.some(c => c.affiliate_id === affiliateId)) {
        alert("È già stata impostata una commissione per questo affiliato.");
        return;
    }
    if (isNaN(commissionValue) || commissionValue < 0) {
        alert("Inserisci un valore di commissione valido.");
        return;
    }
    if (!isNaN(priceValue) && commissionValue >= priceValue) {
        alert("La commissione personalizzata non può essere uguale o superiore al prezzo del prodotto.");
        return;
    }
    
    setAffiliatePenalties([...affiliatePenalties, { affiliate_id: affiliateId, commission: commissionValue }]);
    setSelectedAffiliate('');
    setCustomCommission('');
  };

  const handleRemoveOverride = (affiliateIdToRemove: string) => {
    setAffiliatePenalties(affiliatePenalties.filter(c => c.affiliate_id !== affiliateIdToRemove));
  };


  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Il nome del prodotto è obbligatorio.";
    if (!sku.trim()) newErrors.sku = "Lo SKU è obbligatorio.";
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = "Il prezzo deve essere un numero positivo.";
    }
    
    const commissionNum = parseFloat(commission);
    if (isNaN(commissionNum) || commissionNum < 0) {
        newErrors.commission = "La commissione affiliato non può essere negativa.";
    }

    const platformFeeNum = parseFloat(platformFee);
    if (isNaN(platformFeeNum) || platformFeeNum < 0) {
        newErrors.platformFee = "La commissione piattaforma non può essere negativa.";
    }

    if (!isNaN(priceNum) && priceNum > 0 && !isNaN(commissionNum) && commissionNum >= 0 && !isNaN(platformFeeNum) && platformFeeNum >= 0) {
        if ((commissionNum + platformFeeNum) >= priceNum) {
            const errorMsg = "La somma delle commissioni non può essere uguale o superiore al prezzo.";
            newErrors.platformFee = errorMsg;
            newErrors.commission = errorMsg;
        }
    }
    
    if (!country.trim()) newErrors.country = "Il paese è obbligatorio.";
    if (!niche_id) newErrors.niche_id = "Seleziona una nicchia.";
    if (!supplier_id) newErrors.supplier_id = "Seleziona un fornitore.";
    
    const normalizedTolerance = tolerance.toString().replace(',', '.').trim();
    if (normalizedTolerance) {
        const toleranceNum = parseFloat(normalizedTolerance);
        if (isNaN(toleranceNum) || toleranceNum < 0 || toleranceNum >= 100) {
            newErrors.tolerance = "La tolleranza deve essere un numero tra 0 e 99.9.";
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !product) return;
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    let finalImageUrl = product.image_url;

    // Gestione upload/rimozione immagine
    if (imageFile) {
        // 1. Carica la nuova immagine
        const fileName = `${Date.now()}_${imageFile.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage
            .from('product_images')
            .upload(fileName, imageFile);

        if (uploadError) {
            alert(`Errore durante il caricamento della nuova immagine: ${uploadError.message}`);
            setLoading(false);
            return;
        }

        const { data: newUrlData } = supabase.storage
            .from('product_images')
            .getPublicUrl(fileName);
        
        finalImageUrl = newUrlData.publicUrl;

        // 2. Elimina la vecchia immagine se esisteva
        if (product.image_url) {
            try {
                const oldFileName = product.image_url.split('/').pop();
                if (oldFileName) {
                    await supabase.storage.from('product_images').remove([oldFileName]);
                }
            } catch (e) {
                console.error("Impossibile eliminare la vecchia immagine, ma l'operazione continuerà:", e);
            }
        }
    } else if (!imagePreview && product.image_url) {
        // L'utente ha rimosso l'immagine esistente senza caricarne una nuova
        try {
            const oldFileName = product.image_url.split('/').pop();
            if (oldFileName) {
                await supabase.storage.from('product_images').remove([oldFileName]);
            }
            finalImageUrl = undefined;
        } catch (e) {
            console.error("Impossibile eliminare la vecchia immagine, ma l'operazione continuerà:", e);
        }
    }
    
    const normalizedTolerance = tolerance.toString().replace(',', '.').trim();

    const updateData: Partial<Product> = {
        name: name.trim(),
        description: description.trim(),
        sku: sku.trim(),
        price: parseFloat(price),
        commission: parseFloat(commission),
        platform_fee: parseFloat(platformFee),
        country: country.trim(),
        image_url: finalImageUrl,
        niche_id: niche_id,
        supplier_id: supplier_id,
        customer_fields: customerFields,
        affiliate_penalties: affiliatePenalties,
        tolerance: normalizedTolerance === '' ? undefined : parseFloat(normalizedTolerance),
    };
    
    const success = await onUpdateProduct(product.id, updateData);
    setLoading(false);

    if (success) {
      onClose();
    }
  };
  
  const canSelectSupplier = currentUser.role !== UserRole.SUPPLIER;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">Modifica Prodotto</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <XMarkIcon className="h-6 w-6" />
            <span className="sr-only">Chiudi</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div>
              <label htmlFor="edit-prod-name" className="block text-sm font-medium text-slate-700 mb-1">Nome Prodotto</label>
              <input type="text" id="edit-prod-name" value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} required />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
             <div>
              <label htmlFor="edit-prod-desc" className="block text-sm font-medium text-slate-700 mb-1">Descrizione</label>
              <textarea id="edit-prod-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputStyle}></textarea>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="edit-prod-sku" className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                    <input type="text" id="edit-prod-sku" value={sku} onChange={(e) => setSku(e.target.value)} className={inputStyle} required />
                    {errors.sku && <p className="text-sm text-red-600 mt-1">{errors.sku}</p>}
                </div>
                <div>
                    <label htmlFor="edit-prod-price" className="block text-sm font-medium text-slate-700 mb-1">Prezzo (€)</label>
                    <input type="number" step="0.01" id="edit-prod-price" value={price} onChange={(e) => setPrice(e.target.value)} className={inputStyle} required />
                    {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="edit-prod-commission" className="block text-sm font-medium text-slate-700 mb-1">Commissione Affiliato (€)</label>
                    <input type="number" step="0.01" id="edit-prod-commission" value={commission} onChange={(e) => setCommission(e.target.value)} className={inputStyle} required />
                    {errors.commission && <p className="text-sm text-red-600 mt-1">{errors.commission}</p>}
                </div>
                <div>
                    <label htmlFor="edit-prod-platform-fee" className="block text-sm font-medium text-slate-700 mb-1">Commissione Piattaforma (€)</label>
                    <input type="number" step="0.01" id="edit-prod-platform-fee" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} className={inputStyle} required />
                    {errors.platformFee && <p className="text-sm text-red-600 mt-1">{errors.platformFee}</p>}
                </div>
            </div>
             <div>
                <label htmlFor="edit-prod-country" className="block text-sm font-medium text-slate-700 mb-1">Paese di Vendita</label>
                <input type="text" id="edit-prod-country" value={country} onChange={(e) => setCountry(e.target.value)} className={inputStyle} required />
                {errors.country && <p className="text-sm text-red-600 mt-1">{errors.country}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Immagine Prodotto</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div>
                      <img src={imagePreview} alt="Anteprima prodotto" className="mx-auto h-32 w-auto rounded-md object-contain" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} className="mt-2 text-sm font-medium text-red-600 hover:text-red-800">
                        Rimuovi immagine
                      </button>
                    </div>
                  ) : (
                    <>
                      <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600">
                        <label htmlFor="file-upload-edit" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                          <span>Carica un file</span>
                          <input id="file-upload-edit" name="file-upload-edit" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" />
                        </label>
                        <p className="pl-1">o trascina qui</p>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG, WEBP fino a 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="edit-prod-niche" className="block text-sm font-medium text-slate-700 mb-1">Nicchia</label>
                    <select id="edit-prod-niche" value={niche_id} onChange={(e) => setNiche_id(e.target.value)} className={inputStyle} required>
                        {niches.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                     {errors.niche_id && <p className="text-sm text-red-600 mt-1">{errors.niche_id}</p>}
                </div>
                <div>
                    <label htmlFor="edit-prod-supplier" className="block text-sm font-medium text-slate-700 mb-1">Fornitore</label>
                    <select id="edit-prod-supplier" value={supplier_id} onChange={(e) => setSupplier_id(e.target.value)} className={inputStyle} disabled={!canSelectSupplier} required>
                        {canSelectSupplier ? (
                            suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                        ) : (
                            <option value={currentUser.id}>{currentUser.name}</option>
                        )}
                    </select>
                     {errors.supplier_id && <p className="text-sm text-red-600 mt-1">{errors.supplier_id}</p>}
                </div>
            </div>

            {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
              <div>
                <label htmlFor="edit-prod-tolerance" className="block text-sm font-medium text-slate-700 mb-1">Tolleranza Approvazione (%)</label>
                <input type="text" id="edit-prod-tolerance" value={tolerance} onChange={(e) => setTolerance(e.target.value)} className={inputStyle} placeholder="es. 35 o 35,5" />
                <p className="text-xs text-slate-500 mt-1">Se l'approvato di un affiliato è &gt;= (100 - Tolleranza), verranno pagate tutte le lead.</p>
                {errors.tolerance && <p className="text-sm text-red-600 mt-1">{errors.tolerance}</p>}
              </div>
            )}

            <fieldset className="border p-4 rounded-lg space-y-3 mt-4">
                <legend className="px-2 font-medium text-slate-700 text-sm">Campi Cliente Richiesti</legend>
                {customerFields.map(field => (
                    <div key={field.id} className="flex items-center justify-between">
                        <span className="text-sm text-slate-800">{field.label}</span>
                        <div className="flex items-center space-x-4">
                             <label className="flex items-center text-sm">
                                <input type="checkbox" checked={field.enabled} onChange={e => handleFieldChange(field.id, 'enabled', e.target.checked)} className="h-4 w-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"/>
                                <span className="ml-2">Abilitato</span>
                            </label>
                            <label className="flex items-center text-sm">
                                <input type="checkbox" checked={field.required} disabled={!field.enabled} onChange={e => handleFieldChange(field.id, 'required', e.target.checked)} className="h-4 w-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 disabled:bg-slate-200"/>
                                <span className="ml-2">Obbligatorio</span>
                            </label>
                        </div>
                    </div>
                ))}
            </fieldset>

            <fieldset className="border p-4 rounded-lg space-y-3 mt-4">
                <legend className="px-2 font-medium text-slate-700 text-sm">Penalità/Bonus su Commissione per Affiliati</legend>
                <div className="space-y-2">
                    {affiliatePenalties.map((override) => {
                        const affiliate = affiliates.find(a => a.id === override.affiliate_id);
                        return (
                             <div key={override.affiliate_id} className="flex items-center justify-between bg-slate-100 p-2 rounded-md">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{affiliate?.name || 'Sconosciuto'}</p>
                                    <p className="text-xs text-slate-500">{affiliate?.email}</p>
                                </div>
                                <div className="flex items-center gap-x-4">
                                     <span className="text-sm font-bold text-green-600">€{override.commission.toFixed(2)}</span>
                                     <button type="button" onClick={() => handleRemoveOverride(override.affiliate_id)} className="text-red-500 hover:text-red-700 p-1">
                                        <TrashIcon className="h-4 w-4" />
                                     </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
                 <div className="flex flex-col sm:flex-row items-end gap-2 pt-2 border-t">
                    <div className="flex-grow w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Affiliato</label>
                        <select value={selectedAffiliate} onChange={e => setSelectedAffiliate(e.target.value)} className={inputStyle}>
                            <option value="" disabled>Seleziona un affiliato</option>
                            {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div className="w-full sm:w-40">
                         <label className="block text-sm font-medium text-slate-700 mb-1">Commissione (€)</label>
                         <input type="number" step="0.01" value={customCommission} onChange={e => setCustomCommission(e.target.value)} className={inputStyle} placeholder="es. 4.50" />
                    </div>
                    <button type="button" onClick={handleAddOverride} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                        Aggiungi
                    </button>
                </div>
                <p className="text-xs text-slate-500 pt-1">Imposta una commissione specifica (più alta o più bassa) che sostituirà quella di default solo per un determinato affiliato.</p>
            </fieldset>

          </div>
          <div className="bg-slate-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl flex-shrink-0 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">Annulla</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400">
                {loading ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;