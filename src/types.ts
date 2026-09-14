export type SmsCategory = 'all' | 'otp' | 'transaction' | 'personal' | 'promotion' | 'spam';

export interface SmsMessage {
  id: string;
  sender: string;
  address: string; // phone number or short code like 'bKash', 'GP', 'CityBank'
  body: string;
  timestamp: number; // unix millis
  category: SmsCategory;
  isRead: boolean;
  otpCode?: string;
  amount?: string;
  currency?: string;
  threadId?: string;
}

export interface AndroidPermissionState {
  readSms: boolean;
  receiveSms: boolean;
  sendSms: boolean;
}

export interface CodeSnippet {
  id: string;
  title: string;
  titleBn: string;
  filePath: string;
  language: 'kotlin' | 'xml' | 'javascript' | 'json' | 'html';
  description: string;
  descriptionBn: string;
  code: string;
  highlightLines?: number[];
}

export type ActiveTab = 'payment_gateway' | 'admin_dashboard' | 'simulator' | 'code_studio' | 'play_policy' | 'privacy_policy';

export type Language = 'bn' | 'en';

export type PaymentMethod = 'bkash' | 'nagad';
export type PaymentStatus = 'pending' | 'success' | 'mismatch' | 'duplicate' | 'rejected';

export interface PaymentTransaction {
  id: string;
  userId?: string;
  userName?: string;
  method: PaymentMethod;
  senderPhone: string;
  amount: number;
  trxId: string;
  status: PaymentStatus;
  submittedAt: number;
  matchedAt?: number;
  matchedSmsBody?: string;
  statusMessage?: string;
  extractedAmount?: number;
  extractedSender?: string;
}

export interface AutoMatchLog {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
  tag: 'SMS_READER' | 'PARSER' | 'SERVER_API' | 'FIREBASE_DB' | 'SECURITY';
  message: string;
  payload?: Record<string, unknown>;
}
