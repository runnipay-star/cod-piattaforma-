import React, { useState, useMemo } from 'react';
import { Order, User, Customer, OrderStatus } from '../../types';
import CustomerTable from '../CustomerTable';

interface CustomerManagementPageProps {
  orders: Order[];
  currentUser: User;
}

const CustomerManagementPage: React.FC<CustomerManagementPageProps> = ({ orders, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = useMemo((): Customer[] => {
    const customerMap = new Map<string, Order[]>();

    // Group orders by customer phone number
    for (const order of orders) {
      if (!order.customerPhone) continue;
      const existing = customerMap.get(order.customerPhone) || [];
      customerMap.set(order.customerPhone, [...existing, order]);
    }

    const customerList: Customer[] = [];
    for (const [phone, customerOrders] of customerMap.entries()) {
      // Sort orders by date to easily find the latest info and first/last dates
      const sortedOrders = [...customerOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const latestOrder = sortedOrders[0];
      const totalSpent = sortedOrders
        .filter(o => o.status === OrderStatus.DELIVERED)
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      
      customerList.push({
        id: phone,
        phone: phone,
        name: latestOrder.customerName,
        address: latestOrder.customerAddress,
        totalOrders: sortedOrders.length,
        totalSpent: totalSpent,
        firstOrderDate: sortedOrders[sortedOrders.length - 1].date,
        lastOrderDate: latestOrder.date,
        allOrders: sortedOrders,
      });
    }
    
    return customerList.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }
    const searchLower = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.toLowerCase().includes(searchLower)
    );
  }, [customers, searchTerm]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Archivio Clienti</h1>
            <p className="text-slate-500">Analizza i dati e lo storico ordini dei tuoi clienti.</p>
          </div>
      </div>
      
      <div className="flex">
        <input
          type="text"
          placeholder="Cerca per nome o telefono..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        />
      </div>

      <CustomerTable
        customers={filteredCustomers}
        currentUser={currentUser}
      />
    </div>
  );
};

export default React.memo(CustomerManagementPage);