
import React, { useMemo, useState, useEffect } from 'react';
import { Sale, SaleStatus, User, UserRole } from '../types';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TruckIcon } from './icons/TruckIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface OrderListProps {
  sales: Sale[];
  onViewOrder: (sale: Sale) => void;
  onContactCustomer: (sale: Sale) => void;
  onManageOrder: (sale: Sale) => void;
  user: User;
  onOpenWhatsAppTemplateEditor: () => void;
  onRefreshData: () => Promise<void>;
  onShipOrder: (sale: Sale) => void;
  onUpdateSaleStatus: (saleId: string, status: SaleStatus) => Promise<void>;
}

const ALL_STATUSES: SaleStatus[] = ['In attesa', 'Contattato', 'Confermato', 'Annullato', 'Cancellato', 'Spedito', 'Svincolato', 'Consegnato', 'Duplicato', 'Non raggiungibile', 'Non ritirato', 'Test'];
const LOGISTICS_STATUSES: SaleStatus[] = ['Confermato', 'Spedito', 'Consegnato', 'Svincolato', 'Non ritirato'];

type TimePeriod = 'all' | 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';
const FILTERS_STORAGE_KEY = 'orderListFilters';

const getPeriodRange = (period: TimePeriod, customStart?: string, customEnd?: string): [Date, Date] => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    const setTimeToStart = (d: Date) => d.setHours(0, 0, 0, 0);
    const setTimeToEnd = (d: Date) => d.setHours(23, 59, 59, 999);

    switch (period) {
        case 'all':
            return [new Date(0), new Date()];
        case 'today':
            setTimeToStart(start);
            setTimeToEnd(end);
            break;
        case 'yesterday':
            start.setDate(start.getDate() - 1);
            end.setDate(end.getDate() - 1);
            setTimeToStart(start);
            setTimeToEnd(end);
            break;
        case 'this_week':
            const dayOfWeek = now.getDay();
            const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            start = new Date(now.setDate(diff));
            setTimeToStart(start);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            setTimeToEnd(end);
            break;
        case 'last_week':
            const before7days = new Date();
            before7days.setDate(now.getDate() - 7);
            const dayOfLastWeek = before7days.getDay();
            const diffLastWeek = before7days.getDate() - dayOfLastWeek + (dayOfLastWeek === 0 ? -6 : 1);
            start = new Date(before7days.setDate(diffLastWeek));
            setTimeToStart(start);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            setTimeToEnd(end);
            break;
        case 'this_month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setTimeToStart(start);
            setTimeToEnd(end);
            break;
        case 'last_month':
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
            setTimeToStart(start);
            setTimeToEnd(end);
            break;
        case 'custom':
            start = customStart ? new Date(customStart) : new Date(0);
            end = customEnd ? new Date(customEnd) : new Date();
            setTimeToStart(start);
            setTimeToEnd(end);
            break;
    }
    return [start, end];
};

interface GroupedData {
    subId: string;
    sales: Sale[];
    totalCommission: number;
    statusCounts: { [key in SaleStatus]?: number };
}

