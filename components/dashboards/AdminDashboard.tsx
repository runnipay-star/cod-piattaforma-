import React, { useState, useMemo } from 'react';
import { User, Product, Order, ProductStatus, UserRole } from '../../types';
import UserManagementPage from '../pages/UserManagementPage';
import ProductApprovalTable from '../ProductApprovalTable';
import AffiliatePerformancePage from '../pages/AffiliatePerformancePage';
import SupplierListPage from '../pages/SupplierListPage';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  products: Product[];
  orders: Order[];
  onCreateUser: (user: Omit<User, 'id'> & { password?: string }) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateProductStatus: (productId: string, status: ProductStatus) => void;
}

type AdminTab = 'users' | 'approvals' | 'affiliates' | 'suppliers';

const TabButton: React.FC<{tab: AdminTab, label: string, currentTab: AdminTab, onClick: (tab: AdminTab) => void}> = ({ tab, label, currentTab, onClick }) => (
    <button
        onClick={() => onClick(tab)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-100 ${
            currentTab === tab
                ? 'bg-orange-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-200'
        }`}
    >
        {label}
    </button>
);

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { currentUser, users, products, orders, onCreateUser, onUpdateUser, onDeleteUser, onUpdateProductStatus } = props;
    const [currentTab, setCurrentTab] = useState<AdminTab>('users');

    const pendingProducts = useMemo(() => 
        products.filter(p => p.status === ProductStatus.PENDING),
    [products]);

    const suppliers = useMemo(() =>
        users.filter(u => u.role === UserRole.SUPPLIER),
    [users]);
    
    const renderTabContent = () => {
        switch (currentTab) {
            case 'users':
                return <UserManagementPage currentUser={currentUser} users={users} onCreateUser={onCreateUser} onUpdateUser={onUpdateUser} onDeleteUser={onDeleteUser} />;
            case 'approvals':
                return <ProductApprovalTable products={pendingProducts} onUpdateProductStatus={onUpdateProductStatus} />;
            case 'affiliates':
                return <AffiliatePerformancePage users={users} orders={orders} />;
            case 'suppliers':
                return <SupplierListPage suppliers={suppliers} products={products} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Pannello di Amministrazione</h1>
            
            <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg space-x-2 border border-slate-200">
                <TabButton tab="users" label="Gestione Utenti" currentTab={currentTab} onClick={setCurrentTab} />
                <TabButton tab="approvals" label={`Approvazioni Prodotti (${pendingProducts.length})`} currentTab={currentTab} onClick={setCurrentTab} />
                <TabButton tab="affiliates" label="Performance Affiliati" currentTab={currentTab} onClick={setCurrentTab} />
                <TabButton tab="suppliers" label="Elenco Fornitori" currentTab={currentTab} onClick={setCurrentTab} />
            </div>

            <div className="mt-4">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default React.memo(AdminDashboard);