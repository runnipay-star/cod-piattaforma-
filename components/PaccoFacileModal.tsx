import React, { useState, useEffect } from 'react';
import { Sale, Product, PlatformSettings } from '../types';

interface PaccoFacileModalProps {
    sale: Sale;
    product: Product;
    settings: PlatformSettings;
    onClose: () => void;
    onCreateShipment: (shipmentDetails: any) => Promise<{ success: boolean; error?: string; labelUrl?: string }>;
}

const parseAddress = (addressString: string | undefined): { address: string; city: string; zip: string; province: string } => {
    if (!addressString) return { address: '', city: '', zip: '', province: '' };
    
    // Simple parser: assumes "Via/Piazza..., Città, CAP, Provincia"
    const parts = addressString.split(',').map(p => p.trim());
    if (parts.length >= 3) {
        const province = parts.length > 3 ? parts[3] : '';
        const zip = parts[2];
        const city = parts[1];
        const address = parts[0];
        return { address, city, zip, province };
    }
    return { address: addressString, city: '', zip: '', province: '' };
};

const EditableField: React.FC<{ label: string; value: string; onChange: (value: string) => void; required?: boolean }> = ({ label, value, onChange, required=false }) => (
    <div>
        <label className="block text-xs font-medium text-gray-600">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            required={required}
            className="mt-1 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
    </div>
);

const PaccoFacileModal: React.FC<PaccoFacileModalProps> = ({ sale, product, settings, onClose, onCreateShipment }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ labelUrl: string } | null>(null);

    const [sender, setSender] = useState({
        name: settings.sender_name || '',
        company: settings.sender_company || '',
        address: settings.sender_address || '',
        city: settings.sender_city || '',
        zip: settings.sender_zip || '',
        province: settings.sender_province || '',
        phone: settings.sender_phone || '',
        email: settings.sender_email || '',
    });

    const [recipient, setRecipient] = useState({
        name: sale.customerName || '',
        address: '',
        city: '',
        zip: '',
        province: '',
        phone: sale.customerPhone || '',
        email: sale.customerEmail || '',
    });

    const [pkg, setPkg] = useState({
        weight: (product.weight || 1).toString(),
        height: (product.height || 10).toString(),
        width: (product.width || 10).toString(),
        depth: (product.depth || 10).toString(),
        content: product.name,
    });
    
    useEffect(() => {
        const parsed = parseAddress(sale.customerAddress);
        setRecipient(prev => ({ ...prev, ...parsed }));
    }, [sale.customerAddress]);

    const handleFieldChange = (section: 'sender' | 'recipient' | 'pkg', field: string, value: string) => {
        if (section === 'sender') setSender(prev => ({ ...prev, [field]: value }));
        if (section === 'recipient') setRecipient(prev => ({ ...prev, [field]: value }));
        if (section === 'pkg') setPkg(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');
        setResult(null);

        const shipmentDetails = {
            from: { ...sender },
            to: { ...recipient },
            parcels: [{
                weight: parseFloat(pkg.weight),
                dimensions: {
                    height: parseInt(pkg.height, 10),
                    width: parseInt(pkg.width, 10),
                    depth: parseInt(pkg.depth, 10),
                },
                description: pkg.content,
            }],
            cash_on_delivery: sale.saleAmount,
        };

        const res = await onCreateShipment(shipmentDetails);

        if (res.success && res.labelUrl) {
            setResult({ labelUrl: res.labelUrl });
        } else {
            setError(res.error || 'Errore sconosciuto durante la creazione della spedizione.');
        }

        setIsLoading(false);
    };
    
    if (result) {
        return (
            <div className="text-center p-4">
                <h3 className="text-xl font-bold text-green-600 mb-4">Spedizione Creata!</h3>
                <p className="text-gray-600 mb-6">L'ordine è stato aggiornato a "Spedito". Clicca sul pulsante qui sotto per scaricare e stampare l'etichetta PDF.</p>
                <a
                    href={result.labelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-on-primary font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    Stampa Etichetta
                </a>
                <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:underline">Chiudi</button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            <div>
                <h3 className="text-lg font-bold text-gray-800">Mittente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-3 bg-gray-50 rounded-md border">
                    <EditableField label="Nome" value={sender.name} onChange={v => handleFieldChange('sender', 'name', v)} required />
                    <EditableField label="Azienda" value={sender.company} onChange={v => handleFieldChange('sender', 'company', v)} />
                    <EditableField label="Indirizzo" value={sender.address} onChange={v => handleFieldChange('sender', 'address', v)} required />
                    <EditableField label="Città" value={sender.city} onChange={v => handleFieldChange('sender', 'city', v)} required />
                    <EditableField label="CAP" value={sender.zip} onChange={v => handleFieldChange('sender', 'zip', v)} required />
                    <EditableField label="Provincia" value={sender.province} onChange={v => handleFieldChange('sender', 'province', v)} required />
                    <EditableField label="Telefono" value={sender.phone} onChange={v => handleFieldChange('sender', 'phone', v)} required />
                    <EditableField label="Email" value={sender.email} onChange={v => handleFieldChange('sender', 'email', v)} required />
                </div>
            </div>
             <div>
                <h3 className="text-lg font-bold text-gray-800">Destinatario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <EditableField label="Nome" value={recipient.name} onChange={v => handleFieldChange('recipient', 'name', v)} required />
                    <EditableField label="Indirizzo" value={recipient.address} onChange={v => handleFieldChange('recipient', 'address', v)} required />
                    <EditableField label="Città" value={recipient.city} onChange={v => handleFieldChange('recipient', 'city', v)} required />
                    <EditableField label="CAP" value={recipient.zip} onChange={v => handleFieldChange('recipient', 'zip', v)} required />
                    <EditableField label="Provincia" value={recipient.province} onChange={v => handleFieldChange('recipient', 'province', v)} required />
                    <EditableField label="Telefono" value={recipient.phone} onChange={v => handleFieldChange('recipient', 'phone', v)} required />
                    <EditableField label="Email" value={recipient.email} onChange={v => handleFieldChange('recipient', 'email', v)} required />
                </div>
            </div>
             <div>
                <h3 className="text-lg font-bold text-gray-800">Dettagli Pacco</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 p-3 bg-gray-50 rounded-md border">
                     <EditableField label="Peso (kg)" value={pkg.weight} onChange={v => handleFieldChange('pkg', 'weight', v)} required />
                     <EditableField label="Altezza (cm)" value={pkg.height} onChange={v => handleFieldChange('pkg', 'height', v)} required />
                     <EditableField label="Larghezza (cm)" value={pkg.width} onChange={v => handleFieldChange('pkg', 'width', v)} required />
                     <EditableField label="Profondità (cm)" value={pkg.depth} onChange={v => handleFieldChange('pkg', 'depth', v)} required />
                </div>
                <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-md mt-4 text-center">
                    <span className="font-bold text-yellow-800">Contrassegno: €{sale.saleAmount.toFixed(2)}</span>
                </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200 text-center">{error}</p>}

            <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={onClose} disabled={isLoading} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
                    Annulla
                </button>
                <button type="button" onClick={handleSubmit} disabled={isLoading} className="bg-primary text-on-primary font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">
                    {isLoading ? 'Creazione in corso...' : 'Crea Spedizione e Stampa Etichetta'}
                </button>
            </div>
        </div>
    );
};

export default PaccoFacileModal;