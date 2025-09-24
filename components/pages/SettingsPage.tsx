import React, { useState } from 'react';
import { User } from '../../types';

interface SettingsPageProps {
    currentUser: User;
    onUpdateProfile: (newName: string) => void;
    onUpdatePassword: (newPassword: string) => void;
}

// FIX: Completed the component implementation to return JSX and added a default export.
const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateProfile, onUpdatePassword }) => {
    const [name, setName] = useState(currentUser.name);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && name.trim() !== currentUser.name) {
            onUpdateProfile(name.trim());
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);

        if (!newPassword) {
            setPasswordError('La nuova password non può essere vuota.');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('La password deve contenere almeno 6 caratteri.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setPasswordError('Le password non corrispondono.');
            return;
        }

        onUpdatePassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800">Impostazioni Account</h1>
            
            {/* Sezione Profilo */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 border-b pb-4 mb-6">Profilo</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="settings-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="settings-email"
                            value={currentUser.email}
                            disabled
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-100 cursor-not-allowed sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="settings-name" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            id="settings-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Salva Modifiche Profilo
                        </button>
                    </div>
                </form>
            </div>

            {/* Sezione Sicurezza */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 border-b pb-4 mb-6">Sicurezza</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">Nuova Password</label>
                        <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            placeholder="Minimo 6 caratteri"
                        />
                    </div>
                     <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">Conferma Nuova Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        />
                    </div>
                    {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                    <div className="flex justify-end">
                         <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Aggiorna Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
