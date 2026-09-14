import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Sparkles, 
  Send, 
  ShieldAlert,
  CreditCard,
  KeyRound,
  User,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { Language, AndroidPermissionState } from '../types';
import { detectSmsCategory } from '../data/mockSms';

interface SimulateSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerIncomingSms: (sender: string, body: string) => void;
  permissions: AndroidPermissionState;
  lang: Language;
}

export const SimulateSmsModal: React.FC<SimulateSmsModalProps> = ({
  isOpen,
  onClose,
  onTriggerIncomingSms,
  permissions,
  lang
}) => {
  const isBn = lang === 'bn';

  const [sender, setSender] = useState('bKash');
  const [body, setBody] = useState(
    'Your bKash verification code is 638201. Never share your OTP or PIN with anyone. Valid for 2 mins.'
  );

  if (!isOpen) return null;

  const presets = [
    {
      title: isBn ? 'bKash ওটিপি (OTP)' : 'bKash OTP',
      icon: KeyRound,
      color: 'bg-amber-500',
      sender: 'bKash',
      body: 'Your bKash verification code is 638201. Never share your OTP or PIN with anyone. Valid for 2 mins.'
    },
    {
      title: isBn ? 'সিটি ব্যাংক ট্রানজেকশন' : 'City Bank Debit',
      icon: CreditCard,
      color: 'bg-emerald-600',
      sender: 'CityBank',
      body: 'Debit Alert: A/C *8812 debited by BDT 4,250.00 at Shwapno Dhanmondi on 14-Sep-26. Avail Bal: BDT 38,060.50.'
    },
    {
      title: isBn ? 'জিপি ইন্টারনেট অফার' : 'GP Promo Offer',
      icon: Tag,
      color: 'bg-purple-600',
      sender: 'GP',
      body: 'ধামাকা অফার! ৪ জিবি ইন্টারনেট মাত্র ৬৯ টাকায়! মেয়াদ ৫ দিন। নিতে ডায়াল করুন *121*5069# এখনই।'
    },
    {
      title: isBn ? 'বন্ধুর ব্যক্তিগত বার্তা' : 'Personal SMS',
      icon: User,
      color: 'bg-blue-600',
      sender: '+8801755112233',
      body: 'ভাইয়া, সন্ধ্যার পর কি একটু ফ্রি আছেন? নতুন অ্যান্ড্রয়েড অ্যাপের প্লে স্টোর পলিসি নিয়ে কথা বলব।'
    },
    {
      title: isBn ? 'ফিশিং লটারি স্প্যাম' : 'Lottery Spam',
      icon: AlertTriangle,
      color: 'bg-rose-600',
      sender: '+8801900112233',
      body: 'CONGRATS! You won 5,00,000 BDT in Mega Lucky Draw! Call now to claim immediately before offer expires.'
    }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setSender(preset.sender);
    setBody(preset.body);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !sender.trim()) return;
    onTriggerIncomingSms(sender, body);
    onClose();
  };

  const detected = detectSmsCategory(body, sender);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">
                {isBn ? 'ব্রডকাস্ট রিসিভার সিমুলেটর' : 'Broadcast Receiver Simulator'}
              </h3>
              <p className="text-[11px] text-stone-300">
                android.provider.Telephony.SMS_RECEIVED
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning if RECEIVE_SMS permission is not granted */}
        {!permissions.receiveSms && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isBn 
                ? 'সতর্কতা: RECEIVE_SMS পারমিশন বন্ধ আছে। ব্রডকাস্ট রিসিভার সিস্টেমে এই মেসেজ ড্রপ করতে পারে।'
                : 'Warning: RECEIVE_SMS permission is denied. System may drop incoming intents.'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
          
          {/* Presets Grid */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-2">
              {isBn ? 'রেডিমেড টেমপ্লেট নির্বাচন করুন:' : 'Select a Test Preset:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presets.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-2 text-left rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition flex flex-col gap-1.5 cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`w-5 h-5 rounded-md ${p.color} text-white flex items-center justify-center shrink-0`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-[11px] font-semibold text-stone-800 group-hover:text-emerald-900 truncate">
                        {p.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 truncate font-mono">
                      {p.sender}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sender Input */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              {isBn ? 'প্রেরক / ফোন নম্বর (Sender Address):' : 'Sender Address / Short Code:'}
            </label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="e.g. bKash, CityBank, +8801700..."
              className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* SMS Body Input */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              {isBn ? 'মেসেজ বডি (SMS Body Text):' : 'SMS Body Text:'}
            </label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter message body..."
              className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              required
            />
          </div>

          {/* Real-time Category Detection Preview */}
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              {isBn ? 'স্বয়ংক্রিয় ক্যাটাগরি:' : 'Auto-detected Category:'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-900 text-white">
                {detected.category.toUpperCase()}
              </span>
              {detected.otpCode && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900">
                  OTP: {detected.otpCode}
                </span>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium transition cursor-pointer"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              id="btn-broadcast-sms-submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isBn ? 'ব্রডকাস্ট রিসিভার ফায়ার করুন' : 'Dispatch SMS Intent'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
