import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, VolumeX, Maximize, MoreVertical, Check } from 'lucide-react';

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Step 1 State
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>('Marketing & Advertising');
  const [subCategory, setSubCategory] = useState<string>('');

  // Step 2 State
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);

  // Step 3 State
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(['Google Sheets']);

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else navigate('/dashboard'); // Or wherever it should go after onboarding
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleSelection = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Let's Get Started!</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Which industry does your business belong to?</h1>
              <p className="text-sm text-gray-500">We'll accordingly personalise your experience.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                'Marketing & Advertising', 'Retail', 'Education',
                'Entertainment, Social Media & Gaming', 'Finance', 'Healthcare',
                'Public Utilities & Non-Profits', 'Professional Services', 'Technology',
                'Travel & Hospitality', 'Automotive', 'Real Estate & Construction', 'Restaurants',
                'Manufacturing & Impex', 'Fitness & Wellness'
              ].map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-4 py-2 text-sm rounded border transition-colors ${
                    selectedIndustry === ind
                      ? 'border-[#00a688] bg-[#00a688]/5 text-[#00a688] font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-base font-bold text-gray-900">Sub-category</h2>
              <select 
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full border border-gray-200 rounded p-3 text-sm text-gray-600 focus:outline-none focus:border-[#00a688] appearance-none bg-white"
              >
                <option value="" disabled>Select a sub-category</option>
                <option value="agency">Digital Agency</option>
                <option value="consulting">Consulting</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">What would you like to use Ricoz for?</h1>
              <p className="text-sm text-gray-500">Choose upto 3 objectives & we will help you achieve those super-quick!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Generate High-intent Leads', desc: 'Click to WhatsApp Ads' },
                { title: 'Qualify Ad Leads', desc: 'WhatsApp Forms' },
                { title: 'Re-target Qualified Leads in Bulk', desc: 'WhatsApp Bulk Campaigns' },
                { title: 'Automate Regular Follow-ups on Leads', desc: 'WhatsApp Automated Notifications' },
                { title: 'Increase Instagram Followers', desc: 'Insta Giveaway Automation' },
                { title: 'Other Reasons', desc: 'If you wish to do something else' }
              ].map((obj) => (
                <div 
                  key={obj.title}
                  onClick={() => toggleSelection(obj.title, selectedObjectives, setSelectedObjectives)}
                  className={`border rounded-lg p-4 cursor-pointer flex justify-between items-start transition-colors ${
                    selectedObjectives.includes(obj.title) ? 'border-[#00a688] bg-[#00a688]/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{obj.title}</p>
                    <p className="text-xs text-gray-500">{obj.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mt-1 ${
                    selectedObjectives.includes(obj.title) ? 'border-[#00a688] bg-[#00a688]' : 'border-gray-300'
                  }`}>
                    {selectedObjectives.includes(obj.title) && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Looking to integrate with a software tool?</h1>
              <p className="text-sm text-gray-500">You can connect Ricoz to tools used by your team.</p>
            </div>

            <div className="space-y-8 overflow-y-auto pr-4 pb-12" style={{ maxHeight: '60vh' }}>
              {/* Sections for integrations */}
              {[
                { 
                  category: 'Custom Integration', 
                  items: [{ name: 'Ricoz APIs & Webhooks', color: 'bg-orange-100', text: 'text-orange-600', icon: '</>' }] 
                },
                { 
                  category: 'Popular Tools', 
                  items: [
                    { name: 'Shopify', color: 'bg-green-100', text: 'text-green-600', icon: 'S' },
                    { name: 'Google Sheets', color: 'bg-green-100', text: 'text-green-600', icon: 'G' },
                    { name: 'Facebook Lead Form', color: 'bg-blue-100', text: 'text-blue-600', icon: 'f' }
                  ] 
                },
                {
                  category: 'Payment Provider',
                  items: [
                    { name: 'WhatsApp Pay', color: 'bg-green-100', text: 'text-green-600', icon: 'W' },
                    { name: 'Razorpay', color: 'bg-blue-900', text: 'text-white', icon: 'R' },
                    { name: 'PayU', color: 'bg-lime-500', text: 'text-white', icon: 'P' },
                    { name: 'Stripe', color: 'bg-indigo-500', text: 'text-white', icon: 'S' }
                  ]
                },
                {
                  category: 'CRM Platform',
                  items: [
                    { name: 'Zoho CRM', color: 'bg-blue-500', text: 'text-white', icon: 'Z' },
                    { name: 'HubSpot', color: 'bg-orange-500', text: 'text-white', icon: 'H' },
                    { name: 'Salesforce', color: 'bg-blue-400', text: 'text-white', icon: 'S' }
                  ]
                }
              ].map((section) => (
                <div key={section.category}>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">{section.category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {section.items.map((item) => (
                      <div 
                        key={item.name}
                        onClick={() => toggleSelection(item.name, selectedIntegrations, setSelectedIntegrations)}
                        className={`border rounded-lg p-3 flex items-center justify-between cursor-pointer transition-colors ${
                          selectedIntegrations.includes(item.name) ? 'border-[#00a688] bg-[#00a688]/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-sm flex items-center justify-center font-bold text-xs ${item.color} ${item.text}`}>
                            {item.icon}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedIntegrations.includes(item.name) ? 'border-[#00a688] bg-[#00a688]' : 'border-gray-300'
                        }`}>
                          {selectedIntegrations.includes(item.name) && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Final Step</h1>
              <p className="text-sm text-gray-500">Almost there! Complete your setup.</p>
            </div>
            {/* Placeholder for step 4 since it wasn't in the images */}
            <div className="p-8 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              <p>Final configuration options here.</p>
            </div>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      
      {/* Left Column - Onboarding Flow */}
      <div className="w-full md:w-3/5 lg:w-[55%] flex flex-col px-8 py-12 md:px-16 lg:px-24">
        
        {/* Header (Back button + Progress) */}
        <div className="mb-12">
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="h-9 mb-8"></div> // Spacer to keep layout stable
          )}

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Step {step} of 4</span>
            <div className="flex-1 max-w-[120px] h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-[#00a688] transition-all duration-300 ease-in-out" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1">
          {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <div className="pt-8 mt-auto flex space-x-4">
          {step === 3 && (
            <button 
              onClick={nextStep}
              className="flex-1 border border-[#00a688] text-[#00a688] bg-white font-bold py-3 rounded hover:bg-[#00a688]/5 transition-colors"
            >
              Skip
            </button>
          )}
          <button 
            onClick={nextStep}
            className={`flex-1 font-bold py-3 rounded transition-colors text-white ${
              (step === 1 && !selectedIndustry) || (step === 2 && selectedObjectives.length === 0) 
                ? 'bg-[#89a29a] cursor-not-allowed' 
                : 'bg-[#1e4c3b] hover:bg-[#153a2d]'
            }`}
            disabled={(step === 1 && !selectedIndustry) || (step === 2 && selectedObjectives.length === 0)}
          >
            {step === totalSteps ? 'Complete' : 'Next \u2192'}
          </button>
        </div>
      </div>

      {/* Right Column - Welcome Video */}
      <div className="hidden md:flex w-full md:w-2/5 lg:w-[45%] bg-white p-8">
        <div className="w-full h-full bg-[#f4fbf7] rounded-3xl p-12 flex flex-col justify-center">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Hey! Welcome to Ricoz</h2>
          <p className="text-sm text-gray-500 mb-8">Here is a short introduction video.</p>

          {/* Video Player Mockup */}
          <div className="bg-[#073223] rounded-2xl aspect-video relative overflow-hidden shadow-xl">
            {/* Background elements */}
            <div className="absolute top-6 left-6 w-16 h-4 bg-[#00a688] rounded-full opacity-60"></div>
            <div className="absolute top-12 left-12 w-20 h-5 bg-[#00a688] rounded-full opacity-60"></div>
            <div className="absolute top-8 right-12 w-24 h-6 bg-[#00a688] rounded-full opacity-60"></div>
            <div className="absolute bottom-12 right-20 w-16 h-4 bg-[#00a688] rounded-full opacity-60"></div>
            
            {/* Sparkles */}
            <div className="absolute top-1/4 right-1/3 text-[#00a688] rotate-45">✦</div>
            <div className="absolute bottom-1/4 right-1/4 text-[#00a688] rotate-12">✦</div>
            <div className="absolute top-1/2 left-8 text-[#00a688] -rotate-12">✦</div>

            {/* Faded Text Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-white/5 tracking-wider">Here!</span>
            </div>

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer">
                <Play className="w-8 h-8 text-white ml-1 fill-current" />
              </button>
            </div>

            {/* Video Controls Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex items-center space-x-4">
              <Play className="w-4 h-4 text-white cursor-pointer fill-current" />
              <span className="text-white text-xs font-medium">0:00 / 1:45</span>
              
              <div className="flex-1 flex items-center justify-end space-x-4">
                <VolumeX className="w-4 h-4 text-white cursor-pointer" />
                <Maximize className="w-4 h-4 text-white cursor-pointer" />
                <MoreVertical className="w-4 h-4 text-white cursor-pointer" />
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
              <div className="w-1/3 h-full bg-red-600"></div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
