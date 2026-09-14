import { CodeSnippet } from '../types';

export const ANDROID_CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'bkash_nagad_sms_listener',
    title: 'SmsListener.kt (bKash/Nagad Auto Reader)',
    titleBn: 'বিকাশ ও নগদ অটো এসএমএস রিডার (SmsListener.kt)',
    filePath: 'app/src/main/java/com/example/paymentreader/SmsListener.kt',
    language: 'kotlin',
    description: 'Background BroadcastReceiver that filters incoming SMS from bKash & Nagad, extracts TrxID and Amount using regex, and posts to the verification server API.',
    descriptionBn: 'বিকাশ ও নগদের ইনকামিং কনফার্মেশন এসএমএস রিসিভ করে TrxID ও অ্যামাউন্ট এক্সট্র্যাক্ট করে সার্ভার API-তে পাঠায়।',
    code: `package com.example.paymentreader

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.regex.Pattern

/**
 * বিকাশ ও নগদের অটো পেমেন্ট ভেরিফিকেশন এসএমএস লিসেনার
 * আপনার মার্চেন্ট ফোনে এই ব্রডকাস্ট রিসিভারটি ব্যাকগ্রাউন্ডে চলবে।
 */
class SmsListener : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val sender = sms.originatingAddress ?: continue // যেমন: bKash বা Nagad
                val body = sms.messageBody ?: continue          // এসএমএস-এর মূল টেক্সট

                // ১. চেক করুন মেসেজটি বিকাশ বা নগদ থেকে এসেছে কি না
                if (sender.equals("bKash", ignoreCase = true) || 
                    sender.equals("Nagad", ignoreCase = true) || 
                    sender.contains("16247") || sender.contains("16167")) {

                    Log.d("SMS_READER", "Sender: $sender, Body: $body")
                    
                    // ২. রেগুলার এক্সপ্রেশন (Regex) দিয়ে TrxID এবং অ্যামাউন্ট আলাদা করা
                    val (trxId, amount) = extractTrxDetails(body)

                    // ৩. ফাংশন কল করে ডাটা আপনার সার্ভারে (API-এর মাধ্যমে) পাঠিয়ে দেওয়া
                    sendDataToServer(sender, body, trxId, amount)
                }
            }
        }
    }

    /**
     * এসএমএস বডি থেকে TrxID এবং টাকার পরিমাণ এক্সট্র্যাক্ট করার মেথড
     */
    private fun extractTrxDetails(body: String): Pair<String?, Double?> {
        var trxId: String? = null
        var amount: Double? = null

        // TrxID / TxnID প্যাটার্ন (e.g. TrxID BLA9X192K3 অথবা TxnID: 72H89AK3L)
        val trxPattern = Pattern.compile("(?:TrxID|TxnID|TRXID)\\\\s*[:\\\\s]?\\\\s*([A-Z0-9]{6,16})", Pattern.CASE_INSENSITIVE)
        val trxMatcher = trxPattern.matcher(body)
        if (trxMatcher.find()) {
            trxId = trxMatcher.group(1)?.uppercase()
        }

        // Amount প্যাটার্ন (e.g. Tk 1,500.00 অথবা Amount: Tk 500)
        val amtPattern = Pattern.compile("(?:Tk|Tk\\\\.|BDT|Amount:\\\\s*Tk)\\\\s*([0-9,]+(?:\\\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE)
        val amtMatcher = amtPattern.matcher(body)
        if (amtMatcher.find()) {
            val cleanStr = amtMatcher.group(1)?.replace(",", "")
            amount = cleanStr?.toDoubleOrNull()
        }

        return Pair(trxId, amount)
    }

    /**
     * সার্ভার API (Firebase Realtime DB / Node.js Express) এ ট্রানজেকশন ডাটা পাঠানো
     */
    private fun sendDataToServer(sender: String, body: String, trxId: String?, amount: Double?) {
        Thread {
            try {
                val client = OkHttpClient()
                val payload = JSONObject().apply {
                    put("sender", sender)
                    put("rawBody", body)
                    put("trxId", trxId ?: "")
                    put("amount", amount ?: 0.0)
                    put("timestamp", System.currentTimeMillis())
                    // সিক্রেট এপিআই কি যাতে বাহিরের কেউ সরাসরি সার্ভারে রিকোয়েস্ট পাঠাতে না পারে
                    put("webhookSecret", "SECURE_SECRET_TOKEN_12345")
                }

                val mediaType = "application/json; charset=utf-8".toMediaType()
                val requestBody = payload.toString().toRequestBody(mediaType)
                val request = Request.Builder()
                    .url("https://your-api-server.com/api/sms-webhook")
                    .post(requestBody)
                    .addHeader("Content-Type", "application/json")
                    .build()

                val response = client.newCall(request).execute()
                Log.d("SMS_READER", "Server Match API Response Code: \${response.code}")
            } catch (e: Exception) {
                Log.e("SMS_READER", "Error sending SMS data to server", e)
            }
        }.start()
    }
}`
  },
  {
    id: 'payment_manifest',
    title: 'AndroidManifest.xml (Payment Gateway)',
    titleBn: 'পেমেন্ট গেটওয়ে মেনিফেস্ট (AndroidManifest.xml)',
    filePath: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Manifest declaring RECEIVE_SMS, READ_SMS, INTERNET, FOREGROUND_SERVICE, and high-priority SMS_RECEIVED broadcast receiver.',
    descriptionBn: 'এসএমএস পড়া, ইন্টারনেট সংযোগ ও ব্যাকগ্রাউন্ড সার্ভিস সংক্রান্ত মেনিফেস্ট ডিক্লারেশন।',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.paymentreader">

    <!-- ১. প্রয়োজনীয় পারমিশনসমূহ -->
    <!-- নতুন এসএমএস রিসিভ করার পারমিশন -->
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    
    <!-- ইনবক্স পড়ার পারমিশন -->
    <uses-permission android:name="android.permission.READ_SMS" />
    
    <!-- সার্ভার এপিআইতে ট্রানজেকশন ডেটা পাঠানোর জন্য ইন্টারনেট -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- অ্যান্ড্রয়েড যাতে ব্যাকগ্রাউন্ডে কিল না করে (Sticky Service) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Merchant SMS Gateway"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Material3.DayNight.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- ২. বিকাশ ও নগদ এসএমএস ধরার ব্রডকাস্ট রিসিভার -->
        <receiver
            android:name=".SmsListener"
            android:exported="true"
            android:permission="android.permission.BROADCAST_SMS">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>

    </application>

</manifest>`
  },
  {
    id: 'server_matching_api',
    title: 'ServerAutoMatchApi.js (Node.js & Firebase)',
    titleBn: 'সার্ভার সাইড অটো ম্যাচিং এপিআই (Node.js & Firebase)',
    filePath: 'server/routes/smsWebhook.js',
    language: 'javascript',
    description: 'Server API receiving parsed SMS payload from the merchant phone, querying pending user submissions, verifying amount and TrxID, and atomically updating status to Success.',
    descriptionBn: 'মার্চেন্ট ফোন থেকে আসা ট্রানজেকশন আইডি ও টাকার পরিমাণ ইউজারের তথ্যের সাথে মিলিয়ে স্বয়ংক্রিয়ভাবে Success করে ব্যালেন্স যোগ করে।',
    code: `const express = require('express');
const router = express.Router();
const admin = require('firebase-admin'); // Firebase Admin SDK

const db = admin.firestore();

/**
 * POST /api/sms-webhook
 * মার্চেন্ট ফোন থেকে SmsListener এই এন্ডপয়েন্টে ডেটা পাঠাবে
 */
router.post('/api/sms-webhook', async (req, res) => {
  const { webhookSecret, sender, trxId, amount, rawBody } = req.body;

  // ১. নিরাপত্তা যাচাই (অননুমোদিত রিকোয়েস্ট ব্লক)
  if (webhookSecret !== process.env.MERCHANT_WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Unauthorized webhook request' });
  }

  if (!trxId || !amount) {
    return res.status(400).json({ error: 'Invalid payload: TrxID or Amount missing' });
  }

  const normalizedTrxId = trxId.toUpperCase().trim();

  try {
    // ২. ফায়ারস্টোর ডাটাবেজে এই TrxID দিয়ে পেন্ডিং রিকোয়েস্ট খোঁজা
    const querySnapshot = await db.collection('transactions')
      .where('trxId', '==', normalizedTrxId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      // ইউজার এখনও সাবমিট করেনি, তাই পরবর্তীতে মেলানোর জন্য ক্যাশে রেখে দিন
      await db.collection('unmatched_sms').doc(normalizedTrxId).set({
        trxId: normalizedTrxId,
        amount: Number(amount),
        sender,
        rawBody,
        receivedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.json({ status: 'cached_as_unmatched', trxId: normalizedTrxId });
    }

    const txDoc = querySnapshot.docs[0];
    const userSubmission = txDoc.data();

    // ৩. টাকার পরিমাণ নির্ভুলভাবে যাচাই করা
    if (Math.abs(Number(userSubmission.amount) - Number(amount)) > 0.01) {
      // অ্যামাউন্টে গরমিল থাকলে স্ট্যাটাস mismatch করা
      await txDoc.ref.update({
        status: 'mismatch',
        smsAmount: Number(amount),
        statusMessage: \`টাকার পরিমাণে অমিল! ইউজার বলেছে \${userSubmission.amount}, এসএমএসে এসেছে \${amount}\`,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.json({ status: 'amount_mismatch' });
    }

    // ৪. অ্যাটমিক ট্রানজেকশন (ডাবল স্পেন্ডিং বা কনকারেন্সি সমস্যা রোধ করতে)
    await db.runTransaction(async (transaction) => {
      const freshDoc = await transaction.get(txDoc.ref);
      if (freshDoc.data().status !== 'pending') {
        throw new Error('Transaction was already processed by another thread');
      }

      // ক. ট্রানজেকশন স্ট্যাটাস SUCCESS করা
      transaction.update(txDoc.ref, {
        status: 'success',
        matchedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedVia: sender,
        matchedSmsBody: rawBody,
        statusMessage: 'স্বয়ংক্রিয়ভাবে ভেরিফাইড ও ওয়ালেটে ব্যালেন্স যুক্ত হয়েছে।'
      });

      // খ. ইউজারের একাউন্টে ব্যালেন্স যোগ করা
      const userRef = db.collection('users').doc(userSubmission.userId);
      transaction.update(userRef, {
        walletBalance: admin.firestore.FieldValue.increment(Number(amount)),
        lastRechargeAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    console.log(\`[AUTO_MATCH] Successfully verified TrxID: \${normalizedTrxId}, Credited: ৳\${amount}\`);
    return res.json({ status: 'success', message: 'Payment verified and credited' });

  } catch (err) {
    console.error('[AUTO_MATCH_ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;`
  },
  {
    id: 'web_dashboard_html',
    title: 'AdminDashboard.html (Web Realtime Table)',
    titleBn: 'অ্যাডমিন ড্যাশবোর্ড ওয়েব টেবিল (HTML / Tailwind CSS)',
    filePath: 'web/admin-transactions.html',
    language: 'html',
    description: 'Clean responsive web dashboard table displaying Sender Phone, TrxID, Amount, Status badge, and live user counts for your e-commerce or portal.',
    descriptionBn: 'সেন্ডার নাম্বার, টাকার পরিমাণ, TrxID ও মোট ইউজারের হিসাব লাইভ প্রদর্শনের জন্য রেসপন্সিভ ওয়েব টেবিল ডিজাইন।',
    code: `<!-- অ্যাডমিন প্যানেল ট্রানজেকশন হিস্ট্রি টেবিল (Tailwind CSS) -->
<div class="max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
  
  <!-- ১. হেডার ও কাউন্টার সামারি -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
    <div>
      <h1 class="text-xl font-bold text-gray-900">পেমেন্ট ভেরিফিকেশন ও ট্রানজেকশন হিস্ট্রি</h1>
      <p class="text-xs text-gray-500 mt-1">বিকাশ ও নগদ অটো-পেমেন্টের সকল রেকর্ড ও ইউজারের হিসাব</p>
    </div>

    <!-- মোট ইউজার ও কালেকশন কাউন্টার -->
    <div class="flex items-center gap-3">
      <div class="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
        <span class="text-xs block text-emerald-600 font-medium">মোট সফল জমা</span>
        <span id="total-collected" class="text-lg font-bold font-mono">৳ 0.00</span>
      </div>
      <div class="px-4 py-2 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
        <span class="text-xs block text-blue-600 font-medium">মোট গ্রাহক সংখ্যা</span>
        <span id="total-users" class="text-lg font-bold font-mono">0 জন</span>
      </div>
    </div>
  </div>

  <!-- ২. সার্চ ও ফিল্টারিং বার -->
  <div class="flex flex-wrap items-center justify-between gap-3 py-4">
    <div class="flex-1 min-w-[240px]">
      <input 
        id="search-input"
        type="text" 
        placeholder="সেন্ডার নাম্বার (017...) বা TrxID দিয়ে খুঁজুন..." 
        class="w-full px-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      />
    </div>
    <div class="flex items-center gap-2">
      <select id="method-filter" class="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50">
        <option value="all">সব মেথড (All)</option>
        <option value="bkash">bKash (বিকাশ)</option>
        <option value="nagad">Nagad (নগদ)</option>
      </select>
      <select id="status-filter" class="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50">
        <option value="all">সব স্ট্যাটাস</option>
        <option value="success">Success (সফল)</option>
        <option value="pending">Pending (অপেক্ষমাণ)</option>
        <option value="mismatch">Mismatch (অমিল)</option>
      </select>
    </div>
  </div>

  <!-- ৩. ট্রানজেকশন হিস্ট্রি টেবিল -->
  <div class="overflow-x-auto rounded-xl border border-gray-100">
    <table class="w-full text-left text-xs">
      <thead class="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
        <tr>
          <th class="py-3 px-4">ইউজার ও আইডি</th>
          <th class="py-3 px-4">মেথড</th>
          <th class="py-3 px-4">সেন্ডার নাম্বার</th>
          <th class="py-3 px-4">টাকার পরিমাণ</th>
          <th class="py-3 px-4">ট্রানজেকশন আইডি (TrxID)</th>
          <th class="py-3 px-4">স্ট্যাটাস</th>
          <th class="py-3 px-4">সময়</th>
          <th class="py-3 px-4 text-right">অ্যাকশন</th>
        </tr>
      </thead>
      <tbody id="transaction-rows" class="divide-y divide-gray-100 text-gray-700">
        <!-- জাভাস্ক্রিপ্ট / Firebase দিয়ে অটোমেটিক রো যুক্ত হবে -->
      </tbody>
    </table>
  </div>

</div>`
  },
  {
    id: 'web_firebase_listener',
    title: 'AdminDashboard.js (Firebase Realtime Listener)',
    titleBn: 'অ্যাডমিন ড্যাশবোর্ড রিয়েলটাইম স্ক্রিপ্ট (Firebase Firestore)',
    filePath: 'web/admin-transactions.js',
    language: 'javascript',
    description: 'JavaScript code listening to Firestore / Realtime DB, dynamically populating rows, calculating total users, and filtering instantly without reloading.',
    descriptionBn: 'ডাটাবেজে নতুন পেমেন্ট আসা মাত্রই পেজ রিলোড ছাড়াই টেবিল আপডেট ও সার্চ ফিল্টারিংয়ের জাভাস্ক্রিপ্ট লজিক।',
    code: `// Firebase Firestore / Realtime Database Listener
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "your-project-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let allTransactions = [];

// ১. রিয়েল-টাইমে ট্রানজেকশন লিস্ট লিসেন করা
function startRealtimeTransactionListener() {
  const q = query(collection(db, "transactions"), orderBy("submittedAt", "desc"));

  onSnapshot(q, (snapshot) => {
    allTransactions = [];
    let totalSuccessBDT = 0;
    const uniqueUsersSet = new Set();

    snapshot.forEach((doc) => {
      const tx = { id: doc.id, ...doc.data() };
      allTransactions.push(tx);

      // সফল টাকার মোট যোগফল
      if (tx.status === "success") {
        totalSuccessBDT += Number(tx.amount || 0);
      }
      // সেন্ডার নাম্বার দিয়ে মোট ইউনিক গ্রাহকের হিসাব
      if (tx.senderPhone) {
        uniqueUsersSet.add(tx.senderPhone);
      }
    });

    // কাউন্টার কার্ড আপডেট
    document.getElementById("total-collected").innerText = "৳ " + totalSuccessBDT.toLocaleString();
    document.getElementById("total-users").innerText = uniqueUsersSet.size + " জন";

    // টেবিল রেন্ডার
    renderTransactionsTable(allTransactions);
  });
}

// ২. টেবিলে ডাটা রেন্ডার করার ফাংশন
function renderTransactionsTable(list) {
  const tbody = document.getElementById("transaction-rows");
  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-gray-400">কোনো লেনদেন পাওয়া যায়নি</td></tr>';
    return;
  }

  list.forEach((tx) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50/80 transition";

    const methodColor = tx.method === "bkash" ? "bg-pink-100 text-pink-800" : "bg-orange-100 text-orange-800";
    const statusBadge = tx.status === "success" 
      ? '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Success</span>'
      : tx.status === "pending"
      ? '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Pending</span>'
      : '<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Mismatch</span>';

    tr.innerHTML = \`
      <td class="py-3 px-4 font-medium text-gray-900">\${tx.userName || 'গ্রাহক'}</td>
      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-[11px] font-bold \${methodColor}">\${tx.method.toUpperCase()}</span></td>
      <td class="py-3 px-4 font-mono font-semibold">\${tx.senderPhone}</td>
      <td class="py-3 px-4 font-mono font-bold text-emerald-700">৳ \${Number(tx.amount).toLocaleString()}</td>
      <td class="py-3 px-4 font-mono font-bold bg-gray-50 px-2 py-1 rounded">\${tx.trxId}</td>
      <td class="py-3 px-4">\${statusBadge}</td>
      <td class="py-3 px-4 text-gray-500">\${new Date(tx.submittedAt).toLocaleTimeString()}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="viewTxDetail('\${tx.id}')" class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs font-medium">বিস্তারিত</button>
      </td>
    \`;
    tbody.appendChild(tr);
  });
}

// ৩. লাইভ সার্চ ও ফিল্টারিং ইভেন্ট লিসেনার
document.getElementById("search-input").addEventListener("input", applyFilters);
document.getElementById("method-filter").addEventListener("change", applyFilters);
document.getElementById("status-filter").addEventListener("change", applyFilters);

function applyFilters() {
  const query = document.getElementById("search-input").value.toLowerCase().trim();
  const selectedMethod = document.getElementById("method-filter").value;
  const selectedStatus = document.getElementById("status-filter").value;

  const filtered = allTransactions.filter((tx) => {
    if (selectedMethod !== "all" && tx.method !== selectedMethod) return false;
    if (selectedStatus !== "all" && tx.status !== selectedStatus) return false;
    if (query) {
      const matchPhone = tx.senderPhone && tx.senderPhone.includes(query);
      const matchTrx = tx.trxId && tx.trxId.toLowerCase().includes(query);
      const matchName = tx.userName && tx.userName.toLowerCase().includes(query);
      return matchPhone || matchTrx || matchName;
    }
    return true;
  });

  renderTransactionsTable(filtered);
}

// ইনিশিয়ালাইজেশন
startRealtimeTransactionListener();`
  },
  {
    id: 'manifest',
    title: 'AndroidManifest.xml',
    titleBn: 'অ্যান্ড্রয়েড মেনিফেস্ট (AndroidManifest.xml)',
    filePath: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Declares required permissions (READ_SMS, RECEIVE_SMS, SEND_SMS) and registers the SMS BroadcastReceiver.',
    descriptionBn: 'এসএমএস পড়া, রিসিভ করা ও পাঠানোর জন্য পারমিশন ডিক্লারেশন এবং ব্রডকাস্ট রিসিভার রেজিস্ট্রেশন।',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.example.smsmanager">

    <!-- ১. টেকনোলজি ও পারমিশন সেটআপ -->
    <!-- এসএমএস পড়ার জন্য পারমিশন -->
    <uses-permission android:name="android.permission.READ_SMS" />
    
    <!-- রিয়েল-টাইমে নতুন এসএমএস ধরার জন্য পারমিশন -->
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    
    <!-- অ্যাপ থেকে এসএমএস বা রিপ্লাই পাঠানোর পারমিশন -->
    <uses-permission android:name="android.permission.SEND_SMS" />
    
    <!-- Android 13+ (API 33) নোটিফিকেশন দেখানোর জন্য -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:name=".SmsApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SmsManager">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- ২. ব্রডকাস্ট রিসিভার: নতুন এসএমএস ট্র্যাক করার জন্য -->
        <receiver
            android:name=".receiver.SmsBroadcastReceiver"
            android:exported="true"
            android:permission="android.permission.BROADCAST_SMS">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>

    </application>

</manifest>`
  },
  {
    id: 'broadcast_receiver',
    title: 'SmsBroadcastReceiver.kt',
    titleBn: 'ব্রডকাস্ট রিসিভার (SmsBroadcastReceiver.kt)',
    filePath: 'app/src/main/java/com/example/smsmanager/receiver/SmsBroadcastReceiver.kt',
    language: 'kotlin',
    description: 'Listens for SMS_RECEIVED intents in the background, parses raw PDUs into SmsMessage, saves to Room DB, and shows notification.',
    descriptionBn: 'ব্যাকগ্রাউন্ডে নতুন এসএমএস রিসিভ করে, PDU পার্স করে Room ডাটাবেজে সেভ করে ও নোটিফিকেশন পাঠায়।',
    code: `package com.example.smsmanager.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.telephony.SmsMessage
import android.util.Log
import com.example.smsmanager.data.local.AppDatabase
import com.example.smsmanager.data.local.SmsEntity
import com.example.smsmanager.util.NotificationHelper
import com.example.smsmanager.util.SmsClassifier
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class SmsBroadcastReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val bundle = intent.extras ?: return
            
            try {
                // PDU (Protocol Data Unit) থেকে এসএমএস বের করা
                val pdus = bundle.get("pdus") as? Array<*> ?: return
                val format = bundle.getString("format")
                
                val fullMessage = StringBuilder()
                var senderNumber = ""
                var timestamp = System.currentTimeMillis()

                for (pdu in pdus) {
                    val sms = SmsMessage.createFromPdu(pdu as ByteArray, format)
                    senderNumber = sms.displayOriginatingAddress ?: "Unknown"
                    fullMessage.append(sms.displayMessageBody)
                    timestamp = sms.timestampMillis
                }

                val body = fullMessage.toString()
                Log.d("SmsReceiver", "SMS received from: $senderNumber, body: $body")

                // স্বয়ংক্রিয় ক্যাটাগরি ডিটেকশন (OTP, Transaction, Personal, Spam)
                val category = SmsClassifier.categorize(body)
                val otpCode = SmsClassifier.extractOtp(body)

                // Room Database-এ লোকালভাবে সেভ করা
                CoroutineScope(Dispatchers.IO).launch {
                    val db = AppDatabase.getInstance(context)
                    val smsEntity = SmsEntity(
                        sender = senderNumber,
                        body = body,
                        timestamp = timestamp,
                        category = category,
                        isRead = false,
                        otpCode = otpCode
                    )
                    db.smsDao().insertSms(smsEntity)
                    
                    // নোটিফিকেশন ডিসপ্যাচ করা
                    NotificationHelper.showSmsNotification(context, senderNumber, body, category)
                }

            } catch (e: Exception) {
                Log.e("SmsReceiver", "Error parsing incoming SMS", e)
            }
        }
    }
}`
  },
  {
    id: 'sms_reader',
    title: 'SmsReaderHelper.kt',
    titleBn: 'ইনবক্স রিডিং লজিক (SmsReaderHelper.kt)',
    filePath: 'app/src/main/java/com/example/smsmanager/data/repository/SmsReaderHelper.kt',
    language: 'kotlin',
    description: 'Queries Android ContentResolver at Telephony.Sms.Inbox.CONTENT_URI to fetch existing SMS messages.',
    descriptionBn: 'ContentResolver দিয়ে ফোনের ইনবক্স থেকে এসএমএস ফেচ করা এবং ক্যাটাগরি অনুযায়ী ফিল্টার করা।',
    code: `package com.example.smsmanager.data.repository

import android.content.Context
import android.provider.Telephony
import com.example.smsmanager.data.local.SmsEntity
import com.example.smsmanager.util.SmsClassifier
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class SmsReaderHelper(private val context: Context) {

    /**
     * ইউজারের ফোনের সিস্টেম ইনবক্স থেকে সব এসএমএস ফেচ করে
     */
    suspend fun fetchInboxSms(limit: Int = 100): List<SmsEntity> = withContext(Dispatchers.IO) {
        val smsList = mutableListOf<SmsEntity>()
        val uri = Telephony.Sms.Inbox.CONTENT_URI
        
        val projection = arrayOf(
            Telephony.Sms._ID,
            Telephony.Sms.ADDRESS,
            Telephony.Sms.BODY,
            Telephony.Sms.DATE,
            Telephony.Sms.READ
        )
        
        val sortOrder = "\${Telephony.Sms.DATE} DESC LIMIT $limit"

        context.contentResolver.query(uri, projection, null, null, sortOrder)?.use { cursor ->
            val indexAddress = cursor.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
            val indexBody = cursor.getColumnIndexOrThrow(Telephony.Sms.BODY)
            val indexDate = cursor.getColumnIndexOrThrow(Telephony.Sms.DATE)
            val indexRead = cursor.getColumnIndexOrThrow(Telephony.Sms.READ)

            while (cursor.moveToNext()) {
                val address = cursor.getString(indexAddress) ?: "Unknown"
                val body = cursor.getString(indexBody) ?: ""
                val date = cursor.getLong(indexDate)
                val isRead = cursor.getInt(indexRead) == 1

                val category = SmsClassifier.categorize(body)
                val otp = SmsClassifier.extractOtp(body)

                smsList.add(
                    SmsEntity(
                        sender = address,
                        body = body,
                        timestamp = date,
                        category = category,
                        isRead = isRead,
                        otpCode = otp
                    )
                )
            }
        }
        
        return@withContext smsList
    }
}`
  },
  {
    id: 'room_db',
    title: 'SmsEntity.kt & SmsDao.kt',
    titleBn: 'রুম ডাটাবেজ (Room Database - Entity & DAO)',
    filePath: 'app/src/main/java/com/example/smsmanager/data/local/SmsDatabase.kt',
    language: 'kotlin',
    description: 'Local SQLite/Room Database schema and DAO queries for offline storage, keyword search, and category filtering.',
    descriptionBn: 'ডাটাবেজে লোকালভাবে এসএমএস সংরক্ষণ, কিওয়ার্ড সার্চ ও ক্যাটাগরি ফিল্টারিং কুয়েরি।',
    code: `package com.example.smsmanager.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

// ১. এসএমএস এন্টিটি (Table Schema)
@Entity(
    tableName = "sms_messages",
    indices = [Index(value = ["timestamp"]), Index(value = ["category"])]
)
data class SmsEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val sender: String,
    val body: String,
    val timestamp: Long,
    val category: String, // "otp", "transaction", "personal", "promotion", "spam"
    val isRead: Boolean = false,
    val otpCode: String? = null
)

// ২. ডাটা এক্সেস অবজেক্ট (DAO)
@Dao
interface SmsDao {

    @Query("SELECT * FROM sms_messages ORDER BY timestamp DESC")
    fun getAllSmsFlow(): Flow<List<SmsEntity>>

    @Query("SELECT * FROM sms_messages WHERE category = :category ORDER BY timestamp DESC")
    fun getSmsByCategory(category: String): Flow<List<SmsEntity>>

    @Query("""
        SELECT * FROM sms_messages 
        WHERE sender LIKE '%' || :query || '%' 
           OR body LIKE '%' || :query || '%' 
        ORDER BY timestamp DESC
    """)
    fun searchSms(query: String): Flow<List<SmsEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSms(sms: SmsEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(list: List<SmsEntity>)

    @Query("UPDATE sms_messages SET isRead = 1 WHERE id = :id")
    suspend fun markAsRead(id: Long)

    @Delete
    suspend fun deleteSms(sms: SmsEntity)
}

// ৩. রুম ডাটাবেজ বিল্ডার
@Database(entities = [SmsEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun smsDao(): SmsDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: android.content.Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "sms_local_database.db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
  },
  {
    id: 'recyclerview',
    title: 'SmsAdapter.kt & item_sms.xml',
    titleBn: 'ইউজার ইন্টারফেস ও RecyclerView (UI & Layout)',
    filePath: 'app/src/main/java/com/example/smsmanager/ui/SmsAdapter.kt',
    language: 'kotlin',
    description: 'Clean Material 3 RecyclerView ListAdapter with DiffUtil, category tags, OTP copy action, and custom layout.',
    descriptionBn: 'এসএমএস সুন্দর তালিকা আকারে দেখানোর জন্য RecyclerView অ্যাডাপ্টার ও ভিউহোল্ডার।',
    code: `package com.example.smsmanager.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.smsmanager.R
import com.example.smsmanager.data.local.SmsEntity
import com.example.smsmanager.databinding.ItemSmsBinding
import java.text.SimpleDateFormat
import java.util.*

class SmsAdapter(
    private val onItemClick: (SmsEntity) -> Unit,
    private val onCopyOtp: (String) -> Unit
) : ListAdapter<SmsEntity, SmsAdapter.SmsViewHolder>(DiffCallback) {

    inner class SmsViewHolder(private val binding: ItemSmsBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(sms: SmsEntity) {
            binding.tvSender.text = sms.sender
            binding.tvBody.text = sms.body
            binding.tvTime.text = formatTimestamp(sms.timestamp)
            
            // ক্যাটাগরি চিপ সেট করা
            binding.chipCategory.text = sms.category.uppercase()
            
            // ওটিপি বাটন ভিজিবিলিটি
            if (!sms.otpCode.isNullOrEmpty()) {
                binding.btnCopyOtp.visibility = android.view.View.VISIBLE
                binding.btnCopyOtp.text = "Copy: \${sms.otpCode}"
                binding.btnCopyOtp.setOnClickListener { onCopyOtp(sms.otpCode) }
            } else {
                binding.btnCopyOtp.visibility = android.view.View.GONE
            }

            binding.root.setOnClickListener { onItemClick(sms) }
        }

        private fun formatTimestamp(time: Long): String {
            val sdf = SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault())
            return sdf.format(Date(time))
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SmsViewHolder {
        val binding = ItemSmsBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return SmsViewHolder(binding)
    }

    override fun onBindViewHolder(holder: SmsViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    companion object DiffCallback : DiffUtil.ItemCallback<SmsEntity>() {
        override fun areItemsTheSame(oldItem: SmsEntity, newItem: SmsEntity) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: SmsEntity, newItem: SmsEntity) = oldItem == newItem
    }
}`
  },
  {
    id: 'permission_handler',
    title: 'PermissionHandler.kt',
    titleBn: 'রানটাইম পারমিশন হ্যান্ডলিং (Permission Request)',
    filePath: 'app/src/main/java/com/example/smsmanager/util/PermissionHandler.kt',
    language: 'kotlin',
    description: 'Modern ActivityResultContracts for READ_SMS, RECEIVE_SMS, and SEND_SMS with rationale dialog.',
    descriptionBn: 'Android 6.0+ এর জন্য আধুনিক ActivityResultContracts দিয়ে রানটাইম পারমিশন হ্যান্ডলার।',
    code: `package com.example.smsmanager.util

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat

class PermissionHandler(private val activity: ComponentActivity) {

    private val requiredPermissions = arrayOf(
        Manifest.permission.READ_SMS,
        Manifest.permission.RECEIVE_SMS,
        Manifest.permission.SEND_SMS
    )

    fun hasAllPermissions(context: Context): Boolean {
        return requiredPermissions.all {
            ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    /**
     * রানটাইম পারমিশন রিকোয়েস্ট লঞ্চার
     */
    fun registerPermissionLauncher(
        onGranted: () -> Unit,
        onDenied: (List<String>) -> Unit
    ) = activity.registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val deniedList = permissions.filter { !it.value }.keys.toList()
        if (deniedList.isEmpty()) {
            onGranted()
        } else {
            onDenied(deniedList)
        }
    }
}`
  },
  {
    id: 'sms_sender',
    title: 'SmsSenderHelper.kt',
    titleBn: 'এসএমএস পাঠানো (SEND_SMS / SmsManager)',
    filePath: 'app/src/main/java/com/example/smsmanager/util/SmsSenderHelper.kt',
    language: 'kotlin',
    description: 'Utilizes Android SmsManager to dispatch SMS messages with Sent and Delivered PendingIntents.',
    descriptionBn: 'SmsManager ব্যবহার করে সরাসরি রিপ্লাই বা নতুন মেসেজ পাঠানোর বাস্তবায়ন।',
    code: `package com.example.smsmanager.util

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telephony.SmsManager

object SmsSenderHelper {

    /**
     * সরাসরি এসএমএস সেন্ড করার মেথড
     */
    fun sendSms(
        context: Context,
        destinationAddress: String,
        messageText: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        try {
            val smsManager: SmsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                context.getSystemService(SmsManager::class.java)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }

            // বড় মেসেজের ক্ষেত্রে ডিভাইড করা
            val parts = smsManager.divideMessage(messageText)
            
            if (parts.size > 1) {
                smsManager.sendMultipartTextMessage(
                    destinationAddress, null, parts, null, null
                )
            } else {
                smsManager.sendTextMessage(
                    destinationAddress, null, messageText, null, null
                )
            }

            onSuccess()
        } catch (e: Exception) {
            onError(e.localizedMessage ?: "Failed to send SMS")
        }
    }
}`
  }
];
