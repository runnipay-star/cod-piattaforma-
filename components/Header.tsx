import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { User } from '../types';
import { Language } from '../utils/translations';
import { GlobeIcon, ChevronDownIcon } from './icons';

interface HeaderProps {
  currentUser: User | null;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onLogout: () => void;
}

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const languages: { code: Language; name: string }[] = [
        { code: 'it', name: 'Italiano' },
        { code: 'en', name: 'English' },
        { code: 'ro', name: 'Română' },
    ];

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-white hover:text-accent transition duration-150"
            >
                <GlobeIcon className="h-5 w-5" />
                <span>{languages.find(l => l.code === language)?.name}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20">
                    <ul className="py-1">
                        {languages.map(lang => (
                            <li key={lang.code}>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleLanguageChange(lang.code); }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    {lang.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ currentUser, allUsers, onSwitchUser, onLogout }) => {
    const { t } = useLocalization();

    return (
        <header className="fixed top-0 left-0 right-0 bg-neutral shadow-md p-4 flex justify-between items-center z-50">
            <h1 className="text-2xl font-bold text-white">
                MWS <span className="text-secondary">Platform</span>
            </h1>
            <div className="flex items-center space-x-6">
                 {currentUser && (
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-300 flex items-center">
                            <span className="hidden sm:inline mr-2">{t('loggedInAs')}: </span>
                            <select 
                                value={currentUser.id} 
                                onChange={(e) => onSwitchUser(e.target.value)}
                                className="bg-neutral text-white font-semibold border-none focus:ring-0 rounded-md text-sm p-1"
                            >
                                {allUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                         <button onClick={onLogout} className="text-sm text-gray-300 hover:text-white bg-secondary/20 px-3 py-1 rounded-md transition">
                            Logout
                        </button>
                    </div>
                )}
                <LanguageSwitcher />
            </div>
        </header>
    );
};