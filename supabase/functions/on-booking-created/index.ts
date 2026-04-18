// Supabase Edge Function — triggered by Database Webhook on bookings INSERT
// Sends email (Resend) + WhatsApp/SMS (Twilio) to parking owner

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') ?? '';
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') ?? '';
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER') ?? '';
const FROM_EMAIL = 'ShareParks <noreply@shareparks.com>';

interface BookingPayload {
  type: 'INSERT';
  table: 'bookings';
  record: {
    id: string;
    parking_id: string;
    renter_id: string;
    start_timestamp: string;
    end_timestamp: string;
    total_price: number;
    status: string;
  };
}

Deno.serve(async (req) => {
  try {
    const payload: BookingPayload = await req.json();
    const booking = payload.record;

    // Only trigger on new bookings
    if (payload.type !== 'INSERT') {
      return new Response('skip', { status: 200 });
    }

    // Init Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Get parking + owner details
    const { data: parking } = await supabase
      .from('parkings')
      .select('address, city, owner_id')
      .eq('id', booking.parking_id)
      .single();

    if (!parking) {
      return new Response('parking not found', { status: 404 });
    }

    const { data: owner } = await supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', parking.owner_id)
      .single();

    // Get owner email from auth.users
    const { data: authUser } = await supabase.auth.admin.getUserById(parking.owner_id);
    const ownerEmail = authUser?.user?.email;

    // Format times
    const start = new Date(booking.start_timestamp);
    const end = new Date(booking.end_timestamp);
    const formatHe = (d: Date) =>
      d.toLocaleString('he-IL', {
        timeZone: 'Asia/Jerusalem',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });

    const startStr = formatHe(start);
    const endStr = formatHe(end);
    const amount = booking.total_price;
    const address = parking.address;
    const ownerName = owner?.full_name ?? 'בעל החניה';

    // ─── Send Email via Resend ──────────────────────────────
    if (RESEND_API_KEY && ownerEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: ownerEmail,
          subject: `🅿️ הזמנה חדשה — ${amount} ש"ח`,
          html: buildEmailHtml({ ownerName, address, startStr, endStr, amount }),
        }),
      });
    }

    // ─── Send WhatsApp/SMS via Twilio ───────────────────────
    if (TWILIO_ACCOUNT_SID && owner?.phone_number) {
      const phone = owner.phone_number.startsWith('+')
        ? owner.phone_number
        : `+972${owner.phone_number.replace(/^0/, '')}`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

      const smsBody = [
        `שלום ${ownerName}!`,
        `החניה שלך ב${address} הוזמנה.`,
        `${startStr} — ${endStr}`,
        `רווח: ${amount} ש"ח`,
        `— ShareParks`,
      ].join('\n');

      // Try WhatsApp first, fallback to SMS
      const whatsappBody = new URLSearchParams({
        To: `whatsapp:${phone}`,
        From: `whatsapp:${TWILIO_FROM_NUMBER}`,
        Body: smsBody,
      });

      const whatsappRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}` },
        body: whatsappBody,
      });

      // Fallback to SMS if WhatsApp fails
      if (!whatsappRes.ok) {
        await fetch(twilioUrl, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}` },
          body: new URLSearchParams({
            To: phone,
            From: TWILIO_FROM_NUMBER,
            Body: smsBody,
          }),
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge Function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ─── Email Template ─────────────────────────────────────────
function buildEmailHtml(params: {
  ownerName: string;
  address: string;
  startStr: string;
  endStr: string;
  amount: number;
}) {
  const { ownerName, address, startStr, endStr, amount } = params;
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,sans-serif;">
  <div style="max-width:480px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;">
    <!-- Header -->
    <div style="background:#000;padding:24px 28px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:#f97316;border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-size:18px;font-weight:900;">P</span>
        </div>
        <span style="color:#fff;font-size:18px;font-weight:700;">ShareParks</span>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:28px;">
      <h1 style="color:#000;font-size:22px;margin:0 0 8px;">הזמנה חדשה!</h1>
      <p style="color:#6b7280;font-size:15px;margin:0 0 20px;">
        שלום ${ownerName}, יש לך הזמנה חדשה.
      </p>

      <!-- Details card -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:14px;">כתובת</td>
            <td style="padding:6px 0;color:#000;font-size:14px;font-weight:700;text-align:left;">${address}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:14px;">התחלה</td>
            <td style="padding:6px 0;color:#000;font-size:14px;font-weight:700;text-align:left;">${startStr}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;font-size:14px;">סיום</td>
            <td style="padding:6px 0;color:#000;font-size:14px;font-weight:700;text-align:left;">${endStr}</td>
          </tr>
        </table>
      </div>

      <!-- Earnings highlight -->
      <div style="background:#fff7ed;border:2px solid #f97316;border-radius:12px;padding:20px;text-align:center;">
        <p style="color:#6b7280;font-size:13px;margin:0 0 4px;">הרווחת</p>
        <p style="color:#000;font-size:36px;font-weight:900;margin:0;">
          ${amount}
          <span style="font-size:16px;color:#6b7280;"> ש"ח</span>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
        ShareParks — חניה שיתופית חכמה
      </p>
    </div>
  </div>
</body>
</html>`;
}
