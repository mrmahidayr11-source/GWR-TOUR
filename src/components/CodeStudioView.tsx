import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  FileCode, 
  FolderTree, 
  Layers, 
  ExternalLink,
  Cpu,
  Boxes,
  Database
} from 'lucide-react';
import { ANDROID_CODE_SNIPPETS } from '../data/androidCodeSamples';
import { Language } from '../types';

interface CodeStudioViewProps {
  lang: Language;
}

export const CodeStudioView: React.FC<CodeStudioViewProps> = ({ lang }) => {
  const [selectedId, setSelectedId] = useState(ANDROID_CODE_SNIPPETS[0].id);
  const [copied, setCopied] = useState(false);
  const isBn = lang === 'bn';

  const currentSnippet = ANDROID_CODE_SNIPPETS.find((s) => s.id === selectedId) || ANDROID_CODE_SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-6 text-white mb-6 shadow-xl border border-stone-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Cpu className="w-3.5 h-3.5" />
              <span>Android Studio • Kotlin 2.0 • Room Database</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isBn ? 'অ্যান্ড্রয়েড নেটিভ সোর্স কোড ও আর্কিটেকচার' : 'Android Native Source Code Architecture'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              {isBn 
                ? 'ইউজারের প্রম্পটের প্রতিটি অংশের জন্য সরাসরি প্রোডাকশন-রেডি কোটলিন ও এক্সএমএল সোর্স কোড। আপনি সরাসরি অ্যান্ড্রয়েড স্টুডিও প্রজেক্টে কপি করে ব্যবহার করতে পারবেন।'
                : 'Production-ready Kotlin and XML implementations covering Manifest, BroadcastReceiver, ContentResolver Inbox Reader, Room Database, and Material 3 RecyclerView.'}
            </p>
          </div>

          {/* Architecture flow pill */}
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 text-xs space-y-1 font-mono shrink-0">
            <div className="text-emerald-400 font-bold">Data Flow Architecture:</div>
            <div className="text-stone-300 text-[11px]">
              Telephony SMS ➔ BroadcastReceiver ➔ Room DB ➔ Flow ➔ RecyclerView
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: File Navigator */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-4 shadow-sm h-fit">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider mb-3 pb-2 border-b border-stone-100">
            <FolderTree className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'প্রজেক্ট ফাইল ডিরেক্টরি' : 'Android Project Files'}</span>
          </div>

          <div className="space-y-1.5">
            {ANDROID_CODE_SNIPPETS.map((snippet) => {
              const isSelected = snippet.id === selectedId;
              return (
                <button
                  key={snippet.id}
                  id={`code-tab-${snippet.id}`}
                  onClick={() => setSelectedId(snippet.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs font-semibold'
                      : 'hover:bg-stone-50 text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-stone-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">
                      {isBn ? snippet.titleBn : snippet.title}
                    </div>
                    <div className={`text-[10px] truncate font-mono mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                      {snippet.filePath}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Gradle Dependencies Info Box */}
          <div className="mt-6 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 mb-2">
              <Boxes className="w-3.5 h-3.5 text-stone-600" />
              <span>build.gradle.kts (Dependencies)</span>
            </div>
            <pre className="p-2.5 bg-stone-900 text-stone-200 text-[10px] font-mono rounded-xl overflow-x-auto leading-relaxed border border-stone-800">
{`// Room Database (SQLite)
implementation("androidx.room:room-runtime:2.6.1")
ksp("androidx.room:room-compiler:2.6.1")
implementation("androidx.room:room-ktx:2.6.1")

// Coroutines & Lifecycle
implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")

// RecyclerView & Material 3
implementation("androidx.recyclerview:recyclerview:1.3.2")
implementation("com.google.android.material:material:1.11.0")`}
            </pre>
          </div>
        </div>

        {/* Right Code Viewer */}
        <div className="lg:col-span-8 flex flex-col bg-stone-950 rounded-2xl border border-stone-800 shadow-xl overflow-hidden">
          
          {/* Code Viewer Top Bar */}
          <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-stone-300 font-semibold truncate max-w-xs">
                {currentSnippet.filePath}
              </span>
            </div>

            <button
              id="btn-copy-code-snippet"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isBn ? 'কপি সম্পন্ন!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>{isBn ? 'কোড কপি করুন' : 'Copy Code'}</span>
                </>
              )}
            </button>
          </div>

          {/* Description header */}
          <div className="px-4 py-2.5 bg-stone-900/60 border-b border-stone-800/80 text-xs text-stone-400 leading-normal">
            <span className="font-semibold text-emerald-400 mr-1.5">// Note:</span>
            {isBn ? currentSnippet.descriptionBn : currentSnippet.description}
          </div>

          {/* Code Content with line numbering */}
          <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-stone-200">
            <pre className="table">
              <code>
                {currentSnippet.code.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-stone-900/50">
                    <span className="table-cell select-none pr-4 text-stone-600 text-right w-8 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre">
                      {line}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
