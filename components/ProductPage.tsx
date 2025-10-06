import React, { useState, useEffect, useMemo } from 'react';
import { Product, User, Role, AffiliatePenalty } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { TrashIcon, PencilIcon, ChevronLeftIcon } from './icons';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number';
  required: boolean;
  width: number;
}

const AffiliateFormGenerator: React.FC<{ product: Product, currentUser: User }> = ({ product, currentUser }) => {
    const { t } = useLocalization();
    const [formTitle, setFormTitle] = useState('');
    const [thankYouUrl, setThankYouUrl] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [privacyUrl, setPrivacyUrl] = useState('');
    const [subId, setSubId] = useState('');
    const [buttonText, setButtonText] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#1e40af');
    const [fieldBgColor, setFieldBgColor] = useState('#ffffff');
    
    const [customFields, setCustomFields] = useState<CustomField[]>([]);

    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState<'text' | 'email' | 'number'>('text');
    const [newFieldWidth, setNewFieldWidth] = useState<number>(100);
    const [newFieldRequired, setNewFieldRequired] = useState(false);

    const handleAddField = () => {
        if (newFieldName.trim()) {
            setCustomFields([...customFields, {
                id: crypto.randomUUID(),
                name: newFieldName.trim(),
                type: newFieldType,
                required: newFieldRequired,
                width: newFieldWidth,
            }]);
            setNewFieldName('');
            setNewFieldType('text');
            setNewFieldWidth(100);
            setNewFieldRequired(false);
        }
    };

    const handleRemoveField = (id: string) => {
        setCustomFields(customFields.filter(field => field.id !== id));
    };

    const generatedHtml = useMemo(() => {
        const sourceId = currentUser?.sourceId || 'ADMIN_MANAGER_PREVIEW';
        if (!product) return '';

        const customFieldsHtml = customFields.map(f => `
    <div class="mws-form-field" style="width: ${f.width < 100 ? `calc(${f.width}% - 8px)` : '100%'};">
        <label for="custom_${f.id}" class="mws-form-label">${f.name}${f.required ? ' *' : ''}</label>
        <input type="${f.type}" id="custom_${f.id}" name="custom_${f.name.toLowerCase().replace(/\s+/g, '_')}" placeholder="${f.name}..." ${f.required ? 'required' : ''} class="mws-form-input">
    </div>`).join('');
    
    const privacyHtml = `
    <div class="mws-form-field" style="width: 100%;">
        <label for="privacy_consent" class="mws-privacy-label">
            <input type="checkbox" id="privacy_consent" name="privacy_consent" checked required style="margin-right: 8px;">
            <span>${t('privacyConsent')} ${privacyUrl ? `<a href="${privacyUrl}" target="_blank" class="mws-privacy-link">${t('privacyPolicyLink')}</a>` : ''}</span>
        </label>
    </div>`;

        return `<style>
  .mws-form-container { max-width: 600px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; }
  .mws-form-title { text-align: center; color: ${primaryColor}; margin-bottom: 20px; }
  .mws-form-fields-wrapper { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 15px; }
  .mws-form-field { box-sizing: border-box; }
  .mws-form-label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 14px; }
  .mws-form-input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; background-color: ${fieldBgColor}; }
  .mws-privacy-label { display: flex; align-items: center; font-size: 12px; color: #555; }
  .mws-privacy-link { color: ${primaryColor}; text-decoration: none; }
  .mws-privacy-link:hover { text-decoration: underline; }
  .mws-form-button { width: 100%; padding: 12px; background-color: ${primaryColor}; color: white; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
  .mws-form-button:hover { filter: brightness(1.1); }
</style>
<div class="mws-form-container">
    ${formTitle ? `<h3 class="mws-form-title">${formTitle}</h3>` : ''}
    <form action="${product.endpointUrl}" method="POST">
        <input type="hidden" name="product_id" value="${product.id}">
        <input type="hidden" name="source_id" value="${sourceId}">
        ${product.hiddenTrackingSource ? `<input type="hidden" name="tracking_source" value="${product.hiddenTrackingSource}">` : ''}
        ${thankYouUrl ? `<input type="hidden" name="thank_you_url" value="${thankYouUrl}">` : ''}
        ${webhookUrl ? `<input type="hidden" name="webhook_url" value="${webhookUrl}">` : ''}
        ${subId ? `<input type="hidden" name="sub_id" value="${subId}">` : ''}
        
        <div class="mws-form-fields-wrapper">
            <div class="mws-form-field" style="width: 100%;"><label for="customer_name" class="mws-form-label">${t('fullName')} *</label><input type="text" id="customer_name" name="customer_name" required class="mws-form-input"></div>
            <div class="mws-form-field" style="width: 100%;"><label for="customer_phone" class="mws-form-label">${t('phoneNumber')} *</label><input type="tel" id="customer_phone" name="customer_phone" required class="mws-form-input"></div>
            <div class="mws-form-field" style="width: 100%;"><label for="customer_address" class="mws-form-label">${t('fullAddress')} *</label><input type="text" id="customer_address" name="customer_address" required class="mws-form-input"></div>
            ${customFieldsHtml}
        </div>
        
        ${privacyHtml}
        <button type="submit" class="mws-form-button" style="margin-top: 15px;">${buttonText || t('completeOrder')}</button>
    </form>
</div>`;
    }, [product, currentUser, formTitle, thankYouUrl, webhookUrl, privacyUrl, subId, buttonText, primaryColor, fieldBgColor, customFields, t]);


    return (
        <div className="pt-4 border-t space-y-6">
            <h4 className="text-xl font-bold text-neutral">{t('generateAffiliateForm')}</h4>
            <div className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="font-semibold text-blue-800">{t('productEndpointURL')}</p>
                <code className="text-blue-600 break-all">{product.endpointUrl}</code>
            </div>

            {/* Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold text-lg text-gray-800 mb-3">{t('formConfiguration')}</h5>
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">{t('formTitle')}</label><input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder={t('formTitlePlaceholder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">{t('buttonText')}</label><input type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} placeholder={t('completeOrder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">{t('thankYouPageURL')}</label><input type="url" value={thankYouUrl} onChange={e => setThankYouUrl(e.target.value)} placeholder={t('thankYouPagePlaceholder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">{t('webhookURL')}</label><input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder={t('webhookPlaceholder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">{t('privacyPolicyURL')}</label><input type="url" value={privacyUrl} onChange={e => setPrivacyUrl(e.target.value)} placeholder={t('privacyPolicyPlaceholder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">{t('subId')}</label><input type="text" value={subId} onChange={e => setSubId(e.target.value)} placeholder={t('subIdPlaceholder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
                </div>
            </div>

             {/* Customization */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                 <h5 className="font-semibold text-lg text-gray-800 mb-3">{t('formCustomization')}</h5>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('primaryColor')}</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="p-1 h-10 w-14 block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none" />
                            <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('fieldBackgroundColor')}</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="color" value={fieldBgColor} onChange={e => setFieldBgColor(e.target.value)} className="p-1 h-10 w-14 block bg-white border border-gray-300 cursor-pointer rounded-lg" />
                            <input type="text" value={fieldBgColor} onChange={e => setFieldBgColor(e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                 </div>
            </div>

            {/* Fields */}
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h6 className="font-semibold text-lg text-gray-800 mb-2">{t('customFields')}</h6>
                {customFields.map(field => (
                    <div key={field.id} className="flex items-center gap-2 p-2 bg-white rounded-md mb-2 border">
                        <span className="flex-grow text-sm font-medium">{field.name} <span className="text-xs text-gray-500">({field.type}, {field.width}%{field.required ? ', required' : ''})</span></span>
                        <button onClick={() => handleRemoveField(field.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-end gap-4 p-2 bg-white rounded-md border">
                    <div className="md:col-span-4"><label className="text-xs font-medium text-gray-600">{t('fieldName')}</label><input type="text" value={newFieldName} onChange={e => setNewFieldName(e.target.value)} placeholder={t('fieldPlaceholder')} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm" /></div>
                    
                    <div className="md:col-span-1"><label className="text-xs font-medium text-gray-600">{t('fieldType')}</label><select value={newFieldType} onChange={e => setNewFieldType(e.target.value as any)} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"><option value="text">{t('text')}</option><option value="email">{t('email')}</option><option value="number">{t('number')}</option></select></div>
                    
                    <div className="md:col-span-2">
                         <label className="text-xs font-medium text-gray-600">{t('fieldWidth')} ({newFieldWidth}%)</label>
                         <input type="range" min="25" max="100" step="25" value={newFieldWidth} onChange={e => setNewFieldWidth(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" />
                    </div>

                    <div className="flex items-center h-full pb-2 md:col-start-4"><input type="checkbox" checked={newFieldRequired} onChange={e => setNewFieldRequired(e.target.checked)} className="rounded" /><label className="ml-2 text-sm">{t('required')}</label></div>

                    <div className="md:col-span-4"><button onClick={handleAddField} className="w-full bg-secondary text-white px-4 py-2 rounded-md text-sm font-semibold">{t('addField')}</button></div>
                </div>
            </div>


            {/* Code and Preview */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div>
                    <h5 className="font-semibold text-lg text-gray-800 mb-2">{t('generatedHTMLCode')}</h5>
                    <textarea readOnly value={generatedHtml} className="w-full h-[500px] p-2 font-mono text-xs bg-gray-800 text-green-300 rounded-md border border-gray-600 focus:ring-0 focus:border-gray-600"></textarea>
                </div>
                <div>
                     <h5 className="font-semibold text-lg text-gray-800 mb-2">{t('formPreview')}</h5>
                     <div className="border rounded-lg p-4 h-[500px] overflow-y-auto bg-gray-50">
                        <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
                     </div>
                </div>
            </div>
        </div>
    );
};


interface ProductPageProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onBack: () => void;
  currentUser: User | null;
  affiliates: User[];
}

const emptyProduct: Omit<Product, 'id' | 'hiddenTrackingSource'> = {
  name: '',
  description: '',
  images: [],
  endpointUrl: '',
  price: 0,
  affiliateCommission: 0,
  platformCommission: 0,
  affiliatePenalties: [],
};

export const ProductPage: React.FC<ProductPageProps> = ({ product, onSave, onBack, currentUser, affiliates }) => {
  const { t } = useLocalization();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Omit<Product, 'id'> | Product>(product || emptyProduct);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [penaltyAffiliateId, setPenaltyAffiliateId] = useState('');
  const [penaltyReason, setPenaltyReason] = useState('');
  
  const canManage = currentUser?.role === Role.ADMIN || currentUser?.role === Role.MANAGER;
  const isNewProduct = !product;

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
      setIsEditing(false);
    } else {
      setEditedProduct(emptyProduct);
      setIsEditing(true); // Always in edit mode for new products
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumberField = ['price', 'affiliateCommission', 'platformCommission'].includes(name);
    setEditedProduct({ ...editedProduct, [name]: isNumberField ? parseFloat(value) || 0 : value });
  };
  
  const handleAddImage = () => {
    if (newImageUrl && !editedProduct.images.includes(newImageUrl)) {
        setEditedProduct({ ...editedProduct, images: [...editedProduct.images, newImageUrl] });
        setNewImageUrl('');
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setEditedProduct({ ...editedProduct, images: editedProduct.images.filter(url => url !== urlToRemove) });
  };

  const handleSave = () => {
    const finalProduct = isNewProduct 
        ? { ...editedProduct, id: crypto.randomUUID() } as Product
        : editedProduct as Product;
    onSave(finalProduct);
  };
  
  const handleAddPenalty = () => {
      if(!penaltyAffiliateId || !penaltyReason) return;
      const affiliate = affiliates.find(a => a.id === penaltyAffiliateId);
      if(!affiliate) return;

      const newPenalty: AffiliatePenalty = {
          affiliateId: penaltyAffiliateId,
          affiliateName: affiliate.name,
          reason: penaltyReason,
          date: new Date().toISOString()
      };
      const updatedPenalties = [...(editedProduct.affiliatePenalties || []), newPenalty];
      setEditedProduct({ ...editedProduct, affiliatePenalties: updatedPenalties });
      setPenaltyAffiliateId('');
      setPenaltyReason('');
  }

  const renderContent = () => {
    if (isEditing || isNewProduct) {
      // EDIT/ADD VIEW
      return (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">{t('productName')}</label><input type="text" name="name" value={editedProduct.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
          <div><label className="block text-sm font-medium text-gray-700">{t('description')}</label><textarea name="description" value={editedProduct.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea></div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('images')}</label>
            <div className="flex space-x-2 mt-1">
                <input type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://picsum.photos/..." className="flex-grow border border-gray-300 rounded-md shadow-sm p-2" />
                <button onClick={handleAddImage} className="bg-secondary text-white px-4 rounded-md">{t('addImage')}</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {editedProduct.images.map(url => (
                    <div key={url} className="relative">
                        <img src={url} className="w-20 h-20 object-cover rounded-md" />
                        <button onClick={() => handleRemoveImage(url)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"><TrashIcon className="w-3 h-3" /></button>
                    </div>
                ))}
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700">{t('endpointUrl')}</label><input type="text" name="endpointUrl" value={editedProduct.endpointUrl} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">{t('price')} (€)</label><input type="number" name="price" value={editedProduct.price} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
            <div><label className="block text-sm font-medium text-gray-700">{t('affiliateCommission')} (€)</label><input type="number" name="affiliateCommission" value={editedProduct.affiliateCommission} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>
            {currentUser?.role === Role.ADMIN && <div><label className="block text-sm font-medium text-gray-700">{t('platformCommission')} (€)</label><input type="number" name="platformCommission" value={editedProduct.platformCommission} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>}
          </div>
          {canManage && (
             <div>
                <label className="block text-sm font-medium text-gray-700">{t('hiddenTrackingSource')}</label>
                <input 
                    type="text" 
                    name="hiddenTrackingSource" 
                    value={(editedProduct as Product).hiddenTrackingSource || ''} 
                    onChange={handleInputChange} 
                    placeholder={t('hiddenTrackingSourcePlaceholder')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                />
            </div>
          )}
          {/* Affiliate Penalty Section */}
          <div className="pt-4 border-t">
              <h4 className="text-lg font-semibold text-gray-800">{t('penalizeAffiliate')}</h4>
              <div className="flex items-center gap-2 mt-2">
                  <select value={penaltyAffiliateId} onChange={e => setPenaltyAffiliateId(e.target.value)} className="flex-grow border border-gray-300 rounded-md shadow-sm p-2">
                      <option value="">{t('selectAffiliate')}</option>
                      {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <input type="text" value={penaltyReason} onChange={e => setPenaltyReason(e.target.value)} placeholder={t('penaltyReasonPlaceholder')} className="flex-grow border border-gray-300 rounded-md shadow-sm p-2" />
                  <button onClick={handleAddPenalty} className="bg-warning text-neutral px-4 py-2 rounded-md font-semibold">{t('addPenalty')}</button>
              </div>
          </div>
        </div>
      );
    }

    // VIEW ONLY
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                 <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-2">
                    <img src={product?.images[0]} alt={product?.name} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex gap-2">
                    {product?.images.slice(1).map(img => <img key={img} src={img} className="w-16 h-16 object-cover rounded-md" />)}
                 </div>
            </div>
            <div>
                <p className="text-gray-500">{t('description')}</p>
                <p className="mt-1 text-gray-800">{product?.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div><p className="font-semibold">{t('price')}</p><p className="text-lg text-primary font-bold">€{product?.price.toFixed(2)}</p></div>
                    <div><p className="font-semibold">{t('affiliateCommission')}</p><p className="text-lg text-success font-bold">€{product?.affiliateCommission.toFixed(2)}</p></div>
                    {canManage && <div><p className="font-semibold">{t('platformCommission')}</p><p>€{product?.platformCommission.toFixed(2)}</p></div>}
                    <div className="col-span-2"><p className="font-semibold">{t('endpointUrl')}</p><p className="text-xs text-gray-600 break-all">{product?.endpointUrl}</p></div>
                </div>
            </div>
        </div>

        {canManage && product?.affiliatePenalties?.length > 0 && (
            <div className="pt-4 border-t">
                 <h4 className="text-md font-semibold text-gray-800">{t('penalties')}</h4>
                 <ul className="text-sm text-gray-600 mt-2 list-disc pl-5 space-y-1">
                     {product.affiliatePenalties.map((p, i) => <li key={i}><strong>{p.affiliateName}:</strong> {p.reason}</li>)}
                 </ul>
            </div>
        )}
        
        {(canManage || currentUser?.role === Role.AFFILIATE) && product && currentUser && (
           <AffiliateFormGenerator product={product} currentUser={currentUser} />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-auto mb-8">
        <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeftIcon className="h-6 w-6" /> 
                </button>
                <h3 className="text-2xl font-bold text-neutral">
                    {isNewProduct ? t('addProduct') : (isEditing ? t('editProduct') : t('productDetails'))}
                    {!isNewProduct && !isEditing && `: ${product?.name}`}
                </h3>
            </div>
            <div className="flex items-center space-x-4">
                {canManage && !isNewProduct && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-secondary hover:text-primary"><PencilIcon /></button>
                )}
            </div>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">{renderContent()}</div>
        {(isEditing || isNewProduct) && (
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                <button onClick={onBack} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('close')}</button>
                <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary">{t('saveChanges')}</button>
            </div>
        )}
    </div>
  );
};