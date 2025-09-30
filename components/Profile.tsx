import React from 'react';
import { type User } from '../types';
import { useTranslation } from '../LanguageContext';

interface ProfileProps {
  currentUser: User;
}

const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  const { t } = useTranslation();

  // The Account ID for transfers is the user's numeric ID.
  const accountId = currentUser.id;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">{t('profile')}</h2>
        <p className="text-gray-500 mt-1">{t('profileDetails')}</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          <div className="flex-shrink-0 mb-6 md:mb-0">
            <img 
              src={currentUser.avatar} 
              alt={`${currentUser.firstName} ${currentUser.lastName}`} 
              className="h-32 w-32 rounded-full object-cover shadow-lg"
            />
          </div>
          <div className="flex-1 w-full">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('name')}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{`${currentUser.firstName} ${currentUser.lastName}`}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('email')}</label>
                <p className="mt-1 text-lg text-gray-700">{currentUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Role</label>
                <p className="mt-1 text-lg text-gray-700">{currentUser.role}</p>
              </div>
              <div>
                <label htmlFor="platform-id" className="block text-sm font-medium text-gray-500">{t('platformAccountId')}</label>
                <input
                    id="platform-id"
                    type="text"
                    readOnly
                    value={accountId}
                    className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-600 focus:outline-none"
                />
                <p className="mt-2 text-xs text-gray-500">{t('accountIdDescription')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;