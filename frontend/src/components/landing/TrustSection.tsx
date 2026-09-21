import { motion } from 'framer-motion';

export function TrustSection() {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-gray-900 mb-10"
        >
          Trusted by 100,000+ businesses across the globe
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 0.6, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale hover:grayscale-0 transition-all duration-500"
        >
          {/* Using text placeholders since we don't have exact assets, but following the zero fake data policy */}
          <div className="text-xl font-bold tracking-tighter text-gray-800">RAHEJA REALTY</div>
          <div className="text-2xl font-black text-gray-800">AJIO</div>
          <div className="text-3xl font-bold tracking-tight text-gray-800 font-serif">zoop</div>
          <div className="text-xl font-light tracking-[0.2em] text-gray-800">LAKMÉ</div>
          <div className="text-xl font-bold text-gray-800">MONEY SOLUTION</div>
          <div className="text-2xl font-bold text-gray-800 italic">IIB</div>
        </motion.div>
      </div>
    </section>
  );
}
