import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Database, 
  Lock, 
  Copy, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { PRIVACY_POLICY_DATA } from '../data/policyData';
import { Language } from '../types';

interface PrivacyPolicyViewProps {
  lang: Language;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';
  const [copied, setCopied] = useState(false);

  const fullPolicyText = PRIVACY_POLICY_DATA.sections
    .map((s) => `${isBn ? s.heading : s.headingEn}\n\n${isBn ? s.contentBn : s.contentEn}`)
    .join('\n\n---\n\n');

  const handleCopyPolicy = () => {
    navigator.clipboard.writeText(
      `${isBn ? PRIVACY_POLICY_DATA.appTitleBn : PRIVACY_POLICY_DATA.appTitle} - Privacy Policy\nEffective Date: ${PRIVACY_POLICY_DATA.effectiveDate}\n\n${fullPolicyText}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Privacy Policy Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Google Play Compliant Privacy Document</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              {isBn ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy'}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {isBn ? 'কার্যকর তারিখ:' : 'Effective Date:'} {PRIVACY_POLICY_DATA.effectiveDate} • {isBn ? PRIVACY_POLICY_DATA.appTitleBn : PRIVACY_POLICY_DATA.appTitle}
            </p>
          </div>

          <button
            id="btn-copy-privacy-policy"
            onClick={handleCopyPolicy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isBn ? 'কপি সম্পন্ন!' : 'Copied!') : (isBn ? 'পলিসি টেক্সট কপি করুন' : 'Copy Policy Text')}</span>
          </button>
        </div>

        {/* Highlight Callout: Zero Server Uploads */}
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <Database className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 leading-relaxed">
            <span className="font-bold block mb-0.5 text-emerald-900">
              {isBn ? '১০০% অন-ডিভাইস প্রসেসিং ও জিরো সার্ভার আপলোড অঙ্গীকার' : '100% On-Device Processing Commitment'}
            </span>
            {isBn 
              ? 'গুগল প্লে স্টোর পলিসি অনুসারে এই অ্যাপলিকেশনটি নিশ্চিত করে যে কোনো এসএমএস কন্টেন্ট বা যোগাযোগের তথ্য রিমোট সার্ভার বা তৃতীয় পক্ষের কাছে প্রেরণ করা হয় না। সমস্ত ফিল্টারিং ও অনুসন্ধান লোকাল Room/SQLite ডাটাবেজে সম্পাদিত হয়।'
              : 'In strict compliance with Google Play User Data policies, this app explicitly affirms that NO SMS content, OTP, or sender contact is ever uploaded, synchronized, or stored on remote third-party servers. All processing is strictly confined to the local Room/SQLite database on your hardware.'}
          </div>
        </div>
      </div>

      {/* Structured Policy Sections */}
      <div className="space-y-4">
        {PRIVACY_POLICY_DATA.sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isBn ? section.heading : section.headingEn}</span>
            </h3>
            <div className="text-xs text-stone-600 leading-relaxed whitespace-pre-line pl-6">
              {isBn ? section.contentBn : section.contentEn}
            </div>
          </div>
        ))}
      </div>

      {/* Developer declaration footnote */}
      <div className="p-4 bg-stone-100 rounded-xl text-center text-xs text-stone-500">
        {isBn
          ? 'এই পলিসিটি আপনার গুগল প্লে কনসোলে "App Content > Privacy Policy" সেকশনে ব্যবহার উপযোগী।'
          : 'This policy meets all requirements for submission to Google Play Console under App Content > Privacy Policy.'}
      </div>

    </div>
  );
};
