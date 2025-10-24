import React, { useMemo } from 'react';
import { User, UserRole, Sale, Notification, Affiliate, Manager, CustomerCareUser, LogisticsUser, Transaction } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  user: User;
  sales: Sale[];
  notifications: Notification[];
  transactions: Transaction[];
  fullUserObject: User | Affiliate | Manager | CustomerCareUser | LogisticsUser | null;
  onOpenCommissionDetails: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onViewNotification: (notification: Notification) => void;
}

const Header: React.FC<HeaderProps> = ({ user, sales, notifications, transactions, fullUserObject, onOpenCommissionDetails, onMarkAsRead, onMarkAllAsRead, onViewNotification }) => {
  const isAffiliate = user.role === UserRole.AFFILIATE;

  const { approvedRevenue, pendingRevenue, pendingPayoutsTotal } = useMemo(() => {
    let approved = 0;
    
    // Use currentBalance for roles that have it (Affiliate, Manager, CustomerCare)
    if (fullUserObject && 'currentBalance' in fullUserObject && typeof fullUserObject.currentBalance === 'number') {
        approved = fullUserObject.currentBalance;
    } else {
        // Fallback for Admin/Logistics: calculate from sales.
        const approvedStatuses: Sale['status'][] = ['Svincolato', 'Consegnato'];
        approved = sales
            .filter(sale => approvedStatuses.includes(sale.status))
            .reduce((sum, sale) => sum + sale.commissionAmount, 0);
    }
    
    // Pending calculation is the same for everyone
    const pendingStatuses: Sale['status'][] = ['In attesa', 'Confermato', 'Spedito'];
    const pending = sales
        .filter(sale => pendingStatuses.includes(sale.status))
        .reduce((sum, sale) => sum + sale.commissionAmount, 0);

    const pendingPayouts = transactions
      .filter(t => t.userId === user.id && t.type === 'Payout' && t.status === 'Pending')
      .reduce((sum, t) => sum + t.amount, 0);

    return { approvedRevenue: approved, pendingRevenue: pending, pendingPayoutsTotal: pendingPayouts };
  }, [sales, fullUserObject, transactions, user.id]);
  
  const totalApprovedCommissions = approvedRevenue + pendingPayoutsTotal;
  
  const ApprovedStat = (
      <div className="flex items-center gap-3 text-green-600">
          <CheckCircleIcon className="w-7 h-7" />
          <div>
              <span className="text-xs text-gray-500 font-semibold uppercase">Commissioni Approvate</span>
              <p className="text-xl font-bold">€{totalApprovedCommissions.toFixed(2)}</p>
          </div>
      </div>
  );
  
  const PendingStat = (
       <div className="flex items-center gap-3 text-orange-500">
          <ClockIcon className="w-7 h-7" />
          <div>
              <span className="text-xs text-gray-500 font-semibold uppercase">Commissioni in Attesa</span>
              <p className="text-xl font-bold">€{pendingRevenue.toFixed(2)}</p>
          </div>
      </div>
  );

  return (
    <header className="bg-surface shadow-sm p-4 sticky top-0 z-20">
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 sm:gap-8">
        {isAffiliate ? (
            <button onClick={onOpenCommissionDetails} className="text-left rounded-lg p-2 hover:bg-gray-100 transition-colors">
                {ApprovedStat}
            </button>
        ) : (
            ApprovedStat
        )}
        {isAffiliate ? (
             <button onClick={onOpenCommissionDetails} className="text-left rounded-lg p-2 hover:bg-gray-100 transition-colors">
                {PendingStat}
            </button>
        ) : (
            PendingStat
        )}
        <NotificationBell
            user={user}
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onViewNotification={onViewNotification}
        />
      </div>
    </header>
  );
};

export default Header;
