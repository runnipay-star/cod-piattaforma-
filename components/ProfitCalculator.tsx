import React, { useState, useMemo } from 'react';
import { type User } from '../types';
import { useTranslation } from '../LanguageContext';

interface CalculatorInput {
    purchasePrice: string;
    sellingPrice: string;
    shippingCost: string;
    affiliateCommission: string;
    logisticsCommission: string;
    leadManagementCommission: string;
    returnRate: string;
    returnCost: string;
    quantity: string;
}

const CalculatorIcons = {
    Revenue: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Costs: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Profit: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    Margin: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>,
    Affiliate: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Logistics: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10" /></svg>,
    Lead: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    Return: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" /></svg>,
};


const ResultCard: React.FC<{ title: string; value: string; icon: React.ReactNode; valueColor?: string }> = ({ title, value, icon, valueColor }) => (
    <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-medium text-gray-500">{title}</h4>
            <p className={`text-xl font-bold mt-1 ${valueColor || 'text-gray-800'}`}>{value}</p>
        </div>
    </div>
);

const InputField: React.FC<{ name: keyof CalculatorInput; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ name, label, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
            </div>
            <input type="text" inputMode="decimal" id={name} name={name} value={value}
                onChange={onChange} placeholder="0,00"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-4 py-3 text-lg border-gray-300 rounded-md" />
        </div>
    </div>
);

const PercentageInputField: React.FC<{ name: keyof CalculatorInput; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ name, label, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input type="text" inputMode="decimal" id={name} name={name} value={value}
                onChange={onChange} placeholder="0"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-7 py-3 text-lg border-gray-300 rounded-md" />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
            </div>
        </div>
    </div>
);


const QuantityInputField: React.FC<{ name: keyof CalculatorInput; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ name, label, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input type="text" inputMode="numeric" id={name} name={name} value={value}
            onChange={onChange} placeholder="0"
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-3 text-lg border-gray-300 rounded-md" />
    </div>
);

const parseCurrency = (val: string): number => {
    if (typeof val !== 'string' || val.trim() === '') return 0;

    const lastComma = val.lastIndexOf(',');
    const lastDot = val.lastIndexOf('.');

    let numberString = val;
    
    // Handles European format like "1.234,56"
    if (lastComma > -1 && lastComma > lastDot) {
        numberString = numberString.replace(/\./g, '').replace(',', '.');
    } 
    // Handles American format like "1,234.56"
    else if (lastDot > -1 && lastDot > lastComma) {
         numberString = numberString.replace(/,/g, '');
    }
    // Handles simple comma decimal like "1234,56"
    else if (lastComma > -1) {
        numberString = numberString.replace(',', '.');
    }
    
    const parsed = parseFloat(numberString);
    return isNaN(parsed) ? 0 : parsed;
};


