import React, { useState, useMemo } from 'react';
import { UserRole, User } from '../types';
import { XMarkIcon } from './Icons';

interface CreateUserModalProps {
  isOpen: boolean;
  onCreateUser: (user: Omit<User, 'id'> & { password?: string }) => void;
  onClose: () => void;
  users: User[];
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onCreateUser, onClose, users }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.AFFILIATE);
  const [team, setTeam] = useState('');
  const [managerId, setManagerId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const managers = useMemo(() => users.filter(u => u.role === UserRole.MANAGER), [users]);

  if (!isOpen) {
    return null;
  }

  const rolesWithTeamInput = [UserRole.MANAGER, UserRole.CALL_CENTER];
  const showTeamTextInput = rolesWithTeamInput.includes(role);
  const showManagerSelect = role === UserRole.AFFILIATE;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole(UserRole.AFFILIATE);
    setTeam('');
    setManagerId('');
    setError(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
        setError("La password deve contenere almeno 6 caratteri.");
        return;
    }

    if (!name || !email) return;

    let finalTeam: string | undefined;

    if (showManagerSelect) {
        const selectedManager = managers.find(m => m.id === managerId);
        finalTeam = selectedManager ? selectedManager.team : undefined;
    } else if (showTeamTextInput) {
        finalTeam = team ? team : undefined;
    }
    
    const newUser = {
      name,
      email,
      password,
      role,
      team: finalTeam,
    };

    onCreateUser(newUser);
    resetForm();
    onClose();
  };
  
  const handleClose = () => {
      resetForm();
      onClose();
  }

  const handleRoleChange = (selectedRole: UserRole) => {
      setRole(selectedRole);
      setTeam('');
      setManagerId('');
  }

  const selectableRoles: UserRole[] = Object.values(UserRole).filter(r => r !== UserRole.ADMIN);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-slate-800">Crea Nuovo Utente</h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <XMarkIcon className="h-6 w-6" />
                <span className="sr-only">Chiudi</span>
            </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div>
                    <label htmlFor="create-name" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input
                        type="text"
                        id="create-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="es. Mario Rossi"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="create-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                        type="email"
                        id="create-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="es. mario.rossi@example.com"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="create-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                        type="password"
                        id="create-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="Minimo 6 caratteri"
                        required
                    />
                    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                </div>
                <div>
                    <label htmlFor="create-role" className="block text-sm font-medium text-slate-700 mb-1">Ruolo</label>
                    <select
                        id="create-role"
                        value={role}
                        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                        className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    >
                        {selectableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                
                {showManagerSelect && (
                    <div>
                        <label htmlFor="create-manager" className="block text-sm font-medium text-slate-700 mb-1">Assegna a un team (Opzionale)</label>
                        <select
                            id="create-manager"
                            value={managerId}
                            onChange={(e) => setManagerId(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        >
                            <option value="">Nessun team</option>
                            {managers.map(manager => (
                                <option key={manager.id} value={manager.id}>{manager.name} ({manager.team})</option>
                            ))}
                        </select>
                    </div>
                )}

                {showTeamTextInput && (
                    <div>
                        <label htmlFor="create-team" className="block text-sm font-medium text-slate-700 mb-1">Team (Opzionale)</label>
                        <input
                            type="text"
                            id="create-team"
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            placeholder="es. Team Alpha"
                        />
                    </div>
                )}
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl flex-shrink-0 border-t border-slate-200">
                <button
                    type="button"
                    onClick={handleClose}
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
    </div>
  );
};

export default CreateUserModal;