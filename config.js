/* ============================================================
   Public yapılandırma (gizli DEĞİL — frontend'e gömülür).
   Supabase anon/publishable anahtarı tarayıcıda olması için tasarlanmıştır;
   güvenlik RLS politikalarıyla sağlanır.  R2 ayarları Faz 2'de eklenecek.
   ============================================================ */
window.SUPABASE_URL = "https://spwqecsffboighddyhrs.supabase.co";
// anon (public) JWT — hem DB (RLS) hem Edge Function (verify_jwt) için
window.SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwd3FlY3NmZmJvaWdoZGR5aHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjQzMDMsImV4cCI6MjA5NzYwMDMwM30.gBhyKBZ89MPsmS-ylYFURQQan3H2jvBoAd_amV9RnSo";

// Cloudflare R2 — public görüntüleme adresi (gizli değil)
window.R2_PUBLIC_URL = "https://pub-20d6ee946bbc4873a59e37d7761e6f62.r2.dev";

// Cloudflare Turnstile — site key (PUBLIC, gizli değil). Boşken Turnstile devre dışı,
// RSVP eski (doğrudan) yoldan çalışır. Gerçek key girilince + TURNSTILE_SECRET
// Supabase'de ayarlanınca, RSVP otomatik olarak sunucu-doğrulamalı yola geçer.
window.TURNSTILE_SITE_KEY = "";
