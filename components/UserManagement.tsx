import React, { useState, useEffect, useMemo } from 'react';
import { type User, UserRole } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../LanguageContext';

type UserFormData = Pick<User, 'firstName' | 'lastName' | 'email' | 'role' | 'managerId'> & { password?: string };

interface UserModalProps {
  userToEdit?: User;
  currentUser: User;
  managers: User[];
  onClose: () => void;
  onSave: (userData: UserFormData, userId?: number) => Promise<void>;
  isSaving: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ userToEdit, currentUser, managers, onClose, onSave, isSaving }) => {
  const { t } = useTranslation();
  const isEditMode = !!userToEdit;

  const getAvailableRoles = () => {
    if (currentUser.role === UserRole.ADMIN) {
      return [UserRole.ADMIN, UserRole.MANAGER, UserRole.AFFILIATE, UserRole.LOGISTICS];
    }
    if (currentUser.role === UserRole.MANAGER) {
      return [UserRole.AFFILIATE];
    }
    return [];
  };

  const [formData, setFormData] = useState<UserFormData>({
    firstName: userToEdit?.firstName || '',
    lastName: userToEdit?.lastName || '',
    email: userToEdit?.email || '',
    role: userToEdit?.role || getAvailableRoles()[0] || UserRole.AFFILIATE,
    managerId: userToEdit?.managerId,
    password: '',
  });
  
  useEffect(() => {
    // When a manager creates a new user, automatically assign the affiliate to them.
    if (!isEditMode && currentUser.role === UserRole.MANAGER) {
        setFormData(prev => ({
            ...prev,
            role: UserRole.AFFILIATE,
            managerId: currentUser.id
        }));
    }
  }, [isEditMode, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'role') {
        // If role changes away from Affiliate, clear the manager assignment
        const newRole = value as UserRole;
        setFormData(prev => ({
            ...prev,
            role: newRole,
            managerId: newRole === UserRole.AFFILIATE ? prev.managerId : undefined,
        }));
    } else if (name === 'managerId') {
        setFormData(prev => ({ ...prev, managerId: value ? parseInt(value, 10) : undefined }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, userToEdit?.id);
  };
  
  const canChangeRole = currentUser.role === UserRole.ADMIN;
  // An Admin can change manager assignment. A manager cannot.
  const canChangeManager = currentUser.role === UserRole.ADMIN;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? t('editUser') : t('addUser')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">{t('firstName')}</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">{t('lastName')}</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('email')}</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('password')}</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required={!isEditMode} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            {isEditMode && <p className="text-xs text-gray-500 mt-1">{t('passwordOptionalEdit')}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">{t('role')}</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange} required disabled={!canChangeRole} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                {getAvailableRoles().map(role => (
                    <option key={role} value={role}>{role}</option>
                ))}
                </select>
            </div>
            {formData.role === UserRole.AFFILIATE && (
                <div>
                    <label htmlFor="managerId" className="block text-sm font-medium text-gray-700">{t('assignToManager')}</label>
                    <select id="managerId" name="managerId" value={formData.managerId || ''} onChange={handleChange} disabled={!canChangeManager} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                      <option value="">{t('unassigned')}</option>
                      {managers.map(manager => (
                          <option key={manager.id} value={manager.id}>{manager.firstName} {manager.lastName}</option>
                      ))}
                    </select>
                </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50">{t('cancel')}</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
              {isSaving ? t('saving') : (isEditMode ? t('saveChanges') : t('createUser'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface UserManagementProps {
    currentUser: User;
    onUserAdded: (newUser: User) => void;
    onUserUpdated: (updatedUser: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, onUserAdded, onUserUpdated }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const managers = useMemo(() => users.filter(user => user.role === UserRole.MANAGER), [users]);

  useEffect(() => {
    const fetchUsers = async () => {
        try {
          setLoading(true);
          setError(null);
          const usersData = await api.getUsers();
          setUsers(usersData);
        } catch (err) {
          setError('Failed to fetch users.');
          console.error(err);
        } finally {
          setLoading(false);
        }
    };
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(undefined);
  };
  
  const handleSaveUser = async (userData: UserFormData, userId?: number) => {
    setIsSaving(true);
    try {
      if (userId) { // Editing existing user
        const payload: Partial<UserFormData> = { ...userData };
        if (!payload.password) {
          delete payload.password;
        }
        const updatedUser = await api.updateUser(userId, payload);
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
        onUserUpdated(updatedUser);
        setSuccessMessage(t('userUpdatedSuccessfully'));
      } else { // Adding new user
        const newUser = await api.createUser(userData);
        setUsers(prev => [...prev, newUser].sort((a,b) => a.id - b.id));
        onUserAdded(newUser);
        setSuccessMessage(t('userCreatedSuccessfully'));
      }
      handleCloseModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch(err) {
        console.error("Failed to save user", err);
        setError(userId ? t('failedToUpdateUser') : t('failedToCreateUser'));
    } finally {
        setIsSaving(false);
    }
  };
  
  const canEditUser = (user: User): boolean => {
    if (user.id === currentUser.id) return false; // Can't edit self
    if (currentUser.role === UserRole.ADMIN) return true;
    if (currentUser.role === UserRole.MANAGER) {
        return user.managerId === currentUser.id;
    }
    return false;
  };

  if (loading) {
    return <div className="text-center p-8">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <UserModal
          userToEdit={editingUser}
          currentUser={currentUser}
          managers={managers}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
          isSaving={isSaving}
        />
       )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">{t('userManagement')}</h2>
        <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
         </svg>
          {t('addUser')}
        </button>
      </div>
      
      {successMessage && (
          <div className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg shadow-sm">
              {successMessage}
          </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">{t('name')}</th>
                <th scope="col" className="px-6 py-3">{t('email')}</th>
                <th scope="col" className="px-6 py-3">{t('role')}</th>
                <th scope="col" className="px-6 py-3">{t('manager')}</th>
                <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                  const managerName = user.role === UserRole.AFFILIATE && user.managerId
                    ? users.find(m => m.id === user.managerId)?.firstName + ' ' + users.find(m => m.id === user.managerId)?.lastName
                    : null;

                  return (
                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="h-10 w-10 rounded-full object-cover"/>
                          <span>{user.firstName} {user.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4">
                        {user.role === UserRole.AFFILIATE
                            ? (managerName || <span className="text-gray-400 italic">{t('unassigned')}</span>)
                            : '—'
                        }
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canEditUser(user) && (
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {t('edit')}
                          </button>
                        )}
                      </td>
                    </tr>
                )
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;