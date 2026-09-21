import { motion } from 'framer-motion';

const integrations = [
  { name: 'Shopify', color: 'bg-[#96bf48]' },
  { name: 'WooCommerce', color: 'bg-[#96588a]' },
  { name: 'Instagram', color: 'bg-[#E1306C]' },
  { name: 'Facebook', color: 'bg-[#1877F2]' },
  { name: 'Zapier', color: 'bg-[#FF4A00]' },
  { name: 'HubSpot', color: 'bg-[#ff7a59]' },
  { name: 'Zoho CRM', color: 'bg-[#003B73]' },
  { name: 'Razorpay', color: 'bg-[#000000]' },
  { name: 'Stripe', color: 'bg-[#008CDD]' },
  { name: 'Pabbly', color: 'bg-[#FF5722]' },
];

export function IntegrationsMarquee() {
  // Double the array for infinite scroll effect
  const marqueeItems = [...integrations, ...integrations, ...integrations];

  return (
    <section className="py-24 bg-white border-y border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16">
        <h2 className="text-3xl font-bold text-primary mb-4">Integrates with 60+ of your favorite tools</h2>
        <p className="text-muted-foreground text-lg">Connect Ricoz Communication with your existing tech stack in clicks, not months.</p>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Left Gradient Mask */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-white to-transparent"></div>

        <motion.div
          animate={{ x: [0, -1035] }} // Adjust this value based on total width to make it seamless
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20
          }}
          className="flex space-x-8 items-center px-4"
        >
          {marqueeItems.map((integration, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-center space-x-3 bg-surface border border-border px-6 py-4 rounded-xl shadow-sm min-w-[200px]"
            >
              <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs ${integration.color}`}>
                {integration.name.charAt(0)}
              </div>
              <span className="font-semibold text-primary">{integration.name}</span>
            </div>
          ))}
        </motion.div>

        {/* Right Gradient Mask */}
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-white to-transparent"></div>
      </div>
    </section>
  );
}
