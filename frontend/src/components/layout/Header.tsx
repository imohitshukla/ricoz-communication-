import { Bell, Settings, ChevronDown, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shrink-0 z-50">
      
      <div className="flex items-center space-x-4">
        {/* Trial Badge */}
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-md p-1 pr-2">
          <span className="text-xs font-semibold text-green-700 px-2 py-1 rounded bg-green-100">Trial Plan</span>
          <span className="text-xs text-gray-600 font-medium">⏱ 13 Days Left</span>
          <button className="text-xs bg-[#1e4c3b] hover:bg-[#153a2d] text-white px-3 py-1.5 rounded font-semibold transition-colors">
            Subscribe
          </button>
        </div>

        {/* Notifications */}
        <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        {/* Avatar & Profile Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-1 p-1 hover:bg-gray-50 rounded-full transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1e4c3b] flex items-center justify-center text-white font-bold text-sm">
              MS
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 absolute bottom-1 right-1 border-2 border-white"></div>
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-3 tracking-wider">USER DETAILS</p>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#1e4c3b] flex items-center justify-center text-white font-bold text-lg">
                    MS
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Mohit Shukla</p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <span className="text-xs text-gray-500">Offline</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Set Your Availability</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Offline</span>
                    <button className="w-10 h-6 bg-gray-200 rounded-full flex items-center px-1 transition-colors">
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <p className="text-xs font-bold text-gray-500 mb-3 tracking-wider">ACCOUNT SUMMARY</p>
                <div className="bg-[#1e4c3b] rounded-lg p-3 text-white mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                  <div className="flex items-center space-x-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#00a688] flex items-center justify-center font-bold text-white shadow-sm border border-white/20">
                      CS
                    </div>
                    <div>
                      <p className="font-bold">ct scan</p>
                      <p className="text-[10px] text-gray-300 flex items-center">Copy Org ID <span className="ml-1">📋</span></p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between bg-black/20 rounded p-2 relative z-10">
                    <span className="text-xs font-medium">Free Trial</span>
                    <button className="text-[10px] font-bold bg-white text-[#1e4c3b] px-2 py-1 rounded shadow-sm">
                      Start Subscription
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <span>📞</span>
                      <span className="text-gray-600">WhatsApp Number:</span>
                      <span className="font-semibold text-gray-900">16086000059</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <span>📸</span>
                      <span className="text-gray-600">Instagram Account:</span>
                      <span className="font-medium text-gray-900">-</span>
                    </div>
                    <button className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium">Connect</button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center space-x-2 text-red-500 bg-red-50 hover:bg-red-100 py-2.5 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-semibold text-sm">Log Out</span>
                </button>
                <div className="text-center mt-4 text-[10px] text-gray-400">
                  <p>Terms And Conditions | Privacy Policy</p>
                  <p className="mt-1">Version : 3.113.68</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
