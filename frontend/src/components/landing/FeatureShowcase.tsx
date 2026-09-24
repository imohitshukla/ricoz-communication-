import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShoppingCart, Users, Zap, Search, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    id: 'marketing',
    title: 'Marketing Hub',
    description: 'Launch broadcast campaigns, click-to-WhatsApp ads, and Instagram automation to drive 3x more conversions.',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-[#00a688]',
    bg: 'bg-[#00a688]/10',
    progressBg: 'bg-[#00a688]',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'support',
    title: 'Support Hub',
    description: 'An omnichannel shared inbox for WhatsApp and Instagram. Resolve queries faster with AI assistance.',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
    progressBg: 'bg-brand-primary',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'sales',
    title: 'Sales CRM',
    description: 'Capture leads from multiple sources and qualify them instantly using conversational workflows.',
    icon: <Users className="w-5 h-5" />,
    color: 'text-[#ff9900]',
    bg: 'bg-[#ff9900]/10',
    progressBg: 'bg-[#ff9900]',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'ai-agents',
    title: 'AI Agents & Chatbots',
    description: 'Build no-code chatbots and deploy conversational bots for lead qualification and instant support.',
    icon: <Bot className="w-5 h-5" />,
    color: 'text-success',
    bg: 'bg-success/10',
    progressBg: 'bg-success',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'commerce',
    title: 'WhatsApp Commerce',
    description: 'Sync Shopify or WooCommerce catalogs and accept payments directly within WhatsApp.',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'text-[#e4252b]',
    bg: 'bg-[#e4252b]/10',
    progressBg: 'bg-[#e4252b]',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop',
  }
];

const AUTOPLAY_DURATION = 6000; // 6 seconds per tab

export function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPaused) return;

    progressTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, AUTOPLAY_DURATION);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [activeIndex, isPaused]);

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    // Optional: Resume autoplay after a few seconds of inactivity
    setTimeout(() => setIsPaused(false), 10000); 
  };

  const activeFeature = features[activeIndex];

  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              Everything you need to scale on <span className="text-[#00a688]">WhatsApp</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              A comprehensive suite of tools designed to help you acquire, engage, and support your customers at scale.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Feature List */}
          <div className="w-full lg:w-1/2 space-y-4">
            {features.map((feature, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={feature.id}
                  onClick={() => handleTabClick(index)}
                  className={cn(
                    "p-6 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden border-2",
                    isActive 
                      ? "bg-white border-[#00a688] shadow-lg shadow-[#00a688]/10" 
                      : "bg-transparent border-transparent hover:bg-white/50"
                  )}
                >
                  {/* Progress Bar Background */}
                  {isActive && !isPaused && (
                    <motion.div
                      key={`progress-${feature.id}`}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: AUTOPLAY_DURATION / 1000, ease: 'linear' }}
                      className={cn("absolute bottom-0 left-0 h-1 opacity-20", feature.progressBg)}
                    />
                  )}
                  {isActive && isPaused && (
                    <div className={cn("absolute bottom-0 left-0 h-1 w-full opacity-20", feature.progressBg)} />
                  )}

                  <div className="flex items-start space-x-4 relative z-10">
                    <div className={cn("p-3 rounded-xl transition-colors", isActive ? feature.bg : 'bg-sunken', isActive ? feature.color : 'text-secondary')}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">{feature.title}</h3>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className="text-muted-foreground leading-relaxed pt-2">{feature.description}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Image / Interactive UI */}
          <div className="w-full lg:w-1/2 relative h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gray-100 border border-border">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={activeFeature.image} 
                  alt={activeFeature.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-8">
                  <div className="text-white transform transition-transform duration-500 hover:-translate-y-2">
                    <div className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3 backdrop-blur-md bg-white/20 border border-white/30", activeFeature.color.replace('text-', 'text-white ' /* Keep it white */))}>
                      {activeFeature.title}
                    </div>
                    <h4 className="text-3xl font-bold mb-3">Explore {activeFeature.title}</h4>
                    <button className="text-sm font-semibold hover:underline flex items-center bg-white text-primary px-5 py-2.5 rounded-full shadow-lg">
                      See it in action <Search className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
