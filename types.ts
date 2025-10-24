export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AFFILIATE = 'AFFILIATE',
  LOGISTICS = 'LOGISTICS',
  CUSTOMER_CARE = 'CUSTOMER_CARE',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  notifications?: Notification[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole.ADMIN;
}

export interface BundleOption {
  id: string;
  quantity: number;
  price: number;
  commissionValue: number;
  platformFee?: number;
}

export interface FormFields {
  name: boolean;
  address: boolean;
  phone: boolean;
  email: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  commissionValue: number; // as a fixed amount in €, e.g., 40 for 40€
  imageUrl: string;
  galleryImageUrls?: string[];
  createdAt: string;
  refNumber: string;
  isActive: boolean;
  niche: string;
  allowedAffiliateIds: string[] | null; // null means active for all
  costOfGoods?: number;
  shippingCost?: number;
  shippingCharge?: number; // Cost for the customer
  fulfillmentCost?: number;
  platformFee?: number;
  customerCareCommission?: number;
  freeShipping?: boolean;
  affiliateCommissionOverrides?: { [affiliateId: string]: number };
  approvalTolerance?: number; // E.g. 35 for 35%
  bundleOptions?: BundleOption[];
  approvalFrequencyDays?: number;
  // PaccoFacile integration fields
  weight?: number; // in kg
  height?: number; // in cm
  width?: number; // in cm
  depth?: number; // in cm
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  role: UserRole.AFFILIATE;
  password?: string;
  isBlocked: boolean;
  totalSales: number;
  totalCommissions: number;
  currentBalance: number;
  uniqueLink: string;
  privacyPolicyUrl?: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  password?: string;
  isBlocked: boolean;
  role: UserRole.MANAGER;
  currentBalance: number;
}

export interface LogisticsUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  isBlocked: boolean;
  role: UserRole.LOGISTICS;
}

export interface CustomerCareUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  isBlocked: boolean;
  role: UserRole.CUSTOMER_CARE;
  currentBalance: number;
}

export type SaleStatus = 'In attesa' | 'Confermato' | 'Annullato' | 'Cancellato' | 'Spedito' | 'Svincolato' | 'Consegnato' | 'Duplicato' | 'Non raggiungibile' | 'Non ritirato' | 'Test' | 'Contattato';

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  affiliateId: string;
  affiliateName: string;
  saleAmount: number;
  commissionAmount: number;
  saleDate: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  subId: string | null;
  status: SaleStatus;
  webhookUrl?: string;
  webhookStatus?: 'Sent' | 'Failed' | 'Not Configured';
  trackingCode?: string;
  quantity?: number; // Defaults to 1 if not present
  bundleId?: string; // Optional ID for the bundle sold
  notes?: string;
  statusUpdatedAt?: string;
  lastContactedBy?: string; // User ID
  lastContactedByName?: string;
  user_agent?: string;
  ip_address?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  targetRoles: UserRole[];
  readBy: string[]; // Array of user IDs who have read it
  eventType?: 'new-product' | 'product-deactivated';
  linkTo?: string; // e.g., 'product-detail/p1'
}

export type TransactionType = 'Payout' | 'Transfer' | 'Adjustment';
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed';

export interface Transaction {
  id: string;
  userId: string; // The user who initiated the transaction
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  notes?: string;
  // For Transfers
  fromUserId?: string;
  fromUserName?: string;
  toUserId?: string;
  toUserName?: string;
  // For Payouts
  paymentMethod?: 'PayPal' | 'Bonifico Bancario' | 'Worldfili';
  paymentDetails?: string; // e.g., PayPal email or IBAN
}

export interface TicketReply {
  id: string;
  ticketId: string; // Foreign key to Ticket
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export type TicketStatus = 'Aperto' | 'In Lavorazione' | 'Chiuso';

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
}

export interface PlatformSettings {
  platform_logo?: string;
  logo_sidebar_open_width?: string;
  logo_sidebar_open_height?: string;
  logo_sidebar_closed_width?: string;
  logo_sidebar_closed_height?: string;
  logo_login_width?: string;
  logo_login_height?: string;
  sidebar_open_bg_color?: string;
  sidebar_open_horizontal_align?: 'flex-start' | 'center' | 'flex-end';
  sidebar_open_vertical_align?: 'flex-start' | 'center' | 'flex-end';
  // PaccoFacile integration settings
  paccofacile_api_key?: string;
  sender_name?: string;
  sender_company?: string;
  sender_address?: string;
  sender_city?: string;
  sender_zip?: string;
  sender_province?: string;
  sender_phone?: string;
  sender_email?: string;
  // Global webhook
  global_webhook_url?: string;
  // IP Blocking
  blocked_ips?: string[];
}