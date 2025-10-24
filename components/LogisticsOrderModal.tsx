
import React, { useState } from 'react';
import { Sale, SaleStatus } from '../types';

interface LogisticsOrderModalProps {
  sale: Sale;
  onSave: (saleId: string, newStatus: SaleStatus, trackingCode: string) => void;
  onClose: () => void;
}

const LogisticsOrderModal: React.FC<LogisticsOrderModalProps> = ({ sale, onSave, onClose }) => {
  const [status, setStatus] = useState<SaleStatus>('Spedito');
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (status === 'Spedito' && !trackingCode.trim()) {
      setError('Il codice di tracciamento è obbligatorio per lo stato "Spedito".');
      return;
    }
    setError('');
    onSave(sale.id, status, trackingCode.trim());
  };

  return (
    <div className="p-2 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Ordine #{sale.id}</h3>
        <p className="text-sm text-gray-500">{sale.productName} - {sale.customerName}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nuovo Stato</label>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex items-center">
              <input
                id="spedito"
                name="status"
                type="radio"
                checked={status === 'Spedito'}
                onChange={() => setStatus('Spedito')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="spedito" className="ml-2 block text-sm text-gray-900">Spedito</label>
            </div>
            <div className="flex items-center">
              <input
                id="consegnato"
                name="status"
                type="radio"
                checked={status === 'Consegnato'}
                onChange={() => setStatus('Consegnato')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="consegnato" className="ml-2 block text-sm text-gray-900">Consegnato</label>
            </div>
             <div className="flex items-center">
              <input
                id="svincolato"
                name="status"
                type="radio"
                checked={status === 'Svincolato'}
                onChange={() => setStatus('Svincolato')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="svincolato" className="ml-2 block text-sm text-gray-900">Svincolato</label>
            </div>
             <div className="flex items-center">
              <input
                id="non-ritirato"
                name="status"
                type="radio"
                checked={status === 'Non ritirato'}
                onChange={() => setStatus('Non ritirato')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <label htmlFor="non-ritirato" className="ml-2 block text-sm text-gray-900">Non ritirato</label>
            </div>
          </div>
        </div>

        {status === 'Spedito' && (
          <div>
            <label htmlFor="trackingCode" className="block text-sm font-medium text-gray-700">
              Codice di Tracciamento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="trackingCode"
              value={trackingCode}
              onChange={(e) => {
                setTrackingCode(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Es. T123456789IT"
            />
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="bg-primary text-on-primary font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200"
        >
          Salva Modifiche
        </button>
      </div>
    </div>
  );
};

export default LogisticsOrderModal;