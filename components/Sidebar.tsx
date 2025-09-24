import React, { useState, useMemo } from 'react';
import { UserRole, View, User } from '../types';
import { HomeIcon, ShieldCheckIcon, BriefcaseIcon, UsersIcon, CubeIcon, PhoneIcon, TruckIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, ShoppingCartIcon } from './Icons';

interface SidebarProps {
  currentUser: User;
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
    view: View,
    label: string,
    icon: React.ReactNode,
    currentView: View,
    onViewChange: (view: View) => void
}> = ({ view, label, icon, currentView, onViewChange }) => {
    const isActive = currentView === view;
    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onViewChange(view);
                }}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    isActive
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
                <span className="w-6 h-6">{icon}</span>
                <span className="ml-4 font-semibold text-sm">{label}</span>
            </a>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentView, onViewChange, onLogout }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setSettingsMenuOpen] = useState(false);

  const availableNavItems = useMemo(() => {
    const allItems: { view: View; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
      { view: 'dashboard', label: 'Dashboard', icon: <HomeIcon />, roles: Object.values(UserRole) },
      { view: 'orders', label: 'Ordini', icon: <ShoppingCartIcon />, roles: Object.values(UserRole) },
      { view: 'customers', label: 'Clienti', icon: <UsersIcon />, roles: [UserRole.ADMIN, UserRole.MANAGER] },
      { view: 'products', label: 'Prodotti', icon: <CubeIcon />, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.AFFILIATE, UserRole.SUPPLIER] },
      { view: UserRole.ADMIN, label: 'Pannello Admin', icon: <ShieldCheckIcon />, roles: [UserRole.ADMIN] },
      // FIX: Changed admin-only views to use string literals instead of UserRole enums to match App.tsx switch cases.
      // Admin-only views for other roles
      { view: 'Vista Manager', label: 'Vista Manager', icon: <BriefcaseIcon />, roles: [UserRole.ADMIN] },
      { view: 'Vista Affiliati', label: 'Vista Affiliati', icon: <UsersIcon />, roles: [UserRole.ADMIN] },
      { view: 'Vista Call Center', label: 'Vista Call Center', icon: <PhoneIcon />, roles: [UserRole.ADMIN] },
      { view: 'Vista Fornitori', label: 'Vista Fornitori', icon: <BriefcaseIcon />, roles: [UserRole.ADMIN] },
    ];

    // Filter items based on the current user's role and apply correct labels.
    return allItems
        .filter(item => item.roles.includes(currentUser.role))
        .map(item => {
            if (item.view === 'dashboard') {
                const label = currentUser.role === UserRole.ADMIN ? 'Dashboard Generale' : 'Mia Dashboard';
                return { ...item, label };
            }
            return item;
        });

  }, [currentUser.role]);


  const sidebarContent = (
      <div className="flex-1 flex flex-col w-64 p-5">
            <div className="hidden md:block text-2xl font-bold text-orange-400 mb-8">
                Dashboard PRO
            </div>
            <nav className="flex-1">
                <ul className="space-y-2">
                    {availableNavItems.map(item => (
                         <NavItem 
                            key={item.view}
                            view={item.view}
                            label={item.label}
                            icon={item.icon}
                            currentView={currentView}
                            onViewChange={(view) => {
                                onViewChange(view);
                                setMobileMenuOpen(false); // Chiude il menu su mobile
                            }}
                        />
                    ))}
                </ul>
            </nav>
            {/* User Info and Logout */}
            <div className="relative mt-auto pt-4 border-t border-slate-700">
                 {isSettingsMenuOpen && (
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setSettingsMenuOpen(false)}
                        aria-hidden="true"
                    />
                 )}
                {isSettingsMenuOpen && (
                    <div className="absolute bottom-full mb-2 w-full bg-slate-700 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 animate-fade-in py-1">
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            onViewChange('settings');
                            setSettingsMenuOpen(false);
                        }} className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-600">
                            <Cog6ToothIcon className="w-5 h-5 mr-3" />
                            Impostazioni
                        </a>
                    </div>
                )}
                <button 
                    onClick={() => setSettingsMenuOpen(!isSettingsMenuOpen)}
                    className="flex items-center w-full p-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white mr-3 shrink-0">
                       {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden text-left">
                        <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-slate-400">{currentUser.role}</p>
                    </div>
                </button>
                 <button
                    onClick={onLogout}
                    className="w-full flex items-center p-3 mt-2 rounded-lg transition-colors duration-200 text-slate-300 hover:bg-red-500/20 hover:text-red-400"
                 >
                    <ArrowRightOnRectangleIcon className="w-6 h-6"/>
                    <span className="ml-4 font-semibold text-sm">Logout</span>
                </button>
            </div>
        </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-slate-800 text-white fixed top-0 left-0 right-0 z-30">
        <h1 className="text-xl font-bold text-orange-400">Dashboard PRO</h1>
        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu" className="p-2">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="bg-slate-800 text-white hidden md:flex md:flex-col md:w-64">
        {sidebarContent}
      </aside>

      {/* Sidebar for Mobile (Drawer) */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <aside className="bg-slate-800 text-white w-64 h-full flex flex-col">
          {sidebarContent}
        </aside>
      </div>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black opacity-50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
    </>
  );
};

export default Sidebar;