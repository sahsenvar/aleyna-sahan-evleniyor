/* ============================================================
   Aleyna & Şahan — Düğün Davetiyesi
   ============================================================ */

/* Düğün tarihi — Türkiye saati (UTC+3).
   15 Ağustos 2026 Cumartesi, 18:30. Tarih değişirse yalnızca bu satır. */
const WEDDING = new Date("2026-08-15T18:30:00+03:00");

/* Çeviri yardımcısı — i18n.js yüklüyse aktif dilden, değilse anahtarı döndürür. */
const t = (k) => (window.t ? window.t(k) : k);

/* ---------- Geri sayım ---------- */
const cdEls = {
  days: document.querySelector('[data-cd="days"]'),
  hours: document.querySelector('[data-cd="hours"]'),
  minutes: document.querySelector('[data-cd="minutes"]'),
  seconds: document.querySelector('[data-cd="seconds"]'),
};

function pad(n) { return String(n).padStart(2, "0"); }

function tickCountdown() {
  const diff = WEDDING - new Date();

  if (diff <= 0) {
    cdEls.days.textContent = cdEls.hours.textContent =
      cdEls.minutes.textContent = cdEls.seconds.textContent = "00";
    return;
  }
  const s = Math.floor(diff / 1000);
  cdEls.days.textContent = pad(Math.floor(s / 86400));
  cdEls.hours.textContent = pad(Math.floor((s % 86400) / 3600));
  cdEls.minutes.textContent = pad(Math.floor((s % 3600) / 60));
  cdEls.seconds.textContent = pad(s % 60);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ---------- "Hatırlatıcı al" → takvime ekle (.ics) ---------- */
function icsStamp(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

document.getElementById("addCalendar").addEventListener("click", () => {
  const end = new Date(WEDDING.getTime() + 2 * 60 * 60 * 1000); // +2 saat
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aleyna & Sahan//Dugun//TR",
    "BEGIN:VEVENT",
    "UID:" + WEDDING.getTime() + "@aleyna-sahan",
    "DTSTAMP:" + icsStamp(new Date()),
    "DTSTART:" + icsStamp(WEDDING),
    "DTEND:" + icsStamp(end),
    "SUMMARY:" + t("ics.summary"),
    "LOCATION:Sabancı Öğretmenevi, Göksu Küçüksu Cd. No:10, 34815 Beykoz/İstanbul",
    "DESCRIPTION:" + t("ics.desc"),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aleyna-sahan-dugun.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

/* ---------- Supabase istemcisi (RSVP + sonra anılar için ortak) ---------- */
const sb =
  window.supabase && window.SUPABASE_URL
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY)
    : null;

/* ---------- RSVP formu (Turnstile varsa sunucu-doğrulamalı, yoksa doğrudan) ---------- */
const form = document.getElementById("rsvp");

/* Cloudflare Turnstile: site key varsa etkin → rsvp-submit Edge Function (token sunucuda
   doğrulanır). Key boşsa Turnstile devre dışı, RSVP eski (doğrudan insert) yoldan çalışır. */
const TS_SITEKEY = (window.TURNSTILE_SITE_KEY || "").trim();
const tsEnabled = TS_SITEKEY.length > 0;
let tsWidgetId = null;

(function renderTurnstile() {
  if (!tsEnabled) return;
  const box = document.getElementById("turnstileBox");
  if (!box) return;
  if (window.turnstile && typeof window.turnstile.render === "function") {
    box.hidden = false;
    tsWidgetId = window.turnstile.render(box, { sitekey: TS_SITEKEY, theme: "light" });
  } else {
    setTimeout(renderTurnstile, 200); // api.js henüz yüklenmedi → tekrar dene
  }
})();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ad = document.getElementById("adsoyad").value.trim();
  const durum = document.getElementById("durum").value;
  const kisi = document.getElementById("kisi").value;
  const note = document.getElementById("not").value.trim();

  if (!ad || !durum) {
    alert(t("rsvp.validate"));
    return;
  }

  let gid = localStorage.getItem("guest_id");
  if (!gid) { gid = crypto.randomUUID(); localStorage.setItem("guest_id", gid); }

  let token = "";
  if (tsEnabled) {
    token = window.turnstile && tsWidgetId != null ? (window.turnstile.getResponse(tsWidgetId) || "") : "";
    if (!token) { alert(t("rsvp.botCheck")); return; }
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const oldText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = t("rsvp.sending");

  try {
    if (!sb) throw new Error(t("rsvp.noServer"));
    if (tsEnabled) {
      const { data, error } = await sb.functions.invoke("rsvp-submit", {
        body: { ad_soyad: ad, durum: durum, kisi: kisi, not_metni: note, guest_id: gid, turnstileToken: token },
      });
      if (error) throw error;
      if (!data || !data.ok) throw new Error((data && data.error) || "rsvp_failed");
    } else {
      const { error } = await sb.from("rsvp").insert({
        ad_soyad: ad,
        durum: durum,
        kisi: kisi === "" ? null : Number(kisi),
        not_metni: note || null,
        guest_id: gid,
      });
      if (error) throw error;
    }
    form.hidden = true;
    document.getElementById("thanks").hidden = false;
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = oldText;
    if (tsEnabled && window.turnstile && tsWidgetId != null) window.turnstile.reset(tsWidgetId); // token tek kullanımlık
    alert(t("rsvp.error") + "\n(" + (err.message || err) + ")");
  }
});

/* ---------- Anı Albümü (davetli yükleme: foto / video / sesli not) ----------
   NOT: addMemory() tek ekleme noktası. Backend (ör. Firebase Storage) bağlanınca
   yalnızca burada dosyayı yükleyip dönen kalıcı URL'i kullanmak yeterli olacak. */
(function () {
  const grid = document.getElementById("albumGrid");
  const empty = document.getElementById("albumEmpty"); // kaldırıldıysa null olabilir
  if (!grid) return;

  const refreshEmpty = () => { if (empty) empty.hidden = grid.children.length > 0; };
  const fmtDur = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  /* ---- Kart render (paylaşımlı albüm; misafir silmesi yok) ---- */
  function addMemory({ type, url, duration, prepend = true }) {
    const fig = document.createElement("figure");
    fig.className = "mem mem--" + type;

    if (type === "photo") {
      fig.innerHTML = '<img src="' + url + '" alt="' + t("mem.alt") + '" loading="lazy" />';
    } else if (type === "video") {
      fig.innerHTML = '<video src="' + url + '" controls playsinline preload="metadata"></video>';
    } else {
      fig.innerHTML =
        '<button class="voice" type="button" aria-label="' + t("mem.voiceAria") + '">' +
          '<span class="voice__icon" aria-hidden="true">🎙️</span>' +
          '<span class="voice__play" aria-hidden="true">▶</span>' +
          '<span class="voice__time">' + fmtDur(duration || 0) + "</span>" +
        "</button>" +
        '<audio src="' + url + '" preload="none"></audio>';
      const audio = fig.querySelector("audio");
      const playIcon = fig.querySelector(".voice__play");
      fig.querySelector(".voice").addEventListener("click", () => {
        if (audio.paused) { audio.play(); playIcon.textContent = "⏸"; }
        else { audio.pause(); playIcon.textContent = "▶"; }
      });
      audio.addEventListener("ended", () => { playIcon.textContent = "▶"; });
    }

    if (prepend) grid.prepend(fig); else grid.appendChild(fig);
    refreshEmpty();
    return fig;
  }

  /* ---- Yükleniyor kartı (geçici) ---- */
  function addUploadingCard() {
    const fig = document.createElement("figure");
    fig.className = "mem mem--uploading";
    fig.innerHTML = '<div class="mem__spin" role="status" aria-label="' + t("mem.uploadingAria") + '"></div>';
    grid.prepend(fig);
    refreshEmpty();
    return fig;
  }

  /* ---- Foto sıkıştırma (≤1600px, jpeg) ---- */
  async function compressImage(file) {
    if (!file.type || !file.type.startsWith("image/")) return file;
    try {
      const bmp = await createImageBitmap(file);
      const max = 1600;
      let w = bmp.width, h = bmp.height;
      if (w > max || h > max) { const s = Math.min(max / w, max / h); w = Math.round(w * s); h = Math.round(h * s); }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(bmp, 0, 0, w, h);
      const blob = await new Promise((res) => c.toBlob(res, "image/jpeg", 0.82));
      return blob || file;
    } catch (_) { return file; }
  }

  /* ---- Tek yükleme noktası: Edge Function → R2 → Supabase ---- */
  async function uploadMemory(fileOrBlob, type, ext, duration) {
    if (!sb) { alert(t("rsvp.noServer")); return; }
    const card = addUploadingCard();
    try {
      let body = fileOrBlob;
      if (type === "photo") { body = await compressImage(fileOrBlob); ext = "jpg"; }
      const contentType = body.type || (type === "voice" ? "audio/webm" : "application/octet-stream");

      const { data, error } = await sb.functions.invoke("r2-upload-url", { body: { type, ext } });
      if (error) throw error;
      if (!data || !data.uploadUrl) throw new Error((data && data.error) || t("up.noUrl"));

      const put = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body });
      if (!put.ok) throw new Error(t("up.r2err") + " (" + put.status + ")");

      const publicUrl = window.R2_PUBLIC_URL + "/" + data.key;
      const { error: insErr } = await sb.from("memories").insert({
        type, url: publicUrl, r2_key: data.key, duration: duration != null ? duration : null,
        guest_id: localStorage.getItem("guest_id") || null,
      });
      if (insErr) throw insErr;

      card.remove();
      addMemory({ type, url: publicUrl, duration, prepend: true });
    } catch (e) {
      card.remove();
      alert(t("up.error") + "\n(" + (e.message || e) + ")");
    }
  }

  /* --- Foto / Video dosya seçimi --- */
  function wireFileInput(btnId, inputId, type) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;
    btn.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      Array.from(input.files || []).forEach((file) => {
        const ext = type === "photo" ? "jpg" : (file.name.split(".").pop() || (type === "video" ? "mp4" : "bin"));
        uploadMemory(file, type, ext);
      });
      input.value = "";
    });
  }
  wireFileInput("addPhoto", "photoInput", "photo");
  wireFileInput("addVideo", "videoInput", "video");

  /* --- Sesli not: MediaRecorder ile tarayıcıda kayıt --- */
  const recorder = document.getElementById("recorder");
  const recStart = document.getElementById("recStart");
  const recStop = document.getElementById("recStop");
  const recSave = document.getElementById("recSave");
  const recCancel = document.getElementById("recCancel");
  const recTime = document.getElementById("recTime");
  const recHint = document.getElementById("recHint");
  const recDot = document.getElementById("recDot");
  const recPreview = document.getElementById("recPreview");
  const addVoiceBtn = document.getElementById("addVoice");

  let mediaRecorder = null;
  let chunks = [];
  let timer = null;
  let seconds = 0;
  let recordedUrl = null;
  let recordedBlob = null;

  const fmt = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");

  function resetRecorderUI() {
    if (timer) clearInterval(timer);
    recDot.classList.remove("is-on");
    recTime.textContent = "0:00";
    seconds = 0;
    recHint.textContent = t("rec.hint");
    recPreview.hidden = true;
    recPreview.removeAttribute("src");
    recStart.hidden = false;
    recStop.hidden = true;
    recSave.hidden = true;
    recCancel.hidden = true;
    if (recordedUrl) { URL.revokeObjectURL(recordedUrl); recordedUrl = null; }
    recordedBlob = null;
  }

  if (addVoiceBtn && recorder) {
    addVoiceBtn.addEventListener("click", () => {
      recorder.hidden = !recorder.hidden;
      if (!recorder.hidden) resetRecorderUI();
    });

    recStart.addEventListener("click", async () => {
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        alert(t("rec.noSupport"));
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          recordedBlob = new Blob(chunks, { type: (chunks[0] && chunks[0].type) || "audio/webm" });
          recordedUrl = URL.createObjectURL(recordedBlob);
          recPreview.src = recordedUrl;
          recPreview.hidden = false;
          recSave.hidden = false;
          recCancel.hidden = false;
        };
        mediaRecorder.start();
        recStart.hidden = true;
        recStop.hidden = false;
        recDot.classList.add("is-on");
        recHint.textContent = t("rec.recording");
        seconds = 0;
        recTime.textContent = "0:00";
        timer = setInterval(() => {
          seconds++;
          recTime.textContent = fmt(seconds);
          if (seconds >= 120) recStop.click(); // en fazla 2 dk
        }, 1000);
      } catch (e) {
        alert(t("rec.micPerm"));
      }
    });

    recStop.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
      if (timer) clearInterval(timer);
      recStop.hidden = true;
      recDot.classList.remove("is-on");
      recHint.textContent = t("rec.preview");
    });

    recSave.addEventListener("click", () => {
      const blob = recordedBlob;
      const dur = seconds;
      recorder.hidden = true;
      resetRecorderUI();
      if (blob) uploadMemory(blob, "voice", "webm", dur);
    });

    recCancel.addEventListener("click", () => { resetRecorderUI(); recorder.hidden = true; });
  }

  /* ---- ÖZEL albüm: misafir başkalarının anılarını GÖRMEZ.
     Yalnızca bu oturumda kendi eklediklerini görür (yukarıdaki addMemory).
     Çift, tüm anıları 'gallery.html' (admin) üzerinden görür. ---- */
  refreshEmpty();
})();

/* ---------- Kaydırınca beliren bölümler ---------- */
const revealTargets = document.querySelectorAll(
  ".section__title, .event-card, .map, .rsvp"
);
revealTargets.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealTargets.forEach((el) => io.observe(el));

/* ---------- Arka plan müziği (sol üst floating buton) ----------
   Açılışta otomatik çalmayı dener; tarayıcı engellerse ilk
   kullanıcı etkileşiminde başlar. Butona dokununca aç/kapat. */
(function () {
  const audio = document.getElementById("bgMusic");
  const btn = document.getElementById("musicToggle");
  const dock = document.getElementById("musicDock");
  if (!audio || !btn) return;

  let userMuted = false;

  // İlk dokunuşa/müzik başlangıcına kadar nabız + "🎵 dokun" ipucu; sonra kaldır.
  const clearHint = () => { if (dock) dock.classList.remove("is-hint"); };

  const reflect = () => {
    const on = !audio.paused;
    btn.classList.toggle("is-playing", on);
    btn.classList.toggle("is-off", !on);
    btn.setAttribute("aria-pressed", String(on));
    if (on) clearHint();
  };
  const start = () => audio.play().then(reflect).catch(reflect);

  btn.addEventListener("click", () => {
    clearHint();   // butonu buldu — ipucu görevini tamamladı
    if (audio.paused) { userMuted = false; start(); }
    else { userMuted = true; audio.pause(); reflect(); }
  });

  const events = ["pointerdown", "touchstart", "touchend", "click", "keydown", "scroll"];
  const kick = (e) => {
    if (e && e.target && e.target.closest && e.target.closest(".music-toggle")) return;
    if (audio.paused && !userMuted) start();
    if (!audio.paused) events.forEach((ev) => window.removeEventListener(ev, kick));
  };
  events.forEach((ev) => window.addEventListener(ev, kick, { passive: true }));

  start();   // açılışta dene
  reflect();
})();
