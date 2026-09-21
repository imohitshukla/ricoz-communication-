import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ReactNode } from 'react';

export interface ProductMarketingProps {
  title: ReactNode;
  subtitle: string;
  heroImage: string;
  benefits: { title: string; desc: string; icon?: ReactNode }[];
  features: { title: string; desc: string; image: string; reversed?: boolean }[];
  ctaText?: string;
}

export function ProductMarketingPage({ title, subtitle, heroImage, benefits, features, ctaText = 'Start Free Trial' }: ProductMarketingProps) {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6"
            >
              {title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 font-medium"
            >
              {subtitle}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="bg-[#00a688] text-white px-8 py-4 rounded-full font-bold hover:bg-[#008c73] transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-[#00a688]/30 text-lg">
                {ctaText}
              </button>
              <button className="bg-white text-primary border border-border px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors text-lg flex items-center justify-center">
                Book a Demo <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex items-center gap-2 text-sm text-muted-foreground font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-[#00a688]" /> 14 day free trial
              <CheckCircle2 className="w-4 h-4 text-[#00a688] ml-4" /> No credit card required
            </motion.div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
            >
              <img src={heroImage} alt="Product Demo" className="w-full h-auto" />
            </motion.div>
            {/* Decorative blurs */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-[#00a688]/20 to-[#4F3CC9]/20 blur-3xl rounded-full opacity-50" />
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="bg-gray-50 py-24 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Why choose Ricoz?</h2>
            <p className="text-muted-foreground text-lg">Everything you need to automate your business end-to-end.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              >
                {benefit.icon && (
                  <div className="w-12 h-12 bg-[#00a688]/10 text-[#00a688] rounded-xl flex items-center justify-center mb-6">
                    {benefit.icon}
                  </div>
                )}
                <h3 className="text-xl font-bold text-primary mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Zig-Zag Features */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        {features.map((feature, i) => (
          <div key={i} className={`flex flex-col lg:flex-row items-center gap-16 ${feature.reversed ? 'lg:flex-row-reverse' : ''}`}>
            <motion.div 
              initial={{ opacity: 0, x: feature.reversed ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">{feature.title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">{feature.desc}</p>
              <ul className="space-y-4">
                {[1, 2, 3].map((_, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[#00a688] mr-3 shrink-0" />
                    <span className="text-gray-700 font-medium">Pro-level functionality that scales with your growing business.</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-border bg-gray-50">
                <img src={feature.image} alt={feature.title} className="w-full h-auto object-cover" />
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      
      {/* Bottom CTA */}
      <div className="bg-brand-primary py-24 text-center text-white">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to scale your business?</h2>
        <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto">Join 100,000+ businesses using Ricoz to automate their growth.</p>
        <button className="bg-[#00a688] text-white px-10 py-5 rounded-full font-bold hover:bg-[#008c73] transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-[#00a688]/30 text-lg">
          {ctaText} Now
        </button>
      </div>
    </div>
  );
}
