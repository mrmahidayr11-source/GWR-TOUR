/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { AndroidFrame } from './components/AndroidFrame';
import { SmsInboxView } from './components/SmsInboxView';
import { SmsDetailModal } from './components/SmsDetailModal';
import { SimulateSmsModal } from './components/SimulateSmsModal';
import { PermissionsModal } from './components/PermissionsModal';
import { ComposeSmsModal } from './components/ComposeSmsModal';
import { PaymentGatewayView } from './components/PaymentGatewayView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { CodeStudioView } from './components/CodeStudioView';
import { PlayStorePolicyView } from './components/PlayStorePolicyView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { INITIAL_SMS_LIST, detectSmsCategory } from './data/mockSms';
import { INITIAL_TRANSACTIONS } from './data/mockTransactions';
import { SmsMessage, AndroidPermissionState, ActiveTab, Language, PaymentTransaction, PaymentStatus } from './types';
import { playAndroidNotificationChime } from './utils/audio';

const STORAGE_KEY = 'android_sms_database_v1';
const PERMISSIONS_KEY = 'android_sms_permissions_v1';
const TRANSACTIONS_KEY = 'admin_transactions_ledger_v1';

export default function App() {
  const [lang, setLang] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState<ActiveTab>('payment_gateway');

  // Shared Transactions Ledger across Gateway and Admin Dashboard
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading transactions', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // Local simulated Room database
  const [messages, setMessages] = useState<SmsMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved SMS from storage', e);
    }
    return INITIAL_SMS_LIST;
  });

  // Simulated Android Runtime Permissions
  const [permissions, setPermissions] = useState<AndroidPermissionState>(() => {
    try {
      const saved = localStorage.getItem(PERMISSIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading permissions', e);
    }
    return { readSms: true, receiveSms: true, sendSms: true };
  });

  // UI state
  const [activeNotification, setActiveNotification] = useState<SmsMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<SmsMessage | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving SMS state', e);
    }
  }, [messages]);

  // Persist permissions
  useEffect(() => {
    try {
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
    } catch (e) {
      console.error('Error saving permissions', e);
    }
  }, [permissions]);

  // Persist transactions ledger
  useEffect(() => {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions ledger', e);
    }
  }, [transactions]);

  // Show temporary toast
  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1-Click OTP Copy handler
  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    showToast(lang === 'bn' ? `ওটিপি কোড ${otp} ক্লিপবোর্ডে কপি হয়েছে!` : `OTP code ${otp} copied to clipboard!`);
    setTimeout(() => setCopiedOtp(null), 2500);
  };

  // Simulate Incoming BroadcastReceiver Event
  const handleTriggerIncomingSms = (sender: string, body: string) => {
    const classification = detectSmsCategory(body, sender);
    const newSms: SmsMessage = {
      id: `sms-${Date.now()}`,
      sender,
      address: sender,
      body,
      timestamp: Date.now(),
      category: classification.category,
      isRead: false,
      otpCode: classification.otpCode,
      amount: classification.amount,
      currency: classification.amount ? 'BDT' : undefined
    };

    // If RECEIVE_SMS is granted, process and save to Room DB
    if (permissions.receiveSms) {
      setMessages((prev) => [newSms, ...prev]);
      playAndroidNotificationChime();
      setActiveNotification(newSms);
      showToast(
        lang === 'bn' 
          ? `ব্রডকাস্ট রিসিভার: ${sender} থেকে নতুন এসএমএস এসেছে!` 
          : `BroadcastReceiver: Incoming SMS from ${sender}`
      );
    } else {
      showToast(
        lang === 'bn'
          ? 'RECEIVE_SMS পারমিশন বন্ধ থাকায় নতুন এসএমএস ড্রপ করা হয়েছে।'
          : 'RECEIVE_SMS permission denied. Message dropped.'
      );
    }
  };

  // Send / Reply SMS
  const handleSendSms = (recipient: string, text: string) => {
    if (!permissions.sendSms) {
      showToast(lang === 'bn' ? 'SEND_SMS পারমিশন প্রয়োজন!' : 'SEND_SMS permission required!');
      return;
    }

    const classification = detectSmsCategory(text, recipient);
    const sentMessage: SmsMessage = {
      id: `sms-sent-${Date.now()}`,
      sender: `You -> ${recipient}`,
      address: recipient,
      body: text,
      timestamp: Date.now(),
      category: classification.category === 'otp' ? 'personal' : classification.category,
      isRead: true
    };

    setMessages((prev) => [sentMessage, ...prev]);
    showToast(
      lang === 'bn'
        ? `SmsManager: ${recipient}-কে এসএমএস সফলভাবে পাঠানো হয়েছে!`
        : `SmsManager: SMS successfully sent to ${recipient}!`
    );
  };

  // Delete message from local DB
  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    showToast(
      lang === 'bn' ? 'মেসেজটি রুম ডাটাবেজ থেকে মুছে ফেলা হয়েছে।' : 'Message deleted from local Room DB.'
    );
  };

  // Reset database
  const handleResetData = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি লোকাল ডাটাবেজ রিসেট করতে চান?' : 'Reset local SMS database to initial data?')) {
      setMessages(INITIAL_SMS_LIST);
      localStorage.removeItem(STORAGE_KEY);
      showToast(lang === 'bn' ? 'ডাটাবেজ সফলভাবে রিসেট করা হয়েছে।' : 'Database reset successfully.');
    }
  };

  // Toggle permission
  const handleTogglePermission = (key: keyof AndroidPermissionState) => {
    setPermissions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
  };

  // Grant all permissions
  const handleGrantAllPermissions = () => {
    setPermissions({ readSms: true, receiveSms: true, sendSms: true });
    setIsPermissionsModalOpen(false);
    showToast(lang === 'bn' ? 'সকল পারমিশন সফলভাবে অনুমোদিত হয়েছে।' : 'All permissions granted.');
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Navigation Bar */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onOpenSimulator={() => setIsSimulateModalOpen(true)}
        onOpenPermissions={() => setIsPermissionsModalOpen(true)}
        onResetData={handleResetData}
        unreadCount={unreadCount}
      />

      {/* Global Status Toast */}
      {toastMessage && (
        <div 
          id="app-global-toast"
          className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-stone-700 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Content */}
      <main className="flex-1">
        
        {/* Tab 0: bKash & Nagad Auto SMS Reader & Verification Gateway */}
        {activeTab === 'payment_gateway' && (
          <PaymentGatewayView 
            lang={lang} 
            onNavigateToCodeStudio={() => setActiveTab('code_studio')} 
            onNavigateToAdminDashboard={() => setActiveTab('admin_dashboard')}
          />
        )}

        {/* Tab 0.5: Web Admin Dashboard & Live Transactions Table */}
        {activeTab === 'admin_dashboard' && (
          <AdminDashboardView
            lang={lang}
            transactions={transactions}
            onUpdateTransactionStatus={(id, newStatus, reason) => {
              setTransactions(prev => prev.map(t => {
                if (t.id === id) {
                  return {
                    ...t,
                    status: newStatus,
                    matchedAt: newStatus === 'success' ? Date.now() : t.matchedAt,
                    statusMessage: reason || (newStatus === 'success' ? 'অ্যাডমিন কর্তৃক অনুমোদিত' : 'বাতিল করা হয়েছে')
                  };
                }
                return t;
              }));
              showToast(lang === 'bn' ? `ট্রানজেকশন #${id} আপডেট করা হয়েছে!` : `Transaction #${id} updated!`);
            }}
            onNavigateToCodeStudio={() => setActiveTab('code_studio')}
            onNavigateToGateway={() => setActiveTab('payment_gateway')}
          />
        )}

        {/* Tab 1: Live Android SMS Inbox Simulator */}
        {activeTab === 'simulator' && (
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
            
            {/* Quick Context Summary Header */}
            <div className="mb-4 text-center max-w-2xl mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {lang === 'bn' 
                  ? 'লাইভ অ্যান্ড্রয়েড এসএমএস ইনবক্স ও ব্রডকাস্ট সিমুলেটর' 
                  : 'Live Android SMS Inbox & Broadcast Simulator'}
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                {lang === 'bn' 
                  ? 'ContentResolver দিয়ে ইনবক্স রিডিং, রুম ডাটাবেজ (Room DB) ফিল্টারিং, ওটিপি ১-ক্লিকে কপি এবং নতুন ইনকামিং এসএমএস টেস্ট করুন।' 
                  : 'Test inbox reading via ContentResolver, local Room DB caching, 1-click OTP copying, and real-time BroadcastReceiver events.'}
              </p>
            </div>

            {/* Android Device Simulator Container */}
            <AndroidFrame
              activeNotification={activeNotification}
              onDismissNotification={() => setActiveNotification(null)}
              onNotificationClick={(sms) => {
                setSelectedMessage(sms);
                setActiveNotification(null);
              }}
            >
              <SmsInboxView
                messages={messages}
                permissions={permissions}
                onRequestPermissions={() => setIsPermissionsModalOpen(true)}
                onSelectMessage={(sms) => {
                  // Mark as read
                  setMessages((prev) =>
                    prev.map((m) => (m.id === sms.id ? { ...m, isRead: true } : m))
                  );
                  setSelectedMessage({ ...sms, isRead: true });
                }}
                onComposeClick={() => setIsComposeModalOpen(true)}
                onCopyOtp={handleCopyOtp}
                copiedOtp={copiedOtp}
                lang={lang}
              />
            </AndroidFrame>

          </div>
        )}

        {/* Tab 2: Android Native Code Studio (Kotlin, Room DB, Manifest, Receiver) */}
        {activeTab === 'code_studio' && (
          <CodeStudioView lang={lang} />
        )}

        {/* Tab 3: Google Play Store Policy & Security Hub */}
        {activeTab === 'play_policy' && (
          <PlayStorePolicyView lang={lang} />
        )}

        {/* Tab 4: Google Play Compliant Privacy Policy Page */}
        {activeTab === 'privacy_policy' && (
          <PrivacyPolicyView lang={lang} />
        )}

      </main>

      {/* Modals & Dialogs */}
      <SmsDetailModal
        sms={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onDelete={handleDeleteMessage}
        onSendReply={(recipient, text) => {
          handleSendSms(recipient, text);
          setSelectedMessage(null);
        }}
        onCopyOtp={handleCopyOtp}
        copiedOtp={copiedOtp}
        permissions={permissions}
        lang={lang}
      />

      <SimulateSmsModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onTriggerIncomingSms={handleTriggerIncomingSms}
        permissions={permissions}
        lang={lang}
      />

      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        permissions={permissions}
        onTogglePermission={handleTogglePermission}
        onGrantAll={handleGrantAllPermissions}
        lang={lang}
      />

      <ComposeSmsModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        onSendSms={handleSendSms}
        permissions={permissions}
        lang={lang}
      />

      {/* Clean Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 px-4 sm:px-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {lang === 'bn'
              ? 'অ্যান্ড্রয়েড আর্কিটেকচার • Kotlin 2.0 • Android Studio • Room DB'
              : 'Android SMS Architecture • Kotlin 2.0 • Android Studio • Room Database'}
          </span>
          <span className="text-[11px] text-stone-400">
            {lang === 'bn'
              ? 'Google Play Developer Policy & Privacy Compliant'
              : 'Google Play Developer Policy & Privacy Compliant'}
          </span>
        </div>
      </footer>

    </div>
  );
}

