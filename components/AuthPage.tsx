import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLocalization } from '../hooks/useLocalization';
import { Role } from '../types';

export const AuthPage: React.FC = () => {
    const { t } = useLocalization();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const generateSourceId = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now().toString(36);
    };

    const handleAuthAction = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                if (!name) {
                    throw new Error(t('nameRequired'));
                }
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user) {
                    // NOTE: You need to create a `profiles` table in Supabase
                    // with columns: id (uuid, primary key, references auth.users), name (text), 
                    // role (text), and source_id (text).
                    const { error: profileError } = await supabase.from('profiles').insert({
                        id: data.user.id,
                        name: name,
                        role: Role.AFFILIATE,
                        source_id: generateSourceId(name)
                    });
                    if (profileError) throw profileError;
                }
            }
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-neutral mb-2">
                    MWS <span className="text-secondary">Platform</span>
                </h1>
                <p className="text-center text-gray-500 mb-6">{isLogin ? t('welcomeBack') : t('createYourAccount')}</p>
                
                <form onSubmit={handleAuthAction}>
                    {!isLogin && (
                         <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">{t('fullName')}</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">{t('email')}</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">{t('password')}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
                    >
                        {loading ? t('processing') : (isLogin ? t('login') : t('register'))}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-600 mt-6">
                    {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                    <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-semibold text-secondary hover:text-primary ml-1">
                        {isLogin ? t('registerHere') : t('loginHere')}
                    </button>
                </p>
            </div>
        </div>
    );
};