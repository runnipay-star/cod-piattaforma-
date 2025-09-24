import React, { useState } from 'react';
import { Niche } from '../types';
import { XMarkIcon } from './Icons';

interface CreateNicheModalProps {
  isOpen: boolean;
  onCreateNiche: (niche: Omit<Niche, 'id'>) => Promise<boolean>;
  onClose: () => void;
}

const CreateNicheModal: React.FC<CreateNicheModalProps> = ({ isOpen, onCreateNiche, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;
    
    const resetForm = () => {
        setName('');
        setDescription('');
        setLoading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim() || loading) return;
        setLoading(true);
        
        const success = await onCreateNiche({ name, description });
        
        setLoading(false);
        if (success) {
            resetForm();
            onClose();
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-slate-800">Crea Nuova Nicchia</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                        <span className="sr-only">Chiudi</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                        <div>
                            <label htmlFor="niche-name-create" className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                            <input type="text" id="niche-name-create" value={name} onChange={e => setName(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="es. Fitness" required />
                        </div>
                        <div>
                            <label htmlFor="niche-desc-create" className="block text-sm font-medium text-slate-700 mb-1">Descrizione</label>
                            <textarea id="niche-desc-create" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" placeholder="Una breve descrizione della nicchia" required />
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl flex-shrink-0 border-t border-slate-200">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">Annulla</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400">
                           {loading ? 'Salvataggio...' : 'Salva Nicchia'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNicheModal;