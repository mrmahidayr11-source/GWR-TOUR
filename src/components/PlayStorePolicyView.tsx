import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileCheck2, 
  ExternalLink,
  Lock,
  Smartphone,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PLAY_STORE_POLICIES } from '../data/policyData';
import { Language } from '../types';

interface PlayStorePolicyViewProps {
  lang: Language;
}

export const PlayStorePolicyView: React.FC<PlayStorePolicyViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';
  const [expandedId, setExpandedId] = useState<string | null>(PLAY_STORE_POLICIES[0].id);

  const checklistItems = [
    {
      titleBn: 'অ্যাপটি কি ডিভাইসের "Default SMS Handler" হিসেবে কাজ করে?',
      titleEn: 'Does the app operate as the primary Default SMS Handler?',
      recommendationBn: 'যদি না করে, তবে ফিন্যান্সিয়াল বা এন্টারপ্রাইজ ট্র্যাকার এক্সেপশন সিলেক্ট করতে হবে।',
      recommendationEn: 'If no, you must qualify and declare under an approved core functionality exception.'
    },
    {
      titleBn: 'এসএমএস ডেটা কি কেবল লোকাল SQLite/Room ডাটাবেজে থাকে?',
      titleEn: 'Is SMS data strictly confined to the local on-device SQLite/Room DB?',
      recommendationBn: 'হ্যাঁ। কোনো থার্ড পার্টি সার্ভার বা এনালিটিক্স এন্ডপয়েন্টে এসএমএস আপলোড সম্পূর্ণ নিষিদ্ধ।',
      recommendationEn: 'Yes. Never transmit or upload raw SMS messages to remote cloud servers or analytics.'
    },
    {
      titleBn: 'শুধুমাত্র ওটিপি ভেরিফিকেশনের জন্য কি SMS Retriever API ব্যবহার করা হয়েছে?',
      titleEn: 'Is SMS Retriever API used instead of READ_SMS for pure OTP verification?',
      recommendationBn: 'যদি কাজ শুধু ওটিপি যাচাই হয়, তবে READ_SMS বাদ দিয়ে SMS Retriever API ব্যবহার করুন।',
      recommendationEn: 'If your only purpose is OTP reading, eliminate READ_SMS and use Google Play SMS Retriever.'
    },
    {
      titleBn: 'অ্যাপে কি প্রকাশ্য প্রাইভেসি পলিসি (Privacy Policy) ইউআরএল সংযুক্ত আছে?',
      titleEn: 'Is a comprehensive in-app Privacy Policy accessible to the user?',
      recommendationBn: 'হ্যাঁ, অ্যাপের ভেতরে এবং গুগল প্লে কনসোলে একই প্রাইভেসি পলিসি লিংক দিতে হবে।',
      recommendationEn: 'Yes, provide a transparent Privacy Policy declaring on-device processing both in-app and on Play Console.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-stone-900 rounded-2xl p-6 text-white border border-stone-800 shadow-xl">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Google Play Developer Program Policy • SMS & Call Log Permissions</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          {isBn 
            ? '৪. গুগল প্লে স্টোর পলিসি ও সিকিউরিটি কমপ্লায়েন্স' 
            : '4. Google Play Store SMS Policies & Security Compliance'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-3xl leading-relaxed">
          {isBn
            ? 'গুগল প্লে স্টোরে READ_SMS ও RECEIVE_SMS পারমিশন ব্যবহারের ক্ষেত্রে গুগল অত্যন্ত কঠোর নিয়ম প্রয়োগ করে। এই গাইডলাইন মেনে না চললে অ্যাপ রিজেক্ট বা প্লে স্টোর থেকে সাসপেন্ড হতে পারে।'
            : 'Google applies stringent restrictions on READ_SMS and RECEIVE_SMS permissions. Unjustified requests result in instant APK rejection or app removal.'}
        </p>
      </div>

      {/* Policy Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAY_STORE_POLICIES.map((policy) => {
          const isExpanded = expandedId === policy.id;
          return (
            <div
              key={policy.id}
              className={`rounded-2xl border transition p-4 flex flex-col justify-between ${
                policy.severity === 'strict'
                  ? 'bg-rose-50/40 border-rose-200'
                  : policy.severity === 'recommendation'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-amber-50/40 border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    policy.severity === 'strict'
                      ? 'bg-rose-600 text-white'
                      : policy.severity === 'recommendation'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}>
                    {policy.severity.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900 mb-1">
                  {isBn ? policy.titleBn : policy.title}
                </h3>

                <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                  {isBn ? policy.summaryBn : policy.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-200/60">
                <ul className="space-y-1 text-[11px] text-stone-700">
                  {(isBn ? policy.detailsBn : policy.details).map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-stone-400 font-bold">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Play Console Permissions Declaration Checklist */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
          <FileCheck2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-stone-900">
            {isBn ? 'গুগল প্লে কনসোল ডিক্লারেশন চেকলিস্ট (Checklist)' : 'Play Console Submission Checklist'}
          </h2>
        </div>

        <div className="space-y-3">
          {checklistItems.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                  {isBn ? item.titleBn : item.titleEn}
                </h4>
                <p className="text-xs text-stone-600 mt-0.5 leading-normal">
                  {isBn ? item.recommendationBn : item.recommendationEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative APIs vs Dangerous Permissions Comparison */}
      <div className="bg-stone-950 text-white rounded-2xl p-6 border border-stone-800 shadow-md">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Lock className="w-4 h-4" />
          <span>Security Best Practices</span>
        </div>
        <h3 className="text-base font-bold mb-2">
          {isBn ? 'বিকল্প টেকনোলজি নির্বাচন (Modern Alternatives)' : 'Modern Alternatives vs High-Risk Permissions'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
            <h4 className="text-xs font-bold text-rose-400 mb-1">
              {isBn ? 'ঝুঁকিপূর্ণ পদ্ধতি (High Risk)' : 'High Risk Path'}
            </h4>
            <div className="font-mono text-xs text-stone-300 mb-2">
              android.permission.READ_SMS
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {isBn 
                ? 'ইউজারের পুরো ইনবক্স রিড করে। গুগল প্লে স্টোরে প্রমাণ ছাড়া ৯০% ক্ষেত্রে রিজেক্ট হয়। কেবল ডিফল্ট এসএমএস অ্যাপের জন্য অনুমোদিত।'
                : 'Full inbox access. 90% rejection rate on Play Store unless you are the primary default SMS app.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
            <h4 className="text-xs font-bold text-emerald-400 mb-1">
              {isBn ? 'গুগল প্রস্তাবিত আধুনিক পদ্ধতি (Recommended)' : 'Recommended Modern Path'}
            </h4>
            <div className="font-mono text-xs text-emerald-300 mb-2">
              com.google.android.gms.auth.api.phone.SmsRetriever
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {isBn 
                ? 'কোনো পারমিশন ডায়ালগ ছাড়াই ওটিপি এসএমএস ফেচ করা যায়। প্লে স্টোরে ১০০% নিরাপদ ও তৎক্ষণাৎ অ্যাপ্রুভড হয়।'
                : 'Zero runtime permissions needed. Automatic OTP autofill with 100% Play Store approval guarantee.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
