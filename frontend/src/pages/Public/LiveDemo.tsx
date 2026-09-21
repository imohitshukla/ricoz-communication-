import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Shield, Calendar, Users, Building, ArrowRight } from 'lucide-react';

export function LiveDemo() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate booking
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Value Prop */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight mb-6">
                See Ricoz in action. <br />
                <span className="text-[#00a688]">Book a personalized demo.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10 font-medium">
                Get a tailored walkthrough of the world's most powerful WhatsApp Business API platform.
              </p>

              <div className="space-y-6 mb-12">
                {[
                  "Discover how to automate 80% of customer support.",
                  "Learn how to set up high-converting WhatsApp marketing broadcasts.",
                  "See our No-Code AI Chatbot Builder in real-time.",
                  "Get a custom ROI calculation for your specific industry."
                ].map((item, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-[#00a688] mr-4 shrink-0 mt-0.5" />
                    <span className="text-lg text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-10">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Trusted by industry leaders</p>
                <div className="flex gap-8 opacity-60 grayscale">
                  <div className="text-xl font-bold">RAHEJA REALTY</div>
                  <div className="text-xl font-bold font-serif">MUDRA</div>
                  <div className="text-xl font-bold">WADHAWAN</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Demo Form (Calendly Placeholder) */}
          <div className="lg:w-1/2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl shadow-[#00a688]/10 p-8 border border-gray-100 relative overflow-hidden"
            >
              {/* Form/Calendly Container */}
              {isSubmitted ? (
                <div className="h-[500px] flex flex-col items-center justify-center text-center px-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-[#00a688]" />
                  </div>
                  <h3 className="text-3xl font-bold text-primary mb-4">Demo Requested!</h3>
                  <p className="text-muted-foreground text-lg mb-8">
                    Our team will reach out to the email provided within 1 business day to confirm your personalized walkthrough.
                  </p>
                  <button onClick={() => window.history.back()} className="text-[#00a688] font-bold flex items-center hover:underline">
                    Return to Homepage <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 bg-[#00a688]/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#00a688]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary">Schedule your demo</h3>
                      <p className="text-sm text-muted-foreground">Takes less than a minute</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">First Name *</label>
                        <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00a688]/50 focus:border-[#00a688] transition-all" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Last Name *</label>
                        <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00a688]/50 focus:border-[#00a688] transition-all" placeholder="Doe" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Work Email *</label>
                      <input required type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00a688]/50 focus:border-[#00a688] transition-all" placeholder="john@company.com" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Phone Number *</label>
                      <input required type="tel" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00a688]/50 focus:border-[#00a688] transition-all" placeholder="+1 (555) 000-0000" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Company Name *</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input required type="text" className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00a688]/50 focus:border-[#00a688] transition-all" placeholder="Acme Corp" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Monthly WhatsApp Volume</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select className="w-full appearance-none bg-white border border-gray-200 text-gray-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00a688]/50 focus:border-[#00a688] transition-all">
                          <option>Just starting</option>
                          <option>1k - 10k messages</option>
                          <option>10k - 100k messages</option>
                          <option>100k+ messages</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-[#00a688] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#008c73] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#00a688]/30 flex items-center justify-center">
                      Request Demo <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                    
                    <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center">
                      <Shield className="w-3 h-3 mr-1" /> Your data is secure and encrypted.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
