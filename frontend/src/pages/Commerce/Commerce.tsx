import { ShoppingBag, Search, Plus, Filter, Link, ShoppingCart } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Premium Wireless Headphones', price: '$249.00', stock: 120, status: 'Active', image: 'bg-brand-primary' },
  { id: 2, name: 'Ergonomic Desk Chair', price: '$399.00', stock: 45, status: 'Active', image: 'bg-brand-accent' },
  { id: 3, name: 'Mechanical Keyboard', price: '$129.00', stock: 0, status: 'Out of Stock', image: 'bg-success' },
];

export function Commerce() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <ShoppingBag className="w-8 h-8 text-brand-primary mr-3" />
            Commerce
          </h1>
          <p className="text-secondary mt-1">Manage your catalog, chat checkout links, and abandoned carts.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-surface border border-border px-4 py-2 rounded-md hover:bg-sunken transition-colors font-medium text-sm text-secondary">
            <Link className="w-4 h-4" />
            <span>Generate Link</span>
          </button>
          <button className="flex items-center space-x-2 bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Sales via Chat</h3>
          <div className="mt-2 text-3xl font-semibold">$12,450</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-secondary text-sm font-medium">Orders Pending</h3>
          <div className="mt-2 text-3xl font-semibold text-warning">24</div>
        </div>
        <div className="bg-surface border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success">Automated</span>
          </div>
          <h3 className="text-secondary text-sm font-medium">Recovered Carts</h3>
          <div className="mt-2 text-3xl font-semibold text-brand-primary">$3,200</div>
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
            {MOCK_PRODUCTS.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-sunken/50 transition-colors">
                <td className="px-6 py-4 flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-md ${product.image} opacity-80`} />
                  <span className="font-medium text-primary">{product.name}</span>
                </td>
                <td className="px-6 py-4 font-medium">{product.price}</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-brand-primary font-medium hover:underline">Copy Link</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
