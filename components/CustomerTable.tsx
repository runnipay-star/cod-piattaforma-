import React from 'react';
import { Customer, User, UserRole } from '../types';

interface CustomerTableProps {
  customers: Customer[];
  currentUser: User;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, currentUser }) => {

  if (customers.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nessun Cliente Trovato</h3>
        <p className="text-slate-500">Non ci sono clienti che corrispondono alla tua ricerca.</p>
      </div>
    );
  }

  const canSeeLeadDetails = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;

  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contatti</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordini Totali</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Spesa Totale</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ultimo Ordine</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{canSeeLeadDetails ? customer.name : 'Dato Protetto'}</div>
                  <div className="text-xs text-slate-500">{canSeeLeadDetails ? customer.address : 'Indirizzo Protetto'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-800">{canSeeLeadDetails ? customer.phone : 'Telefono Protetto'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-slate-700">{customer.totalOrders}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">€{customer.totalSpent.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(customer.lastOrderDate).toLocaleDateString('it-IT')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(CustomerTable);