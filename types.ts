export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  AFFILIATE = 'Affiliato',
  SUPPLIER = 'Fornitore',
  CALL_CENTER = 'Call Center',
  LOGISTICS = 'Logistica',
}

export enum OrderStatus {
  PENDING = 'In attesa',
  CONFIRMED = 'Confermato',
  CANCELLED = 'Annullato',
  READY_FOR_SHIPPING = 'Pronto per la spedizione',
  SHIPPED = 'Spedito',
  DELIVERED = 'Consegnato',
  RETURNED = 'Restituito',
}

export enum ProductStatus {
  PENDING = 'In attesa di approvazione',
  APPROVED = 'Approvato',
  REJECTED = 'Rifiutato',
}

export interface User {
  id: string; // Corrisponde a Supabase Auth user ID (UUID)
  name: string;
  email: string;
  role: UserRole;
  team?: string;
}

export interface Order {
  id:string;
  conversionId: number;
  createdAt?: string;
  date: string; // ISO string format
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  productName: string;
  productId: string;
  affiliateId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  subId?: string;
}

export interface ProductCustomerField {
  id: 'name' | 'phone' | 'address' | 'zip' | 'email';
  label: string;
  name_attr: string;
  placeholder?: string;
  enabled: boolean;
  required: boolean;
}

export interface AffiliateCommissionOverride {
  affiliate_id: string;
  commission: number;
}

export interface Product {
  id: string;
  created_at?: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  commission: number;
  platform_fee: number;
  country: string;
  image_url?: string;
  image_urls?: string[];
  status: ProductStatus;
  niche_id: string;
  supplier_id: string;
  customer_fields?: ProductCustomerField[];
  affiliate_penalties?: AffiliateCommissionOverride[];
  tolerance?: number;
}

export interface Niche {
  id: string;
  name: string;
  description: string;
}

export interface Customer {
  id: string; // Using phone number as a unique ID
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  allOrders: Order[];
}

// A view can be a generic dashboard or a role-specific one
// FIX: Added custom admin view strings to the View type to support admin-specific navigation and fix type errors.
export type View = 'dashboard' | 'products' | 'orders' | 'settings' | UserRole | 'Vista Manager' | 'Vista Affiliati' | 'Vista Fornitori' | 'Vista Call Center' | 'customers';