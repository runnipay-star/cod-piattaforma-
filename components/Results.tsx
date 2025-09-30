import React from 'react';
import { type User } from '../types';
import { useTranslation } from '../LanguageContext';

interface ResultsProps {
  currentUser: User;
}

const Results: React.FC<ResultsProps> = ({ currentUser }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">{t('results')}</h2>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600">{t('resultsPageUnderConstruction')}</p>
      </div>
    </div>
  );
};

export default Results;
