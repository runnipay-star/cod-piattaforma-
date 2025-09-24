import React, { useState, useEffect } from 'react';
import { Niche } from '../types';
import { XMarkIcon } from './Icons';

interface EditNicheModalProps {
  niche: Niche | null;
  onUpdateNiche: (niche: Niche) => void;
  onClose: () => void;
}

const EditNicheModal: React.FC<EditNicheModalProps> = ({ niche, onUpdateNiche, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (niche) {
      setName(niche.name);
      setDescription(niche.description);
    }
  }, [niche]);

  if (!niche) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNiche({ ...niche, name, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 flex-shrink-0">
                <h2 className="text-xl font-semibold text-slate-800">Modifica Nicchia</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                    <span className="sr-only">Chiudi</span>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    <div>
                        <label htmlFor="niche-name-edit" className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                        <input type="text" id="niche-name-edit" value={name} onChange={e => setName(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="niche-desc-edit" className="block text-sm font-medium text-slate-700 mb-1">Descrizione</label>
                        <textarea id="niche-desc-edit" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" required />
                    </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl flex-shrink-0 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">Annulla</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">Salva Modifiche</button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default EditNicheModal;