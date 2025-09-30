import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Performance from './components/Performance';
import Conversions from './components/Conversions';
import LiveStatistics from './components/LiveStatistics';
import OrderQuality from './components/OrderQuality';
import Payments from './components/Payments';
import RequestPayout from './components/RequestPayout';
import Header from './components/Header';
import { LanguageProvider } from './LanguageContext';
import { type User, UserRole } from './types';
import Profile from './components/Profile';
import Settings from './components/Settings';
import UserManagement from './components/UserManagement';
import { api } from './services/api';
import Logistics from './components/Logistics';
import ProfitCalculator from './components/ProfitCalculator';

const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
        const usersData = await api.getUsers();
        setAllUsers(usersData);
        setCurrentUser(usersData[0]);
    };
    loadUsers();
  }, []);

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
  };

  const handleUserAdded = (newUser: User) => {
    setAllUsers(prev => [...prev, newUser].sort((a,b) => a.id - b.id));
  };
  
  const handleUserUpdated = (updatedUser: User) => {
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };
  
  if (!currentUser) {
      return <div>Loading application...</div>;
  }
  
  const defaultPath = currentUser.role === UserRole.LOGISTICS ? "/logistics" : "/dashboard";

  return (
    <LanguageProvider>
      <HashRouter>
        <div className="flex h-screen bg-gray-100 font-sans">
          <Sidebar currentUser={currentUser} allUsers={allUsers} onUserChange={handleUserChange} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <Header currentUser={currentUser} />
            <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8 pt-24">
              <Routes>
                <Route path="/" element={<Navigate to={defaultPath} replace />} />
                <Route path="/logistics" element={<Logistics currentUser={currentUser} allUsers={allUsers} />} />
                <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
                <Route path="/results" element={<Navigate to="/results/performance" replace />} />
                <Route path="/results/performance" element={<Performance currentUser={currentUser} allUsers={allUsers} />} />
                <Route path="/results/conversions" element={<Conversions currentUser={currentUser} allUsers={allUsers} />} />
                <Route path="/results/live-statistics" element={<LiveStatistics currentUser={currentUser} />} />
                <Route path="/results/order-quality" element={<OrderQuality currentUser={currentUser} allUsers={allUsers}/>} />
                <Route path="/products" element={<Products currentUser={currentUser} />} />
                <Route path="/products/:id" element={<ProductDetail currentUser={currentUser} allUsers={allUsers} />} />
                <Route path="/payments" element={<Navigate to="/payments/transfers" replace />} />
                <Route path="/payments/transfers" element={<Payments currentUser={currentUser} allUsers={allUsers} />} />
                <Route path="/payments/request" element={<RequestPayout currentUser={currentUser} allUsers={allUsers} />} />
                <Route path="/users" element={<UserManagement currentUser={currentUser} onUserAdded={handleUserAdded} onUserUpdated={handleUserUpdated} />} />
                <Route path="/profit-calculator" element={<ProfitCalculator currentUser={currentUser} />} />
                <Route path="/profile" element={<Profile currentUser={currentUser} />} />
                <Route path="/settings" element={<Settings currentUser={currentUser} onUserChange={handleUserUpdated} />} />
              </Routes>
            </div>
          </main>
        </div>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;