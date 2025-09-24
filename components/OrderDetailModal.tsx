import React, { useState } from 'react';
import { Order, User, Product, UserRole } from '../types';
import { XMarkIcon, ClipboardDocumentIcon } from './Icons';

interface OrderDetailModalProps {
  order: Order | null;
  users: User[];
  products: Product[];
  currentUser: User;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-base font-semibold text-slate-800">{value || 'N/D'}</p>
    </div>
);

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, users, products, currentUser, onClose }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedConvId, setCopiedConvId] = useState(false);

  if (!order) {
    return null;
  }
  
  const affiliate = users.find(u => u.id === order.affiliateId);
  const product = products.find(p => p.id === order.productId);
  const supplier = users.find(u => u.id === product?.supplier_id);

  const canSeeLeadDetails = [UserRole.ADMIN, UserRole.MANAGER, UserRole.CALL_CENTER].includes(currentUser.role);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyConversionId = () => {
    navigator.clipboard.writeText(order.conversionId.toString());
    setCopiedConvId(true);
    setTimeout(() => setCopiedConvId(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">Dettagli Ordine #{order.conversionId}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <XMarkIcon className="h-6 w-6" />
            <span className="sr-only">Chiudi</span>
          </button>
        </div>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Riepilogo Ordine */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-sm font-medium text-slate-500">Data Ordine</p>
                    <p className="text-lg font-bold text-slate-800">{new Date(order.date).toLocaleDateString('it-IT')}</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-slate-500">Stato</p>
                    <p className="text-lg font-bold text-slate-800">{order.status}</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-slate-500">Quantità</p>
                    <p className="text-lg font-bold text-slate-800">{order.quantity}</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-slate-500">Totale</p>
                    <p className="text-lg font-bold text-orange-600">€{(order.totalPrice || 0).toFixed(2)}</p>
                </div>
            </div>

            {/* ID Ordine */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg">
                    <label className="block text-sm font-medium text-slate-500 mb-1">ID Conversione</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={order.conversionId}
                            readOnly
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm bg-slate-100 sm:text-sm font-mono text-slate-600"
                            aria-label="ID Conversione"
                        />
                        <button
                            onClick={handleCopyConversionId}
                            title={copiedConvId ? 'Copiato!' : 'Copia ID'}
                            className="p-2 border border-slate-300 rounded-md bg-white hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <ClipboardDocumentIcon className="h-5 w-5 text-slate-600" />
                        </button>
                    </div>
                </div>
                <div className="border p-4 rounded-lg">
                    <label className="block text-sm font-medium text-slate-500 mb-1">ID Ordine Piattaforma</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={order.id}
                            readOnly
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-md shadow-sm bg-slate-100 sm:text-sm font-mono text-slate-600"
                            aria-label="ID Ordine"
                        />
                        <button
                            onClick={handleCopyId}
                            title={copiedId ? 'Copiato!' : 'Copia ID'}
                            className="p-2 border border-slate-300 rounded-md bg-white hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <ClipboardDocumentIcon className="h-5 w-5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>


            {/* Dati Cliente */}
            <div className="border p-4 rounded-lg">
                 <h3 className="font-semibold text-slate-800 mb-3">Dati Cliente</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <DetailRow label="Nome Cliente" value={canSeeLeadDetails ? order.customerName : 'Dato Protetto'} />
                     <DetailRow label="Telefono" value={canSeeLeadDetails ? order.customerPhone : 'Dato Protetto'} />
                     <DetailRow label="Indirizzo" value={canSeeLeadDetails ? order.customerAddress : 'Dato Protetto'} className="col-span-full" />
                 </div>
            </div>
            
             {/* Dettagli Prodotto e Attribuzione */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="border p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-800 mb-3">Prodotto</h3>
                     <div className="space-y-3">
                        <DetailRow label="Nome Prodotto" value={product?.name} />
                        <DetailRow label="SKU" value={product?.sku} />
                        <DetailRow label="Fornitore" value={supplier?.name} />
                     </div>
                 </div>
                 <div className="border p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-800 mb-3">Attribuzione</h3>
                    <div className="space-y-3">
                        <DetailRow label="Affiliato" value={affiliate?.name} />
                        <DetailRow label="Team" value={affiliate?.team} />
                        <DetailRow label="Sub ID" value={order.subId} />
                    </div>
                 </div>
             </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end items-center rounded-b-xl flex-shrink-0 border-t border-slate-200">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
                Chiudi
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;