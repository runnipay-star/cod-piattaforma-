import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { ProductPage } from './components/ProductPage';
import { Performance } from './components/Performance';
import { Conversions } from './components/Conversions';
import { OrderQuality } from './components/OrderQuality';
import { mockProducts, mockSales } from './data/mockData';
import { User, Product, Role } from './types';
import { LocalizationProvider, useLocalization } from './hooks/useLocalization';
import { ChevronDownIcon } from './components/icons';
import { supabase } from './supabaseClient';
import { AuthPage } from './components/AuthPage';
import { Session } from '@supabase/supabase-js';

type View =
  | { name: 'dashboard' }
  | { name: 'products' }
  | { name: 'results_performance' }
  | { name: 'results_conversions' }
  | { name: 'results_quality' }
  | { name: 'productDetail'; productId: string }
  | { name: 'newProduct' };

const AppContent: React.FC = () => {
    const [view, setView] = useState<View>({ name: 'dashboard' });
    const [session, setSession] = useState<Session | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null); 
    const [allUsers, setAllUsers] = useState<User[]>([]);

    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [sales] = useState(mockSales);
    const { t } = useLocalization();
    const [isResultsMenuOpen, setIsResultsMenuOpen] = useState(false);
    const resultsMenuRef = useRef<HTMLDivElement>(null);
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setSession(null);
        setAllUsers([]);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (session?.user) {
            const fetchUserProfile = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (data) {
                    const userProfile: User = {
                        id: data.id,
                        name: data.name,
                        role: data.role as Role,
                        sourceId: data.source_id,
                    };
                    setCurrentUser(userProfile);
                } else {
                    console.error("Error fetching profile or profile not found:", error);
                    handleLogout();
                }
            };
            fetchUserProfile();
        } else {
            setCurrentUser(null);
            setAllUsers([]);
        }
    }, [session]);
    
    useEffect(() => {
        const fetchAllUsers = async () => {
            if (currentUser && (currentUser.role === Role.ADMIN || currentUser.role === Role.MANAGER)) {
                const { data, error } = await supabase.from('profiles').select('*');
                if (data) {
                    const mappedUsers: User[] = data.map(profile => ({
                        id: profile.id,
                        name: profile.name,
                        role: profile.role as Role,
                        sourceId: profile.source_id,
                    }));
                    setAllUsers(mappedUsers);
                }
            } else if (currentUser) {
                setAllUsers([currentUser]);
            }
        };

        fetchAllUsers();
    }, [currentUser]);

    const affiliates = allUsers.filter(u => u.role === Role.AFFILIATE);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultsMenuRef.current && !resultsMenuRef.current.contains(event.target as Node)) {
                setIsResultsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const handleUserSwitch = (userId: string) => {
        const user = allUsers.find(u => u.id === userId);
        if(user) setCurrentUser(user);
    };

    const handleSelectProduct = (product: Product) => {
        setView({ name: 'productDetail', productId: product.id });
    };

    const handleAddProduct = () => {
        setView({ name: 'newProduct' });
    };

    const handleSaveProduct = (productToSave: Product) => {
        if (products.some(p => p.id === productToSave.id)) {
            setProducts(products.map(p => p.id === productToSave.id ? productToSave : p));
        } else {
            setProducts([...products, productToSave]);
        }
        setView({ name: 'products' });
    };
    
    const renderCurrentView = () => {
        switch (view.name) {
            case 'dashboard':
                return <Dashboard sales={sales} products={products} currentUser={currentUser} />;
            case 'results_performance':
                return <Performance sales={sales} products={products} affiliates={affiliates} currentUser={currentUser} />;
            case 'results_conversions':
                 return <Conversions sales={sales} products={products} affiliates={affiliates} currentUser={currentUser} />;
            case 'results_quality':
                return <OrderQuality sales={sales} products={products} affiliates={affiliates} currentUser={currentUser} />;
            case 'products':
                return (
                    <ProductList
                        products={products}
                        currentUser={currentUser}
                        onSelectProduct={handleSelectProduct}
                        onAddProduct={handleAddProduct}
                    />
                );
            case 'productDetail': {
                const product = products.find(p => p.id === view.productId);
                if (!product) {
                    setView({ name: 'products' });
                    return null;
                }
                return (
                    <ProductPage
                        product={product}
                        onBack={() => setView({ name: 'products' })}
                        onSave={handleSaveProduct}
                        currentUser={currentUser}
                        affiliates={affiliates}
                    />
                );
            }
            case 'newProduct':
                return (
                    <ProductPage
                        product={null}
                        onBack={() => setView({ name: 'products' })}
                        onSave={handleSaveProduct}
                        currentUser={currentUser}
                        affiliates={affiliates}
                    />
                );
            default:
                 return <Dashboard sales={sales} products={products} currentUser={currentUser} />;
        }
    };

    if (!session || !currentUser) {
        return <AuthPage />;
    }

    const isProductView = view.name === 'productDetail' || view.name === 'newProduct';
    const isResultsView = view.name.startsWith('results_');

    return (
        <div className="min-h-screen">
            <Header currentUser={currentUser} allUsers={allUsers} onSwitchUser={handleUserSwitch} onLogout={handleLogout} />
            <main className="pt-24 px-4 sm:px-6 lg:px-8">
                {!isProductView && (
                    <nav className="mb-6 flex justify-center">
                        <div className="flex space-x-2 bg-gray-200 p-1 rounded-full">
                            <button
                                onClick={() => setView({ name: 'dashboard' })}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition ${view.name === 'dashboard' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
                            >
                                {t('dashboard')}
                            </button>
                             <div className="relative" ref={resultsMenuRef}>
                                <button
                                    onClick={() => setIsResultsMenuOpen(!isResultsMenuOpen)}
                                    className={`flex items-center space-x-2 px-6 py-2 text-sm font-semibold rounded-full transition ${isResultsView ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
                                >
                                    <span>{t('results')}</span>
                                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${isResultsMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isResultsMenuOpen && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
                                        <a href="#" onClick={e => {e.preventDefault(); setView({ name: 'results_performance'}); setIsResultsMenuOpen(false);}} className={`block px-4 py-2 text-sm ${view.name === 'results_performance' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}>{t('performance')}</a>
                                        <a href="#" onClick={e => {e.preventDefault(); setView({ name: 'results_conversions'}); setIsResultsMenuOpen(false);}} className={`block px-4 py-2 text-sm ${view.name === 'results_conversions' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}>{t('conversions')}</a>
                                        <a href="#" onClick={e => {e.preventDefault(); setView({ name: 'results_quality'}); setIsResultsMenuOpen(false);}} className={`block px-4 py-2 text-sm ${view.name === 'results_quality' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}>{t('orderQuality')}</a>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setView({ name: 'products' })}
                                className={`px-6 py-2 text-sm font-semibold rounded-full transition ${view.name === 'products' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
                            >
                                {t('products')}
                            </button>
                        </div>
                    </nav>
                )}
                {renderCurrentView()}
            </main>
        </div>
    );
};

const App: React.FC = () => (
    <LocalizationProvider>
        <AppContent />
    </LocalizationProvider>
);

export default App;