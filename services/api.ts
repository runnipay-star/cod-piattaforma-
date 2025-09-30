import { supabase } from '../supabase/client';
import {
  User,
  Product,
  Sale,
  Payout,
  Transfer,
  OrderStatus,
  PayoutStatus,
  UserRole,
} from '../types';

// Helper to convert a string from camelCase to snake_case
const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

// Helper to recursively convert all keys of an object from camelCase to snake_case
const convertKeysToSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => convertKeysToSnakeCase(v));
    } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[camelToSnakeCase(key)] = convertKeysToSnakeCase(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
};

// Helper to map a raw product object from Supabase (snake_case) to our Product type (camelCase)
const mapSupabaseProductToProduct = (dbProduct: any): Product => {
    return {
        id: dbProduct.id,
        name: dbProduct.name,
        sku: dbProduct.sku,
        imageUrls: dbProduct.image_urls,
        price: dbProduct.price,
        purchasePrice: dbProduct.purchase_price,
        commission: dbProduct.commission,
        platformCommission: dbProduct.platform_commission,
        codShippingCost: dbProduct.cod_shipping_cost,
        logisticsCommission: dbProduct.logistics_commission,
        tolerance: dbProduct.tolerance,
        description: dbProduct.description,
        endpointUrl: dbProduct.endpoint_url,
        penalties: dbProduct.penalties,
        trackingCode: dbProduct.tracking_code,
    };
};


// API object
export const api = {
  // USERS
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
    return data as User[];
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const { data, error } = await supabase.from('users').insert({
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      role: userData.role,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      password: userData.password, // In a real app, this should be handled by Supabase Auth
      manager_id: userData.managerId,
    }).select();
    
    if (error) {
        console.error("Error creating user:", error);
        throw error;
    }
    return data[0] as User;
  },
  
  updateUser: async (userId: number, updates: Partial<User>): Promise<User> => {
      // Don't overwrite password with empty string
      if (updates.password === '' || updates.password === undefined) {
          delete updates.password;
      }

      const { data, error } = await supabase.from('users')
        .update(convertKeysToSnakeCase(updates))
        .eq('id', userId)
        .select();

      if (error) {
          console.error("Error updating user:", error);
          throw error;
      }
      return data[0] as User;
  },

  // PRODUCTS
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
    return data.map(mapSupabaseProductToProduct);
  },
  
  getProductById: async (id: number): Promise<Product | undefined> => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
     if (error) {
      console.error(`Error fetching product ${id}:`, error);
      // Supabase throws error if .single() finds no row, so we can return undefined
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return mapSupabaseProductToProduct(data);
  },

  createProduct: async (productData: Omit<Product, 'id' | 'endpointUrl'>): Promise<Product> => {
     const { data, error } = await supabase.from('products').insert(
       convertKeysToSnakeCase(productData)
     ).select();
     
     if (error) {
        console.error("Error creating product:", error);
        throw error;
     }
     // The endpointUrl is a derived property and can be set here if needed, or in the component.
     // For now, we'll let the DB trigger handle it if it was set up.
     return mapSupabaseProductToProduct(data[0]);
  },

  updateProduct: async (productId: number, updates: Partial<Product>): Promise<Product> => {
      const { data, error } = await supabase.from('products')
        .update(convertKeysToSnakeCase(updates))
        .eq('id', productId)
        .select();

      if (error) {
          console.error("Error updating product:", error);
          throw error;
      }
      return mapSupabaseProductToProduct(data[0]);
  },

  // SALES
  getSales: async (): Promise<Sale[]> => {
    const { data, error } = await supabase.from('sales').select('*');
    if (error) {
        console.error("Error fetching sales:", error);
        throw error;
    }
    // Convert date strings to Date objects
    return data.map(sale => ({...sale, date: new Date(sale.date) })) as Sale[];
  },

  updateSale: async (saleId: string, updates: Partial<Sale>): Promise<Sale> => {
    const { data, error } = await supabase.from('sales')
      .update(convertKeysToSnakeCase(updates))
      .eq('id', saleId)
      .select();
    if (error) {
        console.error("Error updating sale:", error);
        throw error;
    }
    const updatedSale = data[0];
    return {...updatedSale, date: new Date(updatedSale.date) } as Sale;
  },

  // PAYOUTS
  getPayouts: async (): Promise<Payout[]> => {
      const { data, error } = await supabase.from('payouts').select('*');
      if (error) {
        console.error("Error fetching payouts:", error);
        throw error;
      }
      return data.map(p => ({...p, date: new Date(p.date)})) as Payout[];
  },

  requestPayout: async (affiliateId: number, amount: number, method: string): Promise<Payout> => {
      const { data, error } = await supabase.from('payouts').insert({
          affiliate_id: affiliateId,
          amount,
          method,
          status: PayoutStatus.PENDING,
      }).select();

      if (error) {
        console.error("Error creating payout:", error);
        throw error;
      }
      const newPayout = data[0];
      return {...newPayout, date: new Date(newPayout.date)} as Payout;
  },

  // TRANSFERS
  getTransfers: async (): Promise<Transfer[]> => {
      const { data, error } = await supabase.from('transfers').select('*');
       if (error) {
        console.error("Error fetching transfers:", error);
        throw error;
      }
      return data.map(t => ({...t, date: new Date(t.date)})) as Transfer[];
  },

  createTransfer: async (fromUserId: number, toUserId: number, amount: number, description: string): Promise<Transfer> => {
      const { data, error } = await supabase.from('transfers').insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          amount,
          description,
      }).select();
      if (error) {
        console.error("Error creating transfer:", error);
        throw error;
      }
      const newTransfer = data[0];
      return {...newTransfer, date: new Date(newTransfer.date)} as Transfer;
  },
};