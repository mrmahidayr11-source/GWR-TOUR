import React, { useState, useMemo } from 'react';
import { 
  Language, 
  PaymentTransaction, 
  PaymentMethod, 
  PaymentStatus 
} from '../types';
import { 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Phone, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  Check, 
  X, 
  ShieldCheck, 
  Smartphone, 
  Code2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  FileSpreadsheet,
  Copy
} from 'lucide-react';

interface AdminDashboardViewProps {
  lang: Language;
  transactions: PaymentTransaction[];
  onUpdateTransactionStatus?: (id: string, newStatus: PaymentStatus, reason?: string) => void;
  onNavigateToCodeStudio?: () => void;
  onNavigateToGateway?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  lang,
  transactions,
  onUpdateTransactionStatus,
  onNavigateToCodeStudio,
  onNavigateToGateway
}) => {
  const isBn = lang === 'bn';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'code'>('table');

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Summary Metrics calculations
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const successTransactions = transactions.filter(t => t.status === 'success');
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    const mismatchTransactions = transactions.filter(t => t.status === 'mismatch' || t.status === 'rejected');

    const totalCollectedBDT = successTransactions.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingBDT = pendingTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    // Unique user count based on sender phone
    const uniqueSenders = new Set(transactions.map(t => t.senderPhone)).size;

    // Today's total (past 24h)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const todayTransactions = transactions.filter(t => t.submittedAt >= oneDayAgo);
    const todaySuccess = todayTransactions.filter(t => t.status === 'success');
    const todayBDT = todaySuccess.reduce((acc, curr) => acc + curr.amount, 0);
    const todayUniqueSenders = new Set(todayTransactions.map(t => t.senderPhone)).size;

    return {
      totalTransactions,
      successCount: successTransactions.length,
      pendingCount: pendingTransactions.length,
      mismatchCount: mismatchTransactions.length,
      totalCollectedBDT,
      pendingBDT,
      uniqueSenders,
      todayCount: todayTransactions.length,
      todayBDT,
      todayUniqueSenders
    };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Method match
      if (methodFilter !== 'all' && tx.method !== methodFilter) return false;

      // Status match
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

      // Date match
      if (dateFilter === 'today') {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (tx.submittedAt < oneDayAgo) return false;
      } else if (dateFilter === 'week') {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (tx.submittedAt < oneWeekAgo) return false;
      }

      // Search query (Phone, TrxID, User name, Amount)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const phoneMatch = tx.senderPhone.toLowerCase().includes(query);
        const trxMatch = tx.trxId.toLowerCase().includes(query);
        const nameMatch = tx.userName ? tx.userName.toLowerCase().includes(query) : false;
        const amountMatch = tx.amount.toString().includes(query);
        if (!phoneMatch && !trxMatch && !nameMatch && !amountMatch) return false;
      }

      return true;
    });
  }, [transactions, methodFilter, statusFilter, dateFilter, searchQuery]);

  // CSV Export utility
  const exportToCsv = () => {
    const headers = ['ID', 'User', 'Method', 'Sender Mobile', 'Amount (BDT)', 'TrxID', 'Status', 'Submitted At', 'Matched At', 'SMS Details'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.userName || 'N/A',
      t.method.toUpperCase(),
      t.senderPhone,
      t.amount,
      t.trxId,
      t.status.toUpperCase(),
      new Date(t.submittedAt).toLocaleString(),
      t.matchedAt ? new Date(t.matchedAt).toLocaleString() : 'N/A',
      `"${(t.statusMessage || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Dashboard Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            {isBn ? 'অ্যাডমিন ড্যাশবোর্ড ও রিয়েলটাইম মনিটর' : 'Admin Dashboard & Real-Time Monitor'}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            {isBn ? 'ইউজার ডিপোজিট ও ট্রানজেকশন হিস্ট্রি কন্ট্রোল প্যানেল' : 'User Deposit & Transaction History Control Panel'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {isBn 
              ? 'বিকাশ ও নগদের সব পেমেন্ট ট্রানজেকশন, মোট ইউজার সংখ্যা, দৈনিক কালেকশন এবং অটো-ম্যাচিং স্টেটাস একনজরে দেখুন ও ফিল্টার করুন।' 
              : 'Monitor bKash & Nagad payments, total deposit volumes, unique active users, and real-time auto-matching audit logs.'}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {onNavigateToGateway && (
            <button
              onClick={onNavigateToGateway}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'গেটওয়ে টেস্ট করুন' : 'Test Gateway'}</span>
            </button>
          )}

          <button
            onClick={exportToCsv}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Collected Balance */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {isBn ? 'মোট সফল কালেকশন' : 'Total Approved (BDT)'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-stone-900 font-mono">
              ৳ {stats.totalCollectedBDT.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <span>{stats.successCount} {isBn ? 'টি সফল লেনদেন' : 'successful deposits'}</span>
          </div>
        </div>

        {/* Metric 2: Today's Collection */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {isBn ? 'আজকের মোট জমা' : "Today's Volume"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-950 font-mono">
              ৳ {stats.todayBDT.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-blue-700 flex items-center gap-1 font-medium">
            <span>{stats.todayCount} {isBn ? 'টি ট্রানজেকশন আজ' : 'txns in last 24h'}</span>
          </div>
        </div>

        {/* Metric 3: Total Unique Users Count */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {isBn ? 'মোট ইউজারের হিসাব' : 'Total Unique Users'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-stone-900 font-mono">
              {stats.uniqueSenders} <span className="text-sm font-semibold text-stone-500">{isBn ? 'জন ইউজার' : 'senders'}</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-purple-700 flex items-center gap-1 font-medium">
            <span>{stats.todayUniqueSenders} {isBn ? 'জন আজকে ডিপোজিট করেছে' : 'active senders today'}</span>
          </div>
        </div>

        {/* Metric 4: Pending / Mismatched Action Required */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {isBn ? 'অপেক্ষমাণ / অমিল' : 'Pending & Review'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-800 font-mono">
              {stats.pendingCount}
            </span>
            <span className="text-xs text-stone-500">
              ({stats.mismatchCount} {isBn ? 'অসঙ্গতি' : 'mismatches'})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 flex items-center gap-1 font-medium">
            <span>৳ {stats.pendingBDT.toLocaleString('en-US')} {isBn ? 'অপেক্ষমাণ' : 'pending approval'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Tabs: Table View vs Code Integration */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Sub Navigation Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-stone-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isBn ? '১. লাইভ ট্রানজেকশন হিস্ট্রি টেবিল' : '1. Live Transactions Table'}</span>
              <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {filteredTransactions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? '২. ওয়েব ও Firebase কোড (লজিক)' : '2. Web & Firebase Code Logic'}</span>
            </button>
          </div>

          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isBn ? 'রিয়েল-টাইমে আপডেট হচ্ছে' : 'Live Realtime Sync'}</span>
          </div>
        </div>

        {/* TAB 1: Live Transactions Table View */}
        {activeTab === 'table' && (
          <div className="p-5 space-y-4">
            
            {/* Filtering & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isBn ? "প্রেরক নম্বর, ট্রানজেকশন আইডি (TrxID) বা নাম দিয়ে খুঁজুন..." : "Search by Phone (017...), TrxID, or Name..."}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2 text-stone-400 hover:text-stone-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Dropdown Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {/* Method filter */}
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value as 'all' | PaymentMethod)}
                  className="px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                >
                  <option value="all">{isBn ? 'সকল মেথড (All)' : 'All Methods'}</option>
                  <option value="bkash">bKash (বিকাশ)</option>
                  <option value="nagad">Nagad (নগদ)</option>
                </select>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | PaymentStatus)}
                  className="px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                >
                  <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
                  <option value="pending">{isBn ? 'Pending (অপেক্ষমাণ)' : 'Pending'}</option>
                  <option value="success">{isBn ? 'Success (সফল)' : 'Success'}</option>
                  <option value="mismatch">{isBn ? 'Mismatch (অমিল)' : 'Mismatch'}</option>
                  <option value="rejected">{isBn ? 'Rejected (বাতিল)' : 'Rejected'}</option>
                </select>

                {/* Date filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week')}
                  className="px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                >
                  <option value="all">{isBn ? 'সব সময় (All Time)' : 'All Time'}</option>
                  <option value="today">{isBn ? 'আজকে (Last 24h)' : 'Today'}</option>
                  <option value="week">{isBn ? 'গত ৭ দিন (7 Days)' : 'Last 7 Days'}</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-600">
                    <th className="py-3 px-3.5 font-bold">{isBn ? 'ইউজার ও আইডি' : 'User / ID'}</th>
                    <th className="py-3 px-3.5 font-bold">{isBn ? 'মেথড' : 'Method'}</th>
                    <th className="py-3 px-3.5 font-bold">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{isBn ? 'সেন্ডার নাম্বার' : 'Sender Number'}</span>
                      </div>
                    </th>
                    <th className="py-3 px-3.5 font-bold">{isBn ? 'টাকার পরিমাণ' : 'Amount (BDT)'}</th>
                    <th className="py-3 px-3.5 font-bold">{isBn ? 'ট্রানজেকশন আইডি (TrxID)' : 'TrxID'}</th>
                    <th className="py-3 px-3.5 font-bold">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="py-3 px-3.5 font-bold">{isBn ? 'সময়' : 'Timestamp'}</th>
                    <th className="py-3 px-3.5 font-bold text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                        <p className="font-medium text-xs text-stone-500">
                          {isBn ? 'কোনো ট্রানজেকশন রেকর্ড পাওয়া যায়নি।' : 'No transaction records match the filter.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-stone-50/80 transition">
                        {/* User & ID */}
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-stone-900">
                            {tx.userName || (isBn ? 'সাধারণ গ্রাহক' : 'Customer')}
                          </div>
                          <div className="text-[10px] font-mono text-stone-400">
                            #{tx.id}
                          </div>
                        </td>

                        {/* Method badge */}
                        <td className="py-3 px-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            tx.method === 'bkash' 
                              ? 'bg-pink-100 text-pink-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${tx.method === 'bkash' ? 'bg-pink-600' : 'bg-orange-600'}`} />
                            {tx.method.toUpperCase()}
                          </span>
                        </td>

                        {/* Sender Phone */}
                        <td className="py-3 px-3.5 font-mono text-stone-900 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span>{tx.senderPhone}</span>
                            <button
                              onClick={() => copyText(tx.senderPhone, `phone-${tx.id}`)}
                              title={isBn ? 'নাম্বার কপি করুন' : 'Copy Number'}
                              className="text-stone-300 hover:text-stone-600 cursor-pointer"
                            >
                              {copiedId === `phone-${tx.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3.5 font-mono font-bold text-stone-900">
                          <span className="text-sm">৳ {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </td>

                        {/* TrxID */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-800 tracking-wider">
                              {tx.trxId}
                            </span>
                            <button
                              onClick={() => copyText(tx.trxId, `trx-${tx.id}`)}
                              title="Copy TrxID"
                              className="text-stone-300 hover:text-stone-600 cursor-pointer"
                            >
                              {copiedId === `trx-${tx.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5">
                          {tx.status === 'success' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {isBn ? 'Success (সফল)' : 'Success'}
                            </span>
                          )}
                          {tx.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 animate-spin text-amber-600" />
                              {isBn ? 'Pending (অপেক্ষমাণ)' : 'Pending'}
                            </span>
                          )}
                          {tx.status === 'mismatch' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              {isBn ? 'Mismatch (অমিল)' : 'Mismatch'}
                            </span>
                          )}
                          {tx.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600">
                              <X className="w-3 h-3" />
                              {isBn ? 'বাতিল' : 'Rejected'}
                            </span>
                          )}
                        </td>

                        {/* Time */}
                        <td className="py-3 px-3.5 text-stone-500 text-[11px]">
                          <div>{new Date(tx.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-[10px] text-stone-400">{new Date(tx.submittedAt).toLocaleDateString()}</div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                              title={isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                            >
                              <Eye className="w-3 h-3" />
                              <span>{isBn ? 'ডিটেইলস' : 'View'}</span>
                            </button>

                            {/* Manual approve/reject if pending */}
                            {tx.status === 'pending' && onUpdateTransactionStatus && (
                              <button
                                onClick={() => onUpdateTransactionStatus(tx.id, 'success', 'ম্যানুয়াল অ্যাডমিন অনুমোদন')}
                                className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition cursor-pointer"
                                title={isBn ? 'ম্যানুয়াল অ্যাপ্রুভ' : 'Manual Approve'}
                              >
                                {isBn ? 'অ্যাপ্রুভ' : 'Approve'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Summary Footnote */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500 pt-2">
              <div>
                {isBn 
                  ? `মোট ${transactions.length} টির মধ্যে ${filteredTransactions.length} টি ট্রানজেকশন প্রদর্শিত হচ্ছে।` 
                  : `Showing ${filteredTransactions.length} of ${transactions.length} records.`}
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {stats.successCount} {isBn ? 'অনুমোদিত' : 'Approved'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {stats.pendingCount} {isBn ? 'অপেক্ষমাণ' : 'Pending'}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Web Integration & Firebase Realtime Code Logic */}
        {activeTab === 'code' && (
          <div className="p-5 space-y-6">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                {isBn ? 'ওয়েবসাইটে এই অ্যাডমিন টেবিল ও Firebase রিয়েল-টাইম ইন্টিগ্রেশন লজিক' : 'Web Dashboard & Firebase Realtime Integration Architecture'}
              </h3>
              <p className="text-xs text-stone-600">
                {isBn 
                  ? 'আপনার ওয়েবসাইটে React, Vue, অথবা পিওর HTML/JS দিয়ে এই ড্যাশবোর্ড তৈরি করার কোড স্নsnippet নিচে দেওয়া হলো:' 
                  : 'Production code for connecting Firebase Realtime Database or Firestore to your web administration dashboard.'}
              </p>
            </div>

            {/* Code Snippet 1: HTML / JavaScript Table */}
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <div className="bg-stone-900 text-stone-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-emerald-400">admin-dashboard.js (Firebase Realtime Listener)</span>
                <button
                  onClick={() => copyText(`// Firebase Realtime / Firestore Listener for Admin Table
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";

const db = getFirestore();

// ১. রিয়েল-টাইমে সব ট্রানজেকশন লোড ও টেবিল আপডেট করার লজিক
function listenToTransactions(renderTableCallback, updateStatsCallback) {
  const q = query(collection(db, "transactions"), orderBy("submittedAt", "desc"));

  // onSnapshot এর মাধ্যমে ডাটাবেজে কোনো পরিবর্তন হলেই তাৎক্ষণিক টেবিল আপডেট হবে
  return onSnapshot(q, (snapshot) => {
    const transactions = [];
    let totalBDT = 0;
    const uniqueUsers = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({ id: doc.id, ...data });

      if (data.status === "success") {
        totalBDT += Number(data.amount || 0);
      }
      if (data.senderPhone) {
        uniqueUsers.add(data.senderPhone);
      }
    });

    // টেবিল এবং কাউন্টার আপডেট কলব্যাক
    renderTableCallback(transactions);
    updateStatsCallback({
      totalCount: transactions.length,
      totalBDT: totalBDT,
      uniqueUsersCount: uniqueUsers.size
    });
  });
}`, 'code-firebase-listener')}
                  className="text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'code-firebase-listener' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code-firebase-listener' ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                </button>
              </div>
              <pre className="p-4 bg-stone-950 text-stone-200 font-mono text-xs overflow-x-auto leading-relaxed">
{`// Firebase Realtime / Firestore Listener for Admin Table
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";

const db = getFirestore();

// ১. রিয়েল-টাইমে সব ট্রানজেকশন লোড ও টেবিল আপডেট করার লজিক
function listenToTransactions(renderTableCallback, updateStatsCallback) {
  const q = query(collection(db, "transactions"), orderBy("submittedAt", "desc"));

  // onSnapshot এর মাধ্যমে ডাটাবেজে কোনো পরিবর্তন হলেই তাৎক্ষণিক টেবিল আপডেট হবে
  return onSnapshot(q, (snapshot) => {
    const transactions = [];
    let totalBDT = 0;
    const uniqueUsers = new Set();

    snapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({ id: doc.id, ...data });

      if (data.status === "success") {
        totalBDT += Number(data.amount || 0);
      }
      if (data.senderPhone) {
        uniqueUsers.add(data.senderPhone);
      }
    });

    // টেবিল এবং কাউন্টার আপডেট কলব্যাক
    renderTableCallback(transactions);
    updateStatsCallback({
      totalCount: transactions.length,
      totalBDT: totalBDT,
      uniqueUsersCount: uniqueUsers.size
    });
  });
}`}
              </pre>
            </div>

            {/* Code Snippet 2: Filter & Search Function */}
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <div className="bg-stone-900 text-stone-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-emerald-400">filter-logic.js (Client-side Fast Search)</span>
                <button
                  onClick={() => copyText(`// ২. সার্চ ও ফিল্টারিং লজিক (JavaScript)
function filterTransactions(list, { query, method, status }) {
  return list.filter((item) => {
    // মেথড ফিল্টার (bKash / Nagad)
    if (method && method !== 'all' && item.method !== method) return false;

    // স্ট্যাটাস ফিল্টার (pending / success / mismatch)
    if (status && status !== 'all' && item.status !== status) return false;

    // কিওয়ার্ড সার্চ (Sender Phone, TrxID, Amount)
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      const matchPhone = item.senderPhone && item.senderPhone.includes(q);
      const matchTrx = item.trxId && item.trxId.toLowerCase().includes(q);
      const matchAmount = item.amount && item.amount.toString().includes(q);
      return matchPhone || matchTrx || matchAmount;
    }

    return true;
  });
}`, 'code-filter-logic')}
                  className="text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'code-filter-logic' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'code-filter-logic' ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                </button>
              </div>
              <pre className="p-4 bg-stone-950 text-stone-200 font-mono text-xs overflow-x-auto leading-relaxed">
{`// ২. সার্চ ও ফিল্টারিং লজিক (JavaScript)
function filterTransactions(list, { query, method, status }) {
  return list.filter((item) => {
    // মেথড ফিল্টার (bKash / Nagad)
    if (method && method !== 'all' && item.method !== method) return false;

    // স্ট্যাটাস ফিল্টার (pending / success / mismatch)
    if (status && status !== 'all' && item.status !== status) return false;

    // কিওয়ার্ড সার্চ (Sender Phone, TrxID, Amount)
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      const matchPhone = item.senderPhone && item.senderPhone.includes(q);
      const matchTrx = item.trxId && item.trxId.toLowerCase().includes(q);
      const matchAmount = item.amount && item.amount.toString().includes(q);
      return matchPhone || matchTrx || matchAmount;
    }

    return true;
  });
}`}
              </pre>
            </div>
          </div>
        )}

      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  selectedTx.status === 'success' ? 'bg-emerald-500' :
                  selectedTx.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <h3 className="font-bold text-stone-900 text-base">
                  {isBn ? 'ট্রানজেকশন বিস্তারিত অডিট' : 'Transaction Audit Detail'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl">
                <span className="text-stone-400 block mb-0.5">{isBn ? 'ইউজারের নাম' : 'User Name'}</span>
                <span className="font-bold text-stone-900">{selectedTx.userName || 'Customer'}</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl">
                <span className="text-stone-400 block mb-0.5">{isBn ? 'পেমেন্ট মেথড' : 'Method'}</span>
                <span className="font-bold uppercase text-stone-900">{selectedTx.method}</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl">
                <span className="text-stone-400 block mb-0.5">{isBn ? 'প্রেরক নম্বর' : 'Sender Phone'}</span>
                <span className="font-mono font-bold text-stone-900">{selectedTx.senderPhone}</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl">
                <span className="text-stone-400 block mb-0.5">{isBn ? 'টাকার পরিমাণ' : 'Amount'}</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">৳ {selectedTx.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500">{isBn ? 'ট্রানজেকশন আইডি:' : 'TrxID:'}</span>
                <span className="font-bold text-stone-900">{selectedTx.trxId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{isBn ? 'সাবমিট টাইম:' : 'Submitted At:'}</span>
                <span>{new Date(selectedTx.submittedAt).toLocaleString()}</span>
              </div>
              {selectedTx.matchedAt && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>{isBn ? 'অটো-ম্যাচ টাইম:' : 'Matched At:'}</span>
                  <span>{new Date(selectedTx.matchedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {selectedTx.matchedSmsBody && (
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 uppercase mb-1">
                  {isBn ? 'মার্চেন্ট ফোনে রিসিভড কনফার্মেশন এসএমএস:' : 'Received Merchant SMS Body:'}
                </label>
                <div className="p-3 bg-stone-900 text-stone-200 rounded-xl text-xs font-mono break-all leading-relaxed">
                  {selectedTx.matchedSmsBody}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {isBn ? 'ঠিক আছে' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
