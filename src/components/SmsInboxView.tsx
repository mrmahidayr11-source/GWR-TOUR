import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  KeyRound, 
  CreditCard, 
  User, 
  Tag, 
  AlertTriangle, 
  Copy, 
  Check, 
  Plus, 
  Inbox,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';
import { SmsMessage, SmsCategory, Language, AndroidPermissionState } from '../types';

interface SmsInboxViewProps {
  messages: SmsMessage[];
  permissions: AndroidPermissionState;
  onRequestPermissions: () => void;
  onSelectMessage: (sms: SmsMessage) => void;
  onComposeClick: () => void;
  onCopyOtp: (otp: string) => void;
  copiedOtp: string | null;
  lang: Language;
}

export const SmsInboxView: React.FC<SmsInboxViewProps> = ({
  messages,
  permissions,
  onRequestPermissions,
  onSelectMessage,
  onComposeClick,
  onCopyOtp,
  copiedOtp,
  lang
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SmsCategory>('all');
  const isBn = lang === 'bn';

  // Filter messages
  const filteredMessages = useMemo(() => {
    if (!permissions.readSms) return [];

    return messages.filter((sms) => {
      // Category match
      if (selectedCategory !== 'all' && sms.category !== selectedCategory) {
        return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSender = sms.sender.toLowerCase().includes(q);
        const matchAddress = sms.address.toLowerCase().includes(q);
        const matchBody = sms.body.toLowerCase().includes(q);
        const matchOtp = sms.otpCode?.toLowerCase().includes(q);
        const matchAmount = sms.amount?.toLowerCase().includes(q);
        return matchSender || matchAddress || matchBody || matchOtp || matchAmount;
      }
      return true;
    });
  }, [messages, selectedCategory, searchQuery, permissions.readSms]);

  // Counts by category
  const counts = useMemo(() => {
    const map: Record<SmsCategory, number> = {
      all: messages.length,
      otp: 0,
      transaction: 0,
      personal: 0,
      promotion: 0,
      spam: 0
    };
    messages.forEach((m) => {
      map[m.category] = (map[m.category] || 0) + 1;
    });
    return map;
  }, [messages]);

  // Format relative timestamp
  const formatTime = (timeMs: number) => {
    const diffMin = Math.round((Date.now() - timeMs) / (1000 * 60));
    if (diffMin < 1) return isBn ? 'এইমাত্র' : 'Just now';
    if (diffMin < 60) return isBn ? `${diffMin} মিনিট আগে` : `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return isBn ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
    const days = Math.round(diffHours / 24);
    return isBn ? `${days} দিন আগে` : `${days}d ago`;
  };

  // Get Avatar background & text based on sender
  const getAvatarInfo = (sender: string) => {
    const colors = [
      'bg-blue-600 text-white',
      'bg-emerald-600 text-white',
      'bg-indigo-600 text-white',
      'bg-rose-600 text-white',
      'bg-amber-600 text-white',
      'bg-purple-600 text-white',
      'bg-teal-600 text-white'
    ];
    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
      hash = sender.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    const initial = sender.charAt(0).toUpperCase() || 'S';
    return { color, initial };
  };

  // Render permission denied warning
  if (!permissions.readSms) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-stone-900 mb-1">
          {isBn ? 'READ_SMS পারমিশন প্রয়োজন' : 'READ_SMS Permission Required'}
        </h3>
        <p className="text-xs text-stone-500 mb-5 max-w-xs leading-relaxed">
          {isBn
            ? 'অ্যান্ড্রয়েড আর্কিটেকচার অনুযায়ী ইনবক্সের ContentResolver থেকে এসএমএস পড়ার জন্য READ_SMS পারমিশন প্রয়োজন।'
            : 'Android architecture requires the READ_SMS runtime permission to query the ContentResolver inbox.'}
        </p>
        <button
          id="btn-grant-permission-cta"
          onClick={onRequestPermissions}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <span>{isBn ? 'পারমিশন অনুমতি দিন' : 'Grant Runtime Permission'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      
      {/* Top App Bar & Search */}
      <div className="px-4 pt-3 pb-2 bg-stone-50 border-b border-stone-200">
        
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>{isBn ? 'এসএমএস ইনবক্স' : 'SMS Messages'}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
              {filteredMessages.length}
            </span>
          </h2>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Room DB: Synced
          </span>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            id="input-sms-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isBn 
                ? 'কন্টাক্ট, ওটিপি বা মেসেজ খুঁজুন...' 
                : 'Search sender, OTP, or keywords...'
            }
            className="w-full pl-9 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 mt-1 no-scrollbar">
          {[
            { id: 'all' as SmsCategory, labelBn: 'সকল', labelEn: 'All', icon: Inbox },
            { id: 'otp' as SmsCategory, labelBn: 'ওটিপি', labelEn: 'OTP', icon: KeyRound },
            { id: 'transaction' as SmsCategory, labelBn: 'লেনদেন', labelEn: 'Finance', icon: CreditCard },
            { id: 'personal' as SmsCategory, labelBn: 'ব্যক্তিগত', labelEn: 'Personal', icon: User },
            { id: 'promotion' as SmsCategory, labelBn: 'অফার', labelEn: 'Offers', icon: Tag },
            { id: 'spam' as SmsCategory, labelBn: 'স্প্যাম', labelEn: 'Spam', icon: AlertTriangle },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = counts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                id={`filter-cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{isBn ? cat.labelBn : cat.labelEn}</span>
                <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RecyclerView Representation (SMS List) */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full text-stone-400">
            <Filter className="w-10 h-10 mb-2 stroke-1 text-stone-300" />
            <p className="text-xs font-medium text-stone-600 mb-1">
              {isBn ? 'কোনো মেসেজ পাওয়া যায়নি' : 'No messages found'}
            </p>
            <p className="text-[11px] text-stone-400">
              {isBn 
                ? 'অন্য কোনো কিওয়ার্ড বা ক্যাটাগরি দিয়ে চেষ্টা করুন' 
                : 'Try clearing the search or switching category filter'}
            </p>
          </div>
        ) : (
          filteredMessages.map((sms) => {
            const { color, initial } = getAvatarInfo(sms.sender);
            return (
              <div
                key={sms.id}
                id={`sms-item-${sms.id}`}
                onClick={() => onSelectMessage(sms)}
                className={`p-3.5 hover:bg-stone-50/80 transition flex items-start gap-3 cursor-pointer select-none ${
                  !sms.isRead ? 'bg-emerald-50/20' : ''
                }`}
              >
                {/* Sender Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${color}`}>
                  {initial}
                </div>

                {/* Main Content Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1 mb-0.5">
                    <span className={`text-xs truncate ${!sms.isRead ? 'font-bold text-stone-950' : 'font-semibold text-stone-800'}`}>
                      {sms.sender}
                    </span>
                    <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                      {formatTime(sms.timestamp)}
                    </span>
                  </div>

                  {/* Body Snippet */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-snug">
                    {sms.body}
                  </p>

                  {/* Badges and Quick Actions */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-2">
                    
                    {/* Category Tag */}
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      sms.category === 'otp'
                        ? 'bg-amber-100 text-amber-800'
                        : sms.category === 'transaction'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sms.category === 'spam'
                        ? 'bg-rose-100 text-rose-800'
                        : sms.category === 'promotion'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {sms.category.toUpperCase()}
                    </span>

                    {/* Financial Amount Tag if detected */}
                    {sms.amount && (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                        {sms.currency || '৳'} {sms.amount}
                      </span>
                    )}

                    {/* 1-Click OTP Copy Button */}
                    {sms.otpCode && (
                      <button
                        id={`btn-copy-otp-${sms.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyOtp(sms.otpCode!);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-500 hover:bg-amber-600 text-white px-2 py-0.5 rounded-full transition shadow-2xs ml-auto cursor-pointer"
                        title={isBn ? 'ওটিপি কপি করুন' : 'Copy OTP'}
                      >
                        {copiedOtp === sms.otpCode ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>{isBn ? 'কপি হয়েছে' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-white" />
                            <span>OTP: {sms.otpCode}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Unread indicator badge */}
                {!sms.isRead && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Compose Button (Simulating SEND_SMS reply or compose) */}
      <div className="p-3 bg-white border-t border-stone-100 flex items-center justify-between">
        <span className="text-[11px] text-stone-500">
          {isBn ? 'অন-ডিভাইস এনক্রিপ্টেড ডাটাবেজ' : '100% On-Device Room DB'}
        </span>
        <button
          id="btn-compose-sms-fab"
          onClick={onComposeClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isBn ? 'এসএমএস পাঠান (Send)' : 'Compose'}</span>
        </button>
      </div>

    </div>
  );
};
