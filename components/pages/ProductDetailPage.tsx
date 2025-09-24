


import React, { useState, useEffect } from 'react';
import { Product, Niche, User, UserRole, ProductCustomerField } from '../../types';
import { ArrowLeftIcon, ClipboardDocumentIcon, PhotoIcon, CodeBracketIcon, LinkIcon, ChartBarIcon, PlusIcon, SparklesIcon, TagIcon, SwatchIcon, PencilSquareIcon, ArrowsRightLeftIcon, TrashIcon } from '../Icons';
import { GoogleGenAI } from "@google/genai";
import { DEFAULT_CUSTOMER_FIELDS } from '../../constants';
import EditProductModal from '../EditProductModal';
import { supabase } from '../../supabaseClient';

interface ProductDetailPageProps {
    product: Product;
    niche?: Niche;
    supplier?: User;
    currentUser: User;
    onBack: () => void;
    onUpdateProduct?: (productId: string, updateData: Partial<Product>) => Promise<boolean>;
    onDeleteProduct?: (productId: string) => void;
    niches?: Niche[];
    suppliers?: User[];
    affiliates?: User[];
}

type Tab = 'media' | 'api' | 'landing' | 'conversioni';
type LandingTab = 'form' | 'builder' | 'ai';

type EditableCustomerField = ProductCustomerField & { width: '100%' | '50%' };

interface FormPreviewProps {
    productName: string;
    title: string;
    buttonText: string;
    maxWidth: string;
    bgColor: string;
    textColor: string;
    buttonBgColor: string;
    buttonTextColor: string;
    customerFields: EditableCustomerField[];
}

const FormPreview: React.FC<FormPreviewProps> = ({
    productName,
    title,
    buttonText,
    maxWidth,
    bgColor,
    textColor,
    buttonBgColor,
    buttonTextColor,
    customerFields
}) => {
    const formStyle: React.CSSProperties = {
        fontFamily: 'Arial, sans-serif',
        maxWidth: maxWidth || '500px',
        margin: '0 auto',
        padding: '25px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: bgColor || '#ffffff',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '5px',
        color: textColor || '#555',
        fontWeight: 'bold',
    };
    
    const buttonStyle: React.CSSProperties = {
        width: '100%',
        padding: '15px',
        backgroundColor: buttonBgColor || '#fb923c',
        color: buttonTextColor || 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '18px',
        cursor: 'not-allowed',
        fontWeight: 'bold'
    };

    const enabledFields = customerFields.filter(f => f.enabled);

    return (
        <form onSubmit={(e) => e.preventDefault()} style={formStyle}>
            <h3 style={{ textAlign: 'center', color: textColor, marginBottom: '20px' }}>{title || `Ordina Subito: ${productName}`}</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -8px' }}>
                {enabledFields.map(field => (
                     <div key={field.id} style={{ marginBottom: '15px', width: field.width, boxSizing: 'border-box', padding: '0 8px' }}>
                        <label style={labelStyle}>{field.label}{field.required ? ' *' : ''}</label>
                        <input type="text" disabled style={inputStyle} placeholder={field.placeholder || ''} />
                    </div>
                ))}
            </div>
            
            <div style={{ padding: '0 8px', boxSizing: 'border-box' }}>
                <div style={{ marginBottom: '25px' }}>
                    <label style={labelStyle}>Quantità</label>
                    <input type="number" defaultValue="1" min="1" disabled style={inputStyle} />
                </div>
                <button type="submit" disabled style={buttonStyle}>
                    {buttonText || "Completa l'Ordine"}
                </button>
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginTop: '15px' }}>Pagamento alla consegna. Spedizione gratuita.</p>
            </div>
        </form>
    );
};


