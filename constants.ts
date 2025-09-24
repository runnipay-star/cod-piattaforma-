import { User, Order, Product, Niche, ProductCustomerField } from './types';

export const DEFAULT_CUSTOMER_FIELDS: ProductCustomerField[] = [
  { id: 'name', name_attr: 'customerName', label: 'Nome e Cognome', enabled: true, required: true },
  { id: 'phone', name_attr: 'customerPhone', label: 'Numero di Cellulare', enabled: true, required: true },
  { id: 'address', name_attr: 'customerAddress', label: 'Indirizzo Completo', placeholder: 'Via, n°, CAP, Città, Provincia', enabled: true, required: true },
  { id: 'zip', name_attr: 'customerZip', label: 'CAP', enabled: false, required: false },
  { id: 'email', name_attr: 'customerEmail', label: 'Email', enabled: false, required: false },
];

export const initialNoches: Niche[] = [];
export const initialUsers: User[] = [];
export const initialProducts: Product[] = [];
export const initialOrders: Order[] = [];