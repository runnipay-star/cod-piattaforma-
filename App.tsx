import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, getUserProfile } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { User, UserRole, View, Order, Product, Niche, ProductStatus, OrderStatus } from './types';
import Sidebar from './components/Sidebar';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import InitialLoader from './components/InitialLoader';
import MainDashboard from './components/MainDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import AffiliateDashboard from './components/dashboards/AffiliateDashboard';
import SupplierDashboard from './components/dashboards/SupplierDashboard';
import CallCenterDashboard from './components/dashboards/CallCenterDashboard';
import LogisticsDashboard from './components/dashboards/LogisticsDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ProductManagementPage from './components/pages/ProductManagementPage';
import OrderManagementPage from './components/pages/OrderManagementPage';
import CustomerManagementPage from './components/pages/CustomerManagementPage';
import SettingsPage from './components/pages/SettingsPage';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [niches, setNiches] = useState<Niche[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Inizializzazione...');
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [authView, setAuthView] = useState<'login' | 'register'>('login');

    useEffect(() => {
        setLoading(true);
        setLoadingMessage('Verifica autenticazione...');
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                getUserProfile(session.user.id).then(profile => {
                    setCurrentUser(profile);
                });
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                getUserProfile(session.user.id).then(profile => {
                    setCurrentUser(profile);
                });
            } else {
                setCurrentUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        setLoadingMessage('Caricamento dati...');
        try {
            const [usersRes, productsRes, ordersRes, nichesRes] = await Promise.all([
                supabase.from('users').select('*'),
                supabase.from('products').select('*').order('created_at', { ascending: false }),
                supabase.from('orders').select('*').order('date', { ascending: false }),
                supabase.from('niches').select('*')
            ]);

            if (usersRes.error) throw usersRes.error;
            if (productsRes.error) throw productsRes.error;
            if (ordersRes.error) throw ordersRes.error;
            if (nichesRes.error) throw nichesRes.error;

            setUsers(usersRes.data as User[]);
            setProducts(productsRes.data as Product[]);
            setOrders(ordersRes.data as Order[]);
            setNiches(nichesRes.data as Niche[]);
        } catch (error) {
            console.error("Errore nel caricamento dei dati:", error);
            alert("Impossibile caricare i dati della piattaforma.");
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if(currentUser) {
            fetchData();
        }
    }, [currentUser, fetchData]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentView('dashboard');
    };
    
    // CRUD Handlers
    const handleCreateUser = async (userData: Omit<User, 'id'> & { password?: string }): Promise<void> => {
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password!,
            options: {
                data: {
                    name: userData.name,
                }
            }
        });

        if (signUpError) {
            alert(signUpError.message);
            return;
        }

        if (data.user) {
            const { error: updateError } = await supabase.from('users')
                .update({ role: userData.role, team: userData.team })
                .eq('id', data.user.id);

            if (updateError) {
                alert(`Utente creato ma ruolo/team non impostato: ${updateError.message}`);
            }
        }
        await fetchData();
    };

    const handleUpdateUser = async (userData: User): Promise<void> => {
        const { error } = await supabase.from('users').update({ name: userData.name, email: userData.email, role: userData.role, team: userData.team }).eq('id', userData.id);
        if (error) alert(error.message);
        else await fetchData();
    };

    const handleDeleteUser = async (userId: string): Promise<void> => {
        alert("L'eliminazione di utenti tramite l'interfaccia non è sicura e andrebbe gestita tramite una Funzione Supabase (admin). Questa azione è disabilitata.");
        console.log("Tentativo di eliminare utente (disabilitato):", userId);
    };
    
    const handleUpdateProductStatus = async (productId: string, status: ProductStatus): Promise<void> => {
        const { error } = await supabase.from('products').update({ status }).eq('id', productId);
        if (error) alert(error.message);
        else await fetchData();
    };

    const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (error) alert(error.message);
        else await fetchData();
    };

    const handleCreateProduct = async (productData: Omit<Product, 'id' | 'status' | 'created_at'>, creatorRole: UserRole): Promise<boolean> => {
        const status = (creatorRole === UserRole.ADMIN || creatorRole === UserRole.MANAGER) ? ProductStatus.APPROVED : ProductStatus.PENDING;
        const { error } = await supabase.from('products').insert([{ ...productData, status }]);
        if (error) {
            alert(error.message);
            return false;
        }
        await fetchData();
        return true;
    };
    
    const handleUpdateProduct = async (productId: string, updateData: Partial<Product>): Promise<boolean> => {
        const { error } = await supabase.from('products').update(updateData).eq('id', productId);
        if (error) {
            alert(error.message);
            return false;
        }
        await fetchData();
        return true;
    };

    const handleDeleteProduct = async (productId: string): Promise<void> => {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) alert(error.message);
        else await fetchData();
    };

    const handleCreateNiche = async (nicheData: Omit<Niche, 'id'>): Promise<boolean> => {
        const { error } = await supabase.from('niches').insert([nicheData]);
        if (error) {
            alert(error.message);
            return false;
        }
        await fetchData();
        return true;
    };

    const handleUpdateNiche = async (nicheData: Niche): Promise<void> => {
        const { error } = await supabase.from('niches').update({ name: nicheData.name, description: nicheData.description }).eq('id', nicheData.id);
        if (error) alert(error.message);
        else await fetchData();
    };

    const handleDeleteNiche = async (nicheId: string): Promise<void> => {
        const { error } = await supabase.from('niches').delete().eq('id', nicheId);
        if (error) alert(error.message);
        else await fetchData();
    };

    const handleUpdateProfile = async (newName: string): Promise<void> => {
        const { error } = await supabase.from('users').update({ name: newName }).eq('id', currentUser!.id);
        if(error) alert(error.message);
        else {
            alert('Profilo aggiornato!');
            await fetchData();
        }
    };
    const handleUpdatePassword = async (newPassword: string): Promise<void> => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if(error) alert(error.message);
        else alert('Password aggiornata con successo!');
    };
    
    const handleCreateOrder = async (orderData: Omit<Order, 'id' | 'date' | 'createdAt' | 'status' | 'conversionId'>): Promise<boolean> => {
        const { count, error: countError } = await supabase.from('orders').select('id', { count: 'exact', head: true });
        if(countError) {
            alert(countError.message);
            return false;
        }
        const newConversionId = (count || 0) + 1;

        const { error } = await supabase.from('orders').insert([{ ...orderData, date: new Date().toISOString(), status: OrderStatus.PENDING, conversionId: newConversionId }]);
        if(error) {
            alert(error.message);
            return false;
        }
        await fetchData();
        return true;
    };

    const handleUpdateOrder = async (orderData: Order): Promise<boolean> => {
        const { id, ...updateData } = orderData;
        const { error } = await supabase.from('orders').update(updateData).eq('id', id);
        if(error) {
            alert(error.message);
            return false;
        }
        await fetchData();
        return true;
    };
    
    const handleDeleteOrder = async (orderId: string): Promise<void> => {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) alert(error.message);
        else await fetchData();
    };
    
    // Memoized data filters
    const roleFilteredData = useMemo(() => {
        if (!currentUser) return {};
    
        switch (currentUser.role) {
            case UserRole.MANAGER: {
                const teamAffiliates = users.filter(u => u.role === UserRole.AFFILIATE && u.team === currentUser.team);
                const teamAffiliateIds = teamAffiliates.map(a => a.id);
                const teamOrders = orders.filter(o => teamAffiliateIds.includes(o.affiliateId));
                return { teamAffiliates, teamOrders };
            }
            case UserRole.AFFILIATE: {
                const affiliateOrders = orders.filter(o => o.affiliateId === currentUser.id);
                return { affiliateOrders };
            }
            case UserRole.SUPPLIER: {
                const supplierProducts = products.filter(p => p.supplier_id === currentUser.id);
                const supplierProductIds = supplierProducts.map(p => p.id);
                const supplierOrders = orders.filter(o => supplierProductIds.includes(o.productId));
                return { supplierProducts, supplierOrders };
            }
            case UserRole.CALL_CENTER: {
                const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
                return { pendingOrders };
            }
            case UserRole.LOGISTICS: {
                const logisticOrders = orders.filter(o => [OrderStatus.READY_FOR_SHIPPING, OrderStatus.SHIPPED].includes(o.status));
                return { logisticOrders };
            }
            default:
                return {};
        }
    }, [currentUser, users, products, orders]);

    const renderView = () => {
        if (!currentUser) return null;
    
        const adminViewRoleMapping: Record<string, UserRole> = {
            'Vista Manager': UserRole.MANAGER,
            'Vista Affiliati': UserRole.AFFILIATE,
            'Vista Fornitori': UserRole.SUPPLIER,
            'Vista Call Center': UserRole.CALL_CENTER,
        };

        if (currentUser.role === UserRole.ADMIN && adminViewRoleMapping[currentView]) {
            const mockUser: User = { ...currentUser, id: 'admin-view', role: adminViewRoleMapping[currentView] };
            setCurrentView(adminViewRoleMapping[currentView]);
        }

        switch (currentView) {
            case 'dashboard':
                if (currentUser.role === UserRole.ADMIN) return <MainDashboard orders={orders} users={users} products={products} />;
                if (currentUser.role === UserRole.MANAGER) return <ManagerDashboard currentUser={currentUser} teamAffiliates={roleFilteredData.teamAffiliates || []} teamOrders={roleFilteredData.teamOrders || []} />;
                if (currentUser.role === UserRole.AFFILIATE) return <AffiliateDashboard currentUser={currentUser} orders={roleFilteredData.affiliateOrders || []} products={products} users={users} />;
                if (currentUser.role === UserRole.SUPPLIER) return <SupplierDashboard currentUser={currentUser} orders={roleFilteredData.supplierOrders || []} products={roleFilteredData.supplierProducts || []} niches={niches} users={users} onUpdateStatus={handleUpdateOrderStatus} onCreateProduct={handleCreateProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} />;
                if (currentUser.role === UserRole.CALL_CENTER) return <CallCenterDashboard currentUser={currentUser} orders={roleFilteredData.pendingOrders || []} users={users} products={products} onUpdateStatus={handleUpdateOrderStatus} />;
                if (currentUser.role === UserRole.LOGISTICS) return <LogisticsDashboard currentUser={currentUser} orders={roleFilteredData.logisticOrders || []} users={users} products={products} onUpdateStatus={handleUpdateOrderStatus} />;
                return null;
            
            case 'products':
                return <ProductManagementPage products={products} niches={niches} suppliers={users.filter(u => u.role === UserRole.SUPPLIER)} affiliates={users.filter(u => u.role === UserRole.AFFILIATE)} currentUser={currentUser} onCreateProduct={handleCreateProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onCreateNiche={handleCreateNiche} onUpdateNiche={handleUpdateNiche} onDeleteNiche={handleDeleteNiche} />;
            case 'orders':
                 return <OrderManagementPage orders={orders} users={users} products={products} currentUser={currentUser} onCreateOrder={handleCreateOrder} onUpdateOrder={handleUpdateOrder} onDeleteOrder={handleDeleteOrder} />;
            case 'customers':
                return <CustomerManagementPage orders={orders} currentUser={currentUser} />;
            case 'settings':
                return <SettingsPage currentUser={currentUser} onUpdateProfile={handleUpdateProfile} onUpdatePassword={handleUpdatePassword} />;
            
            case UserRole.ADMIN:
            case 'Vista Manager':
            case 'Vista Affiliati':
            case 'Vista Fornitori':
            case 'Vista Call Center':
                return <AdminDashboard currentUser={currentUser} users={users} products={products} orders={orders} onCreateUser={handleCreateUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onUpdateProductStatus={handleUpdateProductStatus} />;
                
            default:
                return <MainDashboard orders={orders} users={users} products={products} />;
        }
    };

    if (loading) {
        return <InitialLoader message={loadingMessage} />;
    }

    if (!session) {
        return authView === 'login'
            ? <LoginPage onSwitchToRegister={() => setAuthView('register')} />
            : <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }

    if (!currentUser) {
        return <InitialLoader message="Caricamento profilo utente..." />;
    }

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <Sidebar currentUser={currentUser} currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                {renderView()}
            </main>
        </div>
    );
};

export default App;
