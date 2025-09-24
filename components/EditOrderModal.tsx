import React, { useState, useEffect, useMemo } from 'react';
import { Product, User, Order, OrderStatus } from '../types';
import { XMarkIcon } from './Icons';

interface EditOrderModalProps {
  order: Order | null;
  onUpdateOrder: (order: Order) => Promise<boolean>;
  onClose: () => void;
  products: Product[];
  affiliates: User[];
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, onUpdateOrder, onClose, products, affiliates }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [affiliateId, setAffiliateId] = useState<string>('');
  const [subId, setSubId] = useState('');
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [totalPrice, setTotalPrice] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputStyle = "block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm";
  
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === productId);
  }, [productId, products]);

  useEffect(() => {
    if (selectedProduct) {
      setTotalPrice(selectedProduct.price * quantity);
    } else {
      setTotalPrice(0);
    }
  }, [selectedProduct, quantity]);

  useEffect(() => {
    if (order) {
        setCustomerName(order.customerName);
        setCustomerPhone(order.customerPhone);
        setCustomerAddress(order.customerAddress);
        setProductId(order.productId);
        setQuantity(order.quantity);
        setAffiliateId(order.affiliateId);
        setSubId(order.subId || '');
        setStatus(order.status);
        setTotalPrice(order.totalPrice);
        setErrors({});
    }
  }, [order]);
  
  if (!order) {
    return null;
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.customerName = "Il nome del cliente è obbligatorio.";
    if (!customerPhone.trim()) newErrors.customerPhone = "Il telefono del cliente è obbligatorio.";
    if (!customerAddress.trim()) newErrors.customerAddress = "L'indirizzo del cliente è obbligatorio.";
    if (!productId) newErrors.productId = "Seleziona un prodotto.";
    if (quantity < 1) newErrors.quantity = "La quantità deve essere almeno 1.";
    if (!affiliateId) newErrors.affiliateId = "È obbligatorio selezionare un affiliato.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    
    const success = await onUpdateOrder({
      ...order,
      customerName: customerName.trim(),
      customerAddress: customerAddress.trim(),
      customerPhone: customerPhone.trim(),
      productName: selectedProduct!.name,
      productId,
      affiliateId,
      quantity,
      totalPrice,
      subId: subId.trim(),
      status,
    });
    setLoading(false);
    if (success) {
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">Modifica Ordine #{order.id}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <XMarkIcon className="h-6 w-6" />
            <span className="sr-only">Chiudi</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Dati Cliente</h3>
            <div>
              <label htmlFor="edit-order-name" className="block text-sm font-medium text-slate-700 mb-1">Nome e Cognome</label>
              <input type="text" id="edit-order-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputStyle} />
              {errors.customerName && <p className="text-sm text-red-600 mt-1">{errors.customerName}</p>}
            </div>
            <div>
                <label htmlFor="edit-order-phone" className="block text-sm font-medium text-slate-700 mb-1">Telefono</label>
                <input type="tel" id="edit-order-phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={inputStyle} />
                {errors.customerPhone && <p className="text-sm text-red-600 mt-1">{errors.customerPhone}</p>}
            </div>
            <div>
              <label htmlFor="edit-order-address" className="block text-sm font-medium text-slate-700 mb-1">Indirizzo Completo</label>
              <input type="text" id="edit-order-address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className={inputStyle} />
              {errors.customerAddress && <p className="text-sm text-red-600 mt-1">{errors.customerAddress}</p>}
            </div>
            
            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 pt-4">Dettagli Ordine</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="edit-order-product" className="block text-sm font-medium text-slate-700 mb-1">Prodotto</label>
                    <select id="edit-order-product" value={productId} onChange={(e) => setProductId(e.target.value)} className={inputStyle}>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {errors.productId && <p className="text-sm text-red-600 mt-1">{errors.productId}</p>}
                </div>
                <div>
                    <label htmlFor="edit-order-quantity" className="block text-sm font-medium text-slate-700 mb-1">Quantità</label>
                    <input type="number" min="1" id="edit-order-quantity" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)} className={inputStyle} />
                    {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="edit-order-status" className="block text-sm font-medium text-slate-700 mb-1">Stato Ordine</label>
                <select id="edit-order-status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className={inputStyle}>
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-right">
                <span className="text-sm font-medium text-slate-500">Totale Ordine: </span>
                <span className="text-2xl font-bold text-slate-800">€{totalPrice.toFixed(2)}</span>
            </div>

            <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 pt-4">Attribuzione</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="edit-order-affiliate" className="block text-sm font-medium text-slate-700 mb-1">Affiliato</label>
                    <select id="edit-order-affiliate" value={affiliateId} onChange={(e) => setAffiliateId(e.target.value)} className={inputStyle}>
                        {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    {errors.affiliateId && <p className="text-sm text-red-600 mt-1">{errors.affiliateId}</p>}
                </div>
                {affiliateId && (
                    <div>
                        <label htmlFor="edit-order-subid" className="block text-sm font-medium text-slate-700 mb-1">Sub ID (Opzionale)</label>
                        <input type="text" id="edit-order-subid" value={subId} onChange={(e) => setSubId(e.target.value)} className={inputStyle} />
                    </div>
                )}
            </div>
            
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

export default EditOrderModal;