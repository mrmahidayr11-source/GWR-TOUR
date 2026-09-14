import { SmsMessage } from '../types';

export const INITIAL_SMS_LIST: SmsMessage[] = [
  {
    id: 'sms-001',
    sender: 'bKash',
    address: 'bKash',
    body: 'Your bKash verification code is 849201. Never share this code or your PIN with anyone. Valid for 2 mins.',
    timestamp: Date.now() - 1000 * 60 * 3, // 3 mins ago
    category: 'otp',
    isRead: false,
    otpCode: '849201',
    threadId: 'th-bkash',
  },
  {
    id: 'sms-002',
    sender: 'City Bank',
    address: 'CityBank',
    body: 'Trx Alert: A/C *7291 debited by BDT 3,500.00 on 14-Sep-26 at POS Aarong Gulshan. Available Balance: BDT 42,310.50.',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    category: 'transaction',
    isRead: false,
    amount: '3,500.00',
    currency: 'BDT',
    threadId: 'th-citybank',
  },
  {
    id: 'sms-003',
    sender: 'Google',
    address: 'Google',
    body: 'G-719342 is your Google verification code. Do not share your code with anyone.',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    category: 'otp',
    isRead: true,
    otpCode: '719342',
    threadId: 'th-google',
  },
  {
    id: 'sms-004',
    sender: 'Rahim Ahmed',
    address: '+8801712345678',
    body: 'দোস্ত, কাল সকাল ১০টায় কি অফিসে দেখা হবে? প্রজেক্টের আপডেট নিয়ে কথা বলতে হবে।',
    timestamp: Date.now() - 1000 * 60 * 360, // 6 hours ago
    category: 'personal',
    isRead: true,
    threadId: 'th-rahim',
  },
  {
    id: 'sms-005',
    sender: 'Grameenphone',
    address: 'GP',
    body: 'ধামাকা অফার! মাত্র ৪৯ টাকায় ৩ জিবি ইন্টারনেট ও ৫০ মিনিট টকটাইম। মেয়াদ ৩ দিন। ডায়াল *121*5049# এখনই।',
    timestamp: Date.now() - 1000 * 60 * 600, // 10 hours ago
    category: 'promotion',
    isRead: true,
    threadId: 'th-gp',
  },
  {
    id: 'sms-006',
    sender: 'Nagad',
    address: 'Nagad',
    body: 'Cash In Successful. Tk 5,000.00 received from 01811223344. TrxID: 9J482LK. Fee: Tk 0.00. Balance: Tk 12,450.00.',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    category: 'transaction',
    isRead: true,
    amount: '5,000.00',
    currency: 'Tk',
    threadId: 'th-nagad',
  },
  {
    id: 'sms-007',
    sender: 'Uber',
    address: 'Uber',
    body: 'Your Uber code is 4921. Never share this code.',
    timestamp: Date.now() - 1000 * 60 * 60 * 30, // 1.25 days ago
    category: 'otp',
    isRead: true,
    otpCode: '4921',
    threadId: 'th-uber',
  },
  {
    id: 'sms-008',
    sender: 'Unknown Lotterys',
    address: '+8801999887766',
    body: 'CONGRATS! You won 10,00,000 BDT in Mega Draw! Send 1000 BDT processing fee to claim prize immediately. Click bit.ly/fake-link',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    category: 'spam',
    isRead: true,
    threadId: 'th-spam',
  },
  {
    id: 'sms-009',
    sender: 'Tanvir Hossain',
    address: '+8801833445566',
    body: 'ভাইয়া, অ্যান্ড্রয়েড অ্যাপের সোর্স কোড আর রুম ডাটাবেজ স্কিমা গিটহাবে পুশ করে দিয়েছি। চেক করে নিও।',
    timestamp: Date.now() - 1000 * 60 * 60 * 60, // 2.5 days ago
    category: 'personal',
    isRead: true,
    threadId: 'th-tanvir',
  }
];

export function detectSmsCategory(text: string, address: string): { category: SmsMessage['category']; otpCode?: string; amount?: string } {
  const lower = text.toLowerCase();
  
  // OTP Detection
  const otpMatch = text.match(/\b\d{4,8}\b/) || text.match(/code\s*(?:is|:)?\s*([0-9]{4,8})/i) || text.match(/otp\s*(?:is|:)?\s*([0-9]{4,8})/i);
  const isOtpContext = lower.includes('otp') || lower.includes('verification') || lower.includes('code') || lower.includes('ভেরিফিকেশন') || lower.includes('কোড');
  
  if (isOtpContext && otpMatch) {
    const rawCode = otpMatch[1] || otpMatch[0];
    return { category: 'otp', otpCode: rawCode.replace(/\D/g, '') };
  }

  // Financial / Transaction Detection
  const isBankOrTrx = lower.includes('bdt') || lower.includes('tk') || lower.includes('debited') || 
    lower.includes('credited') || lower.includes('balance') || lower.includes('trx') || 
    lower.includes('a/c') || lower.includes('লেনদেন') || lower.includes('টাকা') || 
    lower.includes('cash in') || lower.includes('cash out');
  
  if (isBankOrTrx) {
    const amountMatch = text.match(/(?:BDT|Tk|Tk\.|টাকা)\s*([\d,]+(?:\.\d{2})?)/i) || text.match(/([\d,]+(?:\.\d{2})?)\s*(?:BDT|Tk|টাকা)/i);
    return {
      category: 'transaction',
      amount: amountMatch ? amountMatch[1] : undefined
    };
  }

  // Spam detection
  if (lower.includes('congrats') || lower.includes('you won') || lower.includes('lottery') || lower.includes('claim prize') || lower.includes('bit.ly/')) {
    return { category: 'spam' };
  }

  // Promotion detection
  if (lower.includes('offer') || lower.includes('অফার') || lower.includes('discount') || lower.includes('ডায়াল') || lower.includes('dial *') || address.toUpperCase() === 'GP' || address.toUpperCase() === 'ROBI' || address.toUpperCase() === 'BL') {
    return { category: 'promotion' };
  }

  // Personal default
  return { category: 'personal' };
}
