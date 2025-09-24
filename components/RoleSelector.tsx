
import React from 'react';
import { UserRole } from '../types';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => {
  const roles: UserRole[] = Object.values(UserRole);

  return (
    <div className="relative">
      <select
        value={selectedRole}
        onChange={(e) => onRoleChange(e.target.value as UserRole)}
        className="appearance-none w-full sm:w-48 bg-white border border-slate-300 text-slate-700 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default RoleSelector;