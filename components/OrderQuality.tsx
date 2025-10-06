import React from 'react';
import { Sale, Product, User } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface OrderQualityProps {
    sales: Sale[];
    products: Product[];
    affiliates: User[];
    currentUser: User | null;
}

export const OrderQuality: React.FC<OrderQualityProps> = () => {
    const { t } = useLocalization();
    
    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-neutral mb-6">{t('orderQuality')}</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
                <h3 className="text-xl font-bold text-neutral">{t('orderQuality')}</h3>
                <p className="text-gray-500 mt-2">Questa sezione è in fase di sviluppo.</p>
            </div>
        </div>
    );
};