const SubIdGroup: React.FC<{
    group: GroupedData,
    onViewOrder: (sale: Sale) => void,
    getStatusBadge: (status: SaleStatus) => string,
    formatDate: (dateString: string) => string
}> = ({ group, onViewOrder, getStatusBadge, formatDate }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-surface rounded-xl shadow-md overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-4 hover:bg-gray-50 focus:outline-none transition-colors duration-150"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-gray-500 font-semibold uppercase">Sub ID</p>
                        <p className="font-bold text-primary truncate" title={group.subId}>{group.subId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Ordini</p>
                        <p className="font-semibold text-lg text-gray-800">{group.sales.length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Commissione</p>
                        <p className="font-bold text-lg text-green-600">€{group.totalCommission.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end items-center gap-2">
                        <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                            {Object.entries(group.statusCounts).map(([status, count]) => (
                                <span key={status} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(status as SaleStatus)}`}>
                                    {count}
                                </span>
                            ))}
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 ml-2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </button>
            {isOpen && (
                <div className="border-t border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prodotto</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ordine</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {group.sales.map(sale => (
                                    <tr key={sale.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewOrder(sale)}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatDate(sale.saleDate)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{sale.productName}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">€{sale.saleAmount.toFixed(2)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(sale.status)}`}>{sale.status}</span></td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">{sale.id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};


const OrderList: React.FC<OrderListProps> = ({ sales, onViewOrder, onContactCustomer, onManageOrder, user, onOpenWhatsAppTemplateEditor, onRefreshData, onShipOrder, onUpdateSaleStatus }) => {
  const isCustomerCare = user.role === UserRole.CUSTOMER_CARE;
  const isLogistics = user.role === UserRole.LOGISTICS;
  const isAffiliate = user.role === UserRole.AFFILIATE;
  const canEditStatus = !isAffiliate;

  const [filters, setFilters] = useState(() => {
    const initialFilters = {
        timePeriod: 'all' as TimePeriod,
        customStartDate: '',
        customEndDate: '',
        statusFilter: (isLogistics ? 'Confermato' : 'all') as SaleStatus | 'all',
        searchQuery: '',
        subIdQuery: '',
        showDuplicates: !isCustomerCare,
    };
    try {
        const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
        if (savedFilters) {
            return { ...initialFilters, ...JSON.parse(savedFilters) };
        }
    } catch (e) {
        console.error("Failed to parse filters from localStorage", e);
    }
    return initialFilters;
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [groupBySubId, setGroupBySubId] = useState(false);
  const [showOrderId, setShowOrderId] = useState(!isCustomerCare);
  
  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const handleFilterChange = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
      setFilters(prev => ({
          ...prev,
          [key]: value,
          // Reset custom dates if a predefined period is chosen
          ...(key === 'timePeriod' && value !== 'custom' && { customStartDate: '', customEndDate: '' }),
      }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshData();
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: SaleStatus) => {
    switch (status) {
        case 'Consegnato': return 'bg-green-100 text-green-800';
        case 'Svincolato': return 'bg-teal-100 text-teal-800';
        case 'Spedito': return 'bg-blue-100 text-blue-800';
        case 'Contattato': return 'bg-sky-100 text-sky-800';
        case 'Confermato': return 'bg-indigo-100 text-indigo-800';
        case 'In attesa': return 'bg-yellow-100 text-yellow-800';
        case 'Annullato': return 'bg-orange-100 text-orange-800';
        case 'Non ritirato': return 'bg-orange-100 text-orange-800';
        case 'Cancellato': return 'bg-red-100 text-red-800';
        case 'Non raggiungibile': return 'bg-purple-100 text-purple-800';
        case 'Test': return 'bg-purple-100 text-purple-800';
        case 'Duplicato': return 'bg-gray-200 text-gray-700';
        default: return 'bg-gray-100 text-gray-800';
    }
  }

  const editableStatuses: SaleStatus[] = ['In attesa', 'Contattato', 'Confermato', 'Annullato', 'Cancellato', 'Spedito', 'Svincolato', 'Consegnato', 'Non raggiungibile', 'Non ritirato'];
  const logisticsEditableStatuses: SaleStatus[] = ['Confermato', 'Spedito', 'Consegnato', 'Svincolato', 'Non ritirato'];
  const customerCareEditableStatuses: SaleStatus[] = ['In attesa', 'Contattato', 'Confermato', 'Cancellato', 'Non raggiungibile'];

  const getOptionsForRole = () => {
    if (isLogistics) return logisticsEditableStatuses;
    if (isCustomerCare) return customerCareEditableStatuses;
    return editableStatuses; // Admin and Manager
  };
  const optionsForRole = getOptionsForRole();

  const handleStatusChange = async (saleId: string, newStatus: SaleStatus) => {
    // We could add a local loading state per row, but for now global refresh is fine.
    await onUpdateSaleStatus(saleId, newStatus);
  };

  const filteredSales = useMemo(() => {
    const [start, end] = getPeriodRange(filters.timePeriod, filters.customStartDate, filters.customEndDate);

    let result = sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= start && saleDate <= end;
    });

    if (filters.statusFilter !== 'all') {
      result = result.filter(sale => sale.status === filters.statusFilter);
    }
    
    if (isCustomerCare && !filters.showDuplicates) {
      result = result.filter(sale => sale.status !== 'Duplicato');
    }

    if (filters.searchQuery) {
        const lowerQuery = filters.searchQuery.toLowerCase();
        result = result.filter(sale => 
            sale.customerName?.toLowerCase().includes(lowerQuery) ||
            sale.customerPhone?.includes(lowerQuery)
        );
    }
    
    if (isAffiliate && filters.subIdQuery) {
        const lowerQuery = filters.subIdQuery.toLowerCase();
        result = result.filter(sale => 
            sale.subId?.toLowerCase().includes(lowerQuery)
        );
    }
    
    return result.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [sales, filters, isCustomerCare, isAffiliate]);
  
    const groupedSales = useMemo(() => {
        if (!groupBySubId || !isAffiliate) return null;

        const groups: { [key: string]: { sales: Sale[], totalCommission: number, statusCounts: { [key in SaleStatus]?: number } } } = {};

        for (const sale of filteredSales) {
            const subId = sale.subId || 'Nessun Sub ID';
            if (!groups[subId]) {
                groups[subId] = { sales: [], totalCommission: 0, statusCounts: {} };
            }
            groups[subId].sales.push(sale);
            groups[subId].totalCommission += sale.commissionAmount;
            groups[subId].statusCounts[sale.status] = (groups[subId].statusCounts[sale.status] || 0) + 1;
        }

        return Object.entries(groups)
            .map(([subId, data]) => ({ subId, ...data }))
            .sort((a, b) => b.sales.length - a.sales.length);

    }, [filteredSales, groupBySubId, isAffiliate]);

  const dateFilterOptions: { key: TimePeriod; label: string }[] = [
    { key: 'all', label: 'Tutti' },
    { key: 'today', label: 'Oggi' },
    { key: 'yesterday', label: 'Ieri' },
    { key: 'this_week', label: 'Questa Settimana' },
    { key: 'last_week', label: 'Settimana Scorsa' },
    { key: 'this_month', label: 'Questo Mese' },
    { key: 'last_month', label: 'Mese Scorso' },
    { key: 'custom', label: 'Personalizza' },
  ];

  const statusFilterOptions = isLogistics ? LOGISTICS_STATUSES : ALL_STATUSES;

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-on-surface">Ordini Ricevuti</h2>
        <div className="flex items-center gap-2">
           <button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2 bg-surface text-on-surface font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-wait">
                <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Aggiornando...' : 'Aggiorna Dati'}</span>
            </button>
            {user.role === UserRole.CUSTOMER_CARE && (
              <button onClick={onOpenWhatsAppTemplateEditor} className="bg-secondary text-primary font-bold py-2 px-4 rounded-lg hover:bg-secondary-light transition-colors duration-200 flex items-center gap-2">
                <PencilIcon className="w-4 h-4" />
                <span>Modifica Messaggio</span>
              </button>
            )}
        </div>
      </div>
      
      <div className="mb-6 bg-surface rounded-xl shadow-md p-4 space-y-4">
          <div>
            <span className="text-sm font-semibold text-gray-600 mr-2">Filtra per data:</span>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {dateFilterOptions.map(({ key, label }) => (
                <button key={key} onClick={() => handleFilterChange('timePeriod', key)} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.timePeriod === key ? 'bg-primary text-on-primary shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                    {label}
                </button>
              ))}
            </div>
             {filters.timePeriod === 'custom' && (
                <div className="mt-3 flex flex-col sm:flex-row items-center gap-4">
                    <input type="date" value={filters.customStartDate} onChange={e => handleFilterChange('customStartDate', e.target.value)} className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
                    <span className="text-gray-500">a</span>
                    <input type="date" value={filters.customEndDate} onChange={e => handleFilterChange('customEndDate', e.target.value)} className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
                </div>
            )}
          </div>
          <div className="pt-4 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-600 mr-2">Filtra per stato:</span>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button onClick={() => handleFilterChange('statusFilter', 'all')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'all' ? 'bg-primary text-on-primary shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                  Tutti
              </button>
              {statusFilterOptions.map(status => (
                <button key={status} onClick={() => handleFilterChange('statusFilter', status)} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === status ? 'bg-primary text-on-primary shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                    {status}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center gap-4">
            <input type="text" placeholder="Cerca per nome cliente o telefono..." value={filters.searchQuery} onChange={e => handleFilterChange('searchQuery', e.target.value)} className="w-full sm:w-auto flex-grow max-w-sm px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
            {isAffiliate && (
                 <input type="text" placeholder="Filtra per Sub ID..." value={filters.subIdQuery} onChange={e => handleFilterChange('subIdQuery', e.target.value)} className="w-full sm:w-auto flex-grow max-w-xs px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"/>
            )}
            {isCustomerCare && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="show-duplicates" checked={filters.showDuplicates} onChange={e => handleFilterChange('showDuplicates', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="show-duplicates" className="text-sm text-gray-700">Mostra Duplicati</label>
                </div>
                 <div className="flex items-center gap-2">
                    <input type="checkbox" id="show-order-id" checked={showOrderId} onChange={e => setShowOrderId(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="show-order-id" className="text-sm text-gray-700">Mostra ID Ordine</label>
                </div>
              </div>
            )}
             {isAffiliate && (
                <div className="flex items-center gap-2 ml-auto">
                    <input type="checkbox" id="group-by-subid" checked={groupBySubId} onChange={e => setGroupBySubId(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="group-by-subid" className="text-sm font-semibold text-gray-700">Raggruppa per Sub ID</label>
                </div>
            )}
        </div>
      </div>

      {isAffiliate && groupBySubId && groupedSales ? (
         <div className="space-y-3">
            {groupedSales.map((group) => (
                <SubIdGroup 
                    key={group.subId} 
                    group={group} 
                    onViewOrder={onViewOrder}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                />
            ))}
            {groupedSales.length === 0 && (<p className="text-center text-gray-500 py-12">Nessun ordine trovato con i filtri attuali.</p>)}
        </div>
      ) : (
          <div className="bg-surface rounded-xl shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Ordine</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prodotto</th>
                  {isCustomerCare && (
                    <>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome e Cognome</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numero di Telefono</th>
                    </>
                  )}
                  {!isAffiliate && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affiliato</th>}
                  {isAffiliate && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub ID</th>}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                  {showOrderId && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ordine</th>}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => onViewOrder(sale)}><div className="text-sm text-gray-900">{formatDate(sale.saleDate)}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => onViewOrder(sale)}><div className="text-sm font-medium text-gray-900">{sale.productName}</div></td>
                    {isCustomerCare && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => onViewOrder(sale)}><div className="text-sm text-gray-900">{sale.customerName || '-'}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => onViewOrder(sale)}><div className="text-sm text-gray-500">{sale.customerPhone || '-'}</div></td>
                      </>
                    )}
                    {!isAffiliate && (<td className="px-6 py-4 whitespace-nowrap" onClick={() => onViewOrder(sale)}><div className="text-sm text-gray-500">{sale.affiliateName}</div></td>)}
                    {isAffiliate && (<td className="px-6 py-4 whitespace-nowrap" onClick={() => onViewOrder(sale)}><div className="text-sm text-gray-500 font-mono">{sale.subId || '-'}</div></td>)}
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => onViewOrder(sale)}><div className="text-sm font-semibold text-gray-900">€{sale.saleAmount.toFixed(2)}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {canEditStatus ? (
                            <select
                                value={sale.status}
                                onChange={(e) => handleStatusChange(sale.id, e.target.value as SaleStatus)}
                                onClick={(e) => e.stopPropagation()}
                                disabled={sale.status === 'Duplicato' || sale.status === 'Test'}
                                className={`w-full text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-offset-2 focus:ring-primary py-1 px-2 pr-8 truncate ${getStatusBadge(sale.status)} disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {!optionsForRole.includes(sale.status) && <option value={sale.status} disabled>{sale.status}</option>}
                                {optionsForRole.map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        ) : (
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(sale.status)}`}>{sale.status}</span>
                        )}
                    </td>
                    {showOrderId && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" onClick={() => onViewOrder(sale)}>{sale.id}</td>}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                          {(user.role === UserRole.ADMIN || user.role === UserRole.MANAGER || isLogistics) && sale.status === 'Confermato' && (
                             <button onClick={(e) => { e.stopPropagation(); onShipOrder(sale); }} className="bg-accent text-white font-bold py-1 px-3 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2" aria-label={`Crea spedizione per ordine ${sale.id}`}>
                              <PaperAirplaneIcon className="w-4 h-4" />
                              <span>Crea Spedizione</span>
                            </button>
                          )}
                          {(user.role === UserRole.ADMIN || user.role === UserRole.MANAGER || isLogistics) && (
                            <button onClick={(e) => { e.stopPropagation(); onManageOrder(sale); }} className="bg-blue-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2" aria-label={`Gestisci ordine ${sale.id}`}>
                              <TruckIcon className="w-4 h-4" />
                              <span>Gestisci</span>
                            </button>
                          )}
                          {(user.role === UserRole.ADMIN || user.role === UserRole.MANAGER || isCustomerCare) && sale.customerPhone && (
                              <button onClick={(e) => { e.stopPropagation(); onContactCustomer(sale); }} className="bg-green-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2" aria-label={`Contatta ${sale.customerName} su WhatsApp`}>
                                  <WhatsAppIcon className="w-4 h-4" />
                                  <span>Contatta</span>
                              </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSales.length === 0 && (<p className="text-center text-gray-500 py-12">Nessun ordine trovato con i filtri attuali.</p>)}
          </div>
      )}
    </div>
  );
};

export default OrderList;