const ProfitCalculator: React.FC<{ currentUser: User }> = () => {
    const { t } = useTranslation();
    const [inputs, setInputs] = useState<CalculatorInput>({
        purchasePrice: '', sellingPrice: '', shippingCost: '',
        affiliateCommission: '', logisticsCommission: '', leadManagementCommission: '',
        returnRate: '',
        returnCost: '',
        quantity: '',
    });
    const [periodInMonths, setPeriodInMonths] = useState(1);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const { singleSaleResults, projectedResults } = useMemo(() => {
        const purchasePrice = parseCurrency(inputs.purchasePrice);
        const sellingPrice = parseCurrency(inputs.sellingPrice);
        const shippingCost = parseCurrency(inputs.shippingCost);
        const affiliateCommission = parseCurrency(inputs.affiliateCommission);
        const logisticsCommission = parseCurrency(inputs.logisticsCommission);
        const leadManagementCommission = parseCurrency(inputs.leadManagementCommission);
        const returnRate = parseCurrency(inputs.returnRate);
        const returnCost = parseCurrency(inputs.returnCost);
        const quantity = parseInt(inputs.quantity.replace(/[^0-9]/g, ''), 10) || 0;

        if (sellingPrice <= 0) {
            return { singleSaleResults: null, projectedResults: null };
        }
        
        const effectiveReturnCost = (returnRate / 100) * returnCost;

        const grossRevenue = sellingPrice;
        const totalCosts = purchasePrice + shippingCost + affiliateCommission + logisticsCommission + leadManagementCommission + effectiveReturnCost;
        const platformNetProfit = grossRevenue - totalCosts;
        const profitMargin = grossRevenue > 0 ? (platformNetProfit / grossRevenue) * 100 : 0;

        const singleSale = {
            grossRevenue, totalCosts, platformNetProfit, profitMargin,
            affiliateProfit: affiliateCommission, logisticsProfit: logisticsCommission, leadManagementProfit: leadManagementCommission,
        };
        
        const projected = quantity > 0 ? {
            projectedPlatformNetProfit: platformNetProfit * quantity * periodInMonths,
            projectedAffiliateProfit: affiliateCommission * quantity * periodInMonths,
            projectedLogisticsProfit: logisticsCommission * quantity * periodInMonths,
            projectedLeadManagementProfit: leadManagementCommission * quantity * periodInMonths,
            projectedReturnCosts: effectiveReturnCost * quantity * periodInMonths,
        } : null;

        return { singleSaleResults: singleSale, projectedResults: projected };
    }, [inputs, periodInMonths]);

    const periodOptions = [
        { label: t('oneMonth'), value: 1 }, { label: t('threeMonths'), value: 3 },
        { label: t('sixMonths'), value: 6 }, { label: t('oneYear'), value: 12 },
    ];
    
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">{t('profitCalculatorTitle')}</h2>
                <p className="text-gray-500 mt-1">{t('profitCalculatorDescription')}</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-6">{t('productConfiguration')}</h3>
                    <div className="space-y-4">
                        <InputField name="purchasePrice" label={t('productPurchasePrice')} value={inputs.purchasePrice} onChange={handleInputChange} />
                        <InputField name="sellingPrice" label={t('productSellingPrice')} value={inputs.sellingPrice} onChange={handleInputChange} />
                        <InputField name="shippingCost" label={t('codShippingCost')} value={inputs.shippingCost} onChange={handleInputChange} />
                        <InputField name="affiliateCommission" label={t('affiliateCommission')} value={inputs.affiliateCommission} onChange={handleInputChange} />
                        <InputField name="logisticsCommission" label={t('logisticsCommission')} value={inputs.logisticsCommission} onChange={handleInputChange} />
                        <InputField name="leadManagementCommission" label={t('leadManagementCommission')} value={inputs.leadManagementCommission} onChange={handleInputChange} />
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4">
                           <PercentageInputField name="returnRate" label={t('expectedReturnRate')} value={inputs.returnRate} onChange={handleInputChange} />
                           <InputField name="returnCost" label={t('costPerReturn')} value={inputs.returnCost} onChange={handleInputChange} />
                        </div>
                    </div>
                    
                    <div className="border-t pt-6 mt-6">
                        <h4 className="text-md font-semibold text-gray-700 mb-4">{t('salesProjection')}</h4>
                        <div className="space-y-4">
                            <QuantityInputField name="quantity" label={t('projectedSalesPerMonth')} value={inputs.quantity} onChange={handleInputChange} />
                            <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">{t('projectionPeriod')}</label>
                                 <div className="flex items-center space-x-2">
                                    {periodOptions.map(option => (
                                        <button key={option.value} onClick={() => setPeriodInMonths(option.value)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${periodInMonths === option.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                            {option.label}
                                        </button>
                                    ))}
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="xl:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-6">{t('profitAnalysis')}</h3>
                    {!singleSaleResults ? (
                         <div className="flex items-center justify-center h-full text-gray-500">
                            <p>{t('enterValuesToCalculate')}</p>
                        </div>
                    ) : (
                         <div className="space-y-8">
                            <div>
                                <h4 className="text-md font-semibold text-gray-600 mb-4">{t('singleSaleResults')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ResultCard title={t('grossRevenuePerSale')} value={`€${singleSaleResults.grossRevenue.toFixed(2)}`} icon={<CalculatorIcons.Revenue />} />
                                    <ResultCard title={t('totalCostsPerSale')} value={`€${singleSaleResults.totalCosts.toFixed(2)}`} icon={<CalculatorIcons.Costs />} />
                                    <ResultCard title={t('profitMargin')} value={`${singleSaleResults.profitMargin.toFixed(2)}%`} icon={<CalculatorIcons.Margin />} valueColor={singleSaleResults.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'} />
                                    <ResultCard title={t('platformNetProfitPerSale')} value={`€${singleSaleResults.platformNetProfit.toFixed(2)}`} icon={<CalculatorIcons.Profit />} valueColor={singleSaleResults.platformNetProfit >= 0 ? 'text-green-600' : 'text-red-600'} />
                                    <ResultCard title={t('affiliateProfitPerSale')} value={`€${singleSaleResults.affiliateProfit.toFixed(2)}`} icon={<CalculatorIcons.Affiliate />} />
                                    <ResultCard title={t('logisticsProfitPerSale')} value={`€${singleSaleResults.logisticsProfit.toFixed(2)}`} icon={<CalculatorIcons.Logistics />} />
                                    <ResultCard title={t('leadManagementProfitPerSale')} value={`€${singleSaleResults.leadManagementProfit.toFixed(2)}`} icon={<CalculatorIcons.Lead />} />
                                </div>
                            </div>
                            
                            {projectedResults && (
                                <div className="border-t pt-6">
                                    <h4 className="text-md font-semibold text-gray-600 mb-4">{t('projectedResults', {period: periodOptions.find(p=>p.value === periodInMonths)?.label || ''})}</h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <ResultCard title={t('projectedPlatformNetProfit')} value={`€${projectedResults.projectedPlatformNetProfit.toFixed(2)}`} icon={<CalculatorIcons.Profit />} valueColor={projectedResults.projectedPlatformNetProfit >= 0 ? 'text-green-600' : 'text-red-600'} />
                                         <ResultCard title={t('projectedAffiliateProfit')} value={`€${projectedResults.projectedAffiliateProfit.toFixed(2)}`} icon={<CalculatorIcons.Affiliate />} />
                                         <ResultCard title={t('projectedLogisticsProfit')} value={`€${projectedResults.projectedLogisticsProfit.toFixed(2)}`} icon={<CalculatorIcons.Logistics />} />
                                         <ResultCard title={t('projectedLeadManagementProfit')} value={`€${projectedResults.projectedLeadManagementProfit.toFixed(2)}`} icon={<CalculatorIcons.Lead />} />
                                         <ResultCard title={t('projectedReturnCosts')} value={`€${projectedResults.projectedReturnCosts.toFixed(2)}`} icon={<CalculatorIcons.Return />} valueColor="text-yellow-600" />
                                     </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfitCalculator;