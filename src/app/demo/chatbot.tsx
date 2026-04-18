'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  from: 'user' | 'bot';
  text: string;
}

const QUICK_REPLIES = [
  'איך מזמינים חניה?',
  'איך מוסיפים חניה להשכרה?',
  'מה קורה אם החניה תפוסה?',
  'איך עובד התשלום?',
];

const BOT_ANSWERS: Record<string, string> = {
  'איך מזמינים חניה?': 'פשוט מאוד! לחץ על "חפש חניה", אשר מיקום GPS, בחר משך חניה, ותראה רשימה של חניות זמינות ליד המיקום שלך. לחץ על חניה → "הזמן" → "אישור ותשלום". השער ייפתח אוטומטית! 🅿️',
  'איך מוסיפים חניה להשכרה?': 'לחץ "יש לי חניה להשכרה" בדף הבית. מלא כתובת, צלם את החניה, הגדר מחיר ושעות זמינות — ותתחיל להרוויח! ההרשמה לוקחת 3 דקות. 💰',
  'מה קורה אם החניה תפוסה?': 'אם הגעת והחניה תפוסה — לחץ "דיווח על בעיה" → "החניה תפוסה". ההזמנה תבוטל אוטומטית ותקבל החזר מלא מיידי. 🛡️',
  'איך עובד התשלום?': 'התשלום מאובטח דרך כרטיס אשראי. כבעל חניה — הכסף נכנס לארנק שלך ואפשר למשוך לחשבון הבנק בכל רגע. עמלת ShareParks: 10% בלבד. 💳',
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: 'bot', text: 'שלום! 👋 אני הבוט של ShareParks. איך אפשר לעזור?' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend(text: string) {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now(), from: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Bot reply
    setTimeout(() => {
      const answer = BOT_ANSWERS[text] ?? 'תודה על השאלה! צוות ShareParks יחזור אליך בהקדם. בינתיים, תוכל לחפש תשובה בשאלות המהירות למטה. 😊';
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: answer }]);
    }, 800);
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-orange-500 text-white shadow-xl shadow-orange-200 flex items-center justify-center text-2xl active:scale-90 transition-transform"
        >
          💬
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-0 inset-x-0 z-50 max-w-md mx-auto" dir="rtl">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-gray-800/20 z-40" onClick={() => setIsOpen(false)} />

          <div className="relative z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col" style={{ height: '70dvh' }}>
            {/* Header */}
            <div className="bg-gray-800 rounded-t-3xl px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-sm font-black text-white">P</div>
                <div>
                  <p className="text-white font-bold text-sm">ShareParks Bot</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <p className="text-[10px] text-gray-400">מקוון</p>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 text-lg p-1">✕</button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-orange-500 text-white rounded-bl-sm'
                      : 'bg-gray-100 text-black rounded-br-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-t border-gray-100">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold whitespace-nowrap active:bg-orange-100 shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="כתוב הודעה..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-orange-400"
              />
              <button
                type="button"
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center active:scale-90 disabled:opacity-40"
              >
                📤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
