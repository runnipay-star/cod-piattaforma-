import React, { useState, useEffect, useMemo } from 'react';
import { type User, type Payout, type Transfer, PayoutStatus, TransactionStatus, UserRole } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../LanguageContext';

const getStatusColorClasses = (status: PayoutStatus | TransactionStatus): string => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-block";
    switch (status) {
        case PayoutStatus.PENDING: return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case PayoutStatus.PAID: return `${baseClasses} bg-green-100 text-green-800`;
        case PayoutStatus.FAILED: return `${baseClasses} bg-red-100 text-red-800`;
        case TransactionStatus.COMPLETED: return `${baseClasses} bg-blue-100 text-blue-800`;
        default: return `${baseClasses} bg-gray-200 text-gray-900`;
    }
};

interface DisplayTransaction {
    id: string;
    date: Date;
    details: string;
    amount: number;
    status: PayoutStatus | TransactionStatus;
}

interface PaymentsProps {
    currentUser: User;
    allUsers: User[];
}

const NewTransferModal: React.FC<{
    currentUser: User;
    allUsers: User[];
    onClose: () => void;
    onSuccess: () => void;
}> = ({ currentUser, allUsers, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [toUserId, setToUserId] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const recipientId = parseInt(toUserId, 10);

        if (isNaN(recipientId)) {
            setError(t('invalidRecipientId'));
            return;
        }
        
        if (recipientId === currentUser.id) {
            setError(t('cannotSendToSelf'));
            return;
        }
        
        const recipientExists = allUsers.find(u => u.id === recipientId);
        if (!recipientExists) {
            setError(t('recipientNotFound'));
            return;
        }

        if (typeof amount !== 'number' || amount <= 0) {
            setError(t('invalidAmount'));
            return;
        }

        setIsSubmitting(true);
        try {
            await api.createTransfer(currentUser.id, recipientId, amount, description);
            onSuccess();
        } catch (err) {
            console.error("Transfer failed:", err);
            setError(t('transferFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4 transform transition-transform scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{t('newTransfer')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">{t('recipientId')}</label>
                        <input
                            type="text"
                            id="recipient"
                            value={toUserId}
                            onChange={(e) => setToUserId(e.target.value)}
                            required
                            placeholder={t('recipientIdPlaceholder')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">{t('amountEur')}</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            required
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('descriptionOptional')}</label>
                        <textarea
                            id="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50">{t('cancel')}</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {isSubmitting ? t('saving') : t('sendTransfer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Payments: React.FC<PaymentsProps> = ({ currentUser, allUsers }) => {
    const { t } = useTranslation();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const getUserNameById = (id: number): string => {
        const user = allUsers.find(u => u.id === id);
        return user ? `${user.firstName} ${user.lastName}` : `ID: ${id}`;
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [payoutsData, transfersData] = await Promise.all([
                api.getPayouts(),
                api.getTransfers(),
            ]);
            setPayouts(payoutsData);
            setTransfers(transfersData);
        } catch (error) {
            console.error("Failed to fetch payment data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);
    
    const handleTransferSuccess = () => {
        setIsModalOpen(false);
        setSuccessMessage(t('transferSuccess'));
        fetchAllData(); // Refresh data
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const displayTransactions = useMemo(() => {
        const allPayouts = payouts
          .filter(p => currentUser.role !== UserRole.AFFILIATE || p.affiliateId === currentUser.id)
          .map((p): DisplayTransaction => ({
            id: `p-${p.id}`,
            date: p.date,
            details: `${t('payoutTo', { user: getUserNameById(p.affiliateId) })} via ${p.method}`,
            amount: p.amount,
            status: p.status,
          }));

        // Fix: Renamed map parameter from 't' to 'transfer' to avoid shadowing the 't' translation function.
        const allTransfers = transfers
          .filter(transfer => transfer.fromUserId === currentUser.id || transfer.toUserId === currentUser.id)
          .map((transfer): DisplayTransaction => ({
            id: `t-${transfer.id}`,
            date: transfer.date,
            details: transfer.description || t('fromTo', { fromUser: getUserNameById(transfer.fromUserId), toUser: getUserNameById(transfer.toUserId) }),
            amount: transfer.amount,
            status: TransactionStatus.COMPLETED,
          }));

        return [...allPayouts, ...allTransfers]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [payouts, transfers, currentUser, t, allUsers]);


    if (loading) {
        return <div className="text-center p-8">{t('loadingPayments')}</div>;
    }

    return (
        <div className="space-y-6">
            {isModalOpen && <NewTransferModal currentUser={currentUser} allUsers={allUsers} onClose={() => setIsModalOpen(false)} onSuccess={handleTransferSuccess} />}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">{t('transfers')}</h2>
                    <p className="text-gray-500 mt-1">{t('transfersDescription')}</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                     </svg>
                    <span>{t('newTransfer')}</span>
                </button>
            </div>
             {successMessage && (
                <div className="px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg shadow-sm">
                    {successMessage}
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {displayTransactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">{t('noPaymentsFound')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('tableHeaderDate')}</th>
                                    <th scope="col" className="px-6 py-3">{t('tableHeaderDetails')}</th>
                                    <th scope="col" className="px-6 py-3 text-right">{t('tableHeaderAmount')}</th>
                                    <th scope="col" className="px-6 py-3 text-center">{t('status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayTransactions.map(tx => (
                                    <tr key={tx.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{tx.details}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-800">€{tx.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={getStatusColorClasses(tx.status)}>{t(tx.status)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payments;