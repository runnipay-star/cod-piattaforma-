import React, { useState, useEffect, useMemo } from 'react';
import { type User, type Sale, type Payout, type Product, UserRole, OrderStatus, PayoutStatus } from '../types';
import { api } from '../services/api';
import { useTranslation } from '../LanguageContext';

const MINIMUM_PAYOUT_AMOUNT = 50;

interface RequestPayoutProps {
    currentUser: User;
    allUsers: User[];
}

const RequestPayout: React.FC<RequestPayoutProps> = ({ currentUser, allUsers }) => {
    const { t } = useTranslation();
    const [sales, setSales] = useState<Sale[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [payoutAmount, setPayoutAmount] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState('PayPal');

    const isAffiliate = currentUser.role === UserRole.AFFILIATE;
    const isAdminOrManager = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER;
    
    const affiliateUsers = useMemo(() => allUsers.filter(u => u.role === UserRole.AFFILIATE), [allUsers]);

    const [selectedAffiliateId, setSelectedAffiliateId] = useState<string>(() => {
        if (isAdminOrManager && affiliateUsers.length > 0) {
            return String(affiliateUsers[0].id);
        }
        return '';
    });
    
    const targetAffiliateId = useMemo(() => {
        if (isAffiliate) return currentUser.id;
        if (isAdminOrManager && selectedAffiliateId) return parseInt(selectedAffiliateId, 10);
        return null;
    }, [currentUser, isAffiliate, isAdminOrManager, selectedAffiliateId]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [salesData, payoutsData, productsData] = await Promise.all([
                    api.getSales(), 
                    api.getPayouts(),
                    api.getProducts()
                ]);
                setSales(salesData);
                setPayouts(payoutsData);
                setProducts(productsData);
            } catch (err) {
                console.error("Failed to fetch payment data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const availableBalance = useMemo(() => {
        if (!targetAffiliateId || products.length === 0) return 0;

        const affiliateSales = sales.filter(s => s.affiliateId === targetAffiliateId);

        const salesByProduct = affiliateSales.reduce((acc, sale) => {
            const { productId } = sale;
            if (!acc[productId]) {
                acc[productId] = [];
            }
            acc[productId].push(sale);
            return acc;
        }, {} as Record<string, Sale[]>);

        const payableStatuses = [OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.RELEASED, OrderStatus.SHIPPED];

        let totalEarned = 0;

        for (const productIdStr in salesByProduct) {
            const productId = parseInt(productIdStr, 10);
            const productSales = salesByProduct[productId];
            const product = products.find(p => p.id === productId);

            if (!product || typeof product.tolerance === 'undefined' || product.tolerance === null) {
                // Case 1: Product not found or has no tolerance set -> default logic
                const earnedForProduct = productSales
                    .filter(s => payableStatuses.includes(s.status))
                    .reduce((sum, s) => sum + s.commissionValue, 0);
                totalEarned += earnedForProduct;
            } else {
                // Case 2: Tolerance logic applies
                const totalLeads = productSales.length;
                if (totalLeads === 0) continue;

                const approvedLeads = productSales.filter(s => payableStatuses.includes(s.status)).length;
                const approvalRate = (approvedLeads / totalLeads) * 100;
                const requiredRate = 100 - product.tolerance;

                if (approvalRate >= requiredRate) {
                    // Pay for ALL leads for this product
                    const earnedForProduct = productSales.reduce((sum, s) => sum + s.commissionValue, 0);
                    totalEarned += earnedForProduct;
                } else {
                    // Pay only for approved leads
                    const earnedForProduct = productSales
                        .filter(s => payableStatuses.includes(s.status))
                        .reduce((sum, s) => sum + s.commissionValue, 0);
                    totalEarned += earnedForProduct;
                }
            }
        }

        const totalPaidOrPending = payouts
            .filter(p => p.affiliateId === targetAffiliateId && (p.status === PayoutStatus.PAID || p.status === PayoutStatus.PENDING))
            .reduce((sum, p) => sum + p.amount, 0);

        return totalEarned - totalPaidOrPending;
    }, [sales, payouts, products, targetAffiliateId]);
    
    useEffect(() => {
        setPayoutAmount('');
        setError('');
        setSuccess('');
    }, [selectedAffiliateId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!targetAffiliateId) {
             setError('Please select an affiliate.');
             return;
        }

        if (typeof payoutAmount !== 'number' || payoutAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (payoutAmount < MINIMUM_PAYOUT_AMOUNT) {
            setError(t('minimumPayout', { amount: String(MINIMUM_PAYOUT_AMOUNT) }));
            return;
        }
        if (payoutAmount > availableBalance) {
            setError(t('insufficientFunds'));
            return;
        }

        setIsSubmitting(true);
        try {
            const newPayout = await api.requestPayout(targetAffiliateId, payoutAmount, paymentMethod);
            setPayouts(prev => [...prev, newPayout]);
            setSuccess(t('requestSent'));
            setPayoutAmount('');
        } catch (err) {
            setError('Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) {
        return <div className="text-center p-8">{t('loadingData')}</div>;
    }
    
    const descriptionText = isAdminOrManager ? t('payoutRequestAdminDescription') : t('payoutRequestDescription');

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">{t('requestPayout')}</h2>
                <p className="text-gray-500 mt-1">{descriptionText}</p>
            </div>

            {isAdminOrManager && (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <label htmlFor="affiliate-select" className="block text-sm font-medium text-gray-700">{t('requestingFor')}</label>
                    <select
                        id="affiliate-select"
                        name="affiliate-select"
                        value={selectedAffiliateId}
                        onChange={(e) => setSelectedAffiliateId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {affiliateUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col justify-center">
                         <h3 className="text-sm font-medium text-gray-500">{t('availableForPayout')}</h3>
                         <p className="text-4xl font-bold text-green-600 mt-2">€{availableBalance.toFixed(2)}</p>
                         <p className="text-xs text-gray-400 mt-3">{t('balanceCalculationNoteWithTolerance')}</p>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                        <fieldset disabled={isSubmitting || !targetAffiliateId}>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="payoutAmount" className="block text-sm font-medium text-gray-700">{t('payoutAmount')} (€)</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">€</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="payoutAmount"
                                            id="payoutAmount"
                                            value={payoutAmount}
                                            onChange={(e) => setPayoutAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center">
                                            <button 
                                                type="button"
                                                onClick={() => setPayoutAmount(Math.floor(availableBalance * 100) / 100)}
                                                className="text-xs text-blue-600 font-semibold hover:underline pr-4"
                                            >
                                                MAX
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">{t('paymentMethod')}</label>
                                    <select
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        <option>PayPal</option>
                                        <option>Bank Transfer</option>
                                    </select>
                                </div>
                                
                                {error && <p className="text-sm text-red-600">{error}</p>}
                                {success && <p className="text-sm text-green-600">{success}</p>}
                                
                                <div className="text-right">
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                                    >
                                        {isSubmitting ? `${t('saving')}...` : t('requestPayoutCta')}
                                    </button>
                                </div>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RequestPayout;