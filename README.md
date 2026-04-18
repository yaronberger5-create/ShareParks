# ShareParks — חניה שיתופית חכמה

מצא חניה פנויה ברגע, או השכר את שלך וצור הכנסה פסיבית.

## Stack

- **Next.js 15** (App Router)
- **Supabase** — PostgreSQL + PostGIS + Auth (OTP) + Realtime + Edge Functions
- **Tailwind CSS 4** — Flat Design (Orange / Grey / Black / White)
- **MapLibre GL** — מפה אינטראקטיבית (חינם, בלי API key)
- **Lucide React** — אייקונים

## הרצה

```bash
pnpm install
cp .env.local.example .env.local   # מלא Supabase URL + Anon Key
pnpm dev
```

## מבנה

```
src/
├── app/
│   ├── page.tsx                ← Landing page
│   ├── (auth)/                 ← Login / Register / Verify OTP
│   ├── search/                 ← חיפוש חניות (טקסטואלי)
│   ├── dashboard/              ← דשבורד בעל חניה
│   ├── add-parking/            ← הוספת חניה חדשה
│   ├── my-bookings/            ← ההזמנות שלי (נהג)
│   └── wallet/                 ← ארנק + משיכות
├── actions/                    ← 12 Server Actions
├── components/
│   ├── dashboard/              ← 6 קומפוננטות ניהול
│   ├── renter/                 ← 7 קומפוננטות נהג
│   ├── ratings/                ← כוכבי דירוג
│   ├── logo.tsx                ← ShareParks logo (CSS)
│   ├── bottom-nav.tsx          ← ניווט תחתון
│   └── app-layout.tsx          ← Layout עם header + footer
├── hooks/                      ← useUserLocation
├── lib/supabase/               ← Server + Client + Middleware
└── types/                      ← Database types

supabase/
├── migrations/                 ← 7 SQL migrations
└── functions/                  ← Edge Function (email + SMS)
```

## Deploy

```bash
vercel deploy
```

הגדר Environment Variables ב-Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
