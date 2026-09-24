import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Link as LinkIcon, X, CheckCircle2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  image: string;
};

export function Commerce() {
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState({ totalSales: 12450, pendingCount: 24, recoveredCarts: 3200 });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // New Product form
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('50');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCommerceData();
  }, []);

  const fetchCommerceData = async () => {
    try {
      setIsLoading(true);
      const [prodData, orderData] = await Promise.all([
        api.get('/api/commerce/products'),
        api.get('/api/commerce/orders')
      ]);

      if (Array.isArray(prodData)) {
        setProducts(prodData);
      }
      if (orderData && orderData.metrics) {
        setMetrics(orderData.metrics);
      }
    } catch (err) {
      console.error('Failed to load commerce data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;
    setIsSubmitting(true);
    try {
      const created = await api.post('/api/commerce/products', {
        name: newProductName,
        price: parseFloat(newProductPrice),
        stock: parseInt(newProductStock) || 0,
        status: 'Active'
      });

      setProducts(prev => [created, ...prev]);
      setIsAddOpen(false);
      setNewProductName('');
      setNewProductPrice('');
      setFeedbackMsg('Product created successfully!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateLink = async (product?: Product) => {
    try {
      const res = await api.post('/api/commerce/checkout-link', {
        productId: product?.id,
        productName: product?.name || 'Custom Checkout Order',
        amount: product?.price || 99
      });

      setGeneratedLink(res.link);
      navigator.clipboard.writeText(res.link);
      setFeedbackMsg(`Checkout link copied to clipboard! (${product?.name || 'Order'})`);
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err) {
      console.error('Link gen error:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/commerce/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete product');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      {feedbackMsg && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg flex items-center space-x-2 text-sm shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <ShoppingBag className="w-8 h-8 text-brand-primary mr-3" />
            Commerce
          </h1>
          <p className="text-secondary mt-1">Manage your catalog, chat checkout links, and abandoned carts.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => handleGenerateLink()}
            className="flex items-center space-x-2 bg-surface border border-border px-4 py-2 rounded-md hover:bg-sunken transition-colors font-medium text-sm text-secondary cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Generate Link</span>
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Sales via Chat</h3>
          <div className="mt-2 text-3xl font-semibold">${metrics.totalSales.toLocaleString()}</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Orders Pending</h3>
          <div className="mt-2 text-3xl font-semibold text-warning">{metrics.pendingCount}</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success">Automated</span>
          </div>
          <h3 className="text-secondary text-sm font-medium">Recovered Carts</h3>
          <div className="mt-2 text-3xl font-semibold text-brand-primary">${metrics.recoveredCarts.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-surface border border-border rounded-xl shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-secondary uppercase bg-sunken border-b border-border sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-secondary">Loading product catalog...</td>
              </tr>
            ) : products.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-sunken/50 transition-colors">
                <td className="px-6 py-4 flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-md ${product.image || 'bg-brand-primary'} opacity-80`} />
                  <span className="font-medium text-primary">{product.name}</span>
                </td>
                <td className="px-6 py-4 font-medium">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button 
                    onClick={() => handleGenerateLink(product)}
                    className="text-brand-primary font-medium hover:underline text-xs"
                  >
                    Copy Link
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-500 hover:text-red-700 text-xs p-1"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Add New Product</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Product Title</label>
                <input 
                  type="text" 
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Wireless Ergonomic Mouse"
                  className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="79.99"
                    className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Initial Stock</label>
                  <input 
                    type="number" 
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-border rounded-md text-sm font-medium text-secondary hover:bg-sunken"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

