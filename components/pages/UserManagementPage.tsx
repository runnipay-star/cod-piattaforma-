import React, { useState } from 'react';
import { User } from '../../types';
import UserTable from '../UserTable';
import CreateUserModal from '../CreateUserModal';
import EditUserModal from '../EditUserModal';
import { PlusIcon } from '../Icons';

interface UserManagementPageProps {
  currentUser: User;
  users: User[];
  onCreateUser: (user: Omit<User, 'id'> & { password?: string }) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ currentUser, users, onCreateUser, onUpdateUser, onDeleteUser }) => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestione Utenti</h2>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Crea Utente
        </button>
      </div>
      
      <UserTable currentUser={currentUser} users={users} onEditUser={setEditingUser} onDeleteUser={onDeleteUser} />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onCreateUser={onCreateUser}
        onClose={() => setCreateModalOpen(false)}
        users={users}
      />

      <EditUserModal
        user={editingUser}
        onUpdateUser={onUpdateUser}
        onClose={() => setEditingUser(null)}
        users={users}
      />
    </div>
  );
};

export default React.memo(UserManagementPage);