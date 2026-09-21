import { motion } from 'framer-motion';
import { ArrowRight, Handshake, TrendingUp, DollarSign, Award, CheckCircle2 } from 'lucide-react';

export function PartnerProgram() {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-6 bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
            >
              RICOZ PARTNER NETWORK
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6"
            >
              Grow your revenue. <br />
              <span className="text-[#00a688]">Become a Partner.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 font-medium"
            >
              Join forces with Ricoz Communication. Earn recurring commissions by helping your clients scale on the world's most powerful WhatsApp Business API platform.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="bg-[#00a688] text-white px-8 py-4 rounded-full font-bold hover:bg-[#008c73] transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-[#00a688]/30 text-lg">
                Apply Now
              </button>
            </motion.div>
          </div>
          
          <div className="lg:w-1/2 relative h-[500px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 h-full w-full"
            >
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop" alt="Partnership" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00a688]/40 to-transparent flex items-end p-8">
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl max-w-sm">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Earn up to</div>
                      <div className="text-2xl font-black text-gray-900">20% Rev-Share</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Program Benefits */}
      <div className="bg-gray-50 py-24 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Why partner with Ricoz?</h2>
            <p className="text-muted-foreground text-lg">We provide everything you need to succeed and grow your agency.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <DollarSign className="w-6 h-6" />, title: "Recurring Revenue", desc: "Earn generous, lifetime recurring commissions on every client you refer to Ricoz." },
              { icon: <Handshake className="w-6 h-6" />, title: "Dedicated Support", desc: "Get priority access to our partner success team and a dedicated account manager." },
              { icon: <TrendingUp className="w-6 h-6" />, title: "Co-Marketing", desc: "Unlock co-branded marketing materials, joint webinars, and case study opportunities." },
              { icon: <Award className="w-6 h-6" />, title: "Certification", desc: "Become a certified Ricoz expert. Display your badge to build trust with prospects." },
              { icon: <ArrowRight className="w-6 h-6" />, title: "Lead Sharing", desc: "Top-tier partners receive inbound leads directly from Ricoz's global sales team." },
              { icon: <CheckCircle2 className="w-6 h-6" />, title: "Free Agency Account", desc: "Get a complimentary top-tier Ricoz account to manage and demo for your clients." }
            ].map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
