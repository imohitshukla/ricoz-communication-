import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "Ricoz Communication transformed how we handle customer support. Our response time dropped by 80% and customer satisfaction is at an all-time high.",
    name: "Sarah Chen",
    role: "Head of CX, Urban Trends",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    quote: "The click-to-WhatsApp ads paired with their AI chatbots gave us a 3x higher conversion rate than our traditional Facebook ad campaigns.",
    name: "Rajesh Kumar",
    role: "Marketing Director, FreshCart",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    quote: "Integrating our Shopify store with WhatsApp Commerce took literally minutes. Now 40% of our repeat orders happen entirely on WhatsApp.",
    name: "Elena Rodriguez",
    role: "Founder, Glow Beauty",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 4,
    quote: "The best ROI we've seen from any tool this year. The automated workflows and broadcast campaigns are a game changer for our D2C growth.",
    name: "Michael Chang",
    role: "CEO, Nexa Tech",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"
  }
];

export function Testimonials() {
  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, []);

  return (
    <section className="py-24 bg-gray-50 border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              Loved by fast-growing brands
            </h2>
            <p className="text-lg text-muted-foreground">
              Don't just take our word for it. See how businesses are using Ricoz to drive real growth and automate customer experiences.
            </p>
          </div>
          <div className="hidden md:flex space-x-4 mt-6 md:mt-0">
            {/* Visual indicators for drag */}
            <div className="flex items-center text-sm font-semibold text-secondary bg-white px-4 py-2 rounded-full shadow-sm border border-border">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Drag to explore
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        <motion.div ref={carousel} className="cursor-grab active:cursor-grabbing">
          <motion.div 
            drag="x" 
            dragConstraints={{ right: 0, left: -width }}
            whileTap={{ cursor: "grabbing" }}
            className="flex space-x-6"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                className="min-w-[320px] md:min-w-[400px] bg-white p-8 rounded-2xl shadow-sm border border-border relative group hover:shadow-md transition-shadow pointer-events-none"
              >
                <Quote className="absolute top-6 right-6 w-10 h-10 text-gray-100 group-hover:text-[#00a688]/10 transition-colors" />
                <div className="flex space-x-1 mb-6 text-[#ff9900]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-primary text-lg leading-relaxed mb-8 relative z-10 font-medium">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center space-x-4 mt-auto">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100"
                  />
                  <div>
                    <h4 className="font-bold text-primary">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
