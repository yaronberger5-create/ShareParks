'use client';

import { useState } from 'react';

export function WalletInteractive() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawDone, setWithdrawDone] = useState(false);

  const balance = 840;
  const fee = Math.round(balance * 0.1);
  const vat = Math.round(fee * 0.17);
  const totalFee = fee + vat;
  const netAmount = balance - totalFee;

  return (
    <>
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-center relative">
        <a href="/" className="absolute right-4 top-3 text-gray-400 text-sm py-1">חזרה →</a>
        <h1 className="text-lg font-bold">💰 ארנק</h1>
      </div>
      <div className="px-4 py-6 space-y-5">
        <div className="bg-gray-800 rounded-3xl p-6 text-white">
          <p className="text-sm text-gray-400 mb-1">יתרה זמינה</p>
          <p className="text-4xl font-black mb-6">840 <span className="text-lg text-gray-400">ש״ח</span></p>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">📈 סה״כ הכנסות</p>
              <p className="text-lg font-bold">3,240 ש״ח</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">📤 סה״כ משיכות</p>
              <p className="text-lg font-bold">2,400 ש״ח</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowWithdraw(true)}
            className="w-full py-3.5 rounded-2xl bg-orange-500 text-white text-base font-black text-center shadow-lg shadow-orange-500/30 active:scale-[0.97] transition-transform"
          >
            ⬇️ משוך לחשבון הבנק
          </button>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100"><h3 className="font-bold text-black">היסטוריית תנועות</h3></div>
          {[
            { type: 'הכנסה', c: 'text-green-600', amount: '+45', desc: 'חניה ברחוב הרצל', d: 'היום' },
            { type: 'עמלה', c: 'text-gray-400', amount: '-4.50', desc: 'עמלת פלטפורמה 10%', d: 'היום' },
            { type: 'הכנסה', c: 'text-green-600', amount: '+60', desc: 'חניה ברחוב הרצל', d: 'אתמול' },
            { type: 'משיכה', c: 'text-black', amount: '-500', desc: 'משיכה לבנק', d: '12/04' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${tx.c}`}>{tx.type}</span>
                  <span className="text-xs text-gray-300">{tx.d}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{tx.desc}</p>
              </div>
              <span className={`text-base font-black ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-black'}`}>{tx.amount} ש״ח</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Withdrawal Popup ─── */}
      {showWithdraw && (
        <>
          <div className="fixed inset-0 z-50 bg-gray-800/50 backdrop-blur-sm" onClick={() => setShowWithdraw(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden" dir="rtl">
            {!withdrawDone ? (
              <>
                {/* Header */}
                <div className="bg-gray-800 px-6 py-5 text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">🏦</span>
                  </div>
                  <h2 className="text-xl font-black text-white">משיכת כספים</h2>
                  <p className="text-sm text-gray-400 mt-1">העברה לחשבון הבנק שלך</p>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {/* Schedule info */}
                  <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
                    <h3 className="text-sm font-bold text-blue-800 mb-2">📅 מועדי משיכה</h3>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      ב-ShareParks, משיכת כספים מתבצעת באופן מסודר ב-<strong>שלושה מועדים קבועים בחודש</strong>:
                    </p>
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 bg-white rounded-xl border border-blue-200 py-2 text-center">
                        <p className="text-lg font-black text-blue-800">10</p>
                        <p className="text-[10px] text-blue-500">לחודש</p>
                      </div>
                      <div className="flex-1 bg-white rounded-xl border border-blue-200 py-2 text-center">
                        <p className="text-lg font-black text-blue-800">20</p>
                        <p className="text-[10px] text-blue-500">לחודש</p>
                      </div>
                      <div className="flex-1 bg-white rounded-xl border border-blue-200 py-2 text-center">
                        <p className="text-lg font-black text-blue-800">30</p>
                        <p className="text-[10px] text-blue-500">לחודש</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">הכספים יועברו לחשבונך תוך 1-3 ימי עסקים מהמועד שנבחר.</p>
                  </div>

                  {/* Fee breakdown */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-black mb-3">💰 פירוט המשיכה</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">יתרה זמינה</span>
                        <span className="text-sm font-bold text-black">₪{balance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">עמלת ShareParks (10%)</span>
                        <span className="text-sm text-red-500">-₪{fee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">מע״מ על העמלה (17%)</span>
                        <span className="text-sm text-red-500">-₪{vat}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <span className="text-sm font-bold text-black">סה״כ עמלה + מע״מ</span>
                        <span className="text-sm font-bold text-red-500">-₪{totalFee}</span>
                      </div>
                      <div className="border-t-2 border-gray-300 pt-2 flex justify-between">
                        <span className="text-base font-black text-black">סכום נטו לחשבונך</span>
                        <span className="text-xl font-black text-green-600">₪{netAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next date */}
                  <div className="bg-orange-50 rounded-xl border border-orange-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📆</span>
                      <div>
                        <p className="text-sm font-bold text-orange-800">המועד הקרוב: 20 לחודש</p>
                        <p className="text-xs text-orange-600">תוך 2 ימים — הכספים יועברו אוטומטית</p>
                      </div>
                    </div>
                  </div>

                  {/* Fine print */}
                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    העמלה (10%) מנוכה לפני מע״מ. המע״מ (17%) מחושב על סכום העמלה בלבד.
                    <br />משיכה מינימלית: ₪50. חשבון בנק מאומת נדרש.
                  </p>

                  {/* Buttons */}
                  <button
                    type="button"
                    onClick={() => setWithdrawDone(true)}
                    className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform"
                  >
                    ✓ אשר משיכה — ₪{netAmount}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWithdraw(false)}
                    className="w-full py-2 text-sm text-gray-400 text-center"
                  >
                    ביטול
                  </button>
                </div>
              </>
            ) : (
              <div className="px-6 py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
                <h2 className="text-xl font-black text-black mb-2">בקשת המשיכה נקלטה!</h2>
                <p className="text-sm text-gray-500 mb-1">₪{netAmount} יועברו לחשבון הבנק שלך</p>
                <p className="text-xs text-gray-400 mb-6">במועד הקרוב — 20 לחודש (תוך 1-3 ימי עסקים)</p>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 mb-6 text-right">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">סכום ברוטו</span>
                    <span className="text-black font-bold">₪{balance}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">עמלה + מע״מ</span>
                    <span className="text-red-500">-₪{totalFee}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-gray-200 pt-1">
                    <span className="text-black font-bold">נטו</span>
                    <span className="text-green-600 font-bold">₪{netAmount}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowWithdraw(false); setWithdrawDone(false); }}
                  className="w-full py-3 rounded-2xl bg-gray-800 text-white text-base font-bold text-center active:scale-[0.97] transition-transform"
                >
                  סגור
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
