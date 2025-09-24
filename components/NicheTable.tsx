import React from 'react';
import { Niche } from '../types';
import { PencilSquareIcon, TrashIcon } from './Icons';

interface NicheTableProps {
  niches: Niche[];
  onEditNiche: (niche: Niche) => void;
  onDeleteNiche: (nicheId: string) => void;
}

const NicheTable: React.FC<NicheTableProps> = ({ niches, onEditNiche, onDeleteNiche }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome Nicchia</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrizione</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {niches.map((niche) => (
              <tr key={niche.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{niche.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{niche.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  {/* FIX: Changed icon color to orange for UI consistency. */}
                  <button onClick={() => onEditNiche(niche)} className="text-orange-600 hover:text-orange-900 focus:outline-none" title="Modifica">
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => onDeleteNiche(niche.id)} className="text-red-600 hover:text-red-900 focus:outline-none" title="Elimina">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(NicheTable);