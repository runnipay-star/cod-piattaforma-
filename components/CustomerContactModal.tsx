import React, { useState } from 'react';
import { Sale, User, UserRole, SaleStatus, Product } from '../types';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface CustomerContactModalProps {
  sale: Sale;
  template: string;
  user: User;
  products: Product[];
  onUpdate: (saleId: string, newStatus: SaleStatus, notes: string) => void;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || '-'}</dd>
    </div>
);

const CustomerContactModal: React.FC<CustomerContactModalProps> = ({ sale, template, user, products, onUpdate, onClose }) => {
  const [notes, setNotes] = useState(sale.notes || '');
  const isCustomerCare = user.role === UserRole.CUSTOMER_CARE;

  const getCleanedPhone = (phone: string | undefined): string => {
    if (!phone) return '';
    // Remove all non-digit characters
    let cleanedPhone = phone.replace(/\D/g, '');
    
    // Simple logic for Italian mobile numbers: if it has 10 digits and starts with 3, assume it's an Italian mobile needing the country code.
    if (cleanedPhone.length === 10 && cleanedPhone.startsWith('3')) {
        cleanedPhone = `39${cleanedPhone}`;
    }
    
    return cleanedPhone;
  };

  const product = products.find(p => p.id === sale.productId);
  let finalAmountText = `€${sale.saleAmount.toFixed(2)}`;

  if (product && !product.freeShipping && (product.shippingCharge || 0) > 0) {
    const shippingCharge = product.shippingCharge || 0;
    const productPrice = sale.saleAmount - shippingCharge;
    
    finalAmountText = `€${productPrice.toFixed(2)} (prodotto) + €${shippingCharge.toFixed(2)} (spedizione), per un totale di €${sale.saleAmount.toFixed(2)}`;
  }
  
  const welcomeMessage = template
    .replace('{customerName}', sale.customerName || 'Cliente')
    .replace('{productName}', sale.productName || 'il tuo prodotto')
    .replace('{saleAmount}', finalAmountText);
    
  const encodedMessage = encodeURIComponent(welcomeMessage);
  const cleanedPhone = getCleanedPhone(sale.customerPhone);
  const whatsappLink = `https://web.whatsapp.com/send?phone=${cleanedPhone}&text=${encodedMessage}`;

  const handleStatusUpdate = (newStatus: SaleStatus) => {
    onUpdate(sale.id, newStatus, notes);
    onClose();
  };
  
  const handleContactClick = () => {
    const width = 600;
    const height = 700;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    const windowFeatures = `popup,width=${width},height=${height},top=${top},left=${left}`;
    window.open(whatsappLink, 'whatsapp_popup', windowFeatures);
  };

  return (
    <div className="p-2 space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-bold text-primary mb-2">Dati Cliente</h3>
        <dl>
          <DetailRow label="Nome" value={sale.customerName} />
          <DetailRow label="Telefono" value={sale.customerPhone} />
          <DetailRow label="Email" value={sale.customerEmail} />
        </dl>
      </div>

      <div>
        <h3 className="text-lg leading-6 font-bold text-primary mb-2">Messaggio di Benvenuto</h3>
        <div className="p-3 bg-gray-100 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{welcomeMessage}</p>
        </div>
      </div>
      
      <div className="pt-4 text-center">
        <button
          onClick={handleContactClick}
          className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <WhatsAppIcon className="w-6 h-6" />
          <span>Contatta su WhatsApp</span>
        </button>
      </div>

      {isCustomerCare && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg leading-6 font-bold text-primary mb-2">
            Aggiorna Stato Ordine
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Dopo aver contattato il cliente, aggiungi eventuali note e imposta
            lo stato della conversazione.
          </p>
          <div>
            <label htmlFor="contact-notes" className="sr-only">
              Note
            </label>
            <textarea
              id="contact-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Aggiungi note per la logistica..."
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleStatusUpdate('Confermato')}
              className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Confermato
            </button>
            <button
              onClick={() => handleStatusUpdate('Contattato')}
              className="w-full bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors duration-200"
            >
              Contattato
            </button>
            <button
              onClick={() => handleStatusUpdate('Cancellato')}
              className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Cancellato
            </button>
            <button onClick={() => handleStatusUpdate('Non raggiungibile')} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200">Non Raggiungibile</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerContactModal;