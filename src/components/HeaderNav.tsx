import React from 'react';
import { ActiveTab, Language } from '../types';
import { 
  Smartphone, 
  Code2, 
  ShieldCheck, 
  FileText, 
  Globe, 
  Radio, 
  RotateCcw,
  PlusCircle,
  Wallet,
  LayoutDashboard
} from 'lucide-react';

interface HeaderNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenSimulator: () => void;
  onOpenPermissions: () => void;
  onResetData: () => void;
  unreadCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onOpenSimulator,
  onOpenPermissions,
  onResetData,
  unreadCount
}) => {
  const isBn = lang === 'bn';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-base sm:text-lg tracking-tight">
                  {isBn ? 'অ্যান্ড্রয়েড এসএমএস আর্কিটেকচার' : 'Android SMS Architecture'}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Kotlin + Room DB
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden md:block">
                {isBn 
                  ? 'ইনবক্স রিডিং • ব্রডকাস্ট রিসিভার • প্লে স্টোর পলিসি ও সিকিউরিটি' 
                  : 'Inbox Reading • Broadcast Receiver • Play Store Policy & Security'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Simulate Incoming SMS button */}
            <button
              id="btn-trigger-sms-broadcast"
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow-sm cursor-pointer"
              title={isBn ? 'ইনকামিং এসএমএস টেস্ট করুন' : 'Simulate incoming SMS'}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">
                {isBn ? 'নতুন এসএমএস ট্রিগার' : 'Simulate Incoming'}
              </span>
              <span className="sm:hidden">{isBn ? 'এসএমএস' : 'SMS'}</span>
            </button>

            {/* Permissions toggle */}
            <button
              id="btn-manage-permissions"
              onClick={onOpenPermissions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 transition cursor-pointer"
              title={isBn ? 'অ্যান্ড্রয়েড পারমিশন পরিচালনা' : 'Manage Android Permissions'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden md:inline">{isBn ? 'পারমিশন' : 'Permissions'}</span>
            </button>

            {/* Language Switcher */}
            <button
              id="btn-toggle-language"
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{isBn ? 'ENG' : 'বাংলা'}</span>
            </button>

            {/* Reset data */}
            <button
              id="btn-reset-data"
              onClick={onResetData}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              title={isBn ? 'ডাটাবেজ রিসেট করুন' : 'Reset local database'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-stone-100 no-scrollbar">
          <button
            id="nav-tab-payment-gateway"
            onClick={() => setActiveTab('payment_gateway')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'payment_gateway'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-300" />
            <span>{isBn ? '১. বিকাশ/নগদ অটো পেমেন্ট' : '1. bKash/Nagad Auto Match'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950 animate-pulse">
              HOT
            </span>
          </button>

          <button
            id="nav-tab-admin-dashboard"
            onClick={() => setActiveTab('admin_dashboard')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'admin_dashboard'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-300" />
            <span>{isBn ? '২. অ্যাডমিন হিস্ট্রি টেবিল ও ড্যাশবোর্ড' : '2. Admin History & Dashboard'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              NEW
            </span>
          </button>

          <button
            id="nav-tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isBn ? '৩. লাইভ ইনবক্স সিমুলেটর' : '3. Live Inbox Simulator'}</span>
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'simulator' ? 'bg-emerald-400 text-stone-950' : 'bg-emerald-500 text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-code-studio"
            onClick={() => setActiveTab('code_studio')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'code_studio'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{isBn ? '৪. কোটলিন ও রুম কোড স্টুডিও' : '4. Kotlin & Room Code'}</span>
          </button>

          <button
            id="nav-tab-play-policy"
            onClick={() => setActiveTab('play_policy')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'play_policy'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isBn ? '৫. গুগল প্লে পলিসি গাইড' : '5. Google Play Policy'}</span>
          </button>

          <button
            id="nav-tab-privacy-policy"
            onClick={() => setActiveTab('privacy_policy')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === 'privacy_policy'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isBn ? '৬. প্রাইভেসি পলিসি পেজ' : '6. Privacy Policy Page'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
