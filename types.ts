export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  AFFILIATE = 'Affiliate',
  LOGISTICS = 'Logistics',
}

export type Locale = 'it' | 'en' | 'ro';

export enum OrderStatus {
  PENDING = 'in attesa',
  CONFIRMED = 'confermato',
  USER_CANCELLED = 'annullato',
  ADMIN_CANCELLED = 'cancellato',
  SHIPPED = 'spedito',
  RELEASED = 'svincolato',
  DELIVERED = 'consegnato',
  RETURNED = 'reso',
}

export enum PayoutStatus {
  PAID = 'paid',
  PENDING = 'pending',
  FAILED = 'failed',
}

export enum TransactionStatus {
  COMPLETED = 'completed'
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar: string;
  password?: string;
  managerId?: number; // ID of the manager this user is assigned to
  source_id?: string;
  taxCode?: string;
  vatNumber?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  address?: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  contacts?: {
    phone?: string;
    skype?: string;
    telegram?: string;
    whatsapp?: string;
  };
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  imageUrls: string[];
  price: number;
  purchasePrice: number;
  commission: number; // Fixed amount in Euros for the affiliate
  platformCommission: number; // Fixed amount in Euros for the platform
  codShippingCost: number;
  logisticsCommission: number;
  tolerance?: number; // Percentage
  description: string;
  endpointUrl: string;
  penalties?: { [affiliateId: number]: number }; // Key: affiliateId, Value: commission reduction percentage
  trackingCode?: string; // Internal tracking code, hidden from affiliates
}

export interface Sale {
  id: string;
  productId: number;
  affiliateId: number;
  date: Date;
  quantity: number;
  subId?: string;
  status: OrderStatus;
  country: string; // e.g., 'IT', 'RO', 'GB'
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  totalPrice: number;
  commissionValue: number;
  trackingCode?: string;
}

export interface Payout {
  id: string;
  affiliateId: number;
  date: Date;
  amount: number;
  status: PayoutStatus;
  method: string;
}

export interface Transfer {
  id: string;
  fromUserId: number;
  toUserId: number;
  date: Date;
  amount: number;
  description: string;
}