import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  Database, 
  Info, 
  Trash2, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { SmsMessage, Language, AndroidPermissionState } from '../types';

interface SmsDetailModalProps {
  sms: SmsMessage | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSendReply: (recipient: string, text: string) => void;
  onCopyOtp: (otp: string) => void;
  copiedOtp: string | null;
  permissions: AndroidPermissionState;
  lang: Language;
}

export const SmsDetailModal: React.FC<SmsDetailModalProps> = ({
  sms,
  onClose,
  onDelete,
  onSendReply,
  onCopyOtp,
  copiedOtp,
  permissions,
  lang
}) => {
  const [replyText, setReplyText] = useState('');
  const [copiedFullText, setCopiedFullText] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const isBn = lang === 'bn';

  if (!sms) return null;

  const handleCopyFull = () => {
    navigator.clipboard.writeText(sms.body);
    setCopiedFullText(true);
    setTimeout(() => setCopiedFullText(false), 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendReply(sms.sender, replyText);
    setReplyText('');
  };

  const isUnicode = /[^\u0000-\u00ff]/.test(sms.body);
  const charLimit = isUnicode ? 70 : 160;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
              {sms.sender.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 leading-tight">
                {sms.sender}
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {sms.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-toggle-metadata"
              onClick={() => setShowMetadata(!showMetadata)}
              className={`p-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                showMetadata 
                  ? 'bg-stone-900 text-white border-stone-900' 
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
              title={isBn ? 'অ্যান্ড্রয়েড আর্কিটেকচার মেটাডাটা' : 'Android metadata'}
            >
              <Database className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-delete-sms-modal"
              onClick={() => {
                onDelete(sms.id);
                onClose();
              }}
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent transition cursor-pointer"
              title={isBn ? 'রুম ডাটাবেজ থেকে মুছুন' : 'Delete from Room DB'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-close-detail-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto space-y-4">
          
          {/* Metadata Inspector (When toggled) */}
          {showMetadata && (
            <div className="p-3 bg-stone-900 text-stone-200 rounded-xl text-xs font-mono space-y-1.5 border border-stone-800">
              <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-stone-800 pb-1">
                <span>// Room Entity & ContentResolver Meta</span>
                <span className="text-[10px]">Android Telephony</span>
              </div>
              <div><span className="text-stone-400">Content URI:</span> content://sms/inbox/{sms.id}</div>
              <div><span className="text-stone-400">Table:</span> sms_messages (Local Room SQLite)</div>
              <div><span className="text-stone-400">Category:</span> {sms.category}</div>
              <div><span className="text-stone-400">Timestamp:</span> {new Date(sms.timestamp).toISOString()}</div>
              <div><span className="text-stone-400">PDU Encoding:</span> {isUnicode ? 'UCS-2 (Unicode Bengali)' : 'GSM 7-Bit'}</div>
              <div><span className="text-stone-400">Length:</span> {sms.body.length} chars (Limit: {charLimit}/segment)</div>
            </div>
          )}

          {/* Category & Details Banner */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
              {sms.category.toUpperCase()}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              {new Date(sms.timestamp).toLocaleString()}
            </span>
          </div>

          {/* SMS Body Bubble */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-900 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text">
            {sms.body}
          </div>

          {/* Detected Elements (OTP or Amount) */}
          {(sms.otpCode || sms.amount) && (
            <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              {sms.otpCode && (
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-amber-900 font-medium">
                      {isBn ? 'সনাক্তকৃত ওটিপি কোড:' : 'Detected OTP Code:'}
                    </span>
                    <span className="font-mono font-bold text-sm bg-amber-200/70 text-amber-950 px-2 py-0.5 rounded">
                      {sms.otpCode}
                    </span>
                  </div>
                  <button
                    id="btn-copy-detected-otp"
                    onClick={() => onCopyOtp(sms.otpCode!)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-2xs transition cursor-pointer"
                  >
                    {copiedOtp === sms.otpCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOtp === sms.otpCode ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                  </button>
                </div>
              )}

              {sms.amount && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-900 font-medium">
                    {isBn ? 'লেনদেন পরিমাণ:' : 'Amount:'}
                  </span>
                  <span className="font-semibold text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                    {sms.currency || '৳'} {sms.amount}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Copy full text action */}
          <div className="flex items-center justify-end">
            <button
              id="btn-copy-full-text"
              onClick={handleCopyFull}
              className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
            >
              {copiedFullText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFullText ? (isBn ? 'সম্পূর্ণ মেসেজ কপি হয়েছে' : 'Message Copied!') : (isBn ? 'সম্পূর্ণ মেসেজ কপি করুন' : 'Copy Full Message')}</span>
            </button>
          </div>

          {/* Reply Section (SEND_SMS Logic) */}
          <div className="pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-stone-600" />
                <span>{isBn ? 'এসএমএস রিপ্লাই পাঠান (SEND_SMS)' : 'Send SMS Reply (SmsManager)'}</span>
              </span>
              {!permissions.sendSms && (
                <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-medium border border-rose-200">
                  SEND_SMS Denied
                </span>
              )}
            </div>

            <form onSubmit={handleSend} className="space-y-2">
              <div className="relative">
                <textarea
                  id="textarea-reply-sms"
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    permissions.sendSms 
                      ? (isBn ? `${sms.sender}-কে উত্তর লিখুন...` : `Reply to ${sms.sender}...`)
                      : (isBn ? 'রিপ্লাই পাঠাতে SEND_SMS পারমিশন প্রয়োজন' : 'SEND_SMS permission required to reply')
                  }
                  disabled={!permissions.sendSms}
                  className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-mono">
                  {replyText.length} / 160 chars ({Math.ceil((replyText.length || 1) / 160)} SMS)
                </span>

                <button
                  type="submit"
                  id="btn-send-reply-submit"
                  disabled={!permissions.sendSms || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>{isBn ? 'পাঠান' : 'Send'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
