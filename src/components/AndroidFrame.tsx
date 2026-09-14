import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Circle, 
  Square, 
  ChevronLeft,
  Maximize2,
  Minimize2,
  Bell
} from 'lucide-react';
import { SmsMessage } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeNotification: SmsMessage | null;
  onDismissNotification: () => void;
  onNotificationClick: (sms: SmsMessage) => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeNotification,
  onDismissNotification,
  onNotificationClick
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-4 w-full">
      {/* Device View Mode Toggle */}
      <div className="mb-3 flex items-center justify-between w-full max-w-sm sm:max-w-md lg:max-w-lg px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-stone-600">
            Android 14 (API 34) Runtime
          </span>
        </div>
        <button
          id="btn-toggle-device-expand"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-md shadow-xs transition cursor-pointer"
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>মোবাইল ফ্রেম (Phone Frame)</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>বড় ভিউ (Expanded View)</span>
            </>
          )}
        </button>
      </div>

      {/* Frame Container */}
      <div
        className={`relative transition-all duration-300 w-full ${
          isExpanded 
            ? 'max-w-4xl bg-stone-900 rounded-3xl p-3 sm:p-4 shadow-2xl border-4 border-stone-800' 
            : 'max-w-[420px] bg-stone-950 rounded-[44px] p-3 shadow-2xl border-[6px] border-stone-800 ring-1 ring-stone-700/50'
        }`}
      >
        {/* Device Shell Top Speaker & Camera Notch */}
        {!isExpanded && (
          <div className="relative flex items-center justify-center pt-1 pb-2">
            <div className="w-24 h-4 bg-stone-900 rounded-full flex items-center justify-center gap-2 px-3">
              <div className="w-2 h-2 rounded-full bg-stone-950 border border-stone-800" />
              <div className="w-10 h-1 bg-stone-800 rounded-full" />
            </div>
          </div>
        )}

        {/* Device Screen */}
        <div className="relative bg-stone-50 text-stone-900 rounded-[28px] overflow-hidden flex flex-col h-[740px] shadow-inner border border-stone-200">
          
          {/* Android Status Bar */}
          <div className="bg-stone-900 text-stone-200 px-5 py-2 flex items-center justify-between text-xs select-none">
            <span className="font-semibold tracking-wide text-xs">{currentTime || '12:45'}</span>
            <div className="flex items-center space-x-2 text-stone-400">
              <Signal className="w-3.5 h-3.5 text-stone-200" />
              <span className="text-[10px] font-bold text-stone-200">5G</span>
              <Wifi className="w-3.5 h-3.5 text-stone-200" />
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Incoming SMS Heads-up Notification (Simulated BroadcastReceiver Alert) */}
          {activeNotification && (
            <div 
              id="android-heads-up-notification"
              className="absolute top-10 left-3 right-3 z-50 bg-stone-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-stone-700 animate-in fade-in slide-in-from-top-4 duration-300 cursor-pointer"
              onClick={() => onNotificationClick(activeNotification)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 truncate">
                      {activeNotification.sender}
                    </span>
                    <span className="text-[10px] text-stone-400">এখনই • SMS</span>
                  </div>
                  <p className="text-xs text-stone-200 line-clamp-2 mt-0.5 font-normal">
                    {activeNotification.body}
                  </p>
                  {activeNotification.otpCode && (
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[11px] font-mono font-bold">
                      OTP: {activeNotification.otpCode}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismissNotification();
                  }}
                  className="text-stone-400 hover:text-white text-xs px-1.5 py-0.5 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Inner Content Area */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {children}
          </div>

          {/* Android 3-Button Navigation Bar */}
          <div className="bg-stone-900 py-2.5 px-8 flex items-center justify-around text-stone-400 select-none">
            <button className="p-1 hover:text-white transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:text-white transition">
              <Circle className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:text-white transition">
              <Square className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
