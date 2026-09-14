export interface ParsedPaymentSms {
  isPaymentSms: boolean;
  method?: 'bkash' | 'nagad';
  trxId?: string;
  amount?: number;
  senderPhone?: string;
  originalSender: string;
  rawBody: string;
  confidence: number;
}

/**
 * Extracts Transaction ID, Amount (BDT), and Sender Mobile Number from bKash & Nagad SMS
 */
export function parsePaymentSms(sender: string, body: string): ParsedPaymentSms {
  const normalizedSender = sender.trim();
  const isBkashSender = /bkash/i.test(normalizedSender) || /bkash/i.test(body);
  const isNagadSender = /nagad/i.test(normalizedSender) || /nagad/i.test(body);

  const result: ParsedPaymentSms = {
    isPaymentSms: false,
    originalSender: normalizedSender,
    rawBody: body,
    confidence: 0
  };

  if (!isBkashSender && !isNagadSender) {
    // Check if the body contains strong TrxID and Tk indicators regardless of sender
    const hasTrxPattern = /(?:TrxID|TxnID)\s*[:\s]?\s*([A-Z0-9]{6,16})/i.test(body);
    const hasTkPattern = /(?:Tk|BDT)\s*[0-9,]+/i.test(body);
    if (!hasTrxPattern || !hasTkPattern) {
      return result;
    }
  }

  result.method = isNagadSender ? 'nagad' : 'bkash';

  // Extract TrxID / TxnID
  // Matches: "TrxID BLA9X192K3", "TxnID: 72H89AK3L", "TRXID: 928374AB"
  const trxMatch = body.match(/(?:TrxID|TxnID|TRXID)\s*[:\s]?\s*([A-Z0-9]{6,16})/i);
  if (trxMatch && trxMatch[1]) {
    result.trxId = trxMatch[1].toUpperCase().trim();
  }

  // Extract Amount
  // Matches: "Tk 1,500.00", "Amount: Tk 500.00", "Tk. 2,000", "BDT 1500"
  const amountMatch = body.match(/(?:Tk|Tk\.|BDT|Amount:\s*Tk|Amount:\s*Tk\.)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (amountMatch && amountMatch[1]) {
    const cleanAmountStr = amountMatch[1].replace(/,/g, '');
    const num = parseFloat(cleanAmountStr);
    if (!isNaN(num) && num > 0) {
      result.amount = num;
    }
  }

  // Extract Counterparty / Sender phone number
  // Matches: "from 01712345678", "Sender: 01812345678", "Customer: 01912345678"
  const phoneMatch = body.match(/(?:from|Sender:?|Customer:?)\s*(01[3-9]\d{8})/i);
  if (phoneMatch && phoneMatch[1]) {
    result.senderPhone = phoneMatch[1].trim();
  }

  if (result.trxId && result.amount) {
    result.isPaymentSms = true;
    result.confidence = result.senderPhone ? 1.0 : 0.85;
  }

  return result;
}

/**
 * Generate authentic mock bKash confirmation SMS
 */
export function generateBkashSms(amount: number, trxId: string, senderPhone: string = '01712345678'): string {
  const formattedAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  return `You have received Tk ${formattedAmount} from ${senderPhone}. Ref test. Fee Tk 0.00. Balance Tk 24,850.50. TrxID ${trxId} at ${dateStr} ${timeStr}`;
}

/**
 * Generate authentic mock Nagad confirmation SMS
 */
export function generateNagadSms(amount: number, trxId: string, senderPhone: string = '01812345678'): string {
  const formattedAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  return `Money Received. Amount: Tk ${formattedAmount}. Sender: ${senderPhone}. TxnID: ${trxId}. Balance: Tk 18,200.00 at ${dateStr} ${timeStr}. Nagad, A Govt. Postal Service.`;
}
