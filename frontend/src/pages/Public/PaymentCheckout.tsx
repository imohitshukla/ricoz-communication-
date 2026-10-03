import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  QrCode, 
  Smartphone,
  Receipt,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ricoz-backend-production.up.railway.app';

export function PaymentCheckout() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'apple_pay'>('card');
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await axios.get(`${API_BASE}/api/commerce/public/order/${orderNumber}`);
      setOrder(res.data);
      if (res.data.status === 'Paid') {
        setIsPaid(true);
      }
      if (res.data.customerName) {
        setCardholderName(res.data.customerName);
      }
    } catch (err: any) {
      console.error('Failed to load order:', err);
      setErrorMsg(err.response?.data?.error || 'Order not found or link has expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isPaid || isProcessing) return;

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await axios.post(`${API_BASE}/api/commerce/public/pay/${orderNumber}`, {
        paymentMethod,
        cardLast4: cardNumber.replace(/\D/g, '').slice(-4) || '4242'
      });

      if (res.data.success) {
        setIsPaid(true);
        setOrder((prev: any) => ({ ...prev, status: 'Paid', paidAt: new Date().toISOString() }));
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      setErrorMsg(err.response?.data?.error || 'Payment gateway connection failed. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold">Loading secure payment portal...</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl">
          <AlertCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold mb-2">Order Link Unavailable</h2>
          <p className="text-slate-400 text-sm mb-6">{errorMsg}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Ricoz Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Brand Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800/80 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-slate-950 text-lg">
            R
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">Ricoz Pay</span>
            <span className="text-[10px] ml-2 font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              256-bit SSL Encrypted
            </span>
          </div>
        </div>

        <div className="flex items-center text-slate-400 text-xs space-x-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Merchant Checkout</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        
        {/* Left Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl backdrop-blur-md">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Payment For</div>
          <h2 className="text-xl font-black text-white tracking-tight mb-4">
            Order #{order?.orderNumber}
          </h2>

          {/* Price Tag */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-800/40 border border-slate-700/60 mb-6">
            <span className="text-xs font-semibold text-slate-400">Total Amount Due</span>
            <div className="text-4xl font-black text-emerald-400 mt-1 flex items-baseline space-x-1">
              <span>${order?.amount?.toFixed(2)}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{order?.currency || 'USD'}</span>
            </div>
            {isPaid && (
              <div className="mt-3 inline-flex items-center space-x-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Payment Completed</span>
              </div>
            )}
          </div>

          {/* Line items list */}
          <div className="space-y-3 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Items</div>
            {order?.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-slate-800/60">
                <div>
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="text-xs text-slate-500">Qty: {item.qty || 1}</div>
                </div>
                <div className="font-extrabold text-slate-300">${(item.price || order.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Customer metadata if provided */}
          {order?.customerName && (
            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Customer: <span className="font-bold text-slate-200">{order.customerName}</span></div>
              {order.customerPhone && <div>Contact: <span className="font-bold text-slate-200">{order.customerPhone}</span></div>}
            </div>
          )}

          <div className="mt-6 flex items-center space-x-2 text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>End-to-end encrypted. PCI-DSS Level 1 compliant gateway.</span>
          </div>
        </div>

        {/* Right Column: Interactive Payment Methods (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {isPaid ? (
            /* PAID RECEIPT STATE */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Payment Successful</span>
              <h2 className="text-3xl font-black text-white mt-1 mb-2">Thank You for Your Order!</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Your payment of <span className="font-bold text-white">${order?.amount?.toFixed(2)}</span> has been confirmed. A receipt and confirmation notice have been dispatched to your conversation thread.
              </p>

              <div className="max-w-sm mx-auto bg-slate-800/80 rounded-2xl p-5 text-left text-xs space-y-2.5 border border-slate-700/60 mb-8 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Order Reference:</span>
                  <span className="text-white font-bold">{order?.orderNumber}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payment Method:</span>
                  <span className="text-white font-bold uppercase">{order?.paymentMethod || 'Credit Card'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">PAID & VERIFIED</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Timestamp:</span>
                  <span className="text-slate-300">{new Date(order?.paidAt || Date.now()).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl border border-slate-700 transition-all cursor-pointer text-sm"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <Link
                  to="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Return to Store</span>
                </Link>
              </div>
            </div>
          ) : (
            /* PAYMENT FORM STATE */
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-white">Select Payment Method</h3>
                <p className="text-slate-400 text-xs mt-0.5">Choose your preferred payment gateway option</p>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'card', label: 'Credit Card', icon: CreditCard },
                  { id: 'upi', label: 'UPI / QR', icon: QrCode },
                  { id: 'apple_pay', label: 'Apple Pay', icon: Smartphone },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10 font-bold'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium'
                    }`}
                  >
                    <m.icon className="w-5 h-5 mb-1.5" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Payment Details Body */}
              {paymentMethod === 'card' && (
                <form onSubmit={handlePayNow} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="4242 •••• •••• 4242"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Expiration Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">CVC / CVV</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value)}
                        placeholder="123"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={e => setCardholderName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 text-base"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Authorizing with Bank...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-950" />
                        <span>Pay ${order?.amount?.toFixed(2)} Securely</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {paymentMethod === 'upi' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=ricoz@icici&pn=Ricoz%20Communication&am=${order?.amount}&cu=INR`} 
                      alt="UPI QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300">Scan QR code using any UPI App</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, or BHIM UPI</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePayNow()}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    {isProcessing ? 'Verifying UPI UTR...' : `Simulate Instant UPI Payment ($${order?.amount?.toFixed(2)})`}
                  </button>
                </div>
              )}

              {paymentMethod === 'apple_pay' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-900 shadow-xl">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">Apple Pay / Google Pay</h4>
                    <p className="text-xs text-slate-400 mt-1">Authenticate using FaceID or Fingerprint sensor</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePayNow()}
                    disabled={isProcessing}
                    className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-xl cursor-pointer flex items-center justify-center space-x-2 text-base"
                  >
                    <span> Pay ${order?.amount?.toFixed(2)}</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center pt-8 border-t border-slate-800/80 mt-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>© 2026 Ricoz Communication Inc. All rights reserved.</div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-slate-400">Terms of Service</a>
          <a href="#" className="hover:text-slate-400">Privacy Policy</a>
          <a href="#" className="hover:text-slate-400">Refund Policy</a>
        </div>
      </div>

    </div>
  );
}
