import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Info,
  Smartphone,
  Check
} from 'lucide-react';
import { AndroidPermissionState, Language } from '../types';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: AndroidPermissionState;
  onTogglePermission: (key: keyof AndroidPermissionState) => void;
  onGrantAll: () => void;
  lang: Language;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  permissions,
  onTogglePermission,
  onGrantAll,
  lang
}) => {
  const isBn = lang === 'bn';

  if (!isOpen) return null;

  const permissionItems = [
    {
      key: 'readSms' as const,
      name: 'android.permission.READ_SMS',
      titleBn: 'READ_SMS (এসএমএস পড়ার অনুমতি)',
      titleEn: 'READ_SMS (Read SMS Messages)',
      purposeBn: 'ইনবক্সের ContentResolver (Telephony.Sms.Inbox.CONTENT_URI) থেকে পূর্বের ও বর্তমান সকল মেসেজ পড়ার জন্য প্রয়োজন।',
      purposeEn: 'Required to query Android ContentResolver and load inbox messages into local Room Database.',
      granted: permissions.readSms,
      riskLevel: isBn ? 'হাই-রিস্ক পারমিশন (High-Risk)' : 'High-Risk Permission'
    },
    {
      key: 'receiveSms' as const,
      name: 'android.permission.RECEIVE_SMS',
      titleBn: 'RECEIVE_SMS (রিয়েল-টাইম এসএমএস রিসিভ)',
      titleEn: 'RECEIVE_SMS (Incoming SMS Broadcast)',
      purposeBn: 'ব্রডকাস্ট রিসিভারের (SmsBroadcastReceiver) মাধ্যমে কোনো নতুন এসএমএস আসার সাথে সাথে তা ব্যাকগ্রাউন্ডে ধরার জন্য প্রয়োজন।',
      purposeEn: 'Allows SmsBroadcastReceiver to intercept incoming SMS intents, parse PDUs, and trigger local notification.',
      granted: permissions.receiveSms,
      riskLevel: isBn ? 'হাই-রিস্ক পারমিশন (High-Risk)' : 'High-Risk Permission'
    },
    {
      key: 'sendSms' as const,
      name: 'android.permission.SEND_SMS',
      titleBn: 'SEND_SMS (এসএমএস পাঠানোর অনুমতি)',
      titleEn: 'SEND_SMS (Send SMS Messages)',
      purposeBn: 'অ্যাপ থেকে কন্টাক্টকে সরাসরি রিপ্লাই বা নতুন বার্তা পাঠানোর জন্য (SmsManager.getDefault().sendTextMessage)।',
      purposeEn: 'Permits the app to dispatch text messages directly via telephony network upon user interaction.',
      granted: permissions.sendSms,
      riskLevel: isBn ? 'হাই-রিস্ক পারমিশন (High-Risk)' : 'High-Risk Permission'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">
                {isBn ? 'অ্যান্ড্রয়েড রানটাইম পারমিশন কন্ট্রোল' : 'Android Runtime Permissions'}
              </h3>
              <p className="text-[11px] text-stone-300">
                AndroidManifest.xml & ActivityResultContracts
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

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 leading-relaxed">
            <span className="font-semibold text-stone-900 block mb-1">
              {isBn ? 'অ্যান্ড্রয়েড সিকিউরিটি মডেল (Marshmallow+)' : 'Android Security Architecture'}
            </span>
            {isBn 
              ? 'অ্যান্ড্রয়েডে সেনসিটিভ পারমিশনগুলো কেবল মেনিফেস্টে ডিক্লেয়ার করলেই কাজ করে না, অ্যাপ চলার সময় ইউজারের সামনে ডায়ালগের মাধ্যমে রানটাইম অনুমোদন নিতে হয়।'
              : 'Sensitive permissions must not only be declared in AndroidManifest.xml, but also requested at runtime using ActivityResultContracts.'}
          </div>

          {/* Permissions List */}
          <div className="space-y-3">
            {permissionItems.map((item) => (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                  item.granted 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-stone-50 border-stone-200 opacity-80'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-stone-900">
                      {isBn ? item.titleBn : item.titleEn}
                    </span>
                    <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                      {item.riskLevel}
                    </span>
                  </div>
                  
                  <div className="text-[11px] font-mono text-emerald-800 bg-emerald-100/60 inline-block px-1.5 py-0.5 rounded mb-1">
                    {item.name}
                  </div>

                  <p className="text-xs text-stone-600 leading-normal">
                    {isBn ? item.purposeBn : item.purposeEn}
                  </p>
                </div>

                <button
                  id={`btn-toggle-perm-${item.key}`}
                  onClick={() => onTogglePermission(item.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition shadow-2xs cursor-pointer ${
                    item.granted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                  }`}
                >
                  {item.granted 
                    ? (isBn ? 'অনুমোদিত (Granted)' : 'Granted') 
                    : (isBn ? 'বাতিল (Denied)' : 'Denied')}
                </button>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={onGrantAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'সব পারমিশন এলাও করুন (Grant All)' : 'Grant All Permissions'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium cursor-pointer"
            >
              {isBn ? 'সম্পন্ন' : 'Done'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
