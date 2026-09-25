import React from 'react';
import { Sparkles, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react';

interface PremiumFeatureProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PremiumFeature({ title, description, icon }: PremiumFeatureProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fcf9] h-full flex flex-col p-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#00a688] to-[#007b65] rounded-2xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 scale-150">
          <Sparkles className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col items-start">
          <div className="bg-white/20 p-3 rounded-xl mb-6 backdrop-blur-sm border border-white/30 shadow-sm">
            {icon || <Zap className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight drop-shadow-sm">{title}</h1>
          <p className="text-[#dcf2e9] text-lg max-w-2xl mb-8 leading-relaxed font-medium">
            {description}
          </p>
          <button className="bg-white text-[#00a688] font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2">
            <span>Join the Waitlist</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: <Zap className="w-6 h-6 text-[#00a688]" />, title: 'Lightning Fast', desc: 'Execute workflows instantly with our optimized engine.' },
          { icon: <Shield className="w-6 h-6 text-[#00a688]" />, title: 'Enterprise Security', desc: 'Bank-grade encryption ensures your data remains completely private.' },
          { icon: <BarChart3 className="w-6 h-6 text-[#00a688]" />, title: 'Advanced Analytics', desc: 'Track every interaction and optimize your strategy.' },
        ].map((feat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-[#f0fbf6] w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-[#d2efe0]">
              {feat.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{feat.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8 border-t border-gray-200">
        <p className="text-center text-sm text-gray-400 font-medium">
          This feature is currently in active development. Expected Q4 2026.
        </p>
      </div>
    </div>
  );
}
