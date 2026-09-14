export interface PlayPolicyItem {
  id: string;
  title: string;
  titleBn: string;
  severity: 'strict' | 'info' | 'recommendation';
  summary: string;
  summaryBn: string;
  details: string[];
  detailsBn: string[];
}

export const PLAY_STORE_POLICIES: PlayPolicyItem[] = [
  {
    id: 'default_sms_requirement',
    title: 'Default SMS Handler Requirement (গুগল প্লে ডিফল্ট এসএমএস পলিসি)',
    titleBn: 'ডিফল্ট এসএমএস হ্যান্ডলার পলিসি ও বিধিনিষেধ',
    severity: 'strict',
    summary: 'Google strictly restricts READ_SMS, RECEIVE_SMS, and SEND_SMS permissions to apps that act as the default SMS handler, with very narrow exceptions.',
    summaryBn: 'গুগল প্লে স্টোরের পলিসি অনুযায়ী, আপনার অ্যাপকে অবশ্যই ফোনের "Default SMS Handler" হতে হবে, অথবা নির্ধারিত ব্যতিক্রমী ক্যাটাগরির আওতায় পড়তে হবে।',
    details: [
      'Apps that are NOT the default SMS app cannot publish with READ_SMS or RECEIVE_SMS unless they qualify for an approved use-case exception.',
      'Google Play will reject or remove apps during review if permissions are declared without justification.',
      'You must complete the Permissions Declaration Form in the Google Play Console before submitting your APK/AAB bundle.'
    ],
    detailsBn: [
      'আপনার অ্যাপ যদি সিস্টেমের প্রধান ডিফল্ট এসএমএস অ্যাপ না হয়, তবে সাধারণ রিভিউতে পারমিশন ডিক্লারেশন রিজেক্ট হবে।',
      'গুগল প্লে কনসোলে "Permissions Declaration Form" পূরণ করে একটি সুস্পষ্ট ভিডিও ডেমোনস্ট্রেশন সহ সাবমিট করতে হবে।',
      'অ্যাপের মূল উদ্দেশ্য যদি শুধু এসএমএস রিডিং বা ফিল্টারিং হয়, তবে "Default SMS App" প্রম্পট কোডে ইন্টিগ্রেট থাকতে হবে।'
    ]
  },
  {
    id: 'otp_alternative',
    title: 'Best Practice for OTP: SMS Retriever API',
    titleBn: 'ওটিপির (OTP) জন্য বিকল্প ও আধুনিক সলিউশন (SMS Retriever API)',
    severity: 'recommendation',
    summary: 'If your application only needs to read OTP verification codes, DO NOT request READ_SMS. Use Google Play Services SMS Retriever API instead.',
    summaryBn: 'আপনার অ্যাপের কাজ যদি কেবল লগইন বা ওটিপি ভেরিফিকেশন হয়, তবে ঝুঁকিপূর্ণ READ_SMS পারমিশন না নিয়ে গুগল প্লে সার্ভিসের "SMS Retriever API" ব্যবহার করুন।',
    details: [
      'SMS Retriever API automatically extracts the OTP without asking the user for any SMS permission.',
      'Guarantees 100% Google Play approval without filling the complex SMS permission declaration form.',
      'Requires an 11-character hash string at the end of your verification SMS payload.'
    ],
    detailsBn: [
      'SMS Retriever API ব্যবহার করলে ইউজারের কাছ থেকে কোনো পারমিশন ডায়ালগ চাওয়ার প্রয়োজন নেই।',
      'গুগল প্লে স্টোরে তাৎক্ষণিক অ্যাপ্রুভাল পাওয়া যায় এবং রিজেকশনের কোনো ঝুঁকি থাকে না।',
      'এসএমএস টেমপ্লেটের শেষে ১১ ডিজিটের একটি হ্যাশ স্ট্রিং থাকতে হয়।'
    ]
  },
  {
    id: 'financial_exception',
    title: 'Financial / Expense Tracker Exception',
    titleBn: 'আর্থিক লেনদেন বা খরচ ট্র্যাকার ব্যতিক্রম (Financial Exception)',
    severity: 'info',
    summary: 'Enterprise financial management and budget tracking apps can apply for an exception under Google Play’s Financial Services category.',
    summaryBn: 'ব্যাংক অ্যালার্ট বা লেনদেন ট্র্যাক করার মতো পার্সোনাল ফিন্যান্স অ্যাপগুলো গুগলের কাছে বিশেষ এক্সেপশন চেয়ে আবেদন করতে পারে।',
    details: [
      'Must prove that SMS reading of bank transaction messages is an indispensable core function.',
      'Must demonstrate that data never leaves the local device storage (SQLite/Room).',
      'Must provide an end-to-end video demonstrating user consent and value creation.'
    ],
    detailsBn: [
      'প্রমাণ করতে হবে যে ব্যাংক এসএমএস পড়া অ্যাপের প্রধানতম কার্যকারিতা এবং এটি ছাড়া অ্যাপ অকেজো।',
      'স্পষ্ট করতে হবে যে সমস্ত লেনদেনের তথ্য কেবল ফোনের লোকাল SQLite/Room ডাটাবেজে থাকে, কোনো সার্ভারে যায় না।',
      'প্লে কনসোল টিমকে ইউটিউব ভিডিও আনলিস্টেড লিংক প্রদান করতে হবে যেখানে পারমিশন অনুমতি ও কার্যপদ্ধতি দেখানো আছে।'
    ]
  }
];

