import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, MessageSquare, Info, ShieldCheck } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Step 2 State
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'instagram' | 'both'>('whatsapp');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [revenue, setRevenue] = useState('');
  const [otp, setOtp] = useState('');
  const [optIn, setOptIn] = useState(true);

  const [error, setError] = useState('');

  const handleNext = () => {
    if (!email || !firstName || !lastName) {
      setError('Please fill in all fields to continue.');
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !companyName) {
      setError('Please fill in phone number and company name.');
      return;
    }
    setError('');
    // Mock API submission here
    console.log('Form submitted', { email, firstName, lastName, phone, companyName });
    
    // Navigate to onboarding flow
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#073223]">
      {/* Header */}
      <header className="bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded bg-[#00a688] flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="font-bold text-xl text-primary tracking-tight">Ricoz Communication</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-800">Already a user?</span>
          <Link to="/login" className="text-sm font-bold text-gray-900 hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Left Column - Marketing Copy & Graphic */}
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Grow your business on<br />
            <span className="text-[#25D366]">WhatsApp</span> & <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045]">Instagram</span>
          </h1>
          <p className="text-gray-200 text-lg mb-12">
            Get a 14 day free trial | No Credit Card required
          </p>
          
          {/* Mockup Graphic */}
          <div className="relative h-80 w-full max-w-md mt-4 hidden md:block">
            {/* Facebook Card */}
            <div className="absolute top-0 left-0 bg-white rounded-xl shadow-xl w-64 overflow-hidden transform -rotate-2 z-10 border border-gray-100">
              <div className="absolute -top-3 -left-3 bg-[#1877F2] text-white text-xs font-bold px-3 py-1 rounded-full z-20 flex items-center">
                <span className="text-lg mr-1">f</span> Acquire
              </div>
              <div className="p-4 pt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="text-xs font-bold">Acme Beauty</p>
                    <p className="text-[10px] text-gray-500">Sponsored</p>
                  </div>
                </div>
                <p className="text-xs mb-3 text-gray-700">Explore radiant & relaxing skin care collection this summer.</p>
                <div className="h-32 bg-orange-100 rounded mb-3 flex items-center justify-center">
                  <span className="text-orange-300 font-bold">Product Image</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-xs font-bold">Send Message</span>
                  <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="absolute top-12 left-48 bg-[#e8f5e9] rounded-xl shadow-2xl w-64 overflow-hidden transform rotate-2 z-20 border border-green-100">
              <div className="absolute -top-3 right-4 bg-[#f5a623] text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                Engage
              </div>
              <div className="absolute -top-4 -right-4 bg-[#25D366] w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#073223] z-30">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="p-4 pt-6 space-y-3">
                <div className="bg-white rounded-lg p-2 flex items-center space-x-2 shadow-sm">
                  <div className="w-10 h-10 bg-green-100 rounded"></div>
                  <div>
                    <p className="text-xs font-bold">Forest Essentials</p>
                    <p className="text-[10px] text-gray-500">Facewash Set</p>
                  </div>
                </div>
                <div className="bg-green-100 text-green-900 text-xs p-2 rounded-lg rounded-tl-none inline-block shadow-sm">
                  Interested in your products.
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 relative">
                  <p className="text-xs font-bold mb-2">Catalog Collection</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-100 rounded"></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold">Face Serum</p>
                        <p className="text-[10px] text-gray-500">Rs. 1500</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="flex flex-col justify-center lg:pl-10">
          <div className="space-y-4 max-w-md w-full bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-2xl">
            
            {/* Tally Integration */}
            <div className="bg-[#2B5482] rounded-lg p-4 flex justify-between items-center shadow-md mb-2">
              <div className="text-white text-sm">
                <p className="font-medium">For Tally Integration,</p>
                <p>signup directly with TallyPrime</p>
              </div>
              <button className="bg-white text-gray-900 text-sm font-semibold px-3 py-2 rounded shadow-sm flex items-center space-x-2 hover:bg-gray-50 transition-colors">
                <div className="flex space-x-0.5">
                  <div className="w-2 h-2 bg-[#F3B728]"></div>
                  <div className="w-2 h-2 bg-[#2B5482]"></div>
                </div>
                <span>Sign up with TallyPrime</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Step 1: Initial Credentials */}
              <div className={`space-y-4 transition-all duration-500 ${step === 2 ? 'opacity-50 pointer-events-none hidden' : ''}`}>
                
                {/* Social Logins */}
                <div className="flex space-x-3">
                  <button type="button" className="flex-1 bg-white border border-gray-300 rounded-lg py-2.5 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                    </svg>
                    <span className="text-gray-700 font-semibold text-sm">Google</span>
                  </button>
                  <button type="button" className="flex-1 bg-white border border-gray-300 rounded-lg py-2.5 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors shadow-sm">
                    <span className="text-[#96bf48] font-bold text-lg leading-none shrink-0">S</span>
                    <span className="text-gray-700 font-semibold text-sm">Shopify</span>
                  </button>
                </div>

                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-white/20"></div>
                  <span className="px-4 text-xs font-semibold text-white/60 uppercase">Or sign up with email</span>
                  <div className="flex-1 border-t border-white/20"></div>
                </div>

                <div>
                  <div className="relative group">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Work Email" 
                      className="w-full rounded-lg border border-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] bg-white font-medium text-gray-800"
                    />
                    {/* Tooltip on focus */}
                    <div className="absolute right-3 top-3 text-gray-400 group-focus-within:text-[#00a688] transition-colors">
                      <Info className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-white/70 text-xs mt-1.5 ml-1">You'll receive an auto-generated password on this email.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name" 
                    className="w-full rounded-lg border border-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] bg-white font-medium text-gray-800"
                  />
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name" 
                    className="w-full rounded-lg border border-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] bg-white font-medium text-gray-800"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-[#00a688] hover:bg-[#009176] text-white font-bold py-3.5 rounded-lg shadow-lg transition-colors text-[15px]"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Step 2: Details */}
              {step === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  
                  {/* User Profile Info (ReadOnly from Step 1) */}
                  <div className="bg-white/90 backdrop-blur rounded-lg p-3 flex items-center justify-between border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#00a688] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {firstName.charAt(0)}{lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{firstName} {lastName}</p>
                        <p className="text-gray-500 text-xs">{email}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold text-[#008cDD] hover:underline px-2 py-1">
                      Edit
                    </button>
                  </div>

                  {/* Channel Selection */}
                  <div className="bg-white/90 backdrop-blur rounded-lg p-4 shadow-sm border border-white/20">
                    <p className="font-bold text-gray-900 text-sm mb-3">Select Channel</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        type="button"
                        onClick={() => setSelectedChannel('whatsapp')}
                        className={`border rounded-full px-4 py-1.5 text-sm flex items-center space-x-2 transition-colors ${selectedChannel === 'whatsapp' ? 'border-[#00a688] bg-[#00a688]/10 text-[#00a688] font-medium' : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-white'}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSelectedChannel('instagram')}
                        className={`border rounded-full px-4 py-1.5 text-sm flex items-center space-x-2 transition-colors ${selectedChannel === 'instagram' ? 'border-pink-500 bg-pink-50 text-pink-600 font-medium' : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-white'}`}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        <span>Instagram</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSelectedChannel('both')}
                        className={`border rounded-full px-4 py-1.5 text-sm flex items-center space-x-2 transition-colors ${selectedChannel === 'both' ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium' : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-white'}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Both</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <div className="flex rounded-lg overflow-hidden border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-[#00a688]">
                        <select 
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value)}
                          className="bg-gray-50 border-r border-gray-300 px-3 py-3 text-sm focus:outline-none font-medium text-gray-700 w-[70px]"
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                        </select>
                        <input 
                          type="text" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone Number" 
                          className="w-full px-3 py-3 text-sm focus:outline-none font-medium text-gray-800" 
                        />
                      </div>
                      <p className="text-white/80 text-[10px] mt-1 font-medium">*Ensure WhatsApp is enabled for this number</p>
                    </div>
                    <div className="col-span-1">
                      <input 
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Company Name" 
                        className="w-full rounded-lg border border-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] bg-[#Eef2ff] font-medium text-gray-800" 
                      />
                    </div>

                    <div className="col-span-1">
                      <input 
                        type="text" 
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="Company Website" 
                        className="w-full rounded-lg border border-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] bg-white font-medium text-gray-800" 
                      />
                    </div>
                    <div className="col-span-1">
                      <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-lg border border-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] bg-white font-medium text-gray-800 appearance-none"
                      >
                        <option value="India">India</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                      </select>
                    </div>

                    <div className="col-span-1">
                      <select 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full rounded-lg border border-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] bg-white font-medium text-gray-800 appearance-none"
                      >
                        <option value="" disabled>State</option>
                        <option value="MH">Maharashtra</option>
                        <option value="DL">Delhi</option>
                        <option value="KA">Karnataka</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <select 
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        className="w-full rounded-lg border border-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] bg-white font-medium text-gray-800 appearance-none"
                      >
                        <option value="" disabled>Annual Revenue (INR)</option>
                        <option value="0-10">0 - 10 Lakhs</option>
                        <option value="10-50">10 - 50 Lakhs</option>
                        <option value="50+">50 Lakhs+</option>
                      </select>
                    </div>
                    
                    {/* Optional OTP field - showing if requested by server, otherwise hidden. Mocking it here as requested in original image */}
                    <div className="col-span-2 relative">
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP sent to your phone number on whatsapp" 
                        className="w-full rounded-lg border border-transparent px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a688] bg-white pr-28 font-medium" 
                      />
                      <button type="button" className="absolute right-2 top-2 bottom-2 bg-white border border-gray-200 text-[#00a688] text-xs font-bold px-3 rounded shadow-sm hover:bg-gray-50 transition-colors">
                        Resend OTP
                      </button>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start space-x-3 text-white text-sm cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={optIn}
                        onChange={(e) => setOptIn(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#00a688] focus:ring-[#00a688]" 
                      />
                      <div className="flex items-center space-x-1">
                        <span className="font-medium group-hover:text-white/90">Get updates regarding your Ricoz account on WhatsApp</span>
                        <MessageCircle className="w-4 h-4 text-green-400" />
                      </div>
                    </label>
                  </div>

                  {/* reCAPTCHA Mock & Submit */}
                  <div className="pt-2 flex flex-col space-y-4">
                    <div className="bg-white rounded border border-gray-300 p-3 w-[300px] flex items-center justify-between shadow-sm">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" required className="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-medium text-gray-700">I'm not a robot</span>
                      </label>
                      <div className="flex flex-col items-center">
                        <ShieldCheck className="w-8 h-8 text-blue-600 opacity-80" />
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">reCAPTCHA</div>
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full bg-[#00a688] hover:bg-[#009176] text-white font-bold py-3.5 rounded-lg shadow-lg transition-colors text-lg"
                    >
                      Create Account
                    </button>
                  </div>

                </div>
              )}

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
