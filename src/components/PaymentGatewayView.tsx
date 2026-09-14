import React, { useState } from 'react';
import { 
  Language, 
  PaymentTransaction, 
  PaymentMethod, 
  AutoMatchLog 
} from '../types';
import { 
  parsePaymentSms, 
  generateBkashSms, 
  generateNagadSms 
} from '../utils/paymentParser';
import { 
  playAndroidNotificationChime, 
  playPaymentSuccessChime, 
  playAlertChime 
} from '../utils/audio';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Smartphone, 
  Server, 
  Database, 
  Radio, 
  Send, 
  RefreshCw, 
  ArrowRight, 
  Copy, 
  Check, 
  Code2, 
  ShieldAlert, 
  Sparkles, 
  DollarSign,
  Wallet,
  FileText,
  AlertCircle,
  Cpu,
  Trash2,
  LayoutDashboard
} from 'lucide-react';

interface PaymentGatewayViewProps {
  lang: Language;
  onNavigateToCodeStudio?: () => void;
  onNavigateToAdminDashboard?: () => void;
}

export const PaymentGatewayView: React.FC<PaymentGatewayViewProps> = ({ 
  lang,
  onNavigateToCodeStudio,
  onNavigateToAdminDashboard
}) => {
  const isBn = lang === 'bn';

  // Demo user wallet balance
  const [walletBalance, setWalletBalance] = useState<number>(2500);

  // User submission form state
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [senderPhone, setSenderPhone] = useState<string>('01712345678');
  const [amount, setAmount] = useState<string>('1500');
  const [trxId, setTrxId] = useState<string>('BLA9X192K3');

  // Transactions ledger state
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([
    {
      id: 'tx-101',
      method: 'bkash',
      senderPhone: '01712345678',
      amount: 1500,
      trxId: 'BLA9X192K3',
      status: 'pending',
      submittedAt: Date.now() - 1000 * 60 * 3,
      statusMessage: isBn ? 'মার্চেন্ট কনফার্মেশন এসএমএস-এর অপেক্ষায়...' : 'Awaiting merchant confirmation SMS...'
    },
    {
      id: 'tx-100',
      method: 'nagad',
      senderPhone: '01899887766',
      amount: 750,
      trxId: '72H99AK12',
      status: 'success',
      submittedAt: Date.now() - 1000 * 60 * 15,
      matchedAt: Date.now() - 1000 * 60 * 14,
      statusMessage: isBn ? 'এসএমএস ভেরিফাইড ও ব্যালেন্স যোগ হয়েছে।' : 'SMS verified and balance credited.',
      extractedAmount: 750,
      extractedSender: '01899887766'
    }
  ]);

  // Merchant SMS reader state
  const [smsSender, setSmsSender] = useState<string>('bKash');
  const [smsBody, setSmsBody] = useState<string>(() => generateBkashSms(1500, 'BLA9X192K3', '01712345678'));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Live auto-match activity logs
  const [logs, setLogs] = useState<AutoMatchLog[]>([
    {
      id: 'log-1',
      timestamp: Date.now() - 1000 * 60 * 15,
      type: 'info',
      tag: 'SMS_READER',
      message: 'Merchant device SmsListener started in background.'
    },
    {
      id: 'log-2',
      timestamp: Date.now() - 1000 * 60 * 14,
      type: 'success',
      tag: 'SERVER_API',
      message: 'Auto-matched TrxID 72H99AK12 with pending transaction tx-100. Credited ৳ 750.00.'
    }
  ]);

  const addLog = (type: AutoMatchLog['type'], tag: AutoMatchLog['tag'], message: string, payload?: Record<string, unknown>) => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: Date.now(),
        type,
        tag,
        message,
        payload
      },
      ...prev.slice(0, 40)
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Generate random authentic TrxID
  const handleGenerateRandomTrxId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTrxId(result);
  };

  // User submits "Add Money"
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount);
    const cleanTrx = trxId.trim().toUpperCase();
    const cleanPhone = senderPhone.trim();

    if (!cleanPhone || isNaN(cleanAmount) || cleanAmount <= 0 || !cleanTrx) {
      alert(isBn ? 'দয়া করে সকল তথ্য সঠিকভাবে পূরণ করুন।' : 'Please fill all fields properly.');
      return;
    }

    // Check if TrxID already exists in ledger
    const existing = transactions.find((t) => t.trxId.toUpperCase() === cleanTrx);
    if (existing) {
      alert(
        isBn 
          ? `এই ট্রানজেকশন আইডি (${cleanTrx}) ইতিমধ্যে সিস্টেমে বিদ্যমান!` 
          : `This TrxID (${cleanTrx}) already exists in the system!`
      );
      return;
    }

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      method,
      senderPhone: cleanPhone,
      amount: cleanAmount,
      trxId: cleanTrx,
      status: 'pending',
      submittedAt: Date.now(),
      statusMessage: isBn ? 'মার্চেন্ট ফোনের কনফার্মেশন এসএমএস-এর অপেক্ষায়...' : 'Pending merchant confirmation SMS...'
    };

    setTransactions((prev) => [newTx, ...prev]);
    addLog(
      'info', 
      'FIREBASE_DB', 
      `User submitted Add Money request: ৳${cleanAmount} via ${method.toUpperCase()} (TrxID: ${cleanTrx}). Status set to PENDING.`,
      { trxId: cleanTrx, amount: cleanAmount, phone: cleanPhone }
    );

    // Also auto-prepare the merchant SMS input box for quick testing
    if (method === 'bkash') {
      setSmsSender('bKash');
      setSmsBody(generateBkashSms(cleanAmount, cleanTrx, cleanPhone));
    } else {
      setSmsSender('Nagad');
      setSmsBody(generateNagadSms(cleanAmount, cleanTrx, cleanPhone));
    }
  };

  // Simulate Incoming SMS from Merchant Phone (Triggers BroadcastReceiver & Auto-Matching)
  const handleProcessIncomingSms = () => {
    if (!smsBody.trim()) return;

    setIsProcessing(true);
    playAndroidNotificationChime();

    addLog(
      'info', 
      'SMS_READER', 
      `BroadcastReceiver received SMS from "${smsSender}". Calling sendDataToServer()...`
    );

    setTimeout(() => {
      // Step 1: Parse SMS
      const parsed = parsePaymentSms(smsSender, smsBody);

      if (!parsed.isPaymentSms || !parsed.trxId || !parsed.amount) {
        addLog(
          'error', 
          'PARSER', 
          `Could not extract valid TrxID or Amount from SMS body! Parsed: ${JSON.stringify(parsed)}`
        );
        playAlertChime();
        setIsProcessing(false);
        return;
      }

      addLog(
        'info', 
        'PARSER', 
        `Extracted Data: TrxID: ${parsed.trxId}, Amount: ৳${parsed.amount}, Sender: ${parsed.senderPhone || 'N/A'}`
      );

      // Step 2: Auto-Matching Logic (Simulating Server API / Firebase logic)
      const incomingTrx = parsed.trxId.toUpperCase();
      const incomingAmount = parsed.amount;

      // Find matching transaction in database
      const matchedIdx = transactions.findIndex((t) => t.trxId.toUpperCase() === incomingTrx);

      if (matchedIdx === -1) {
        // No user has submitted this TrxID yet
        addLog(
          'warning', 
          'SERVER_API', 
          `Unmatched SMS: TrxID ${incomingTrx} (৳${incomingAmount}) received from ${smsSender}, but no user has submitted this TrxID.`
        );
        playAlertChime();
        setIsProcessing(false);
        return;
      }

      const matchedTx = transactions[matchedIdx];

      // Check for duplicate / replay attack
      if (matchedTx.status === 'success') {
        addLog(
          'error', 
          'SECURITY', 
          `[REPLAY ATTACK BLOCKED] TrxID ${incomingTrx} was already approved previously at ${new Date(matchedTx.matchedAt || 0).toLocaleTimeString()}. Duplicate payment rejected.`
        );
        playAlertChime();
        setIsProcessing(false);
        return;
      }

      // Check amount exact match
      if (Math.abs(matchedTx.amount - incomingAmount) > 0.01) {
        // Amount mismatch!
        const updated = [...transactions];
        updated[matchedIdx] = {
          ...matchedTx,
          status: 'mismatch',
          statusMessage: isBn 
            ? `টাকার পরিমাণে অমিল! ইউজার বলেছে ৳${matchedTx.amount}, কিন্তু এসএমএসে এসেছে ৳${incomingAmount}` 
            : `Amount Mismatch! User requested ৳${matchedTx.amount}, but SMS has ৳${incomingAmount}`,
          extractedAmount: incomingAmount,
          extractedSender: parsed.senderPhone,
          matchedSmsBody: smsBody
        };
        setTransactions(updated);
        addLog(
          'error', 
          'SECURITY', 
          `[AMOUNT MISMATCH] User requested ৳${matchedTx.amount}, but SMS confirmed ৳${incomingAmount}. Flagged for review.`
        );
        playAlertChime();
        setIsProcessing(false);
        return;
      }

      // Exact match! Update status to SUCCESS & credit wallet
      const updated = [...transactions];
      updated[matchedIdx] = {
        ...matchedTx,
        status: 'success',
        matchedAt: Date.now(),
        statusMessage: isBn 
          ? `স্বয়ংক্রিয়ভাবে ভেরিফাইড! ${smsSender} থেকে ৳${incomingAmount} নিশ্চিত হয়েছে।` 
          : `Auto-verified! ৳${incomingAmount} confirmed via ${smsSender}.`,
        extractedAmount: incomingAmount,
        extractedSender: parsed.senderPhone,
        matchedSmsBody: smsBody
      };

      setTransactions(updated);
      setWalletBalance((prev) => prev + incomingAmount);
      playPaymentSuccessChime();

      addLog(
        'success', 
        'FIREBASE_DB', 
        `[SUCCESS MATCH] TrxID ${incomingTrx} matched! Transaction status updated to SUCCESS. User wallet credited +৳${incomingAmount}. Total balance: ৳${walletBalance + incomingAmount}.`
      );

      setIsProcessing(false);
    }, 450);
  };

  // Quick preset loader for testing
  const handleLoadPendingPreset = (tx: PaymentTransaction, mismatchAmount: boolean = false) => {
    const amt = mismatchAmount ? tx.amount - 500 : tx.amount;
    if (tx.method === 'bkash') {
      setSmsSender('bKash');
      setSmsBody(generateBkashSms(amt, tx.trxId, tx.senderPhone));
    } else {
      setSmsSender('Nagad');
      setSmsBody(generateNagadSms(amt, tx.trxId, tx.senderPhone));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

      {/* Banner / Title & Balance Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            {isBn ? 'স্বয়ংক্রিয় পেমেন্ট ভেরিফিকেশন সিস্টেম' : 'Automated Payment Verification System'}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            {isBn ? 'বিকাশ ও নগদ অটো এসএমএস রিডার ও ম্যাচিং গেটওয়ে' : 'bKash & Nagad Auto SMS Reader & Matcher Gateway'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {isBn 
              ? 'ইউজার সাইড (Add Money) ➔ মার্চেন্ট ফোন (SmsListener) ➔ সার্ভার ডাটাবেজ (Auto Matching) এর লাইভ রিয়েলটাইম আর্কিটেকচার।'
              : 'Live 3-tier pipeline connecting User Add Money, Android Background SmsListener, and Cloud Server Auto-Matching.'}
          </p>
        </div>

        {/* User Simulated Wallet Balance */}
        <div className="w-full md:w-auto bg-stone-900 text-white p-4 rounded-xl flex items-center justify-between md:justify-start gap-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-400 font-medium block uppercase tracking-wider">
              {isBn ? 'ইউজার ওয়ালেট ব্যালেন্স' : 'User Wallet Balance'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ৳ {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow Diagram */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {/* Step 1 */}
          <div className="flex-1 bg-stone-800/80 border border-stone-700 rounded-xl p-3 text-center">
            <div className="w-7 h-7 mx-auto rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs mb-1.5">
              ১
            </div>
            <span className="text-xs font-bold block text-pink-300">
              {isBn ? 'ইউজার সাবমিশন' : 'User Add Money'}
            </span>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {isBn ? 'TrxID, ফোন ও অ্যামাউন্ট সাবমিট' : 'Phone, TrxID & Amount'}
            </p>
          </div>

          <ArrowRight className="w-4 h-4 text-stone-500 shrink-0 animate-pulse" />

          {/* Step 2 */}
          <div className="flex-1 bg-stone-800/80 border border-stone-700 rounded-xl p-3 text-center">
            <div className="w-7 h-7 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs mb-1.5">
              ২
            </div>
            <span className="text-xs font-bold block text-amber-300">
              {isBn ? 'সার্ভার ডাটাবেজ' : 'Server / Firebase'}
            </span>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {isBn ? 'স্ট্যাটাস: "Pending"' : 'Status: "Pending"'}
            </p>
          </div>

          <ArrowRight className="w-4 h-4 text-stone-500 shrink-0 animate-pulse" />

          {/* Step 3 */}
          <div className="flex-1 bg-stone-800/80 border border-stone-700 rounded-xl p-3 text-center">
            <div className="w-7 h-7 mx-auto rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs mb-1.5">
              ৩
            </div>
            <span className="text-xs font-bold block text-cyan-300">
              {isBn ? 'মার্চেন্ট ফোন (SmsListener)' : 'Merchant SmsListener'}
            </span>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {isBn ? 'ব্যাকগ্রাউন্ডে এসএমএস পড়া' : 'Extracts TrxID & Amount'}
            </p>
          </div>

          <ArrowRight className="w-4 h-4 text-stone-500 shrink-0 animate-pulse" />

          {/* Step 4 */}
          <div className="flex-1 bg-stone-800/80 border border-stone-700 rounded-xl p-3 text-center">
            <div className="w-7 h-7 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-1.5">
              ৪
            </div>
            <span className="text-xs font-bold block text-emerald-300">
              {isBn ? 'অটো ম্যাচিং ও ক্রেডিট' : 'Auto Match & Credit'}
            </span>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {isBn ? 'স্ট্যাটাস: "Success" + ব্যালেন্স' : 'Status: "Success" + Wallet'}
            </p>
          </div>
        </div>
      </div>

      {/* 3-Tier Live Interactive Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ========================================================
            TIER 1: ইউজার সাইড (Add Money UI - 4 Columns)
           ======================================================== */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center justify-center">
                  ১
                </span>
                <h2 className="font-bold text-stone-900 text-sm sm:text-base">
                  {isBn ? 'ইউজার সাইড: টাকা যোগ করুন (Add Money)' : 'User Side: Add Money UI'}
                </h2>
              </div>
              <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                Client Web / App
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {isBn ? 'পেমেন্ট মেথড সিলেক্ট করুন:' : 'Select Payment Method:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('bkash');
                    setSmsSender('bKash');
                    setSmsBody(generateBkashSms(parseFloat(amount) || 1500, trxId, senderPhone));
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    method === 'bkash'
                      ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm ring-1 ring-pink-500'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-600" />
                  bKash (বিকাশ)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod('nagad');
                    setSmsSender('Nagad');
                    setSmsBody(generateNagadSms(parseFloat(amount) || 1500, trxId, senderPhone));
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    method === 'nagad'
                      ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm ring-1 ring-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                  Nagad (নগদ)
                </button>
              </div>
            </div>

            {/* Merchant Account Information Notice */}
            <div className={`p-3 rounded-xl text-xs mb-4 border ${
              method === 'bkash' 
                ? 'bg-pink-50/70 border-pink-200 text-pink-900' 
                : 'bg-orange-50/70 border-orange-200 text-orange-900'
            }`}>
              <div className="font-semibold mb-0.5">
                {method === 'bkash' ? 'বিকাশ সেন্ড মানি নম্বর:' : 'নগদ ক্যাশ ইন/সেন্ড মানি নম্বর:'}
              </div>
              <div className="font-mono text-sm font-bold tracking-wider">
                01823-456789 <span className="text-[11px] font-normal opacity-80">(মার্চেন্ট/পার্সোনাল সিম)</span>
              </div>
              <p className="text-[11px] opacity-75 mt-1">
                {isBn 
                  ? 'উক্ত নম্বরে টাকা পাঠিয়ে নিচে আপনার প্রেরক নম্বর, পরিমাণ ও ট্রানজেকশন আইডি দিন।' 
                  : 'Send money to the above number, then fill the details below.'}
              </p>
            </div>

            {/* User Submission Form */}
            <form onSubmit={handleSubmitPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {isBn ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile):' : 'Sender Mobile Number:'}
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {isBn ? 'টাকার পরিমাণ (Amount in BDT):' : 'Amount (BDT):'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-400 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1500"
                    min="10"
                    step="1"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone-700">
                    {isBn ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID (TrxID):'}
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomTrxId}
                    className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isBn ? 'র‍্যান্ডম TrxID' : 'Random TrxID'}
                  </button>
                </div>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="e.g. BLA9X192K3"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs font-mono uppercase font-bold tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isBn ? 'টাকা যোগ করার রিকোয়েস্ট সাবমিট করুন' : 'Submit Add Money Request'}</span>
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500">
            {isBn 
              ? '💡 সাবমিট করার সাথে সাথে ডাটাবেজে "Pending" স্ট্যাটাসে সেভ হবে।' 
              : '💡 Saved as "Pending" in DB until confirmed by merchant phone.'}
          </div>
        </div>


        {/* ========================================================
            TIER 2: মার্চেন্ট ফোন ও এসএমএস রিডার (SmsListener App - 7 Columns)
           ======================================================== */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center justify-center">
                  ৩
                </span>
                <h2 className="font-bold text-stone-900 text-sm sm:text-base">
                  {isBn ? 'মার্চেন্ট ফোন: ব্যাকগ্রাউন্ড এসএমএস রিডার (SmsListener)' : 'Merchant Phone: Background SmsListener App'}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Listening in Background
              </div>
            </div>

            {/* Quick Test Presets */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-stone-700 mb-2 flex items-center justify-between">
                <span>{isBn ? 'টেস্ট সিনারিও প্রিসেট (Quick Test Presets):' : 'Quick Test Presets:'}</span>
                <span className="text-[11px] text-stone-400">১-ক্লিকে টেস্ট করুন</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Preset 1: Exact Match */}
                <button
                  type="button"
                  onClick={() => {
                    const pending = transactions.find((t) => t.status === 'pending') || transactions[0];
                    if (pending) {
                      handleLoadPendingPreset(pending, false);
                    }
                  }}
                  className="p-2 text-left rounded-xl bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100/70 transition cursor-pointer text-xs"
                >
                  <div className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {isBn ? '১. সঠিক কনফার্মেশন (Exact Match)' : '1. Exact Match Test'}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    {isBn ? 'পেন্ডিং TrxID ও সম্পূর্ণ টাকা মিলিয়ে Success করবে' : 'Matches pending TrxID & Amount'}
                  </div>
                </button>

                {/* Preset 2: Amount Mismatch */}
                <button
                  type="button"
                  onClick={() => {
                    const pending = transactions.find((t) => t.status === 'pending') || transactions[0];
                    if (pending) {
                      handleLoadPendingPreset(pending, true);
                    }
                  }}
                  className="p-2 text-left rounded-xl bg-amber-50/70 border border-amber-200 hover:bg-amber-100/70 transition cursor-pointer text-xs"
                >
                  <div className="font-bold text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    {isBn ? '২. অ্যামাউন্ট অমিল টেস্ট (Mismatch)' : '2. Amount Mismatch Test'}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    {isBn ? 'ইউজার চেয়েছে ১৫০০ কিন্তু এসএমএস এ এসেছে ১০০০' : 'SMS amount is 500 less than requested'}
                  </div>
                </button>

                {/* Preset 3: Duplicate TrxID Replay Attack */}
                <button
                  type="button"
                  onClick={() => {
                    const successTx = transactions.find((t) => t.status === 'success') || transactions[0];
                    setSmsSender(successTx.method === 'bkash' ? 'bKash' : 'Nagad');
                    setSmsBody(
                      successTx.method === 'bkash' 
                        ? generateBkashSms(successTx.amount, successTx.trxId, successTx.senderPhone)
                        : generateNagadSms(successTx.amount, successTx.trxId, successTx.senderPhone)
                    );
                  }}
                  className="p-2 text-left rounded-xl bg-red-50/70 border border-red-200 hover:bg-red-100/70 transition cursor-pointer text-xs"
                >
                  <div className="font-bold text-red-900 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    {isBn ? '৩. ডুপ্লিকেট TrxID (Replay Attack)' : '3. Replay Attack Test'}
                  </div>
                  <div className="text-[11px] text-red-700 mt-0.5">
                    {isBn ? 'পূর্বে অনুমোদিত TrxID আবার চালিয়ে দেখা' : 'Resend already approved TrxID'}
                  </div>
                </button>

                {/* Preset 4: Fake Sender */}
                <button
                  type="button"
                  onClick={() => {
                    setSmsSender('01799887766');
                    setSmsBody(`You have received Tk 2,500.00 from 01711223344. TrxID FAKE99999`);
                  }}
                  className="p-2 text-left rounded-xl bg-stone-100 border border-stone-200 hover:bg-stone-200 transition cursor-pointer text-xs"
                >
                  <div className="font-bold text-stone-900 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-stone-600" />
                    {isBn ? '৪. অজানা নম্বর (Spoofed/Unknown)' : '4. Spoofed Sender Test'}
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    {isBn ? 'বিকাশ বা নগদ ছাড়া অন্য ব্যক্তিগত নম্বর' : 'Simulate non-official sender'}
                  </div>
                </button>
              </div>
            </div>

            {/* Merchant SMS Input Form */}
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    {isBn ? 'প্রেরক (OriginatingAddress):' : 'Sender Address:'}
                  </label>
                  <input
                    type="text"
                    value={smsSender}
                    onChange={(e) => setSmsSender(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-900 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    {isBn ? 'অটো এক্সট্রাক্টেড ফিল্ডস (Live Regex Extraction):' : 'Auto Extracted Preview:'}
                  </label>
                  {(() => {
                    const parsed = parsePaymentSms(smsSender, smsBody);
                    return (
                      <div className="flex items-center gap-2 text-[11px] font-mono bg-white px-2.5 py-1.5 rounded-lg border border-stone-200 overflow-x-auto">
                        <span className="font-semibold text-stone-500">TrxID:</span>
                        <span className={parsed.trxId ? "text-emerald-700 font-bold bg-emerald-50 px-1 rounded" : "text-stone-400"}>
                          {parsed.trxId || 'Not found'}
                        </span>
                        <span className="text-stone-300">|</span>
                        <span className="font-semibold text-stone-500">Tk:</span>
                        <span className={parsed.amount ? "text-emerald-700 font-bold bg-emerald-50 px-1 rounded" : "text-stone-400"}>
                          {parsed.amount ? `৳${parsed.amount}` : 'Not found'}
                        </span>
                        <span className="text-stone-300">|</span>
                        <span className="font-semibold text-stone-500">From:</span>
                        <span className={parsed.senderPhone ? "text-emerald-700 font-bold bg-emerald-50 px-1 rounded" : "text-stone-400"}>
                          {parsed.senderPhone || 'N/A'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {isBn ? 'রিসিভড এসএমএস বডি (Raw Message Body):' : 'Raw Message Body:'}
                </label>
                <textarea
                  rows={3}
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-stone-200 text-stone-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Action Button: Broadcast Incoming SMS */}
              <button
                type="button"
                onClick={handleProcessIncomingSms}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isBn ? 'অ্যান্ড্রয়েড ব্রডকাস্ট রিসিভার প্রসেসিং ও ম্যাচিং হচ্ছে...' : 'Processing BroadcastReceiver & Matching...'}</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isBn ? 'ইনকামিং এসএমএস রিসিভ ও অটো-ম্যাচ করান' : 'Simulate Incoming SMS & Auto-Match'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
            <span>
              {isBn 
                ? '📱 কোড: Telephony.Sms.Intents.SMS_RECEIVED_ACTION' 
                : '📱 Code: Telephony.Sms.Intents.SMS_RECEIVED_ACTION'}
            </span>
            <span className="text-emerald-600 font-semibold">Priority: 999</span>
          </div>
        </div>

      </div>

      {/* ========================================================
          TIER 3: রিয়েলটাইম ট্রানজেকশন লেজার ও ডাটাবেজ (Server Ledger)
         ======================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-stone-900 text-sm sm:text-base">
              {isBn ? 'সার্ভার ডাটাবেজ ও ট্রানজেকশন ম্যাচিং লেজার (Server & Database Ledger)' : 'Server & Database Transaction Ledger'}
            </h2>
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-mono font-medium">
              {transactions.length} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToAdminDashboard && (
              <button
                type="button"
                onClick={onNavigateToAdminDashboard}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{isBn ? 'সম্পূর্ণ অ্যাডমিন ড্যাশবোর্ড' : 'Full Admin Dashboard'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setTransactions([
                  {
                    id: `tx-${Date.now().toString().slice(-4)}`,
                    method: 'bkash',
                    senderPhone: '01712345678',
                    amount: 1500,
                    trxId: 'BLA9X192K3',
                    status: 'pending',
                    submittedAt: Date.now(),
                    statusMessage: isBn ? 'মার্চেন্ট কনফার্মেশন এসএমএস-এর অপেক্ষায়...' : 'Pending merchant confirmation SMS...'
                  }
                ]);
                setWalletBalance(2500);
              }}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isBn ? 'লেজার রিসেট করুন' : 'Reset Ledger'}
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 bg-stone-50/50">
                <th className="py-2.5 px-3 font-semibold">{isBn ? 'আইডি' : 'ID'}</th>
                <th className="py-2.5 px-3 font-semibold">{isBn ? 'মেথড' : 'Method'}</th>
                <th className="py-2.5 px-3 font-semibold">{isBn ? 'প্রেরক নম্বর' : 'Sender Phone'}</th>
                <th className="py-2.5 px-3 font-semibold">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                <th className="py-2.5 px-3 font-semibold">{isBn ? 'ট্রানজেকশন আইডি (TrxID)' : 'TrxID'}</th>
                <th className="py-2.5 px-3 font-semibold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="py-2.5 px-3 font-semibold">{isBn ? 'ম্যাচিং বিস্তারিত' : 'Match Details'}</th>
                <th className="py-2.5 px-3 font-semibold text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50/80 transition">
                  <td className="py-3 px-3 font-mono text-stone-400 text-[11px]">{tx.id}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                      tx.method === 'bkash' 
                        ? 'bg-pink-100 text-pink-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tx.method === 'bkash' ? 'bg-pink-600' : 'bg-orange-600'}`} />
                      {tx.method.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-stone-800">{tx.senderPhone}</td>
                  <td className="py-3 px-3 font-mono font-bold text-stone-900">৳ {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold bg-stone-100 px-1.5 py-0.5 rounded text-stone-800">
                      {tx.trxId}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {tx.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3 animate-spin" />
                        {isBn ? 'Pending (অপেক্ষমাণ)' : 'Pending'}
                      </span>
                    )}
                    {tx.status === 'success' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        {isBn ? 'Success (সফল)' : 'Success'}
                      </span>
                    )}
                    {tx.status === 'mismatch' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3" />
                        {isBn ? 'Mismatch (অমিল)' : 'Mismatch'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-stone-600 max-w-xs truncate" title={tx.statusMessage}>
                    {tx.statusMessage}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {tx.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleLoadPendingPreset(tx, false)}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded cursor-pointer"
                        title={isBn ? 'এই ট্রানজেকশনের জন্য এসএমএস প্রস্তুত করুন' : 'Load SMS for this transaction'}
                      >
                        {isBn ? 'ম্যাচ টেস্ট' : 'Test Match'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          LIVE AUDIT LOGS / CONSOLE
         ======================================================== */}
      <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-sm text-white">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold tracking-tight text-stone-200">
              {isBn ? 'রিয়েলটাইম অডিট লগ ও কনসোল (Live Execution Logs)' : 'Live Execution & Auto-Match Logs'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setLogs([])}
            className="text-[11px] text-stone-500 hover:text-stone-300 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            {isBn ? 'ক্লিয়ার লগ' : 'Clear Logs'}
          </button>
        </div>

        <div className="font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-[11px] py-0.5">
              <span className="text-stone-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`px-1 rounded text-[10px] font-bold shrink-0 ${
                log.tag === 'SMS_READER' ? 'bg-cyan-900/60 text-cyan-300' :
                log.tag === 'PARSER' ? 'bg-purple-900/60 text-purple-300' :
                log.tag === 'SERVER_API' ? 'bg-blue-900/60 text-blue-300' :
                log.tag === 'SECURITY' ? 'bg-red-900/60 text-red-300' :
                'bg-emerald-900/60 text-emerald-300'
              }`}>
                [{log.tag}]
              </span>
              <span className={
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warning' ? 'text-amber-400' :
                log.type === 'success' ? 'text-emerald-400 font-semibold' :
                'text-stone-300'
              }>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          SECTION 2 & 3: কোড ও আর্কিটেকচার (Kotlin & Server Snippets)
         ======================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg mb-2">
            <Code2 className="w-3.5 h-3.5" />
            {isBn ? '২ ও ৩. অ্যান্ড্রয়েড কোটলিন কোড ও AndroidManifest.xml' : '2 & 3. Android Kotlin & Manifest Implementation'}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            {isBn ? 'আপনার ফোনের জন্য এসএমএস রিডার ও অটোমেশন কোড' : 'Production Kotlin Code for Merchant Phone'}
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {isBn 
              ? 'নিচের কোডটি আপনার অ্যান্ড্রয়েড অ্যাপের ব্যাকগ্রাউন্ড ব্রডকাস্ট রিসিভারে যোগ করে বিকাশ/নগদের ট্রানজেকশন অটোমেট করুন।' 
              : 'Add this BroadcastReceiver and Retrofit API pipeline to your merchant Android application.'}
          </p>
        </div>

        {/* Code Block 1: SmsListener.kt */}
        <div className="rounded-xl border border-stone-200 overflow-hidden">
          <div className="bg-stone-900 text-stone-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-emerald-400">SmsListener.kt (BroadcastReceiver)</span>
            <button
              onClick={() => copyToClipboard(`import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.regex.Pattern

class SmsListener : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val sender = sms.originatingAddress ?: continue
                val body = sms.messageBody ?: continue

                // ১. চেক করুন মেসেজটি বিকাশ বা নগদ থেকে এসেছে কি না
                if (sender.equals("bKash", ignoreCase = true) || 
                    sender.equals("Nagad", ignoreCase = true) || 
                    sender.contains("16247") || sender.contains("16167")) {

                    Log.d("SMS_READER", "Sender: $sender, Body: $body")
                    
                    // ২. Regex দিয়ে TrxID এবং Amount স্বয়ংক্রিয়ভাবে আলাদা করা
                    val extracted = parseTransaction(body)

                    // ৩. সার্ভার API-তে পাঠিয়ে দেওয়া
                    sendDataToServer(sender, body, extracted.first, extracted.second)
                }
            }
        }
    }

    // TrxID এবং অ্যামাউন্ট বের করার রেগুলার এক্সপ্রেশন
    private fun parseTransaction(body: String): Pair<String?, Double?> {
        var trxId: String? = null
        var amount: Double? = null

        // TrxID খোঁজা (e.g. TrxID BLA9X192K3 or TxnID: 72H89AK3L)
        val trxMatcher = Pattern.compile("(?:TrxID|TxnID|TRXID)\\s*[:\\s]?\\s*([A-Z0-9]{6,16})", Pattern.CASE_INSENSITIVE).matcher(body)
        if (trxMatcher.find()) {
            trxId = trxMatcher.group(1)
        }

        // Amount খোঁজা (e.g. Tk 1,500.00 or Tk. 500)
        val amountMatcher = Pattern.compile("(?:Tk|Tk\\.|BDT|Amount:\\s*Tk)\\s*([0-9,]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE).matcher(body)
        if (amountMatcher.find()) {
            val amtStr = amountMatcher.group(1)?.replace(",", "")
            amount = amtStr?.toDoubleOrNull()
        }

        return Pair(trxId, amount)
    }

    // সার্ভারে ডেটা পাঠানো
    private fun sendDataToServer(sender: String, body: String, trxId: String?, amount: Double?) {
        Thread {
            try {
                val client = OkHttpClient()
                val json = JSONObject().apply {
                    put("sender", sender)
                    put("rawBody", body)
                    put("trxId", trxId ?: "")
                    put("amount", amount ?: 0.0)
                    put("timestamp", System.currentTimeMillis())
                    put("secretKey", "YOUR_SECURE_MERCHANT_WEBHOOK_KEY")
                }

                val mediaType = "application/json; charset=utf-8".toMediaType()
                val requestBody = json.toString().toRequestBody(mediaType)
                val request = Request.Builder()
                    .url("https://your-server.com/api/sms-webhook")
                    .post(requestBody)
                    .build()

                val response = client.newCall(request).execute()
                Log.d("SMS_READER", "Server Response: \${response.code}")
            } catch (e: Exception) {
                Log.e("SMS_READER", "Failed to send SMS data to server", e)
            }
        }.start()
    }
}`, 'code-sms-listener')}
              className="inline-flex items-center gap-1 text-[11px] text-stone-300 hover:text-white bg-stone-800 px-2 py-1 rounded cursor-pointer"
            >
              {copiedCodeId === 'code-sms-listener' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCodeId === 'code-sms-listener' ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কোড কপি করুন' : 'Copy Code')}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono bg-stone-950 text-stone-100 overflow-x-auto leading-relaxed">
{`import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.regex.Pattern

class SmsListener : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val sender = sms.originatingAddress ?: continue
                val body = sms.messageBody ?: continue

                // ১. চেক করুন মেসেজটি বিকাশ বা নগদ থেকে এসেছে কি না
                if (sender.equals("bKash", ignoreCase = true) || 
                    sender.equals("Nagad", ignoreCase = true) || 
                    sender.contains("16247") || sender.contains("16167")) {

                    Log.d("SMS_READER", "Sender: $sender, Body: $body")
                    
                    // ২. Regex দিয়ে TrxID এবং Amount স্বয়ংক্রিয়ভাবে আলাদা করা
                    val extracted = parseTransaction(body)

                    // ৩. সার্ভার API-তে পাঠিয়ে দেওয়া
                    sendDataToServer(sender, body, extracted.first, extracted.second)
                }
            }
        }
    }

    private fun parseTransaction(body: String): Pair<String?, Double?> {
        var trxId: String? = null
        var amount: Double? = null

        val trxMatcher = Pattern.compile("(?:TrxID|TxnID|TRXID)\\\\s*[:\\\\s]?\\\\s*([A-Z0-9]{6,16})", Pattern.CASE_INSENSITIVE).matcher(body)
        if (trxMatcher.find()) trxId = trxMatcher.group(1)

        val amountMatcher = Pattern.compile("(?:Tk|Tk\\\\.|BDT|Amount:\\\\s*Tk)\\\\s*([0-9,]+(?:\\\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE).matcher(body)
        if (amountMatcher.find()) {
            amount = amountMatcher.group(1)?.replace(",", "")?.toDoubleOrNull()
        }

        return Pair(trxId, amount)
    }

    private fun sendDataToServer(sender: String, body: String, trxId: String?, amount: Double?) {
        Thread {
            try {
                val client = OkHttpClient()
                val json = JSONObject().apply {
                    put("sender", sender)
                    put("rawBody", body)
                    put("trxId", trxId ?: "")
                    put("amount", amount ?: 0.0)
                    put("timestamp", System.currentTimeMillis())
                    put("secretKey", "YOUR_SECURE_WEBHOOK_KEY")
                }

                val mediaType = "application/json; charset=utf-8".toMediaType()
                val requestBody = json.toString().toRequestBody(mediaType)
                val request = Request.Builder()
                    .url("https://your-server.com/api/sms-webhook")
                    .post(requestBody)
                    .build()

                client.newCall(request).execute()
            } catch (e: Exception) {
                Log.e("SMS_READER", "Error sending SMS data", e)
            }
        }.start()
    }
}`}
          </pre>
        </div>

        {/* Code Block 2: AndroidManifest.xml */}
        <div className="rounded-xl border border-stone-200 overflow-hidden">
          <div className="bg-stone-900 text-stone-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-amber-400">AndroidManifest.xml</span>
            <button
              onClick={() => copyToClipboard(`<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<application ...>
    <!-- ব্রডকাস্ট রিসিভার রেজিস্ট্রেশন -->
    <receiver
        android:name=".SmsListener"
        android:exported="true"
        android:permission="android.permission.BROADCAST_SMS">
        <intent-filter android:priority="999">
            <action android:name="android.provider.Telephony.SMS_RECEIVED" />
        </intent-filter>
    </receiver>
</application>`, 'code-manifest')}
              className="inline-flex items-center gap-1 text-[11px] text-stone-300 hover:text-white bg-stone-800 px-2 py-1 rounded cursor-pointer"
            >
              {copiedCodeId === 'code-manifest' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCodeId === 'code-manifest' ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'মেনিফেস্ট কপি করুন' : 'Copy Manifest')}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono bg-stone-950 text-stone-100 overflow-x-auto leading-relaxed">
{`<!-- ১. প্রয়োজনীয় পারমিশন -->
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<application ...>

    <!-- ২. ব্রডকাস্ট রিসিভার ডিক্লারেশন -->
    <receiver
        android:name=".SmsListener"
        android:exported="true"
        android:permission="android.permission.BROADCAST_SMS">
        <intent-filter android:priority="999">
            <action android:name="android.provider.Telephony.SMS_RECEIVED" />
        </intent-filter>
    </receiver>

</application>`}
          </pre>
        </div>

        {/* Code Block 3: Server API (Node.js / Express Matching API) */}
        <div className="rounded-xl border border-stone-200 overflow-hidden">
          <div className="bg-stone-900 text-stone-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-cyan-400">server/paymentVerificationApi.js (Node.js + Firebase/DB)</span>
            <button
              onClick={() => copyToClipboard(`// Express Backend API for Auto Matching
const express = require('express');
const router = express.Router();
const db = require('./firebaseAdmin'); // Firebase Firestore / Realtime DB

// ১. মার্চেন্ট ফোন থেকে SMS ডাটা রিসিভ করা
router.post('/api/sms-webhook', async (req, res) => {
  const { secretKey, trxId, amount, sender, rawBody } = req.body;

  // সিকিউরিটি টোকেন যাচাই
  if (secretKey !== process.env.MERCHANT_SECRET_KEY) {
    return res.status(403).json({ error: 'Unauthorized webhook' });
  }

  if (!trxId || !amount) {
    return res.status(400).json({ error: 'Missing TrxID or Amount' });
  }

  try {
    // ২. ডাটাবেজে এই TrxID দিয়ে পেন্ডিং রিকোয়েস্ট খোঁজা
    const snapshot = await db.collection('transactions')
      .where('trxId', '==', trxId.toUpperCase())
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (snapshot.empty) {
      // কোন পেন্ডিং ট্রানজেকশন মেলেনি (হয়তো ইউজার পরে সাবমিট করবে, তাই ক্যাশে রেখে দিন)
      await db.collection('unmatched_sms').doc(trxId).set({
        trxId,
        amount,
        sender,
        rawBody,
        receivedAt: new Date()
      });
      return res.json({ status: 'cached_unmatched' });
    }

    const doc = snapshot.docs[0];
    const userPayment = doc.data();

    // ৩. টাকার পরিমাণ হুবহু মিলছে কি না চেক করা
    if (Math.abs(userPayment.amount - amount) > 0.01) {
      await doc.ref.update({
        status: 'mismatch',
        smsAmount: amount,
        note: \`Amount mismatch: User requested \${userPayment.amount}, SMS had \${amount}\`
      });
      return res.json({ status: 'mismatch' });
    }

    // ৪. অ্যাটমিক ট্রানজেকশনে স্ট্যাটাস SUCCESS করা এবং ইউজারের ব্যালেন্স যোগ করা
    await db.runTransaction(async (t) => {
      // ডাবল স্পেন্ডিং বা রি-প্লে অ্যাটাক রোধে স্ট্যাটাস লক
      const freshDoc = await t.get(doc.ref);
      if (freshDoc.data().status !== 'pending') {
        throw new Error('Transaction already processed');
      }

      // স্ট্যাটাস Success
      t.update(doc.ref, {
        status: 'success',
        matchedAt: new Date(),
        matchedSms: rawBody
      });

      // ইউজারের ওয়ালেট ব্যালেন্স বৃদ্ধি
      const userRef = db.collection('users').doc(userPayment.userId);
      t.update(userRef, {
        balance: admin.firestore.FieldValue.increment(amount)
      });
    });

    return res.json({ status: 'success', message: 'Payment auto-verified & wallet credited' });

  } catch (error) {
    console.error('Matching Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;`, 'code-server-api')}
              className="inline-flex items-center gap-1 text-[11px] text-stone-300 hover:text-white bg-stone-800 px-2 py-1 rounded cursor-pointer"
            >
              {copiedCodeId === 'code-server-api' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCodeId === 'code-server-api' ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'সার্ভার কোড কপি করুন' : 'Copy Server Code')}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono bg-stone-950 text-stone-100 overflow-x-auto leading-relaxed">
{`// Express API: মার্চেন্ট ফোনের SMS ডাটা পেয়ে স্বয়ংক্রিয় ম্যাচিং করা
router.post('/api/sms-webhook', async (req, res) => {
  const { secretKey, trxId, amount, rawBody } = req.body;

  // ১. সিকিউরিটি চেক
  if (secretKey !== process.env.MERCHANT_SECRET_KEY) return res.status(403).send();

  // ২. পেন্ডিং ট্রানজেকশন অনুসন্ধান
  const snapshot = await db.collection('transactions')
    .where('trxId', '==', trxId.toUpperCase())
    .where('status', '==', 'pending')
    .get();

  if (snapshot.empty) return res.json({ status: 'unmatched' });

  const doc = snapshot.docs[0];
  const userOrder = doc.data();

  // ৩. অ্যামাউন্ট যাচাই
  if (Math.abs(userOrder.amount - amount) > 0.01) {
    await doc.ref.update({ status: 'mismatch', smsAmount: amount });
    return res.json({ status: 'mismatch' });
  }

  // ৪. ডাবল স্পেন্ডিং রোধে Firestore Transaction দিয়ে স্ট্যাটাস SUCCESS ও ব্যালেন্স যোগ
  await db.runTransaction(async (t) => {
    t.update(doc.ref, { status: 'success', matchedAt: new Date() });
    t.update(userWalletRef, { balance: admin.firestore.FieldValue.increment(amount) });
  });

  res.json({ status: 'success' });
});`}
          </pre>
        </div>
      </div>

      {/* ========================================================
          SECTION 4: প্রয়োজনীয় টেকনোলজি, নিরাপত্তা ও গুগল প্লে স্টোর পলিসি
         ======================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-lg mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            {isBn ? '৪. প্রয়োজনীয় টেকনোলজি, নিরাপত্তা সতর্কতা ও প্লে স্টোর পলিসি' : '4. Architecture, Security Warnings & Play Store Policy'}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            {isBn ? 'প্রডাকশন ব্যবহারের পূর্বে জানা অত্যন্ত জরুরি বিষয়সমূহ' : 'Critical Considerations Before Production Deployment'}
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {isBn 
              ? 'ব্যক্তিগত বিকাশ/নগদ সিম থেকে এসএমএস স্ক্র্যাপিংয়ের সীমাবদ্ধতা, সিকিউরিটি ঝুঁকি এবং প্লে স্টোরের নিয়মাবলী।' 
              : 'Security pitfalls of SMS scraping, battery optimization bypasses, and official merchant API comparison.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Card 1: Security Risk - SMS Spoofing */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{isBn ? '১. এসএমএস স্পুফিং ঝুঁকি (SMS Spoofing Risk)' : '1. SMS Sender ID Spoofing'}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isBn 
                ? 'সাধারণ এসএমএসে প্রেরকের নাম ("bKash" বা "Nagad") বিভিন্ন আন্তর্জাতিক বা গ্রে-রুট এসএমএস গেটওয়ে দিয়ে হুবহু স্পুফ (নকল) করা সম্ভব। যদি কোনো প্রতারক আপনার মার্চেন্ট ফোনে বিকাশ পরিচয়ে ভুয়া এসএমএস পাঠায়, আপনার অ্যাপ সেটি রিড করে পেমেন্ট ভেরিফাই করে দিতে পারে! সমাধান: অ্যাপে শুধুমাত্র প্রেরক চেক না করে এসএমএসের মধ্যে থাকা "Balance" ফিল্ড ও পূর্ববর্তী ব্যালেন্স মিলিয়ে যাচাই করুন।'
                : 'Sender IDs like "bKash" can be spoofed by malicious actors via international grey SMS routes. Solution: Verify account balance increments in the message or cross-check via SIM USSD.'}
            </p>
          </div>

          {/* Card 2: Security Risk - Replay Attacks */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm mb-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>{isBn ? '২. ডাবল স্পেন্ডিং বা রি-প্লে অ্যাটাক (Replay Attack)' : '2. Replay & Duplicate TrxID Attacks'}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isBn 
                ? 'একই TrxID একাধিক ইউজার বা একই ইউজার বারবার সাবমিট করতে পারে। ডাটাবেজের `trxId` কলামে অবশ্যই `UNIQUE` কনস্ট্রেইন্ট থাকতে হবে এবং সার্ভার কোডে অ্যাটমিক ট্রানজেকশন (Firestore runTransaction / SQL row locking) ব্যবহার করতে হবে যেন একই TrxID দুইবার ব্যালেন্স যোগ করতে না পারে।'
                : 'Enforce strict UNIQUE constraints on trxId in your database and use atomic database transactions to prevent race conditions and duplicate wallet crediting.'}
            </p>
          </div>

          {/* Card 3: Android Background Killers (Xiaomi, Samsung) */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm mb-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>{isBn ? '৩. অ্যান্ড্রয়েড ব্যাকগ্রাউন্ড কিলিং (Doze Mode & OEMs)' : '3. Android Doze Mode & Battery Killers'}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isBn 
                ? 'Xiaomi (MIUI), Samsung, Oppo বা Vivo ফোনে স্ক্রিন বন্ধ থাকলে অ্যান্ড্রয়েড ওএস ব্যাকগ্রাউন্ড অ্যাপ কিল করে দেয়। ফলস্বরূপ নতুন এসএমএস আসলে ব্রডকাস্ট রিসিভার কল নাও হতে পারে। সমাধান: মার্চেন্ট ফোনে অ্যাপের জন্য "Battery Optimization: Unrestricted" এবং "Autostart" অন রাখুন এবং একটি সাইলেন্ট Foreground Service চালু রাখুন।'
                : 'Modern Android OEM battery managers kill background receivers when the screen is off. Keep a sticky Foreground Service running and set Battery Optimization to Unrestricted.'}
            </p>
          </div>

          {/* Card 4: Google Play Store Policy */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm mb-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? '৪. গুগল প্লে স্টোর পলিসি ও সাইডলোডিং (Sideloading)' : '4. Google Play Store Policy & Sideloading'}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {isBn 
                ? 'গুগল প্লে স্টোরের পলিসি অনুযায়ী শুধুমাত্র ডিফল্ট এসএমএস অ্যাপ (Default SMS App) ছাড়া অন্য কোনো অ্যাপকে `RECEIVE_SMS` পারমিশন দেয় না। আপনার এই এসএমএস রিডার অ্যাপটি প্লে স্টোরে আপলোড করলে রিজেক্ট হবে। তাই এটি শুধুমাত্র আপনার নিজের মার্চেন্ট ফোনে সরাসরি APK ফাইল বিল্ড করে (Sideload) ইনস্টল করে চালাতে হবে।'
                : 'Google Play strictly bans RECEIVE_SMS for non-default SMS apps. Build a signed APK and sideload it directly onto your dedicated merchant phone.'}
            </p>
          </div>

        </div>

        {/* Comparison with Official bKash/Nagad PGW */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="font-bold text-emerald-950 text-sm mb-1">
            {isBn ? '💡 দীর্ঘমেয়াদী ও ১০০% নিরাপদ বিকল্প: অফিশিয়াল bKash/Nagad Merchant API' : '💡 Official Alternative: bKash PGW & Nagad Merchant APIs'}
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            {isBn 
              ? 'আপনার ব্যবসা বড় হলে বা ১০০% লিগ্যাল অটোমেশন চাইলে bKash Payment Gateway (PGW - Tokenized Checkout) এবং Nagad Merchant API ব্যবহার করা সর্বোত্তম। এতে কোনো মার্চেন্ট ফোনের দরকার হয় না; সরাসরি বিকাশ/নগদের সার্ভার থেকে আপনার সার্ভারে সুরক্ষিত ওয়েবহুক (IPN Webhook) আসে, যেখানে কোনো ভুয়া ট্রানজেকশন বা স্পুফিংয়ের সুযোগ থাকে না।'
              : 'For legal and scaled e-commerce, integrate the official bKash Payment Gateway (Tokenized API) and Nagad IPN Webhook instead of personal SMS scraping.'}
          </p>
        </div>

      </div>

    </div>
  );
};
