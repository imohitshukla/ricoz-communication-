import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  return (
    <>
      {/* CTA Section */}
      <section className="py-24 bg-[#00a688] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to scale your business on WhatsApp?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join 100,000+ businesses growing their revenue with Ricoz Communication.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-white text-[#00a688] px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center shadow-xl"
            >
              Start Your Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white/10 transition-colors">
              Talk to Sales
            </button>
          </div>
          <p className="text-white/80 text-sm mt-6">14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 pt-20 pb-10 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-[#00a688] rounded-md flex items-center justify-center text-white font-bold text-xl rounded-bl-none">
                  R
                </div>
                <span className="text-2xl font-bold tracking-tight">ricoz</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                The all-in-one WhatsApp Business API platform for marketing, sales, and support. Built to help D2C brands scale faster.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#00a688] transition-colors text-white font-bold text-xs">
                  FB
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#00a688] transition-colors text-white font-bold text-xs">
                  TW
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#00a688] transition-colors text-white font-bold text-xs">
                  IG
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#00a688] transition-colors text-white font-bold text-xs">
                  IN
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Marketing Hub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support Hub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sales CRM</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Agents</a></li>
                <li><a href="#" className="hover:text-white transition-colors">WhatsApp Commerce</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Webinars</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Ricoz Communication. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
