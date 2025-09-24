import React, { useState } from 'react';
import { UserRole, User } from '../../types';
import { ArrowLeftIcon } from '../Icons';

interface CreateUserPageProps {
  onCreateUser: (user: Omit<User, 'id'> & { password?: string }) => void;
  onCancel: () => void;
}

const CreateUserPage: React.FC<CreateUserPageProps> = ({ onCreateUser, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.AFFILIATE);
  const [team, setTeam] = useState('');

  const rolesWithTeam = [UserRole.MANAGER, UserRole.AFFILIATE, UserRole.CALL_CENTER];
  const showTeamInput = rolesWithTeam.includes(role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    const newUser = {
      name,
      email,
      password,
      role,
      ...(showTeamInput && team && { team }),
    };

    onCreateUser(newUser);
  };

  const selectableRoles: UserRole[] = Object.values(UserRole).filter(r => r !== UserRole.ADMIN);

  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200">
        <div className="flex items-center p-5 border-b border-slate-200">
            <button onClick={onCancel} className="mr-4 text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <ArrowLeftIcon className="h-6 w-6" />
                <span className="sr-only">Indietro</span>
            </button>
            <h2 className="text-xl font-semibold text-slate-800">Crea Nuovo Utente</h2>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="es. Mario Rossi"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="es. mario.rossi@example.com"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Ruolo</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    >
                        {selectableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                {showTeamInput && (
                    <div>
                        <label htmlFor="team" className="block text-sm font-medium text-slate-700 mb-1">Team (Opzionale)</label>
                        <input
                            type="text"
                            id="team"
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            placeholder="es. Team Alpha"
                        />
                    </div>
                )}
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Salva Utente
                </button>
            </div>
        </form>
    </div>
  );
};

export default CreateUserPage;