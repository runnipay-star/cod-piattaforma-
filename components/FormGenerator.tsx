import React, { useState, useMemo, useEffect } from 'react';
import { Product, Affiliate, FormFields, Sale, PlatformSettings } from '../types';
import { DesktopIcon } from './icons/DesktopIcon';
import { TabletIcon } from './icons/TabletIcon';
import { MobileIcon } from './icons/MobileIcon';

interface FormGeneratorProps {
    product: Product;
    currentAffiliate?: Affiliate;
    platformSettings: PlatformSettings;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({ product, currentAffiliate, platformSettings }) => {
    const [formTitle, setFormTitle] = useState(`Completa il tuo ordine`);
    const [thankYouUrl, setThankYouUrl] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [subId, setSubId] = useState('');
    const [buttonText, setButtonText] = useState('Acquista Ora');
    const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [formFields, setFormFields] = useState<FormFields>({
        name: true,
        address: true,
        phone: true,
        email: true,
    });
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [showBundles, setShowBundles] = useState(true);
    const [showShippingText, setShowShippingText] = useState(true);

     const handleFormFieldChange = (field: keyof FormFields) => {
        setFormFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const canToggleShippingText = !product.freeShipping && product.bundleOptions && product.bundleOptions.length > 0;

    const generatedHtml = useMemo(() => {
        const hasBundles = product.bundleOptions && product.bundleOptions.length > 0;
        const isShippingPaid = !product.freeShipping && (product.shippingCharge || 0) > 0;
        const shippingText = (isShippingPaid && showShippingText) ? `<span style="font-size: 12px; color: #555;"> + Sped.</span>` : '';

        const initialOffer = { bundleId: '' };

        const generateOfferOptions = () => {
                let optionsHtml = '';
                
                // Single product option (default checked)
                optionsHtml += `
    <label style="display: block; padding: 12px; cursor: pointer; border-bottom: 1px solid #eee; background-color: #f9f9f9;">
        <input type="radio" name="offerSelection" value="single_product"
               data-bundle-id=""
               checked style="margin-right: 8px; vertical-align: middle;">
        <span style="font-weight: bold;">Offerta 1x</span> - <span style="font-weight: bold; color: #1a237e;">€${product.price.toFixed(2)}</span>${shippingText}
    </label>`;

                // Bundle options
                product.bundleOptions!.forEach((bundle, index) => {
                    const isLast = index === product.bundleOptions!.length - 1;
                    const borderRadius = isLast ? 'border-radius: 0 0 5px 5px;' : '';
                    const borderStyle = !isLast ? 'border-bottom: 1px solid #eee;' : '';
                    optionsHtml += `
    <label style="display: block; padding: 12px; cursor: pointer; ${borderStyle} background-color: #f9f9f9; ${borderRadius}">
        <input type="radio" name="offerSelection" value="${bundle.id}"
               data-bundle-id="${bundle.id}"
               style="margin-right: 8px; vertical-align: middle;">
        <span style="font-weight: bold;">Offerta ${bundle.quantity}x</span> - <span style="font-weight: bold; color: #1a237e;">€${bundle.price.toFixed(2)}</span>${shippingText}
    </label>`;
                });
                return optionsHtml;
        };
    
        const offerSelectorHtml = hasBundles && showBundles
        ? `<div style="margin-bottom: 15px;">
    <p style="font-weight: bold; color: #333; margin-bottom: 5px;">Scegli la tua offerta:</p>
    <div id="offer-selector" style="border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
        ${generateOfferOptions()}
    </div>
</div>`
        : '';
        
        const generateCustomerFields = () => {
            let fieldsHtml = '';
            const fieldStyles = "width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;";
            const divStyles = "margin-bottom: 15px;";
            
            if (formFields.name) {
                fieldsHtml += `<div style="${divStyles}"><label for="customer_name" style="display: block; margin-bottom: 5px; color: #666;">Nome e Cognome:</label><input type="text" id="customer_name" name="customerName" required style="${fieldStyles}"></div>`;
            }
            if (formFields.address) {
                fieldsHtml += `<div style="${divStyles}"><label for="customer_address" style="display: block; margin-bottom: 5px; color: #666;">Indirizzo Completo (Via, Città, CAP):</label><textarea id="customer_address" name="customer_address" required rows="3" style="${fieldStyles}"></textarea></div>`;
            }
            if (formFields.phone) {
                fieldsHtml += `<div style="${divStyles}"><label for="customer_phone" style="display: block; margin-bottom: 5px; color: #666;">Numero di Telefono:</label><input type="tel" id="customer_phone" name="customerPhone" required style="${fieldStyles}" inputmode="numeric" pattern="[0-9]*" title="Inserisci solo cifre numeriche."></div>`;
            }
            if (formFields.email) {
                fieldsHtml += `<div style="${divStyles}"><label for="customer_email" style="display: block; margin-bottom: 5px; color: #666;">La tua Email:</label><input type="email" id="customer_email" name="customerEmail" required style="${fieldStyles}"></div>`;
            }
            return fieldsHtml;
        };

        const privacyLinkHtml = privacyPolicyUrl
          ? ` secondo la <a href="${privacyPolicyUrl}" target="_blank" rel="noopener noreferrer" style="color: #1a237e; text-decoration: underline;">Privacy Policy</a>`
          : '';

        const bundleLogicScript = `
<script>
(function() {
    var form = document.currentScript.closest('form');
    if (!form) return;

    var offerRadios = form.querySelectorAll('input[name="offerSelection"]');
    var bundleIdInput = form.querySelector('#form-bundle-id');

    function updateForm(radio) {
        if (!radio) return;
        var bundleId = radio.dataset.bundleId;
        
        if (bundleIdInput) { bundleIdInput.value = bundleId; }
    }

    if (offerRadios.length > 0) {
        offerRadios.forEach(function(radio) {
            radio.addEventListener('change', function() {
                updateForm(this);
            });
        });
        
        var initiallyChecked = form.querySelector('input[name="offerSelection"]:checked');
        if (initiallyChecked) {
            updateForm(initiallyChecked);
        }
    }
})();
</script>`;

        const formHtml = `
<form style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 400px; font-family: sans-serif; margin: 0 auto;" id="mws-order-form">
  <input type="hidden" name="productId" value="${product.id}">
  <input type="hidden" name="bundleId" id="form-bundle-id" value="${initialOffer.bundleId}">
  <input type="hidden" name="refNumber" value="${product.refNumber}">
  <input type="hidden" name="affiliateId" value="${currentAffiliate ? currentAffiliate.id : '[IL_TUO_ID_AFFILIATO]'}">
  <input type="hidden" name="subId" value="${subId}">
  <input type="hidden" name="redirectUrl" value="${thankYouUrl}">
  <input type="hidden" name="webhookUrl" value="${webhookUrl}">
  <input type="hidden" name="globalWebhookUrl" value="${platformSettings.global_webhook_url || ''}">
  <h3 style="margin-top: 0; color: #333;">${formTitle}</h3>
  ${offerSelectorHtml}
  ${generateCustomerFields()}
  <div style="margin-bottom: 15px; font-size: 12px; color: #666;">
    <label for="privacy_consent" style="display: flex; align-items: center; cursor: pointer;">
      <input type="checkbox" id="privacy_consent" name="privacyConsent" required checked style="margin-right: 8px;">
      Acconsento al trattamento dei dati personali${privacyLinkHtml}.
    </label>
  </div>
  <div id="mws-submit-error" style="color: red; font-size: 12px; text-align: center; min-height: 16px; margin-bottom: 10px;"></div>
  <button type="submit" id="mws-submit-button" style="width: 100%; padding: 10px; background-color: #1a237e; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; transition: background-color 0.2s;">
    ${buttonText}
  </button>
  ${hasBundles && showBundles ? bundleLogicScript : ''}
</form>`;

    const productDataForScript = {
        name: product.name,
        price: product.price,
        commissionValue: product.commissionValue,
        freeShipping: product.freeShipping ?? true,
        shippingCharge: product.shippingCharge || 0,
        bundleOptions: product.bundleOptions || [],
    };

    const affiliateDataForScript = currentAffiliate 
        ? { name: currentAffiliate.name } 
        : null;

    const submissionScript = `
<script>
(async function() {
  const form = document.getElementById('mws-order-form');
  const submitButton = document.getElementById('mws-submit-button');
  const errorDiv = document.getElementById('mws-submit-error');
  
  if (!form || !submitButton || !errorDiv) return;

  const generateId = () => \`S-\${Date.now()}-\${Math.random().toString(36).substring(2, 8).toUpperCase()}\`;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.innerText = 'Invio in corso...';
    errorDiv.innerText = '';
    
    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      const userAgent = navigator.userAgent;
      let ipAddress = 'not_captured';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ipAddress = ipData.ip;
        }
      } catch (ipError) {
        console.error('Could not fetch IP address:', ipError);
      }
      
      const blocked_ips = ${JSON.stringify(platformSettings.blocked_ips || [])};
      if (blocked_ips.includes(ipAddress)) {
          console.error('Order submission blocked for IP:', ipAddress);
          errorDiv.innerText = 'Impossibile completare l\\'ordine in questo momento. Riprova più tardi.';
          submitButton.disabled = false;
          submitButton.innerText = '${buttonText}';
          return; // Stop the submission
      }
      
      const isTestOrder = data.customerName && data.customer_address && 
                          data.customerName.trim().toLowerCase() === 'test' &&
                          data.customer_address.trim().toLowerCase() === 'test';

      const product = ${JSON.stringify(productDataForScript)};
      const affiliate = ${JSON.stringify(affiliateDataForScript)};
      const bundleId = data.bundleId;

      let saleAmount = product.price;
      let commissionAmount = product.commissionValue;
      let quantity = 1;

      if (bundleId && product.bundleOptions) {
          const selectedBundle = product.bundleOptions.find(b => b.id === bundleId);
          if (selectedBundle) {
              saleAmount = selectedBundle.price;
              commissionAmount = selectedBundle.commissionValue;
              quantity = selectedBundle.quantity;
          }
      }

      if (!product.freeShipping && product.shippingCharge > 0) {
        saleAmount += product.shippingCharge;
      }

      const productWebhook = data.webhookUrl;
      const globalWebhook = data.globalWebhookUrl;
      const allWebhooks = [productWebhook, globalWebhook].filter(Boolean);

      const salePayload = {
        id: generateId(),
        productId: data.productId,
        productName: product.name,
        affiliateId: data.affiliateId,
        affiliateName: affiliate ? affiliate.name : 'Sconosciuto',
        saleAmount: Number(saleAmount),
        commissionAmount: Number(commissionAmount),
        quantity: Number(quantity),
        bundleId: bundleId || null,
        saleDate: new Date().toISOString(),
        status: isTestOrder ? 'Test' : 'In attesa',
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customer_address: data.customer_address,
        notes: null,
        subId: data.subId || null,
        webhookUrl: allWebhooks.join(', ') || null,
        user_agent: userAgent,
        ip_address: ipAddress,
      };

      const supabaseUrl = 'https://qscuniyfebjfbebrkakm.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzY3VuaXlmZWJqZmJlYnJrYWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDExNjksImV4cCI6MjA3NjE3NzE2OX0.vTEeY69AhxzN5t7wGZrmac8YqXQaM5OJ432BhDDAhyY';

      const response = await fetch(supabaseUrl + '/rest/v1/sales', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnonKey,
              'Authorization': 'Bearer ' + supabaseAnonKey,
              'Prefer': 'return=representation'
          },
          body: JSON.stringify(salePayload)
      });
      
      if (response.status < 200 || response.status >= 300) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Errore del server');
      }
      
      const result = await response.json();
      const createdSale = result[0];
      
      if (productWebhook) {
          fetch(productWebhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(createdSale),
              keepalive: true,
          }).catch(err => console.error("Product Webhook POST failed:", err));
      }
      if (globalWebhook) {
          fetch(globalWebhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(createdSale),
              keepalive: true,
          }).catch(err => console.error("Global Webhook POST failed:", err));
      }
      
      window.location.href = data.redirectUrl || '/';
      
    } catch (error) {
      console.error('Order submission failed:', error);
      errorDiv.innerText = 'Errore: ' + (error instanceof Error ? error.message : 'Riprova.');
      submitButton.disabled = false;
      submitButton.innerText = '${buttonText}';
    }
  });
})();
</script>`;
        
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:1rem;font-family:sans-serif;background-color:#f8f9fa;}</style></head><body>${formHtml}${submissionScript}</body></html>`;

    }, [product, formTitle, thankYouUrl, webhookUrl, subId, buttonText, privacyPolicyUrl, formFields, currentAffiliate, showBundles, showShippingText, platformSettings]);

    const codeToCopy = useMemo(() => {
        const bodyContentRegex = /<body>([\s\S]*)<\/body>/;
        const match = generatedHtml.match(bodyContentRegex);
        return match ? `<!-- Incolla questo codice nel tuo sito web -->\n${match[1].trim()}` : '';
    }, [generatedHtml]);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const deviceWidths = {
        desktop: '100%',
        tablet: '768px',
        mobile: '375px',
    };

    return (
        <div className="bg-surface rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-on-surface mb-4">Generatore Form HTML</h3>
            <p className="text-sm text-gray-600 mb-6">Personalizza e copia il codice del form da inserire nel tuo sito per vendere questo prodotto.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Settings & Code */}
                <div>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="formTitle" className="block text-sm font-medium text-gray-700">Titolo del Formulario</label>
                            <input type="text" id="formTitle" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="thankYouUrl" className="block text-sm font-medium text-gray-700">Pagina di Ringraziamento (URL)</label>
                            <input type="text" id="thankYouUrl" value={thankYouUrl} onChange={(e) => setThankYouUrl(e.target.value)} placeholder="https://iltuosito.com/grazie" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">Webhook (URL) - Opzionale</label>
                            <input type="text" id="webhookUrl" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://iltuosito.com/api/webhook" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="subId" className="block text-sm font-medium text-gray-700">Sub ID (es. 'facebook', 'tiktok') - Opzionale</label>
                            <input type="text" id="subId" value={subId} onChange={(e) => setSubId(e.target.value)} placeholder="facebook" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700">Testo del Pulsante</label>
                            <input type="text" id="buttonText" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="privacyPolicyUrl" className="block text-sm font-medium text-gray-700">URL Privacy Policy (Opzionale)</label>
                            <input type="url" id="privacyPolicyUrl" value={privacyPolicyUrl} onChange={(e) => setPrivacyPolicyUrl(e.target.value)} placeholder="https://tuosito.com/privacy" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                            <div>
                                <h3 className="text-base font-medium text-gray-800 mb-2">Campi del Formulario d'Ordine</h3>
                                <p className="text-sm text-gray-500 mb-4">Seleziona quali informazioni richiedere al cliente.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {(Object.keys(formFields) as Array<keyof FormFields>).map(field => {
                                        const labels: Record<keyof FormFields, string> = { name: 'Nome e Cognome', address: 'Indirizzo Completo', phone: 'Telefono', email: 'Email' };
                                        return (
                                            <div key={field} className="flex items-center">
                                                <input id={`field-gen-${field}`} type="checkbox" checked={formFields[field]} onChange={() => handleFormFieldChange(field)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                                                <label htmlFor={`field-gen-${field}`} className="ml-2 block text-sm text-gray-900">{labels[field]}</label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {product.bundleOptions && product.bundleOptions.length > 0 && (
                                <div className="flex items-center pt-4 border-t">
                                    <input
                                        id="show-bundles-toggle"
                                        type="checkbox"
                                        checked={showBundles}
                                        onChange={() => setShowBundles(prev => !prev)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="show-bundles-toggle" className="ml-3 block text-sm font-medium text-gray-900">
                                        Mostra Opzioni Multi-Pack nel form
                                    </label>
                                </div>
                            )}
                             {canToggleShippingText && (
                                <div className="flex items-center pt-4 border-t">
                                    <input
                                        id="show-shipping-text-toggle"
                                        type="checkbox"
                                        checked={showShippingText}
                                        onChange={() => setShowShippingText(prev => !prev)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="show-shipping-text-toggle" className="ml-3 block text-sm font-medium text-gray-900">
                                        Mostra "+ Sped." accanto al prezzo nel form
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="mt-6 relative">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Codice da Copiare</h4>
                        <pre className="bg-gray-800 text-white p-4 rounded-md text-xs overflow-x-auto max-h-64"><code>{codeToCopy}</code></pre>
                        <button onClick={handleCopy} className="absolute top-10 right-2 bg-gray-600 text-white px-3 py-1 text-xs rounded hover:bg-gray-500">{copied ? 'Copiato!' : 'Copia'}</button>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div>
                     <h4 className="text-sm font-medium text-gray-700 mb-2">Anteprima Form</h4>
                     <div className="flex justify-center gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
                        {(['desktop', 'tablet', 'mobile'] as const).map(device => (
                            <button
                                key={device}
                                onClick={() => setPreviewDevice(device)}
                                className={`p-2 rounded-md transition-colors ${previewDevice === device ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-white'}`}
                                aria-label={`Visualizza anteprima ${device}`}
                            >
                                {device === 'desktop' && <DesktopIcon className="w-5 h-5" />}
                                {device === 'tablet' && <TabletIcon className="w-5 h-5" />}
                                {device === 'mobile' && <MobileIcon className="w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                     <div className="w-full bg-gray-200 p-2 sm:p-4 rounded-lg flex justify-center items-center">
                        <div 
                            className="border rounded-xl shadow-lg overflow-hidden bg-white transition-all duration-300 ease-in-out mx-auto"
                            style={{ width: deviceWidths[previewDevice], height: '640px' }}
                        >
                            <iframe
                                srcDoc={generatedHtml}
                                title="Anteprima Formulario"
                                className="w-full h-full border-0"
                                sandbox="allow-forms allow-scripts allow-same-origin"
                            />
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default FormGenerator;