export const PRIVACY_POLICY_DATA = {
  effectiveDate: '14 September, 2026',
  appTitle: 'Android SMS Manager & Organizer',
  appTitleBn: 'অ্যান্ড্রয়েড এসএমএস ম্যানেজার ও অর্গানাইজার',
  sections: [
    {
      heading: '১. এসএমএস তথ্যের গোপনীয়তা ও অন-ডিভাইস প্রসেসিং (On-Device Local Processing)',
      headingEn: '1. On-Device Local Processing & Zero Server Uploads',
      contentBn: 'আমরা আপনার ব্যক্তিগত বার্তার গোপনীয়তাকে সর্বোচ্চ অগ্রাধিকার দিই। এই অ্যাপলিকেশন দ্বারা পঠিত বা প্রক্রিয়াজাত সমস্ত এসএমএস বার্তা (যেমন: ওটিপি কোড, ব্যাংক লেনদেনের বিবরণ, ব্যক্তিগত বার্তা) সম্পূর্ণভাবে আপনার ফোনের লোকাল SQLite/Room ডাটাবেজে সংরক্ষিত থাকে। আপনার কোনো বার্তা বা কন্টাক্ট নম্বর কোনো থার্ড-পার্টি রিমোট সার্ভার, ক্লাউড বা বিজ্ঞাপনী সংস্থায় পাঠানো বা আপলোড করা হয় না।',
      contentEn: 'We hold your privacy in the highest regard. All SMS messages read and processed by this application (including OTPs, bank transaction alerts, and personal texts) reside exclusively within your local on-device SQLite/Room database. We NEVER transmit, backup, or upload your SMS data or phone numbers to any third-party remote server, cloud infrastructure, or advertising network.'
    },
    {
      heading: '২. অ্যান্ড্রয়েড পারমিশন ব্যবহারের কারণ (Declared Permissions)',
      headingEn: '2. Declared Android Permissions & Justification',
      contentBn: 'আমাদের অ্যাপ কার্যক্ষম করার জন্য নিম্নলিখিত পারমিশনগুলো প্রয়োজন হয়:\n- READ_SMS: আপনার ইনবক্সের বার্তাগুলো পড়া এবং ক্যাটাগরি (ব্যাংক, ওটিপি, প্রোমোশন) অনুযায়ী ফিল্টার করার জন্য।\n- RECEIVE_SMS: ব্রডকাস্ট রিসিভারের মাধ্যমে রিয়েল-টাইমে আগত নতুন বার্তা সনাক্ত করে নোটিফিকেশন প্রদান ও সেভ করার জন্য।\n- SEND_SMS: অ্যাপের ভেতর থেকে রিপ্লাই বা নতুন মেসেজ পাঠানোর জন্য (ইউজারের সরাসরি ইচ্ছানুসারে)।',
      contentEn: 'Our app requests the following core permissions:\n- READ_SMS: To query the inbox ContentResolver and organize your messages into categories (Banking, OTP, Promotions).\n- RECEIVE_SMS: Used strictly by our local BroadcastReceiver to detect incoming messages in real-time and provide instant classification.\n- SEND_SMS: Triggered solely when you explicitly tap to reply or compose a message within the interface.'
    },
    {
      heading: '৩. ডেটা নিয়ন্ত্রণ ও ব্যবহারকারীর অধিকার (User Data Control)',
      headingEn: '3. Data Control & Deletion Rights',
      contentBn: 'আপনি যেকোনো সময় অ্যাপের সেটিংস থেকে সম্পূর্ণ ডাটাবেজ পরিষ্কার করতে পারেন অথবা আপনার ফোনের সিস্টেম সেটিংস (Settings > Apps > Permissions) থেকে এসএমএস পারমিশন প্রত্যাহার করে নিতে পারেন। অ্যাপ আনইনস্টল করলে সমস্ত ক্যাশড মেসেজ স্বয়ংক্রিয়ভাবে মুছে যাবে।',
      contentEn: 'You maintain absolute ownership of your data. You may purge the local database at any time from within the app settings, or revoke SMS permissions via your phone’s system settings (Settings > Apps > Permissions). Uninstalling the application completely erases all cached messages from your device.'
    },
    {
      heading: '৪. গুগল প্লে পলিসি কমপ্লায়েন্স (Google Play Store Compliance)',
      headingEn: '4. Compliance with Google Play Policies',
      contentBn: 'এই অ্যাপলিকেশনটি Google Play Developer Program Policies এবং SMS/MMS Permissions Policy-এর সকল শর্ত মেনে তৈরি করা হয়েছে। কোনো লুকানো ট্র্যাকিং কোড, এনালিটিক্স পে-লোড বা বিজ্ঞাপন মডিউল আপনার এসএমএস ডেটাতে প্রবেশাধিকার পায় না।',
      contentEn: 'This application strictly complies with Google Play Developer Program Policies, specifically the User Data and SMS/MMS Permissions Policy. No tracking SDKs, analytics payloads, or advertising modules have access to your SMS content.'
    }
  ]
};
