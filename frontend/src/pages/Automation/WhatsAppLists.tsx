import { useState, useEffect } from 'react';
import { 
  ListFilter, 
  Plus, 
  Smartphone, 
  CheckCircle2, 
  Layers, 
  Send, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

export function WhatsAppLists() {
  const [lists, setLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await api.get('/api/whatsapp/lists');
      if (Array.isArray(res.data)) {
        setLists(res.data);
        if (res.data.length > 0) setSelectedList(res.data[0]);
      }
    } catch (e) {
      console.error('Failed to load lists:', e);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fc] h-full p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-7 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 inline-flex items-center">
              <ListFilter className="w-3.5 h-3.5 mr-1" />
              Meta WhatsApp Interactive List Studio
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">WhatsApp Interactive Lists & Menus</h1>
            <p className="text-emerald-200 text-sm mt-1 max-w-2xl">
              Organize up to 10 structured options across categorized sections. Ideal for support routing, service directories, and product packages.
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lists Selection (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Configured List Menus ({lists.length})</h2>
            
            <div className="space-y-4">
              {lists.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedList(item);
                    setIsMenuOpen(false);
                  }}
                  className={`bg-white border p-5 rounded-2xl shadow-sm transition-all cursor-pointer ${
                    selectedList?.id === item.id ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>
                    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                      Button: "{item.buttonText}"
                    </span>
                  </div>

                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                    {item.sections?.map((sec: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{sec.title}</div>
                        <div className="space-y-1">
                          {sec.rows?.map((row: any) => (
                            <div key={row.id} className="flex justify-between items-center text-xs py-0.5">
                              <span className="font-semibold text-slate-900">• {row.title}</span>
                              <span className="text-slate-500 text-[11px]">{row.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone Emulator (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
              <Smartphone className="w-4 h-4 mr-1.5 text-emerald-600" />
              Interactive WhatsApp List Preview
            </div>

            <div className="w-[360px] h-[700px] bg-slate-950 rounded-[44px] p-3.5 shadow-2xl ring-1 ring-slate-800 relative flex flex-col overflow-hidden">
              <div className="w-full h-full bg-[#ECE5DD] rounded-[36px] overflow-hidden flex flex-col relative z-20">
                
                {/* Header */}
                <div className="bg-[#075E54] text-white px-4 py-3 flex items-center space-x-2 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-bold">Ricoz Interactive Menu</div>
                    <div className="text-[10px] text-emerald-200">Verified Business</div>
                  </div>
                </div>

                {/* Chat Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                  
                  {/* List Message Bubble */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 max-w-[280px]">
                    <h4 className="font-extrabold text-sm text-slate-900 mb-1">{selectedList?.title || 'Service Directory'}</h4>
                    <p className="text-xs text-slate-600 mb-3">Please choose an option from the menu below to connect with the right department.</p>
                    
                    <button
                      onClick={() => setIsMenuOpen(true)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-emerald-700 font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <Menu className="w-3.5 h-3.5" />
                      <span>{selectedList?.buttonText || 'View Options'}</span>
                    </button>
                  </div>

                  {/* Opened Sheet Popover */}
                  {isMenuOpen && (
                    <div className="absolute inset-x-2 bottom-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-30 animate-in slide-in-from-bottom duration-300">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                        <span className="font-extrabold text-xs text-slate-900">{selectedList?.title}</span>
                        <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 hover:text-slate-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 max-h-56 overflow-y-auto">
                        {selectedList?.sections?.map((sec: any, idx: number) => (
                          <div key={idx}>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{sec.title}</div>
                            <div className="space-y-1">
                              {sec.rows?.map((row: any) => (
                                <button
                                  key={row.id}
                                  onClick={() => {
                                    alert(`Selected: "${row.title}"`);
                                    setIsMenuOpen(false);
                                  }}
                                  className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors border border-transparent hover:border-emerald-200"
                                >
                                  <div className="font-bold text-xs text-slate-900">{row.title}</div>
                                  <div className="text-[10px] text-slate-500">{row.description}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
