import { Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'E-commerce', 'CRM', 'Payment', 'Social'];

const INTEGRATIONS = [
  { id: 1, name: 'Shopify', category: 'E-commerce', status: 'Connected', icon: 'bg-[#95BF47]', desc: 'Sync products and abandoned carts.' },
  { id: 2, name: 'WooCommerce', category: 'E-commerce', status: 'Available', icon: 'bg-[#96588a]', desc: 'Connect your WordPress store.' },
  { id: 3, name: 'HubSpot', category: 'CRM', status: 'Available', icon: 'bg-[#ff7a59]', desc: 'Two-way contact and deal sync.' },
  { id: 4, name: 'Stripe', category: 'Payment', status: 'Connected', icon: 'bg-[#635BFF]', desc: 'Generate payment links in chat.' },
  { id: 5, name: 'Instagram', category: 'Social', status: 'Connected', icon: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]', desc: 'Respond to IG DMs and Story mentions.' },
  { id: 6, name: 'WhatsApp Business', category: 'Social', status: 'Connected', icon: 'bg-[#25D366]', desc: 'Official Cloud API connection.' },
];

export function Integrations() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Layers className="w-8 h-8 text-brand-primary mr-3" />
            Integrations
          </h1>
          <p className="text-secondary mt-1">Connect Ricoz to your favorite tools and platforms.</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button 
            key={cat} 
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              cat === 'All' ? "bg-brand-primary text-white shadow-sm" : "bg-surface border border-border text-secondary hover:text-primary hover:border-brand-primary/50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATIONS.map(integration => (
          <div key={integration.id} className="bg-surface border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl ${integration.icon}`}>
                {integration.name.charAt(0)}
              </div>
              {integration.status === 'Connected' ? (
                <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                </span>
              ) : (
                <span className="text-xs font-medium text-secondary bg-sunken border border-border px-2 py-1 rounded-full">
                  Available
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg">{integration.name}</h3>
            <p className="text-sm text-secondary mt-2 mb-6 flex-1">{integration.desc}</p>
            
            <button className={cn(
              "w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center",
              integration.status === 'Connected' 
                ? "bg-sunken text-primary border border-border hover:border-danger hover:text-danger" 
                : "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white"
            )}>
              {integration.status === 'Connected' ? 'Configure' : 'Connect'}
              {integration.status !== 'Connected' && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
