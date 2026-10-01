import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Send, 
  Trash2,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

export function WhatsAppForms() {
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('Product Pre-Order Qualification');
  const [newDescription, setNewDescription] = useState('Collect shipping address, product size, and custom delivery instructions directly inside WhatsApp.');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await api.get('/api/whatsapp/forms');
      if (Array.isArray(res.data)) {
        setForms(res.data);
        if (res.data.length > 0) setSelectedForm(res.data[0]);
      }
    } catch (e) {
      console.error('Failed to load forms:', e);
    }
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/whatsapp/forms', {
        title: newTitle,
        description: newDescription,
        fields: [
          { id: 'f1', type: 'text', label: 'Customer Full Name' },
          { id: 'f2', type: 'dropdown', label: 'Package Selected', options: ['Starter', 'Growth', 'Enterprise'] },
          { id: 'f3', type: 'text', label: 'Delivery Location / Address' }
        ]
      });

      setForms([res.data, ...forms]);
      setSelectedForm(res.data);
      setIsCreateOpen(false);
    } catch (e) {
      alert('Failed to save form');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fc] h-full p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-[#00a688] to-[#1e4c3b] text-white p-7 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 inline-flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1" />
              Meta WhatsApp Flows 3.0
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">WhatsApp Interactive Forms & Flows</h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              Gather rich structured leads, book appointments, collect CSAT reviews, and process orders without taking users out of WhatsApp.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-white text-[#1e4c3b] hover:bg-emerald-50 font-extrabold px-6 py-3 rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Interactive Flow</span>
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Forms List (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Active WhatsApp Forms ({forms.length})</h2>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                100% In-App Rendering
              </span>
            </div>

            <div className="space-y-4">
              {forms.map(form => (
                <div 
                  key={form.id} 
                  onClick={() => setSelectedForm(form)}
                  className={`bg-white border p-5 rounded-2xl shadow-sm transition-all cursor-pointer ${
                    selectedForm?.id === form.id ? 'border-[#00a688] ring-2 ring-[#00a688]/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-extrabold text-slate-900 text-base">{form.title}</h3>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {form.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{form.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <span className="flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1 text-[#00a688]" />
                      {form.fields?.length || 3} Interactive Fields
                    </span>
                    <span className="font-bold text-slate-900">
                      {form.submissionsCount || 0} Submissions Collected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Phone Screen Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
              <Smartphone className="w-4 h-4 mr-1.5 text-[#00a688]" />
              WhatsApp Flow Phone Emulator
            </div>

            <div className="w-[360px] h-[700px] bg-slate-950 rounded-[44px] p-3.5 shadow-2xl ring-1 ring-slate-800 relative flex flex-col overflow-hidden">
              <div className="w-full h-full bg-[#ECE5DD] rounded-[36px] overflow-hidden flex flex-col relative z-20">
                
                {/* Header */}
                <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                      R
                    </div>
                    <div>
                      <div className="text-xs font-bold">Ricoz Verified</div>
                      <div className="text-[10px] text-emerald-200">Interactive Flow</div>
                    </div>
                  </div>
                </div>

                {/* Form Body Inside WhatsApp */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {selectedForm?.title || 'Interactive Lead Form'}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{selectedForm?.description}</p>

                    {/* Render Form Fields */}
                    <div className="space-y-3">
                      {(selectedForm?.fields || [
                        { label: 'Company Name', type: 'text' },
                        { label: 'Message Volume', type: 'dropdown', options: ['< 5,000', '5k - 25k', '25k - 100k'] },
                        { label: 'Work Email Address', type: 'text' }
                      ]).map((field: any, i: number) => (
                        <div key={i}>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">{field.label}</label>
                          {field.type === 'dropdown' ? (
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800">
                              {(field.options || ['Option 1', 'Option 2']).map((opt: string) => (
                                <option key={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => alert('Form response submitted and logged to Contacts & CRM!')}
                      className="w-full mt-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Submit Response
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Create Flow Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-lg">Create WhatsApp Interactive Flow</h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Flow Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Subtitle</label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm resize-none"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-bold bg-[#00a688] hover:bg-[#008f75] text-white rounded-xl shadow-md cursor-pointer"
                  >
                    Save & Deploy Flow
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
