import React, { useMemo, useState } from 'react';
import { Order, UserRole, OrderStatus, Product, Niche, User } from '../../types';
import DashboardCard from '../DashboardCard';
import OrderTable from '../OrderTable';
import { CubeIcon, ShoppingCartIcon, PlusIcon } from '../Icons';
import ProductTable from '../ProductTable';
import CreateProductModal from '../CreateProductModal';
import EditProductModal from '../EditProductModal';
import OrderDetailModal from '../OrderDetailModal';

interface SupplierDashboardProps {
  orders: Order[];
  products: Product[];
  niches: Niche[];
  users: User[];
  currentUser: User;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCreateProduct: (product: Omit<Product, 'id' | 'status'>, creatorRole: UserRole) => Promise<boolean>;
  onUpdateProduct: (productId: string, updateData: Partial<Product>) => Promise<boolean>;
  onDeleteProduct: (productId: string) => void;
}

const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ orders, products, niches, users, currentUser, onUpdateStatus, onCreateProduct, onUpdateProduct, onDeleteProduct }) => {
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const affiliates = useMemo(() => users.filter(u => u.role === UserRole.AFFILIATE), [users]);
  
  const toPrepareCount = useMemo(() => 
    orders.filter(o => o.status === OrderStatus.CONFIRMED).length,
  [orders]);
  
  const readyCount = useMemo(() => 
    orders.filter(o => o.status === OrderStatus.READY_FOR_SHIPPING).length,
  [orders]);

  const ordersToShow = useMemo(() => 
    orders.filter(o => [OrderStatus.CONFIRMED, OrderStatus.READY_FOR_SHIPPING].includes(o.status)),
    [orders]
  );
  
  const handleCreateProduct = (product: Omit<Product, 'id' | 'status'>): Promise<boolean> => {
    return onCreateProduct(product, currentUser.role);
  }

  const handleUpdateProduct = async (productId: string, updateData: Partial<Product>) => {
    try {
        const success = await onUpdateProduct(productId, updateData);
        if (success) {
          setEditingProduct(null);
        }
        return success;
    } catch (err) {
        console.error("Caught unexpected error during product update:", err);
        // The main error handling and alert is in App.tsx.
        // This catch block is to prevent unhandled promise rejections.
        return false;
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DashboardCard title="Ordini da Preparare" value={toPrepareCount} icon={<ShoppingCartIcon className="h-8 w-8 text-blue-600"/>} color="bg-blue-100" />
        <DashboardCard title="Pronti per la Spedizione" value={readyCount} icon={<CubeIcon className="h-8 w-8 text-orange-600"/>} color="bg-orange-100" />
      </div>

      <OrderTable 
        title="Gestione Fornitore" 
        orders={ordersToShow} 
        currentUser={currentUser}
        users={users}
        products={products}
        onUpdateStatus={onUpdateStatus}
        onViewDetails={setViewingOrder}
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">I Miei Prodotti</h2>
            <button
                onClick={() => setIsCreatingProduct(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
                <PlusIcon className="h-5 w-5 mr-2" />
                Aggiungi Prodotto
            </button>
        </div>
        <ProductTable products={products} onEditProduct={setEditingProduct} onDeleteProduct={onDeleteProduct} />
      </div>

      <CreateProductModal 
        isOpen={isCreatingProduct}
        onCreateProduct={handleCreateProduct}
        onClose={() => setIsCreatingProduct(false)}
        niches={niches}
        suppliers={[]}
        affiliates={affiliates}
        currentUser={currentUser}
      />

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onUpdateProduct={handleUpdateProduct}
          onClose={() => setEditingProduct(null)}
          niches={niches}
          suppliers={[]}
          affiliates={affiliates}
          currentUser={currentUser}
        />
      )}

      <OrderDetailModal
        order={viewingOrder}
        users={users}
        products={products}
        onClose={() => setViewingOrder(null)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default React.memo(SupplierDashboard);