const ProductDetailPage: React.FC<ProductDetailPageProps> = (props) => {
    const { product, niche, supplier, currentUser, onBack, onUpdateProduct, onDeleteProduct, niches = [], suppliers = [], affiliates = [] } = props;

    const [copyButtonText, setCopyButtonText] = useState('Copia Codice');
    const [copiedId, setCopiedId] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('media');
    const [landingTab, setLandingTab] = useState<LandingTab>('form');
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // Landing Page Builder State
    const [selectedLandingImages, setSelectedLandingImages] = useState<string[]>([product.image_url || '']);
    const [formPosition, setFormPosition] = useState<'right' | 'bottom'>('right');

    // Advanced Options State
    const [subId, setSubId] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [thankYouPageUrl, setThankYouPageUrl] = useState('');
    const [metaPixelId, setMetaPixelId] = useState('');
    const [tiktokPixelId, setTiktokPixelId] = useState('');
    const [metaEvents, setMetaEvents] = useState({ viewContent: true, purchase: true });
    const [tiktokEvents, setTiktokEvents] = useState({ viewContent: true, completePayment: true });

    // Form Customization State
    const [formTitle, setFormTitle] = useState(`Ordina Subito: ${product.name}`);
    const [formButtonText, setFormButtonText] = useState("Completa l'Ordine");
    const [formMaxWidth, setFormMaxWidth] = useState('500px');
    const [formBgColor, setFormBgColor] = useState('#ffffff');
    const [formTextColor, setFormTextColor] = useState('#333333');
    const [formButtonBgColor, setFormButtonBgColor] = useState('#f97316');
    const [formButtonTextColor, setFormButtonTextColor] = useState('#ffffff');
    const [editableCustomerFields, setEditableCustomerFields] = useState<EditableCustomerField[]>([]);
    
    useEffect(() => {
      const fieldsWithWidth = (product.customer_fields || DEFAULT_CUSTOMER_FIELDS)
        .map(f => ({ ...f, width: '100%' as '100%' | '50%' }));
      setEditableCustomerFields(fieldsWithWidth);
    }, [product]);

    // AI feature State
    const [aiLandingPageHtml, setAiLandingPageHtml] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const handleFieldWidthChange = (id: ProductCustomerField['id'], width: '100%' | '50%') => {
        setEditableCustomerFields(prev => prev.map(f => f.id === id ? { ...f, width } : f));
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(product.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const generatePixelHtml = () => {
        let headCode = '';
        let bodyViewContentCode = '';
        let submitHandlerCode = `function handleCodMasterSubmit(event) {\n`;

        const productDetails = `{
            content_name: ${JSON.stringify(product.name)},
            content_category: ${JSON.stringify(niche?.name || 'N/A')},
            content_ids: [${JSON.stringify(product.sku)}],
            content_type: 'product',
            value: ${product.price},
            currency: 'EUR'
        }`;

        if (metaPixelId.trim()) {
            headCode += `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId.trim()}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${metaPixelId.trim()}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->\n`;
            if (metaEvents.viewContent) {
                bodyViewContentCode += `if(typeof fbq !== 'undefined') { fbq('track', 'ViewContent', ${productDetails}); }\n`;
            }
            if (metaEvents.purchase) {
                submitHandlerCode += `  if(typeof fbq !== 'undefined') { fbq('track', 'Purchase', ${productDetails}); }\n`;
            }
        }

        if (tiktokPixelId.trim()) {
            headCode += `<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e].TikTokAnalyticsObject=t;var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${tiktokPixelId.trim()}');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->\n`;
            if (tiktokEvents.viewContent) {
                bodyViewContentCode += `if(typeof ttq !== 'undefined') { ttq.track('ViewContent', {
                    content_id: ${JSON.stringify(product.sku)},
                    content_type: 'product',
                    content_name: ${JSON.stringify(product.name)},
                    quantity: 1,
                    price: ${product.price},
                    value: ${product.price},
                    currency: 'EUR'
                }); }\n`;
            }
            if (tiktokEvents.completePayment) {
                 submitHandlerCode += `  if(typeof ttq !== 'undefined') { ttq.track('CompletePayment', {
                    content_id: ${JSON.stringify(product.sku)},
                    content_type: 'product',
                    quantity: 1,
                    price: ${product.price},
                    value: ${product.price},
                    currency: 'EUR'
                }); }\n`;
            }
        }

        submitHandlerCode += `}\n`;
        const formOnSubmit = (metaPixelId.trim() && metaEvents.purchase) || (tiktokPixelId.trim() && tiktokEvents.completePayment) ? 'onsubmit="handleCodMasterSubmit(event)"' : '';
        const submitHandlerScript = formOnSubmit ? `<script>\n${submitHandlerCode}</script>` : '';
        const viewContentScript = bodyViewContentCode ? `<script>\n${bodyViewContentCode}</script>` : '';

        return {
            head: headCode,
            bodyViewContent: viewContentScript,
            formSubmitHandler: submitHandlerScript,
            formOnSubmit: formOnSubmit,
        };
    };

    const generateFormEmbedCode = () => {
        const affiliateId = currentUser ? currentUser.id : 'AFFILIATE_ID';
        const formStyle = `font-family: Arial, sans-serif; max-width: ${formMaxWidth || '500px'}; margin: 40px auto; padding: 25px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background-color: ${formBgColor};`;
        const labelStyle = `display: block; margin-bottom: 5px; color: ${formTextColor}; font-weight: bold;`;
        const inputStyle = `width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;`;
        const buttonStyle = `width: 100%; padding: 15px; background-color: ${formButtonBgColor}; color: ${formButtonTextColor}; border: none; border-radius: 5px; font-size: 18px; cursor: pointer; font-weight: bold;`;

        const subIdInput = subId.trim() ? `\n  <input type="hidden" name="subId" value="${subId.trim()}">` : '';
        const webhookInput = webhookUrl.trim() ? `\n  <input type="hidden" name="webhookUrl" value="${webhookUrl.trim()}">` : '';
        const redirectInput = thankYouPageUrl.trim() ? `\n  <input type="hidden" name="redirectUrl" value="${thankYouPageUrl.trim()}">` : '';
        
        const pixelSnippets = generatePixelHtml();
        const pixelInstructions = pixelSnippets.head ? `<!-- IMPORTANTE: Per un tracciamento corretto, incolla questo codice nel tag <head> della tua pagina -->\n<---\n${pixelSnippets.head}\n--->\n\n` : '';
        
        const customerFieldsHtml = `<div style="display: flex; flex-wrap: wrap; margin: 0 -8px;">${
            editableCustomerFields
                .filter(field => field.enabled)
                .map(field => {
                    const type = field.id === 'email' ? 'email' : (field.id === 'phone' ? 'tel' : 'text');
                    return `
    <div style="width: ${field.width}; box-sizing: border-box; padding: 0 8px; margin-bottom: 15px;">
        <label for="${field.name_attr}" style="${labelStyle}">${field.label}${field.required ? ' *' : ''}</label>
        <input type="${type}" id="${field.name_attr}" name="${field.name_attr}" ${field.required ? 'required' : ''} style="${inputStyle}" placeholder="${field.placeholder || ''}">
    </div>`;
                }).join('')
        }</div>`;

        const formHtml = `<!-- Incolla questo codice nel body della tua landing page -->
<form action="https://api.piattaformacod.com/orders" method="POST" style="${formStyle}" ${pixelSnippets.formOnSubmit}>
  <h3 style="text-align: center; color: ${formTextColor}; margin-bottom: 20px;">${formTitle}</h3>
  <input type="hidden" name="productId" value="${product.id}">
  <input type="hidden" name="affiliateId" value="${affiliateId}">${subIdInput}${webhookInput}${redirectInput}
  ${customerFieldsHtml}
  <div style="margin-bottom: 25px; padding: 0 8px; box-sizing: border-box;">
    <label for="quantity" style="${labelStyle}">Quantità</label>
    <input type="number" id="quantity" name="quantity" value="1" min="1" required style="${inputStyle}">
  </div>
  
  <button type="submit" style="${buttonStyle}">
    ${formButtonText}
  </button>
  <p style="text-align: center; font-size: 12px; color: #888; margin-top: 15px;">Pagamento alla consegna. Spedizione gratuita.</p>
</form>`;

        return pixelInstructions + formHtml + '\n' + pixelSnippets.bodyViewContent + '\n' + pixelSnippets.formSubmitHandler;
    };

    const generateLandingPageHtml = () => {
        const pixelSnippets = generatePixelHtml();
        const imagesHtml = selectedLandingImages.map(img => `<img src="${img}" alt="${product.name}" style="max-width: 100%; border-radius: 8px; margin-bottom: 15px;">`).join('\n');
        const formHtml = generateFormEmbedCode().replace(/<!--[\s\S]*?-->/g, ''); // Remove instructions for full page
        const layoutStyle = formPosition === 'right' ? 'display: flex; flex-wrap: wrap; gap: 30px; align-items: flex-start;' : 'display: block;';
        const contentStyle = formPosition === 'right' ? 'flex: 2; min-width: 300px;' : '';
        const formContainerStyle = formPosition === 'right' ? 'flex: 1; min-width: 300px; position: sticky; top: 20px;' : '';

        return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.name}</title>
    ${pixelSnippets.head}
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f9; color: #333; }
        .container { max-width: 1100px; margin: auto; padding: 20px; }
        .layout-container { ${layoutStyle} }
        .content { ${contentStyle} }
        .form-container { ${formContainerStyle} }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        .description { font-size: 1.1em; line-height: 1.6; margin-bottom: 20px; }
        .price-box { background: #fff7ed; border: 2px solid #fed7aa; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .price { font-size: 2em; font-weight: bold; color: #c2410c; }
        .commission { color: #16a34a; font-weight: bold; }
        @media (max-width: 768px) {
            .layout-container { display: block; }
            .form-container { position: static; }
        }
    </style>
</head>
<body>
    ${pixelSnippets.bodyViewContent}
    <div class="container">
        <div class="layout-container">
            <div class="content">
                <h1>${product.name}</h1>
                <p class="description">${product.description || 'La descrizione perfetta per un prodotto fantastico.'}</p>
                ${imagesHtml}
                <div class="price-box">
                    <div>Offerta Speciale a soli:</div>
                    <div class="price">€${(product.price || 0).toFixed(2)}</div>
                    <div class="commission">(Tua commissione: €${(product.commission || 0).toFixed(2)})</div>
                </div>
            </div>
            <div class="form-container">
                ${formHtml}
            </div>
        </div>
    </div>
    ${pixelSnippets.formSubmitHandler}
</body>
</html>`;
    };

    const handleGenerateWithAI = async () => {
        setIsGenerating(true);
        setAiLandingPageHtml('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const pixelSnippets = generatePixelHtml();
            const placeholderImages = [product.image_url, ...(product.image_urls || [])].filter(Boolean) as string[];

            const prompt = `
    You are an expert web developer and direct response copywriter. Your task is to generate the complete HTML code for a high-converting, responsive landing page for the following product.

    **Product Details:**
    - Name: "${product.name}"
    - Description: "${product.description}"
    - Price: €${(product.price || 0).toFixed(2)}
    - Commission for affiliate: €${(product.commission || 0).toFixed(2)}
    - Available Images (use one or more of these):
    ${placeholderImages.map(img => `  - ${img}`).join('\n')}

    **Custom Form Styling (Important):**
    - Form Title: "${formTitle}"
    - Button Text: "${formButtonText}"
    - Form Background Color: "${formBgColor}"
    - Form Text Color: "${formTextColor}"
    - Button Background Color: "${formButtonBgColor}"
    - Button Text Color: "${formButtonTextColor}"

    **Requirements:**
    1.  **Full HTML Document:** Generate a single, complete HTML file including \`<!DOCTYPE html>\`, \`<head>\`, and \`<body>\`.
    2.  **Inline CSS:** Use a single \`<style>\` tag in the \`<head>\`. Do not use external stylesheets. Make the design modern, clean, and trustworthy.
    3.  **Responsive Design:** The page must look great on both desktop and mobile devices. Use media queries inside the style tag.
    4.  **Compelling Copy:** Write new, persuasive copy based on the product description to convince customers to buy. Use headings, subheadings, bullet points highlighting benefits, testimonials (if you can invent plausible ones), and strong calls to action.
    5.  **Visuals:** Incorporate the provided images effectively to showcase the product.
    
    **Tracking Pixels (VERY IMPORTANT):**
    You MUST include the following tracking scripts exactly as provided.
    1.  **Code for the <head> section:** Place this code right before the closing </head> tag.
        \`\`\`html
        ${pixelSnippets.head}
        \`\`\`
    2.  **Code for the <body> section:** Place this code right after the opening <body> tag.
        \`\`\`html
        ${pixelSnippets.bodyViewContent}
        \`\`\`
    3.  **Code for the form submission handler:** Place this script right before the closing </body> tag.
        \`\`\`html
        ${pixelSnippets.formSubmitHandler}
        \`\`\`

    **Order Form HTML to Include (Do NOT modify input names, action, or method):**
    The page MUST include the following HTML order form. You MUST add the onsubmit attribute: ${pixelSnippets.formOnSubmit}. Style it to match the page design AND the custom styling requirements provided above.
        \`\`\`html
        ${generateFormEmbedCode().replace(/<!--[\s\S]*?-->/g, '')}
        \`\`\`

    **Final Output:**
    Return ONLY the raw HTML code for the landing page. Do not add any explanations, comments, or markdown formatting (like \`\`\`html) around the code.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const generatedHtml = response.text;
            setAiLandingPageHtml(generatedHtml);

        } catch (error) {
            console.error("Error generating AI landing page:", error);
            // FIX: The 'error' object in a catch block is of type 'unknown'. A type guard is used to check if it's an instance of Error before accessing its properties, preventing a TypeScript error.
            let message = "Si è verificato un errore durante la generazione della landing page. Riprova.";
            if (error instanceof Error) {
                message = `Errore (${error.name || 'AI Error'}): ${error.message}. Riprova.`;
            }
            setAiLandingPageHtml(`<p style="color: red;">${message}</p>`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyCode = () => {
        let codeToCopy = '';
        if (activeTab === 'landing') {
            switch (landingTab) {
                case 'form':
                    codeToCopy = generateFormEmbedCode();
                    break;
                case 'builder':
                    codeToCopy = generateLandingPageHtml();
                    break;
                case 'ai':
                    codeToCopy = aiLandingPageHtml;
                    break;
            }
        }
        if (codeToCopy) {
            navigator.clipboard.writeText(codeToCopy);
            setCopyButtonText('Codice Copiato!');
            setTimeout(() => setCopyButtonText('Copia Codice'), 2000);
        }
    };
    
    const showTabs = currentUser && [UserRole.ADMIN, UserRole.MANAGER, UserRole.AFFILIATE].includes(currentUser.role);
    const canAddMedia = currentUser && [UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPLIER].includes(currentUser.role);
    const canEditProduct = onUpdateProduct && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER || currentUser.id === product.supplier_id);
    const canSeePlatformFee = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER || (currentUser.role === UserRole.SUPPLIER && currentUser.id === product.supplier_id);

    const toggleImageSelection = (imgUrl: string) => {
        setSelectedLandingImages(prev => {
            if (prev.includes(imgUrl)) {
                return prev.filter(url => url !== imgUrl);
            }
            return [...prev, imgUrl];
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (!onUpdateProduct) return;
    
        setIsUploading(true);
        try {
            const files = Array.from(e.target.files);
            const uploadPromises = files.map(file => {
                const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
                return supabase.storage.from('product_images').upload(fileName, file);
            });
    
            const uploadResults = await Promise.all(uploadPromises);
            
            const uploadedUrls: string[] = [];
            for (const result of uploadResults) {
                if (result.error) throw result.error;
                const { data } = supabase.storage.from('product_images').getPublicUrl(result.data.path);
                uploadedUrls.push(data.publicUrl);
            }
    
            const newImageUrls = [...(product.image_urls || []), ...uploadedUrls];
            await onUpdateProduct(product.id, { image_urls: newImageUrls });
    
        } catch (error) {
            alert(`Errore durante il caricamento delle immagini: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset file input
        }
    };

    const handleImageDelete = async (imageUrl: string) => {
        if (!onUpdateProduct || !window.confirm("Sei sicuro di voler eliminare questa immagine?")) return;
    
        setIsUploading(true);
        try {
            // 1. Delete from storage
            const fileName = imageUrl.split('/').pop();
            if (fileName) {
                const { error: storageError } = await supabase.storage.from('product_images').remove([fileName]);
                if (storageError) throw storageError;
            }
    
            // 2. Update product record
            const newImageUrls = product.image_urls?.filter(url => url !== imageUrl);
            await onUpdateProduct(product.id, { image_urls: newImageUrls });
    
        } catch (error) {
            alert(`Errore durante l'eliminazione dell'immagine: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsUploading(false);
        }
    };

    const TabButton = ({ tab, label, icon }: { tab: Tab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center whitespace-nowrap py-4 px-3 border-b-2 font-semibold text-sm transition-colors duration-200 focus:outline-none -mb-px ${
                activeTab === tab
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
        >
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );
    
    const advancedOptionsFields = (
        <div className="space-y-6">
            <fieldset className="border p-4 rounded-lg bg-white space-y-4">
                <legend className="px-2 font-medium text-slate-700 text-sm flex items-center">
                    <SwatchIcon className="h-4 w-4 mr-2" />
                    Personalizzazione Formulario
                </legend>
                <div>
                    <label htmlFor="formTitle" className="block text-sm font-medium text-slate-700 mb-1">Titolo del Formulario</label>
                    <input type="text" id="formTitle" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="formButtonText" className="block text-sm font-medium text-slate-700 mb-1">Testo del Bottone</label>
                    <input type="text" id="formButtonText" value={formButtonText} onChange={(e) => setFormButtonText(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="formMaxWidth" className="block text-sm font-medium text-slate-700 mb-1">Larghezza Formulario</label>
                    <div className="flex items-center gap-4">
                         <input
                            type="range"
                            id="formMaxWidth"
                            min="320"
                            max="800"
                            value={parseInt(formMaxWidth, 10) || 500}
                            onChange={(e) => setFormMaxWidth(`${e.target.value}px`)}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-slate-600 font-mono bg-slate-100 py-1 px-2 rounded-md w-24 text-center">
                            {formMaxWidth}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                         <label htmlFor="formBgColor" className="block text-sm font-medium text-slate-700">Sfondo Form.</label>
                         <input type="color" id="formBgColor" value={formBgColor} onChange={(e) => setFormBgColor(e.target.value)} className="h-8 w-10 border-slate-300" />
                    </div>
                     <div className="flex items-center justify-between">
                         <label htmlFor="formTextColor" className="block text-sm font-medium text-slate-700">Testo Form.</label>
                         <input type="color" id="formTextColor" value={formTextColor} onChange={(e) => setFormTextColor(e.target.value)} className="h-8 w-10 border-slate-300" />
                    </div>
                     <div className="flex items-center justify-between">
                         <label htmlFor="formButtonBgColor" className="block text-sm font-medium text-slate-700">Sfondo Bottone</label>
                         <input type="color" id="formButtonBgColor" value={formButtonBgColor} onChange={(e) => setFormButtonBgColor(e.target.value)} className="h-8 w-10 border-slate-300" />
                    </div>
                     <div className="flex items-center justify-between">
                         <label htmlFor="formButtonTextColor" className="block text-sm font-medium text-slate-700">Testo Bottone</label>
                         <input type="color" id="formButtonTextColor" value={formButtonTextColor} onChange={(e) => setFormButtonTextColor(e.target.value)} className="h-8 w-10 border-slate-300" />
                    </div>
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-lg bg-white space-y-3">
                <legend className="px-2 font-medium text-slate-700 text-sm flex items-center">
                    <ArrowsRightLeftIcon className="h-4 w-4 mr-2" />
                    Layout Campi
                </legend>
                {editableCustomerFields.filter(f => f.enabled).map(field => (
                    <div key={field.id} className="flex items-center justify-between">
                        <span className="text-sm text-slate-800">{field.label}</span>
                        <div className="flex items-center space-x-1 bg-slate-200/75 p-1 rounded-md">
                             <button type="button" onClick={() => handleFieldWidthChange(field.id, '100%')} className={`px-2 py-0.5 text-xs font-semibold rounded ${field.width === '100%' ? 'bg-white text-orange-600 shadow' : 'text-slate-600 hover:bg-white/60'}`}>100%</button>
                             <button type="button" onClick={() => handleFieldWidthChange(field.id, '50%')} className={`px-2 py-0.5 text-xs font-semibold rounded ${field.width === '50%' ? 'bg-white text-orange-600 shadow' : 'text-slate-600 hover:bg-white/60'}`}>50%</button>
                        </div>
                    </div>
                ))}
            </fieldset>

            <fieldset className="border p-4 rounded-lg bg-white space-y-4">
                <legend className="px-2 font-medium text-slate-700 text-sm">Parametri di Tracciamento</legend>
                <div>
                    <label htmlFor="subId" className="block text-sm font-medium text-slate-700 mb-1">Sub ID</label>
                    <input type="text" id="subId" value={subId} onChange={(e) => setSubId(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="es. google_ads_campaign_1" />
                </div>
                <div>
                    <label htmlFor="webhookUrl" className="block text-sm font-medium text-slate-700 mb-1">Webhook URL</label>
                    <input type="url" id="webhookUrl" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="https://tuo-server.com/webhook" />
                </div>
                <div>
                    <label htmlFor="thankYouPageUrl" className="block text-sm font-medium text-slate-700 mb-1">Pagina di Ringraziamento</label>
                    <input type="url" id="thankYouPageUrl" value={thankYouPageUrl} onChange={(e) => setThankYouPageUrl(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="https://tua-pagina.com/grazie" />
                </div>
            </fieldset>

            <details className="border rounded-lg bg-white group">
                <summary className="p-4 font-medium text-slate-700 text-sm flex items-center justify-between cursor-pointer list-none">
                    <div className="flex items-center">
                        <TagIcon className="h-4 w-4 mr-2" />
                        Tracciamento Pixel (Meta & TikTok)
                    </div>
                    <svg className="h-5 w-5 text-slate-500 transform transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>
                <div className="p-4 border-t space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-800 flex items-center text-sm"><img src="https://www.facebook.com/favicon.ico" alt="Meta icon" className="h-4 w-4 mr-2" />Meta Pixel (Facebook/Instagram)</h4>
                        <div>
                            <label htmlFor="metaPixelId" className="block text-sm font-medium text-slate-700 mb-1">Pixel ID</label>
                            <input type="text" id="metaPixelId" value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Il tuo ID Meta Pixel" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input type="checkbox" checked={metaEvents.viewContent} onChange={() => setMetaEvents(p => ({ ...p, viewContent: !p.viewContent }))} className="h-4 w-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500" />
                                <span className="ml-2 text-sm">Invia evento <strong>ViewContent</strong> al caricamento della pagina</span>
                            </label>
                             <label className="flex items-center">
                                <input type="checkbox" checked={metaEvents.purchase} onChange={() => setMetaEvents(p => ({ ...p, purchase: !p.purchase }))} className="h-4 w-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500" />
                                <span className="ml-2 text-sm">Invia evento <strong>Purchase</strong> all'invio del form</span>
                            </label>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h4 className="font-semibold text-slate-800 flex items-center text-sm"><img src="https://www.tiktok.com/favicon.ico" alt="TikTok icon" className="h-4 w-4 mr-2" />TikTok Pixel</h4>
                        <div>
                            <label htmlFor="tiktokPixelId" className="block text-sm font-medium text-slate-700 mb-1">Pixel ID</label>
                            <input type="text" id="tiktokPixelId" value={tiktokPixelId} onChange={(e) => setTiktokPixelId(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Il tuo ID TikTok Pixel" />
                        </div>
                         <div className="space-y-2">
                            <label className="flex items-center">
                                <input type="checkbox" checked={tiktokEvents.viewContent} onChange={() => setTiktokEvents(p => ({ ...p, viewContent: !p.viewContent }))} className="h-4 w-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500" />
                                <span className="ml-2 text-sm">Invia evento <strong>ViewContent</strong> al caricamento della pagina</span>
                            </label>
                             <label className="flex items-center">
                                <input type="checkbox" checked={tiktokEvents.completePayment} onChange={() => setTiktokEvents(p => ({ ...p, completePayment: !p.completePayment }))} className="h-4 w-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500" />
                                <span className="ml-2 text-sm">Invia evento <strong>CompletePayment</strong> all'invio del form</span>
                            </label>
                        </div>
                    </div>
                </div>
            </details>
        </div>
    );

    return (
        <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Torna al Catalogo
                </button>
                 <div className="flex items-center gap-2">
                    {canEditProduct && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <PencilSquareIcon className="h-4 w-4 mr-2" />
                            Modifica
                        </button>
                    )}
                     {onDeleteProduct && canEditProduct && (
                        <button 
                            onClick={() => window.confirm("Sei sicuro di voler eliminare questo prodotto?") && onDeleteProduct(product.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Elimina
                        </button>
                    )}
                 </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Image and Description */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                           {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                           ) : (
                               <PhotoIcon className="h-24 w-24 text-slate-400" />
                           )}
                        </div>
                         <div>
                            <h1 className="text-3xl font-bold text-slate-800">{product.name}</h1>
                            <p className="text-sm font-mono text-slate-500 mt-1">{product.sku}</p>
                        </div>
                        <p className="text-slate-600 text-base leading-relaxed">{product.description}</p>
                    </div>

                    {/* Right Column: Details & Affiliate Tools */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center bg-slate-50 p-4 rounded-lg border">
                           <div>
                               <p className="text-sm font-semibold text-slate-500">Prezzo</p>
                               <p className="text-3xl font-bold text-slate-800">€{(product.price || 0).toFixed(2)}</p>
                           </div>
                           <div>
                               <p className="text-sm font-semibold text-slate-500">Tua Commissione</p>
                               <p className="text-3xl font-bold text-green-600">€{(product.commission || 0).toFixed(2)}</p>
                           </div>
                           {canSeePlatformFee && product.platform_fee != null && (
                             <div className="col-span-2 border-t pt-2">
                                <p className="text-xs text-slate-500">Fee Piattaforma: €{(product.platform_fee || 0).toFixed(2)}</p>
                             </div>
                           )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow label="Nicchia" value={niche?.name} />
                            <DetailRow label="Fornitore" value={supplier?.name} />
                            <DetailRow label="Paese" value={product.country} />
                             {product.tolerance != null && (
                                <DetailRow label="Tolleranza" value={`${product.tolerance}%`} />
                            )}
                        </div>
                        
                        <div className="border-t pt-4">
                            <label className="block text-sm font-semibold text-slate-500 mb-1">ID Prodotto Piattaforma</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={product.id}
                                    readOnly
                                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm bg-slate-100 sm:text-sm font-mono text-slate-600"
                                    aria-label="ID Prodotto"
                                />
                                <button
                                    onClick={handleCopyId}
                                    title={copiedId ? 'Copiato!' : 'Copia ID'}
                                    className="p-2 border border-slate-300 rounded-md bg-white hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <ClipboardDocumentIcon className="h-5 w-5 text-slate-600" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Usa questo ID per le integrazioni API.</p>
                        </div>

                        {/* Affiliate Tools */}
                        {showTabs && (
                            <div className="border-t pt-6">
                                <div className="border-b border-slate-200">
                                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                       <TabButton tab="media" label="Media" icon={<PhotoIcon className="h-5 w-5"/>} />
                                       <TabButton tab="landing" label="Landing" icon={<LinkIcon className="h-5 w-5"/>} />
                                       <TabButton tab="api" label="API" icon={<CodeBracketIcon className="h-5 w-5"/>} />
                                       <TabButton tab="conversioni" label="Conversioni" icon={<ChartBarIcon className="h-5 w-5"/>} />
                                    </nav>
                                </div>
                                <div className="py-6 bg-slate-50 -mx-6 px-6">
                                    {activeTab === 'media' && (
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-slate-800">Galleria Immagini</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {product.image_url && (
                                                    <div className="relative group">
                                                        <img src={product.image_url} alt="Immagine principale" className="aspect-square object-contain rounded-lg border bg-white p-1" />
                                                    </div>
                                                )}
                                                {product.image_urls?.map(url => (
                                                    <div key={url} className="relative group">
                                                        <img src={url} alt="Immagine prodotto" className="aspect-square object-contain rounded-lg border bg-white p-1" />
                                                         {canAddMedia && (
                                                            <button 
                                                                onClick={() => handleImageDelete(url)}
                                                                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <TrashIcon className="h-3 w-3" />
                                                            </button>
                                                         )}
                                                    </div>
                                                ))}
                                                {canAddMedia && (
                                                    <label className="relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                                                        {isUploading ? (
                                                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                          <>
                                                            <PlusIcon className="h-8 w-8 text-slate-400"/>
                                                            <span className="mt-1 text-xs text-center text-slate-500">Aggiungi immagini</span>
                                                          </>
                                                        )}
                                                        <input type="file" multiple onChange={handleImageUpload} accept="image/*" className="sr-only" disabled={isUploading} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'landing' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center bg-slate-200/75 p-1 rounded-lg space-x-1">
                                                <button onClick={() => setLandingTab('form')} className={`flex-1 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${landingTab === 'form' ? 'bg-white text-orange-600 shadow' : 'text-slate-600 hover:bg-white/60'}`}>Form Embed</button>
                                                <button onClick={() => setLandingTab('builder')} className={`flex-1 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${landingTab === 'builder' ? 'bg-white text-orange-600 shadow' : 'text-slate-600 hover:bg-white/60'}`}>Builder Semplice</button>
                                                <button onClick={() => setLandingTab('ai')} className={`flex-1 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${landingTab === 'ai' ? 'bg-white text-orange-600 shadow' : 'text-slate-600 hover:bg-white/60'}`}>Genera con AI</button>
                                            </div>
                                            
                                            {landingTab === 'form' && (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                     <div>{advancedOptionsFields}</div>
                                                     <div className="bg-white p-4 rounded-lg border">
                                                        <h4 className="font-semibold mb-4 text-center">Anteprima Formulario</h4>
                                                         <FormPreview 
                                                            productName={product.name}
                                                            title={formTitle}
                                                            buttonText={formButtonText}
                                                            maxWidth={formMaxWidth}
                                                            bgColor={formBgColor}
                                                            textColor={formTextColor}
                                                            buttonBgColor={formButtonBgColor}
                                                            buttonTextColor={formButtonTextColor}
                                                            customerFields={editableCustomerFields}
                                                         />
                                                     </div>
                                                </div>
                                            )}

                                            {landingTab === 'builder' && (
                                                <div className="space-y-4">
                                                    <div>
                                                         <label className="block text-sm font-medium text-slate-700 mb-2">Seleziona Immagini</label>
                                                         <div className="flex flex-wrap gap-2">
                                                            {[product.image_url, ...(product.image_urls || [])].filter(Boolean).map((img, idx) => (
                                                                <button key={idx} onClick={() => toggleImageSelection(img as string)} className={`p-1 rounded-md border-2 ${selectedLandingImages.includes(img as string) ? 'border-orange-500' : 'border-transparent'}`}>
                                                                    <img src={img as string} alt={`Img ${idx}`} className="w-16 h-16 object-contain bg-white rounded" />
                                                                </button>
                                                            ))}
                                                         </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Posizione Formulario</label>
                                                        <div className="flex items-center bg-slate-100 p-1 rounded-lg space-x-1 max-w-xs">
                                                            <button onClick={() => setFormPosition('right')} className={`flex-1 text-sm py-1 rounded-md ${formPosition === 'right' ? 'bg-white shadow' : ''}`}>Destra</button>
                                                            <button onClick={() => setFormPosition('bottom')} className={`flex-1 text-sm py-1 rounded-md ${formPosition === 'bottom' ? 'bg-white shadow' : ''}`}>Sotto</button>
                                                        </div>
                                                    </div>
                                                    <details className="pt-2">
                                                        <summary className="text-sm font-medium text-slate-700 cursor-pointer">Opzioni Avanzate</summary>
                                                        <div className="mt-4 border-t pt-4">{advancedOptionsFields}</div>
                                                    </details>
                                                </div>
                                            )}

                                            {landingTab === 'ai' && (
                                                <div className="space-y-4">
                                                    <button onClick={handleGenerateWithAI} disabled={isGenerating} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400">
                                                        <SparklesIcon className="h-5 w-5 mr-2" />
                                                        {isGenerating ? 'Generazione in corso...' : 'Genera Landing Page con AI'}
                                                    </button>
                                                    <p className="text-xs text-center text-slate-500">L'IA utilizzerà le opzioni di tracciamento e personalizzazione del form definite nella tab "Form Embed".</p>
                                                    {isGenerating && (
                                                        <div className="text-center p-4">
                                                             <div className="w-8 h-8 mx-auto border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                             <p className="text-sm text-slate-600 mt-2">Creazione della tua landing page in corso...</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="mt-4 pt-4 border-t">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-semibold text-slate-800">Codice da Incorporare</h4>
                                                    <button onClick={handleCopyCode} className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                                                        <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                                                        {copyButtonText}
                                                    </button>
                                                </div>
                                                <pre className="bg-slate-900 text-white p-4 rounded-lg text-xs overflow-x-auto max-h-80">
                                                    <code>
                                                        {landingTab === 'form' && generateFormEmbedCode()}
                                                        {landingTab === 'builder' && generateLandingPageHtml()}
                                                        {landingTab === 'ai' && (aiLandingPageHtml || 'Clicca su "Genera" per creare il codice HTML.')}
                                                    </code>
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
             <EditProductModal 
                product={isEditing ? product : null}
                onUpdateProduct={async (productId, updateData) => {
                    if (onUpdateProduct) {
                        const success = await onUpdateProduct(productId, updateData);
                        if (success) {
                            setIsEditing(false);
                        }
                        return success;
                    }
                    return false;
                }}
                onClose={() => setIsEditing(false)}
                niches={niches}
                suppliers={suppliers}
                affiliates={affiliates}
                currentUser={currentUser}
             />
        </div>
    );
};

const DetailRow: React.FC<{label: string, value: React.ReactNode}> = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="text-base text-slate-800">{value || 'N/D'}</p>
    </div>
);

export default ProductDetailPage;