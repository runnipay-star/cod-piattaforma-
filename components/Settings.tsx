import React, { useState, useEffect } from 'react';
import { type User } from '../types';
import { useTranslation } from '../LanguageContext';
import { api } from '../services/api';

interface SettingsProps {
  currentUser: User;
  onUserChange: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, onUserChange }) => {
  const { t } = useTranslation();

  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatar: '',
    dateOfBirth: '',
    taxCode: '',
    vatNumber: '',
    street: '',
    city: '',
    zip: '',
    country: '',
  });

  const [contacts, setContacts] = useState({
    phone: '',
    skype: '',
    telegram: '',
    whatsapp: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setPersonalData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || '',
      avatar: currentUser.avatar || '',
      dateOfBirth: currentUser.dateOfBirth || '',
      taxCode: currentUser.taxCode || '',
      vatNumber: currentUser.vatNumber || '',
      street: currentUser.address?.street || '',
      city: currentUser.address?.city || '',
      zip: currentUser.address?.zip || '',
      country: currentUser.address?.country || '',
    });
    setContacts({
      phone: currentUser.contacts?.phone || '',
      skype: currentUser.contacts?.skype || '',
      telegram: currentUser.contacts?.telegram || '',
      whatsapp: currentUser.contacts?.whatsapp || '',
    });
  }, [currentUser]);
  
  const showSuccessMessage = (message: string) => {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 3000);
  }

  const handlePersonalDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContactsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContacts(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handleSave = async (updates: Partial<User>) => {
    try {
        const updatedUser = await api.updateUser(currentUser.id, updates);
        onUserChange(updatedUser);
        return updatedUser;
    } catch (e) {
        console.error("Failed to save settings", e);
        // Optionally show an error message to the user
        return null;
    }
  }

  const handlePersonalDataSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<User> = {
        firstName: personalData.firstName,
        lastName: personalData.lastName,
        email: personalData.email,
        avatar: personalData.avatar,
        dateOfBirth: personalData.dateOfBirth,
        taxCode: personalData.taxCode,
        vatNumber: personalData.vatNumber,
        address: {
            street: personalData.street,
            city: personalData.city,
            zip: personalData.zip,
            country: personalData.country,
        }
    };
    if (await handleSave(updates)) {
      showSuccessMessage(t('dataSaved'));
    }
  };
  
  const handleContactsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<User> = {
        contacts: {
            phone: contacts.phone,
            skype: contacts.skype,
            telegram: contacts.telegram,
            whatsapp: contacts.whatsapp,
        }
    };
    if (await handleSave(updates)) {
      showSuccessMessage(t('dataSaved'));
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordData.newPassword) {
      setPasswordError(t('passwordRequired'));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('passwordsDoNotMatch'));
      return;
    }

    const updates: Partial<User> = {
      password: passwordData.newPassword,
    };
    
    if (await handleSave(updates)) {
        showSuccessMessage(t('passwordUpdated'));
        setPasswordData({ newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">{t('settings')}</h2>
        {successMessage && (
            <div className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg shadow-sm animate-pulse">
                {successMessage}
            </div>
        )}
      </div>

      {/* Personal Data Section */}
      <form onSubmit={handlePersonalDataSave} className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800">{t('personalData')}</h3>
        <p className="text-gray-500 mt-1 mb-6">{t('personalDataDescription')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">{t('firstName')}</label>
                <input type="text" id="firstName" name="firstName" value={personalData.firstName} onChange={handlePersonalDataChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">{t('lastName')}</label>
                <input type="text" id="lastName" name="lastName" value={personalData.lastName} onChange={handlePersonalDataChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('email')}</label>
                <input type="email" id="email" name="email" value={personalData.email} onChange={handlePersonalDataChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">{t('avatarUrl')}</label>
                <input type="url" id="avatar" name="avatar" value={personalData.avatar} onChange={handlePersonalDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">{t('dateOfBirth')}</label>
                <input type="date" id="dateOfBirth" name="dateOfBirth" value={personalData.dateOfBirth} onChange={handlePersonalDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div>
                <label htmlFor="taxCode" className="block text-sm font-medium text-gray-700">{t('taxCode')}</label>
                <input type="text" id="taxCode" name="taxCode" value={personalData.taxCode} onChange={handlePersonalDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div className="md:col-span-2">
                <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">{t('vatNumber')}</label>
                <input type="text" id="vatNumber" name="vatNumber" value={personalData.vatNumber} onChange={handlePersonalDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div className="md:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">{t('street')}</label>
                <input type="text" id="street" name="street" value={personalData.street} onChange={handlePersonalDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">{t('city')}</label>
                <input type="text" id="city" name="city" value={personalData.city} onChange={handlePersonalDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">{t('zipCode')}</label>
                <input type="text" id="zip" name="zip" value={personalData.zip} onChange={handlePersonalDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div className="md:col-span-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">{t('country')}</label>
                <select id="country" name="country" value={personalData.country} onChange={handlePersonalDataChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select a country</option>
                    <option value="IT">Italy</option>
                    <option value="GB">United Kingdom</option>
                    <option value="RO">Romania</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="ES">Spain</option>
                </select>
            </div>
        </div>
        <div className="flex justify-end mt-8">
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                {t('save')}
            </button>
        </div>
      </form>
      
      {/* Contacts Section */}
      <form onSubmit={handleContactsSave} className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800">{t('contacts')}</h3>
        <p className="text-gray-500 mt-1 mb-6">{t('contactsDescription')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('phoneNumber')}</label>
                <input type="tel" id="phone" name="phone" value={contacts.phone} onChange={handleContactsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">{t('whatsapp')}</label>
                <input type="tel" id="whatsapp" name="whatsapp" value={contacts.whatsapp} onChange={handleContactsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="telegram" className="block text-sm font-medium text-gray-700">{t('telegram')}</label>
                <input type="text" id="telegram" name="telegram" value={contacts.telegram} onChange={handleContactsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="skype" className="block text-sm font-medium text-gray-700">{t('skype')}</label>
                <input type="text" id="skype" name="skype" value={contacts.skype} onChange={handleContactsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
        </div>

        <div className="flex justify-end mt-8">
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                {t('save')}
            </button>
        </div>
      </form>
      
       {/* Change Password Section */}
      <form onSubmit={handlePasswordSave} className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800">{t('changePassword')}</h3>
        <p className="text-gray-500 mt-1 mb-6">{t('changePasswordDescription')}</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">{t('newPassword')}</label>
            <input 
              type="password" 
              id="newPassword" 
              name="newPassword" 
              value={passwordData.newPassword} 
              onChange={handlePasswordChange} 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">{t('confirmPassword')}</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              value={passwordData.confirmPassword} 
              onChange={handlePasswordChange} 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
        </div>

        <div className="flex justify-end mt-8">
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                {t('save')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;