import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type Product, type User, UserRole } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../LanguageContext';

const EditProductModal: React.FC<{
  product: Product;
  onClose: () => void;
  onSave: (updates: Partial<Product>) => void;
  isSaving: boolean;
}> = ({ product, onClose, onSave, isSaving }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Product>>(product);
  const [newImageUrl, setNewImageUrl] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddImageUrl = () => {
        const trimmedUrl = newImageUrl.trim();
        if (trimmedUrl && !formData.imageUrls?.includes(trimmedUrl)) {
            setFormData(prev => ({ ...prev, imageUrls: [...(prev.imageUrls || []), trimmedUrl] }));
            setNewImageUrl('');
        }
    };
    
    const handleRemoveImageUrl = (urlToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: (prev.imageUrls || []).filter(url => url !== urlToRemove)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updates = {
            ...formData,
            price: parseFloat(String(formData.price)) || 0,
            purchasePrice: parseFloat(String(formData.purchasePrice)) || 0,
            commission: parseFloat(String(formData.commission)) || 0,
            platformCommission: parseFloat(String(formData.platformCommission)) || 0,
            codShippingCost: parseFloat(String(formData.codShippingCost)) || 0,
            logisticsCommission: parseFloat(String(formData.logisticsCommission)) || 0,
            tolerance: parseFloat(String(formData.tolerance)) || 0,
            trackingCode: formData.trackingCode?.trim() || undefined,
        };
        onSave(updates);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('editProduct')}</h2>
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
                            {formData.imageUrls?.map((url, index) => (
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
                            <input type="text" id="trackingCode" name="trackingCode" value={formData.trackingCode || ''} onChange={handleChange} placeholder={t('trackingCodePlaceholder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="tolerance" className="flex items-center text-sm font-medium text-gray-700">
                                {t('tolerancePercentage')}
                            </label>
                            <input type="number" step="1" min="0" max="100" id="tolerance" name="tolerance" value={formData.tolerance || 0} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50">{t('cancel')}</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {isSaving ? t('saving') : t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AffiliatePenalties: React.FC<{
    product: Product;
    onSave: (updates: Partial<Product>) => void;
    allUsers: User[];
}> = ({ product, onSave, allUsers }) => {
    const { t } = useTranslation();
    const [penalties, setPenalties] = useState(product.penalties || {});
    const [selectedAffiliateId, setSelectedAffiliateId] = useState('');
    const [penaltyPercentage, setPenaltyPercentage] = useState('');
    
    const affiliateUsers = useMemo(() => allUsers.filter(u => u.role === UserRole.AFFILIATE), [allUsers]);

    const handleAddPenalty = () => {
        const affiliateId = parseInt(selectedAffiliateId, 10);
        const percentage = parseInt(penaltyPercentage, 10);
        if (affiliateId && !isNaN(percentage) && percentage >= 0 && percentage <= 100) {
            const newPenalties = { ...penalties, [affiliateId]: percentage };
            setPenalties(newPenalties);
            onSave({ penalties: newPenalties });
            setSelectedAffiliateId('');
            setPenaltyPercentage('');
        }
    };

    const handleRemovePenalty = (affiliateId: number) => {
        const newPenalties = { ...penalties };
        delete newPenalties[affiliateId];
        setPenalties(newPenalties);
        onSave({ penalties: newPenalties });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800">{t('affiliatePenalties')}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">{t('affiliatePenaltiesDescription')}</p>
            <div className="space-y-2 mb-4">
                {Object.entries(penalties).map(([id, penalty]) => {
                    const affiliateId = parseInt(id, 10);
                    const affiliate = allUsers.find(u => u.id === affiliateId);
                    if (!affiliate) return null;
                    const originalCommission = product.commission;
                    const newCommission = originalCommission * (1 - (penalty / 100));
                    return (
                        <div key={id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            <div>
                                <p className="font-semibold text-gray-900">{`${affiliate.firstName} ${affiliate.lastName}`}</p>
                                <p className="text-sm text-gray-600">
                                    {t('penaltyPercentage')}: <span className="font-bold text-red-600">{penalty}%</span> | €{originalCommission.toFixed(2)} → <span className="font-bold text-green-600">€{newCommission.toFixed(2)}</span> {t('commissionAfterPenalty')}
                                </p>
                            </div>
                            <button onClick={() => handleRemovePenalty(affiliateId)} className="text-sm text-red-500 hover:text-red-700 font-semibold">{t('remove')}</button>
                        </div>
                    )
                })}
            </div>
            <div className="flex items-end space-x-2">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">{t('affiliate')}</label>
                    <select value={selectedAffiliateId} onChange={e => setSelectedAffiliateId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select Affiliate</option>
                        {affiliateUsers.map(user => <option key={user.id} value={user.id}>{`${user.firstName} ${user.lastName}`}</option>)}
                    </select>
                </div>
                <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700">{t('penaltyPercentage')}</label>
                    <input type="number" min="0" max="100" value={penaltyPercentage} onChange={e => setPenaltyPercentage(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button onClick={handleAddPenalty} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t('addPenalty')}</button>
            </div>
        </div>
    );
};

const AffiliateTools: React.FC<{ product: Product; currentUser: User; allUsers: User[] }> = ({ product, currentUser, allUsers }) => {
    const { t } = useTranslation();

    const isAffiliate = currentUser.role === UserRole.AFFILIATE;
    const isAdminOrManager = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;

    const affiliateUsers = useMemo(() => allUsers.filter(u => u.role === UserRole.AFFILIATE), [allUsers]);

    const [selectedAffiliateId, setSelectedAffiliateId] = useState<string>(() => {
        if (isAffiliate) return String(currentUser.id);
        return affiliateUsers.length > 0 ? String(affiliateUsers[0].id) : '';
    });

    const [formOptions, setFormOptions] = useState({
        title: '',
        buttonText: t('formCompleteOrder'),
        thankYouUrl: '',
        subId: ''
    });

    const [linkCopied, setLinkCopied] = useState(false);
    const [htmlCopied, setHtmlCopied] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormOptions(prev => ({ ...prev, [name]: value }));
    };
    
    const affiliateLink = useMemo(() => {
        if (!product || !selectedAffiliateId) return '';
        const baseUrl = product.endpointUrl || `${window.location.origin}/landing/${product.id}`;
        const params = new URLSearchParams({
            aff_id: selectedAffiliateId,
        });
        if (formOptions.subId) {
            params.append('sub_id', formOptions.subId);
        }
        return `${baseUrl}?${params.toString()}`;
    }, [product, selectedAffiliateId, formOptions.subId]);


    const generatedHtml = useMemo(() => {
        const formId = `mws-form-${product.id}`;
        const messageId = `mws-form-message-${product.id}`;
        const titleHtml = formOptions.title ? `  <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">${formOptions.title}</h3>` : '';
        
        const endpoint = `https://rkuiwfshwnnvlhibaqht.supabase.co/functions/v1/lead-handler`;

        return `<!-- Incolla questo codice nel tuo sito web -->
<div id="${formId}-container">
  <form id="${formId}" style="font-family: sans-serif; max-width: 400px; margin: auto;">
    <input type="hidden" name="aff_id" value="${selectedAffiliateId}">
    <input type="hidden" name="product_id" value="${product.id}">
    <input type="hidden" name="sub_id" value="${formOptions.subId || ''}">
    <input type="hidden" name="redirect_url" value="${formOptions.thankYouUrl}">
    ${titleHtml}
    <div style="margin-bottom: 1rem;">
      <label for="customerName" style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem;">${t('formFullName')}</label>
      <input type="text" id="customerName" name="customerName" required style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
    </div>
    <div style="margin-bottom: 1rem;">
      <label for="customerPhone" style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem;">${t('formPhoneNumber')}</label>
      <input type="tel" id="customerPhone" name="customerPhone" required style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
    </div>
    <div style="margin-bottom: 1rem;">
      <label for="customerAddress" style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem;">${t('formFullAddress')}</label>
      <input type="text" id="customerAddress" name="customerAddress" required style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
    </div>
    <button type="submit" style="width: 100%; padding: 0.75rem; background-color: #3b82f6; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer;">
      ${formOptions.buttonText}
    </button>
    <p id="${messageId}" style="margin-top: 1rem; text-align: center; font-size: 0.875rem;"></p>
  </form>
</div>
<script>
  (function() {
    var form = document.getElementById('${formId}');
    if (!form) return;
    var submitButton = form.querySelector('button[type="submit"]');
    var messageEl = document.getElementById('${messageId}');
    var originalButtonText = submitButton.textContent;
    var endpoint = '${endpoint}';

    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      submitButton.disabled = true;
      submitButton.textContent = '${t('formSubmittingOrder')}';
      messageEl.textContent = '';
      messageEl.style.color = 'inherit';

      var formData = new FormData(form);

      fetch(endpoint, {
        method: 'POST',
        body: formData,
      })
      .then(function(response) {
        return response.json().then(function(data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function(result) {
        if (result.ok && result.data.redirectUrl) {
          window.location.href = result.data.redirectUrl;
        } else {
          throw new Error(result.data.error || '${t('formSubmissionError')}');
        }
      })
      .catch(function(error) {
        console.error('Form submission error:', error);
        messageEl.textContent = error.message || '${t('formSubmissionError')}';
        messageEl.style.color = 'red';
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      });
    });
  })();
</script>`;
    }, [formOptions, product, t, selectedAffiliateId]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(affiliateLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };
    
    const handleCopyHtml = () => {
        navigator.clipboard.writeText(generatedHtml.trim());
        setHtmlCopied(true);
        setTimeout(() => setHtmlCopied(false), 2000);
    };
    
    if (isAdminOrManager && affiliateUsers.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800">{t('affiliateTools')}</h3>
                <p className="text-gray-500 mt-2">{t('noAffiliatesFoundForTools')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-800">{t('affiliateTools')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('affiliateToolsDescription')}</p>
            </div>
            
            <div className="space-y-4">
                {isAdminOrManager && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('affiliate')}</label>
                        <select 
                            value={selectedAffiliateId} 
                            onChange={e => setSelectedAffiliateId(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            {affiliateUsers.map(user => (
                                <option key={user.id} value={user.id}>{`${user.firstName} ${user.lastName} (ID: ${user.id})`}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">{t('formAffiliateSelectionDescription')}</p> 
                    </div>
                )}
                 <div>
                    <label htmlFor="subId" className="block text-sm font-medium text-gray-700">{t('subId')}</label>
                    <input 
                        type="text" 
                        id="subId" 
                        name="subId"
                        value={formOptions.subId} 
                        onChange={handleChange} 
                        placeholder={t('subIdPlaceholder')} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('affiliateLinkSubIdDescription')}</p>
                </div>
            </div>
            
             <div className="border-t pt-6">
                 <h4 className="text-lg font-semibold text-gray-700 mb-2">{t('yourAffiliateLink')}</h4>
                 <p className="text-sm text-gray-500 mt-1 mb-4">{t('affiliateLinkDescription')}</p>
                 <div className="flex items-center space-x-2">
                    <input type="text" value={affiliateLink} readOnly className="w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 focus:outline-none" />
                    <button onClick={handleCopyLink} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">{linkCopied ? t('codeCopied') : t('copyCode')}</button>
                </div>
            </div>

            <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-700">{t('formGenerator')}</h4>
                <p className="text-sm text-gray-500 mt-1 mb-4">{t('formGeneratorDescription')}</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('formTitleLabel')}</label>
                            <input type="text" name="title" value={formOptions.title} onChange={handleChange} placeholder={t('formTitlePlaceholder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{t('formButtonText')}</label>
                            <input type="text" name="buttonText" value={formOptions.buttonText} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('thankYouPageUrl')}</label>
                            <input type="url" name="thankYouUrl" value={formOptions.thankYouUrl} onChange={handleChange} required placeholder={t('thankYouPageUrlPlaceholder')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">{t('generatedHtmlCode')}</h4>
                            <div className="relative">
                                <textarea readOnly value={generatedHtml.trim()} rows={10} className="w-full p-2 bg-gray-900 text-green-400 text-xs font-mono rounded-md border border-gray-700 focus:outline-none"></textarea>
                                <button onClick={handleCopyHtml} className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-xs font-semibold rounded-md hover:bg-gray-600">{htmlCopied ? t('codeCopied') : t('copyCode')}</button>
                            </div>
                        </div>
                         <div className="mt-4">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">{t('formPreview')}</h4>
                            <div className="border p-4 rounded-md" dangerouslySetInnerHTML={{ __html: generatedHtml }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


const ProductDetail: React.FC<{ currentUser: User; allUsers: User[] }> = ({ currentUser, allUsers }) => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const productData = await api.getProductById(parseInt(id, 10));
                if (productData) {
                    setProduct(productData);
                } else {
                    setError(t('productNotFound'));
                }
            } catch (err) {
                setError(t('failedToFetch'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, t]);

    const canEdit = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;
    const canUseAffiliateTools = currentUser.role !== UserRole.LOGISTICS;

    const handleSave = async (updates: Partial<Product>) => {
        if (!product) return;
        setIsSaving(true);
        try {
            const updatedProduct = await api.updateProduct(product.id, updates);
            setProduct(updatedProduct);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update product", err);
        } finally {
            setIsSaving(false);
        }
    };
    
    const effectiveCommission = useMemo(() => {
        if (!product) return 0;
        if (currentUser.role === UserRole.AFFILIATE && product.penalties && product.penalties[currentUser.id]) {
            const reduction = product.penalties[currentUser.id];
            return product.commission * (1 - reduction / 100);
        }
        return product.commission;
    }, [product, currentUser]);


    if (loading) return <div className="text-center p-8">{t('loadingProducts')}</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!product) return <div className="text-center p-8">{t('productNotFound')}</div>;

    const hasPenalty = effectiveCommission !== product.commission;

    return (
        <div className="space-y-8">
            {isEditing && (
                <EditProductModal
                    product={product}
                    onClose={() => setIsEditing(false)}
                    onSave={handleSave}
                    isSaving={isSaving}
                />
            )}

            <div className="flex justify-between items-center">
                <Link to="/products" className="flex items-center text-sm font-semibold text-blue-600 hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    {t('backToProducts')}
                </Link>
                {canEdit && (
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                        {t('editProduct')}
                    </button>
                )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <img src={product.imageUrls[0]} alt={product.name} className="w-full h-auto object-cover rounded-lg mb-4" />
                        <div className="grid grid-cols-4 gap-2">
                            {product.imageUrls.slice(1, 5).map((url, index) => (
                                <img key={index} src={url} alt={`${product.name} ${index+1}`} className="w-full h-20 object-cover rounded-md" />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{product.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                        <p className="text-gray-600 my-4">{product.description}</p>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">{t('price')}</p>
                                <p className="text-3xl font-bold text-blue-600">€{product.price.toFixed(2)}</p>
                            </div>
                             <div>
                                <p className="text-sm text-gray-500 text-right">{t('commission')}</p>
                                <p className={`text-2xl font-bold ${hasPenalty ? 'text-yellow-600' : 'text-green-600'}`}>
                                    €{effectiveCommission.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {canEdit && <AffiliatePenalties product={product} onSave={handleSave} allUsers={allUsers} />}
            
            {canUseAffiliateTools && <AffiliateTools product={product} currentUser={currentUser} allUsers={allUsers} />}
        </div>
    );
};

export default ProductDetail;