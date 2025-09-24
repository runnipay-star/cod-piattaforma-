import React from 'react';
import { User } from '../types';
import { PencilSquareIcon, TrashIcon } from './Icons';

interface UserTableProps {
  currentUser: User;
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ currentUser, users, onEditUser, onDeleteUser }) => {
  if (users.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Elenco Utenti</h3>
        <p className="text-slate-500">Nessun utente da visualizzare.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ruolo</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Team</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUser.id;
              return (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.team || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => onEditUser(user)} className="text-orange-600 hover:text-orange-900 focus:outline-none" title="Modifica">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => !isCurrentUser && window.confirm('Sei sicuro di voler eliminare questo utente?') && onDeleteUser(user.id)} 
                      className="text-red-600 hover:text-red-900 focus:outline-none disabled:text-slate-400 disabled:hover:text-slate-400 disabled:cursor-not-allowed" 
                      title={isCurrentUser ? "Non puoi eliminare te stesso" : "Elimina"}
                      disabled={isCurrentUser}>
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(UserTable);