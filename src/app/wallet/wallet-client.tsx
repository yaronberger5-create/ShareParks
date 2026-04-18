'use client';

import { useState, useTransition } from 'react';
import { requestWithdrawal } from '@/actions/wallet-actions';
import {
  Wallet,
  ArrowDownToLine,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Check,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface WalletClientProps {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  transactions: Transaction[];
  pendingWithdrawals: Withdrawal[];
}

export function WalletClient({
  balance: initialBalance,
  totalEarned,
  totalWithdrawn,
  transactions,
  pendingWithdrawals,
}: WalletClientProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Withdrawal form
  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [branch, setBranch] = useState('');
  const [account, setAccount] = useState('');

  function handleWithdraw() {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    setError(null);
    startTransition(async () => {
      const result = await requestWithdrawal({
        amount: numAmount,
        bankCode,
        branchNumber: branch,
        accountNumber: account,
      });

      if (result.success) {
        setBalance(result.newBalance ?? balance - numAmount);
        setWithdrawSuccess(true);
        setShowWithdraw(false);
        setAmount('');
      } else {
        setError(result.error);
      }
    });
  }

  const typeLabels: Record<string, { label: string; color: string }> = {
    booking_earning: { label: 'הכנסה', color: 'text-green-600' },
    platform_fee: { label: 'עמלה', color: 'text-gray-400' },
    overtime_earning: { label: 'overtime', color: 'text-orange-500' },
    refund: { label: 'החזר', color: 'text-red-500' },
    withdrawal: { label: 'משיכה', color: 'text-black' },
    adjustment: { label: 'התאמה', color: 'text-gray-500' },
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white px-5 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Wallet size={16} className="text-white" />
            </div>
            <h1 className="text-lg font-bold">ארנק</h1>
          </div>
          <span className="text-xs text-gray-500">ShareParks</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Balance card */}
        <div className="bg-black rounded-3xl p-6 text-white">
          <p className="text-sm text-gray-400 mb-1">יתרה זמינה</p>
          <p className="text-4xl font-black mb-6">
            {balance.toLocaleString('he-IL')}
            <span className="text-lg font-medium text-gray-400 mr-1">ש"ח</span>
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <TrendingUp size={12} />
                <span>סה"כ הכנסות</span>
              </div>
              <p className="text-lg font-bold">{totalEarned.toLocaleString('he-IL')} ש"ח</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <ArrowUpRight size={12} />
                <span>סה"כ משיכות</span>
              </div>
              <p className="text-lg font-bold">{totalWithdrawn.toLocaleString('he-IL')} ש"ח</p>
            </div>
          </div>

          {/* Withdraw button */}
          <button
            onClick={() => setShowWithdraw(!showWithdraw)}
            disabled={balance < 50}
            className="
              w-full mt-5 py-3.5 rounded-2xl bg-orange-500 text-white text-base font-black
              shadow-lg shadow-orange-500/30 transition-all active:scale-[0.97]
              disabled:opacity-30 disabled:shadow-none
            "
          >
            <ArrowDownToLine size={18} className="inline ml-2" />
            משוך לחשבון הבנק
          </button>
          {balance < 50 && balance > 0 && (
            <p className="text-xs text-gray-500 text-center mt-2">מינימום משיכה: 50 ש"ח</p>
          )}
        </div>

        {/* Success message */}
        {withdrawSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <Check size={20} className="text-green-600" />
            <p className="text-sm font-bold text-green-700">בקשת המשיכה נשלחה! הכסף יגיע תוך 1-3 ימי עסקים.</p>
          </div>
        )}

        {/* Withdraw form */}
        {showWithdraw && (
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
            <h3 className="font-bold text-black">משיכה לחשבון בנק</h3>

            <label>
              <span className="text-xs text-gray-500 block mb-1">סכום (ש"ח)</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={balance}
                min={50}
                placeholder="100"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
              />
            </label>

            <div className="grid grid-cols-3 gap-2">
              <label>
                <span className="text-xs text-gray-500 block mb-1">בנק</span>
                <input
                  type="text"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  placeholder="12"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
                />
              </label>
              <label>
                <span className="text-xs text-gray-500 block mb-1">סניף</span>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="456"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
                />
              </label>
              <label>
                <span className="text-xs text-gray-500 block mb-1">חשבון</span>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-base bg-white"
                />
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setShowWithdraw(false)}
                className="py-3 rounded-xl bg-gray-100 text-gray-500 font-bold active:scale-95 transition-all"
              >
                ביטול
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isPending || !amount || !bankCode || !branch || !account}
                className="py-3 rounded-xl bg-black text-white font-bold active:scale-95 transition-all disabled:opacity-40"
              >
                {isPending ? 'שולח...' : 'אישור משיכה'}
              </button>
            </div>
          </div>
        )}

        {/* Pending withdrawals */}
        {pendingWithdrawals.length > 0 && (
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4">
            <p className="text-sm font-bold text-orange-600 mb-2">משיכות בתהליך</p>
            {pendingWithdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-orange-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(w.created_at).toLocaleDateString('he-IL')}
                  </span>
                </div>
                <span className="font-bold text-black">{w.amount} ש"ח</span>
              </div>
            ))}
          </div>
        )}

        {/* Transactions list */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="font-bold text-black">היסטוריית תנועות</h3>
          </div>
          {transactions.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <Wallet size={28} className="mx-auto mb-2" />
              <p className="text-sm">אין תנועות</p>
            </div>
          ) : (
            <div>
              {transactions.map((tx) => {
                const meta = typeLabels[tx.type] ?? { label: tx.type, color: 'text-gray-500' };
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
                        <span className="text-xs text-gray-300">
                          {new Date(tx.created_at).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                      {tx.description && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">{tx.description}</p>
                      )}
                    </div>
                    <span className={`text-base font-black tabular-nums ${isPositive ? 'text-green-600' : 'text-black'}`}>
                      {isPositive ? '+' : ''}{tx.amount} ש"ח
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <div className="h-8" />
    </div>
  );
}
