import { motion } from 'framer-motion';
import { ArrowRight, Search, ChevronDown } from 'lucide-react';

const integrationCategories = ['All', 'E-commerce', 'CRM', 'Marketing', 'Payment', 'Support'];

const integrationApps = [
  { name: 'Shopify', category: 'E-commerce', logo: 'https://www.vectorlogo.zone/logos/shopify/shopify-icon.svg', desc: 'Sync orders and send abandoned cart recovery on WhatsApp.' },
  { name: 'WooCommerce', category: 'E-commerce', logo: 'https://www.vectorlogo.zone/logos/woocommerce/woocommerce-icon.svg', desc: 'Connect your store for instant order updates.' },
  { name: 'HubSpot', category: 'CRM', logo: 'https://www.vectorlogo.zone/logos/hubspot/hubspot-icon.svg', desc: 'Sync leads and manage WhatsApp conversations in CRM.' },
  { name: 'Zapier', category: 'Marketing', logo: 'https://www.vectorlogo.zone/logos/zapier/zapier-icon.svg', desc: 'Connect Ricoz with 5,000+ apps using Zapier.' },
  { name: 'Stripe', category: 'Payment', logo: 'https://www.vectorlogo.zone/logos/stripe/stripe-icon.svg', desc: 'Send payment links securely via WhatsApp.' },
  { name: 'Calendly', category: 'Marketing', logo: 'https://www.vectorlogo.zone/logos/calendly/calendly-icon.svg', desc: 'Send automated appointment reminders to clients.' },
  { name: 'Salesforce', category: 'CRM', logo: 'https://www.vectorlogo.zone/logos/salesforce/salesforce-icon.svg', desc: 'Enterprise CRM integration for sales workflows.' },
  { name: 'Zendesk', category: 'Support', logo: 'https://www.vectorlogo.zone/logos/zendesk/zendesk-icon.svg', desc: 'Turn WhatsApp messages into Zendesk support tickets.' },
];

export function PublicIntegrations() {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-primary leading-tight mb-6"
            >
              Seamlessly Integrate WhatsApp with your business tech stack
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-700 mb-8 font-medium"
            >
              Enjoy brilliant integrations with your preferred e-commerce platforms, CRMs, e-stores, and more with Ricoz Communication.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#00a688] text-white px-8 py-3.5 rounded-md font-bold hover:bg-[#008c73] transition-colors shadow-lg"
            >
              Signup for Free
            </motion.button>
          </div>
          
          <div className="lg:w-1/2 relative h-[400px] w-full flex items-center justify-center">
            {/* Visual Representation of Integrations (Abstract) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-[400px] h-[400px]"
            >
              <div className="absolute inset-0 border-[1px] border-dashed border-gray-300 rounded-full animate-[spin_40s_linear_infinite]" />
              <div className="absolute inset-8 border-[1px] border-gray-200 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
              <div className="absolute inset-16 border-[1px] border-gray-100 rounded-full animate-[spin_20s_linear_infinite]" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-[#00a688] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#00a688]/30 z-10">
                  <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-[#00a688] font-bold text-3xl rounded-bl-none shadow-sm">
                    R
                  </div>
                </div>
              </div>

              {/* Floating Logos */}
              <div className="absolute top-[10%] left-[20%] w-12 h-12 bg-white rounded-full shadow-lg p-2 flex items-center justify-center"><img src="https://www.vectorlogo.zone/logos/shopify/shopify-icon.svg" alt="Shopify" /></div>
              <div className="absolute top-[20%] right-[15%] w-12 h-12 bg-white rounded-full shadow-lg p-2 flex items-center justify-center"><img src="https://www.vectorlogo.zone/logos/zapier/zapier-icon.svg" alt="Zapier" /></div>
              <div className="absolute bottom-[25%] left-[10%] w-12 h-12 bg-white rounded-full shadow-lg p-2 flex items-center justify-center"><img src="https://www.vectorlogo.zone/logos/hubspot/hubspot-icon.svg" alt="HubSpot" /></div>
              <div className="absolute bottom-[15%] right-[25%] w-12 h-12 bg-white rounded-full shadow-lg p-2 flex items-center justify-center"><img src="https://www.vectorlogo.zone/logos/stripe/stripe-icon.svg" alt="Stripe" /></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-7xl mx-auto px-6 bg-gray-50/50 py-16 rounded-3xl border border-border">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-border pb-6">
          <h2 className="text-3xl font-bold text-primary">
            <span className="text-[#00a688]">Pick From Our Top Integration Apps</span> To Grow Your Business On WhatsApp
          </h2>
          
          <div className="mt-6 md:mt-0 relative min-w-[200px]">
            <select className="w-full appearance-none bg-white border border-[#00a688] text-primary rounded-full px-6 py-2.5 font-medium pr-10 focus:outline-none focus:ring-2 focus:ring-[#00a688]/20 cursor-pointer">
              {integrationCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00a688] pointer-events-none" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrationApps.map((app, idx) => (
            <motion.div 
              key={app.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-xl p-3 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <img src={app.logo} alt={app.name} className="max-w-full max-h-full object-contain" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">{app.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 h-10">{app.desc}</p>
              <div className="flex items-center text-[#00a688] text-sm font-semibold group-hover:translate-x-1 transition-transform">
                View Integration <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
