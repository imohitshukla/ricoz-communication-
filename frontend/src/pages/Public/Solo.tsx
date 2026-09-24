import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, PenTool, TrendingUp, MessageCircle, Clock, CheckCircle2, Download } from 'lucide-react';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export function SoloPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-[#ff7a00] selection:text-white font-inter">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] flex flex-col justify-center items-center text-center">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/80 via-[#111111]/60 to-[#111111] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Business owner working" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        <motion.div 
          className="relative z-20 max-w-4xl mx-auto flex flex-col items-center"
          initial="hidden" animate="visible" variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="flex items-center gap-1 mb-6">
            <span className="text-6xl md:text-8xl font-bold tracking-tight text-white font-outfit">solo</span>
            <Sparkles className="w-10 h-10 md:w-14 md:h-14 text-[#ff7a00] mt-[-2rem]" fill="currentColor" />
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-medium tracking-tight mb-4 font-outfit text-white">
            Your AI Business Team
          </motion.h1>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-medium tracking-tight mb-12 text-zinc-400 font-outfit">
            Working full-time <span className="text-[#ff7a00] italic">for you.</span>
          </motion.h2>

          <motion.div variants={itemVariants} className="flex items-center gap-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-full py-2 px-6 mb-12">
            <div className="flex -space-x-3">
              <img className="w-8 h-8 rounded-full border-2 border-[#111]" src="https://i.pravatar.cc/100?img=1" alt="User" />
              <img className="w-8 h-8 rounded-full border-2 border-[#111]" src="https://i.pravatar.cc/100?img=2" alt="User" />
              <img className="w-8 h-8 rounded-full border-2 border-[#111]" src="https://i.pravatar.cc/100?img=3" alt="User" />
            </div>
            <span className="text-sm font-medium text-zinc-300">Loved and trusted by 1000's of solopreneurs and small businesses</span>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-zinc-400 font-medium mr-2">Available on</span>
            <button className="inline-flex items-center justify-center font-medium bg-[#1a1a1a] hover:bg-[#222] border border-white/10 text-white rounded-xl h-14 px-6 gap-3 transition-colors focus:outline-none">
              <Download className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] leading-none text-zinc-400 uppercase tracking-wider">Get it on</span>
                <span className="text-sm font-semibold leading-none mt-1">Google Play</span>
              </div>
            </button>
            <button className="inline-flex items-center justify-center font-medium bg-[#1a1a1a] hover:bg-[#222] border border-white/10 text-white rounded-xl h-14 px-6 gap-3 transition-colors focus:outline-none">
              <Download className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] leading-none text-zinc-400 uppercase tracking-wider">Download on the</span>
                <span className="text-sm font-semibold leading-none mt-1">App Store</span>
              </div>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#1a1a1a] rounded-[3rem] my-12 relative overflow-hidden">
        <div className="text-center mb-20 relative z-10">
          <h2 className="text-4xl md:text-5xl font-medium font-outfit mb-4">
            Meet the <span className="text-[#ff7a00]">AI growth team</span><Sparkles className="inline-block w-6 h-6 text-[#ff7a00] ml-1 mb-6" fill="currentColor"/>
          </h2>
          <p className="text-xl text-zinc-400">Two AI Teammates working behind your business, every single day.</p>
        </div>

        {/* Tara - Marketing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 relative z-10">
          <div>
            <h3 className="text-3xl font-medium font-outfit text-[#ff7a00] mb-4">Tara • Handles Marketing</h3>
            <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
              Understands your brand, creates images & reels, plans monthly content calendar, and runs ad campaigns that brings new customers. You approve, Tara publishes.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-white mr-2">Skills:</span>
              <div className="flex items-center gap-2 border border-[#ff7a00]/30 rounded-full px-4 py-2 bg-[#ff7a00]/10 text-[#ff7a00]">
                <Calendar className="w-4 h-4" /> <span className="text-sm font-medium">Content Planning</span>
              </div>
              <div className="flex items-center gap-2 border border-[#ff7a00]/30 rounded-full px-4 py-2 bg-[#ff7a00]/10 text-[#ff7a00]">
                <PenTool className="w-4 h-4" /> <span className="text-sm font-medium">Creatives</span>
              </div>
              <div className="flex items-center gap-2 border border-[#ff7a00]/30 rounded-full px-4 py-2 bg-[#ff7a00]/10 text-[#ff7a00]">
                <TrendingUp className="w-4 h-4" /> <span className="text-sm font-medium">Social Media & Meta Ads</span>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-tr from-[#ff7a00]/20 to-transparent border border-white/5 flex items-end justify-center">
            {/* Avatar placeholder - in a real app this would be the 3D render */}
            <div className="absolute inset-0 bg-[#ff7a00]/5" />
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Tara AI Agent" 
              className="w-full h-full object-cover mix-blend-luminosity opacity-80"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent">
              <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl max-w-sm ml-auto mr-auto transform translate-y-4">
                <p className="text-sm text-zinc-300">"I've scheduled 3 Instagram posts for this week and optimized your Meta Ads budget. Tap to approve."</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ved - Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="order-2 lg:order-1 relative h-[500px] rounded-3xl overflow-hidden bg-gradient-to-tr from-[#00a688]/20 to-transparent border border-white/5 flex items-end justify-center">
             <div className="absolute inset-0 bg-[#00a688]/5" />
             <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Ved AI Agent" 
              className="w-full h-full object-cover mix-blend-luminosity opacity-80"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent">
              <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl max-w-sm ml-auto mr-auto transform translate-y-4">
                <p className="text-sm text-zinc-300">"I just replied to 12 WhatsApp inquiries and closed 3 sales while you were asleep."</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h3 className="text-3xl font-medium font-outfit text-[#00a688] mb-4">Ved • Handles Sales</h3>
            <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
              Replies to customer inquiries on WhatsApp & Instagram DM within seconds, recommends products, sends follow-ups to quiet leads, and manages bookings 24/7.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-white mr-2">Skills:</span>
              <div className="flex items-center gap-2 border border-[#00a688]/30 rounded-full px-4 py-2 bg-[#00a688]/10 text-[#00a688]">
                <MessageCircle className="w-4 h-4" /> <span className="text-sm font-medium">WhatsApp & IG DMs</span>
              </div>
              <div className="flex items-center gap-2 border border-[#00a688]/30 rounded-full px-4 py-2 bg-[#00a688]/10 text-[#00a688]">
                <CheckCircle2 className="w-4 h-4" /> <span className="text-sm font-medium">Lead Conversion</span>
              </div>
              <div className="flex items-center gap-2 border border-[#00a688]/30 rounded-full px-4 py-2 bg-[#00a688]/10 text-[#00a688]">
                <Clock className="w-4 h-4" /> <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A Day With SOLO */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-medium font-outfit mb-4">A Day with SOLO</h2>
          <p className="text-xl text-zinc-400">While you focus on the craft, your AI team handles the business.</p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#1a1a1a] text-zinc-400 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Clock className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-[#1a1a1a] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#ff7a00] font-bold text-sm">07:30 AM</span>
                <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md text-zinc-400">You</span>
              </div>
              <p className="text-zinc-300">Wake up, exercise, and pack today's orders.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#ff7a00]/30 bg-[#ff7a00]/10 text-[#ff7a00] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-gradient-to-br from-[#ff7a00]/10 to-[#1a1a1a] border border-[#ff7a00]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#ff7a00] font-bold text-sm">08:31 AM</span>
                <span className="text-xs font-medium px-2 py-1 bg-[#ff7a00]/20 text-[#ff7a00] rounded-md">Tara</span>
              </div>
              <p className="text-zinc-300">Instagram post published automatically (creative & captions were generated overnight).</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00a688]/30 bg-[#00a688]/10 text-[#00a688] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-gradient-to-br from-[#00a688]/10 to-[#1a1a1a] border border-[#00a688]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#00a688] font-bold text-sm">01:43 PM</span>
                <span className="text-xs font-medium px-2 py-1 bg-[#00a688]/20 text-[#00a688] rounded-md">Ved</span>
              </div>
              <p className="text-zinc-300">Responds to WhatsApp leads in &lt;90 seconds and converts a browsing customer into a buyer.</p>
            </div>
          </div>

           <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00a688]/30 bg-[#00a688]/10 text-[#00a688] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Clock className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-gradient-to-br from-[#00a688]/10 to-[#1a1a1a] border border-[#00a688]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#00a688] font-bold text-sm">03:34 AM</span>
                <span className="text-xs font-medium px-2 py-1 bg-[#00a688]/20 text-[#00a688] rounded-md">Ved</span>
              </div>
              <p className="text-zinc-300">Answers late-night Instagram DMs while you sleep, capturing leads that normally bounce.</p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#ff7a00] to-[#e66a00] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-medium font-outfit mb-6">Ready to hire your AI team?</h2>
            <p className="text-xl md:text-2xl mb-10 text-white/90">Free to start. Upgrade or cancel anytime. Available on iOS & Android.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="inline-flex items-center justify-center bg-white text-[#ff7a00] hover:bg-zinc-100 rounded-full h-14 px-8 text-lg font-bold transition-colors focus:outline-none">
                Get the App Now
              </button>
              <button className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full h-14 px-8 text-lg font-bold transition-colors focus:outline-none">
                Register for Webinar
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
