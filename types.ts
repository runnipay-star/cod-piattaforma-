export enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  AFFILIATE = 'Affiliate',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  sourceId?: string; // Unique for affiliates
}

export interface AffiliatePenalty {
  affiliateId: string;
  affiliateName: string;
  reason: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  endpointUrl: string;
  price: number;
  affiliateCommission: number;
  platformCommission: number;
  affiliatePenalties: AffiliatePenalty[];
  hiddenTrackingSource?: string;
}

export interface Sale {
  productId: string;
  affiliateId: string;
  date: string; // ISO string format
  amount: number;
  affiliateCommission: number;
}