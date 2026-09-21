import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-900 mt-[40px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop" 
          alt="Team working" 
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl lg:text-[64px] font-bold leading-[1.1] tracking-tight text-white mb-6"
          >
            <span className="text-[#6495ED]">Automate Support</span>
            <br />
            on WhatsApp, Instagram and RCS!
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-lg lg:text-xl text-gray-200 mb-10 max-w-lg leading-relaxed"
          >
            Engage audiences, accelerate sales and drive better customer support with AI-powered automation
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4"
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-[#00a688] text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-[#008c73] transition-all flex items-center justify-center group shadow-lg shadow-[#00a688]/20"
            >
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-white/10 transition-colors">
              Book a Demo
            </button>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm text-gray-300"
          >
            14 day free trial | No credit card required
          </motion.p>
        </div>
      </div>
    </section>
  );
}
