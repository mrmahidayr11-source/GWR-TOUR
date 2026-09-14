import React, { useState } from 'react';
import { X, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AndroidPermissionState, Language } from '../types';

interface ComposeSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSms: (recipient: string, body: string) => void;
  permissions: AndroidPermissionState;
  lang: Language;
}

export const ComposeSmsModal: React.FC<ComposeSmsModalProps> = ({
  isOpen,
  onClose,
  onSendSms,
  permissions,
  lang
}) => {
  const isBn = lang === 'bn';
  const [recipient, setRecipient] = useState('');
  const [body, setBody] = useState('');

  if (!isOpen) return null;

  const isUnicode = /[^\u0000-\u00ff]/.test(body);
  const maxSegment = isUnicode ? 70 : 160;
  const segments = Math.ceil((body.length || 1) / maxSegment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !body.trim() || !permissions.sendSms) return;
    onSendSms(recipient, body);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">
                {isBn ? 'নতুন এসএমএস কম্পোজ করুন' : 'Compose SMS (SmsManager)'}
              </h3>
              <p className="text-[11px] text-stone-300">
                android.permission.SEND_SMS
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Permission warning if disabled */}
        {!permissions.sendSms && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-xs text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {isBn 
                ? 'SEND_SMS পারমিশন বন্ধ আছে! মেসেজ পাঠাতে পারমিশন অনুমতি দিন।'
                : 'SEND_SMS permission is denied! Enable permission to dispatch SMS.'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              {isBn ? 'প্রাপক / মোবাইল নম্বর (To):' : 'Recipient Phone Number:'}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. +8801700112233"
              className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              {isBn ? 'মেসেজ টেক্সট (Message Body):' : 'Message Body:'}
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={isBn ? 'এখানে বার্তা লিখুন...' : 'Type your SMS message here...'}
              className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              required
            />
          </div>

          {/* Telephony segmentation meter */}
          <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-[11px] font-mono text-stone-600">
            <span>
              Encoding: {isUnicode ? 'UCS-2 Unicode (Bengali)' : 'GSM 7-Bit'}
            </span>
            <span>
              {body.length} / {maxSegment} chars ({segments} SMS)
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium cursor-pointer"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!permissions.sendSms || !body.trim() || !recipient.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBn ? 'এসএমএস পাঠান (Dispatch)' : 'Send SMS'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
