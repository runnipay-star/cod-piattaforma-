import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { type User, UserRole } from '../types';
// Fix: Removed unused 'USERS' import which is not exported from constants.
import { Icons } from '../constants';
import { useTranslation } from '../LanguageContext';

interface SidebarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  allUsers: User[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, onUserChange, allUsers }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsResultsOpen(location.pathname.startsWith('/results'));
    setIsPaymentsOpen(location.pathname.startsWith('/payments'));
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = allUsers.find(u => u.id === parseInt(event.target.value));
    if (selectedUser) {
      onUserChange(selectedUser);
    }
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;
  
  const subMenuNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'text-white'
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`;
    
  const profileMenuNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${
      isActive
        ? 'bg-gray-100 text-gray-900'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const isResultsActive = location.pathname.startsWith('/results');
  const isPaymentsActive = location.pathname.startsWith('/payments');

  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="flex items-center justify-center h-16 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wider">MWS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {currentUser.role === UserRole.LOGISTICS ? (
           <NavLink to="/logistics" className={navLinkClasses}>
              <Icons.Products className="h-5 w-5 mr-3" />
              {t('leads')}
           </NavLink>
        ) : (
          <>
            <NavLink to="/dashboard" className={navLinkClasses}>
              <Icons.Dashboard className="h-5 w-5 mr-3" />
              {t('dashboard')}
            </NavLink>
            
            <div>
              <button
                onClick={() => setIsResultsOpen(!isResultsOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none ${
                  isResultsActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <Icons.Results className="h-5 w-5 mr-3" />
                  <span>{t('results')}</span>
                </div>
                <Icons.ChevronDown className={`h-5 w-5 transform transition-transform duration-200 ${isResultsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isResultsOpen && (
                <div className="pl-8 py-2 space-y-1">
                  <NavLink to="/results/performance" className={subMenuNavLinkClasses}>
                    <Icons.Performance className="h-5 w-5 mr-3" />
                    {t('performance')}
                  </NavLink>
                  <NavLink to="/results/conversions" className={subMenuNavLinkClasses}>
                    <Icons.Conversions className="h-5 w-5 mr-3" />
                    {t('conversions')}
                  </NavLink>
                  <NavLink to="/results/live-statistics" className={subMenuNavLinkClasses}>
                    <Icons.LiveStatistics className="h-5 w-5 mr-3" />
                    {t('liveStatistics')}
                  </NavLink>
                  <NavLink to="/results/order-quality" className={subMenuNavLinkClasses}>
                    <Icons.OrderQuality className="h-5 w-5 mr-3" />
                    {t('orderQuality')}
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/products" className={navLinkClasses}>
              <Icons.Products className="h-5 w-5 mr-3" />
              {t('products')}
            </NavLink>

            <div>
              <button
                onClick={() => setIsPaymentsOpen(!isPaymentsOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none ${
                  isPaymentsActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <Icons.Payments className="h-5 w-5 mr-3" />
                  <span>{t('payments')}</span>
                </div>
                <Icons.ChevronDown className={`h-5 w-5 transform transition-transform duration-200 ${isPaymentsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPaymentsOpen && (
                <div className="pl-8 py-2 space-y-1">
                  <NavLink to="/payments/request" className={subMenuNavLinkClasses}>
                    <Icons.RequestPayout className="h-5 w-5 mr-3" />
                    {t('requestPayout')}
                  </NavLink>
                  <NavLink to="/payments/transfers" className={subMenuNavLinkClasses}>
                    <Icons.Transfers className="h-5 w-5 mr-3" />
                    {t('transfers')}
                  </NavLink>
                </div>
              )}
            </div>
            
            {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER) && (
                <>
                    <NavLink to="/users" className={navLinkClasses}>
                        <Icons.Users className="h-5 w-5 mr-3" />
                        {t('userManagement')}
                    </NavLink>
                    <NavLink to="/profit-calculator" className={navLinkClasses}>
                        <Icons.ProfitCalculator className="h-5 w-5 mr-3" />
                        {t('profitCalculator')}
                    </NavLink>
                </>
            )}
          </>
        )}
      </nav>
      <div className="p-4 border-t border-gray-700" ref={profileMenuRef}>
        <div className="mb-4">
          <label htmlFor="user-select" className="block text-xs font-medium text-gray-400 mb-1">
            {t('simulateUser')}
          </label>
          <div className="relative">
            <select
              id="user-select"
              value={currentUser.id}
              onChange={handleUserChange}
              className="w-full pl-3 pr-8 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.role})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <Icons.ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="relative">
          {isProfileMenuOpen && (
            <div
              className="absolute bottom-full w-full mb-2 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
            >
              <NavLink
                to="/profile"
                className={profileMenuNavLinkClasses}
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Icons.Profile className="h-4 w-4 mr-3 text-gray-500" />
                <span>{t('profile')}</span>
              </NavLink>
              <NavLink
                to="/settings"
                className={profileMenuNavLinkClasses}
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Icons.Settings className="h-4 w-4 mr-3 text-gray-500" />
                <span>{t('settings')}</span>
              </NavLink>
            </div>
          )}
          <button
            id="user-menu-button"
            onClick={() => setIsProfileMenuOpen(prev => !prev)}
            className="w-full flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none"
            aria-haspopup="true"
            aria-expanded={isProfileMenuOpen}
          >
            <img src={currentUser.avatar} alt={`${currentUser.firstName} ${currentUser.lastName}`} className="h-10 w-10 rounded-full object-cover" />
            <div className="ml-3 text-left flex-1">
              <p className="text-sm font-semibold">{`${currentUser.firstName} ${currentUser.lastName}`}</p>
              <p className="text-xs text-gray-400">{currentUser.role}</p>
            </div>
            <Icons.ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;