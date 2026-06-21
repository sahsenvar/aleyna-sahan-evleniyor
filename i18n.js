/* ============================================================
   Aleyna & Şahan — Çok dilli (TR / FR / EN)
   ------------------------------------------------------------
   - Otomatik dil algılama (navigator.languages) + localStorage hafıza
   - data-i18n / data-i18n-ph / data-i18n-aria ile DOM çevirisi
   - window.t(key): JS dinamik metinleri için
   - Sağ-üst bayrak seçici (🇹🇷 🇫🇷 🇬🇧)
   - İsimler (Aleyna & Şahan) her dilde Latin/Sacramento kalır.
   ============================================================ */
(function () {
  "use strict";

  const SUPPORTED = ["tr", "fr", "en"];

  const I18N = {
    tr: {
      "meta.titleSuffix": "Düğün Davetiyesi",
      "meta.desc": "Aleyna & Şahan'ın düğün davetiyesi",
      "music.hint": "🎵 dokun",
      "music.aria": "Müziği aç/kapat",
      "hero.tagline": "Özel günler birlikte güzel..",
      "cd.aria": "Düğüne kalan süre",
      "cd.days": "GÜN",
      "cd.hours": "SAAT",
      "cd.minutes": "DAKİKA",
      "cd.seconds": "SANİYE",
      "cta.calendar": "Hatırlatıcı al",
      "scroll.cue": "Aşağı kaydırınız.",
      "meet.title": "Ne zaman & Nerede",
      "event.type": "Düğün",
      "event.date": "15 Ağustos 2026 Cumartesi · Saat 18:30",
      "event.directions": "Yol Tarifi",
      "album.title": "Anı Albümü",
      "album.subtitle": "Bu güzel günde çektiklerinizi bizimle paylaşın 💐",
      "album.photo": "Fotoğraf",
      "album.video": "Video",
      "album.voice": "Sesli Not",
      "rec.hint": "Sesli notunuzu kaydedin",
      "rec.start": "● Kaydı Başlat",
      "rec.stop": "■ Durdur",
      "rec.save": "Albüme Ekle",
      "rec.cancel": "Vazgeç",
      "rec.recording": "Kaydediliyor…",
      "rec.preview": "Önizleyin, sonra albüme ekleyin",
      "rec.noSupport": "Tarayıcınız ses kaydını desteklemiyor.",
      "rec.micPerm": "Mikrofon izni gerekli. Lütfen tarayıcıdan izin verin.",
      "rsvp.title": "Davetli formu",
      "rsvp.name": "Ad Soyad",
      "rsvp.status": "Katılım Durumu",
      "rsvp.select": "Seçiniz",
      "rsvp.optYes": "Katılacağım",
      "rsvp.optMaybe": "Net Değil",
      "rsvp.optNo": "Üzülerek Katılmayacağım",
      "rsvp.count": "Toplam katılımcı sayısı",
      "rsvp.note": "Hatıra notunuz",
      "rsvp.send": "GÖNDER",
      "rsvp.sending": "Gönderiliyor…",
      "rsvp.thanks": "Teşekkürler! Katılım bildiriminiz alındı. 💐",
      "rsvp.validate": "Lütfen ad soyad ve katılım durumunu doldurun.",
      "rsvp.botCheck": "Güvenlik doğrulaması bekleniyor, birkaç saniye sonra tekrar deneyin.",
      "rsvp.noServer": "Sunucu bağlantısı kurulamadı.",
      "rsvp.error": "Gönderilemedi, lütfen tekrar deneyin.",
      "mem.alt": "Anı",
      "mem.voiceAria": "Sesli notu oynat/duraklat",
      "mem.uploadingAria": "Yükleniyor",
      "up.noUrl": "Yükleme adresi alınamadı",
      "up.r2err": "R2 yükleme hatası",
      "up.error": "Yüklenemedi, lütfen tekrar deneyin.",
      "ics.summary": "Aleyna & Şahan — Düğün",
      "ics.desc": "Düğünümüze davetlisiniz!",
    },

    fr: {
      "meta.titleSuffix": "Faire-part de Mariage",
      "meta.desc": "Le faire-part de mariage d'Aleyna & Şahan",
      "music.hint": "🎵 appuyez",
      "music.aria": "Activer/couper la musique",
      "hero.tagline": "Les jours spéciaux sont plus beaux ensemble..",
      "cd.aria": "Temps restant avant le mariage",
      "cd.days": "JOURS",
      "cd.hours": "HEURES",
      "cd.minutes": "MINUTES",
      "cd.seconds": "SECONDES",
      "cta.calendar": "Ajouter un rappel",
      "scroll.cue": "Faites défiler",
      "meet.title": "Quand & Où",
      "event.type": "Mariage",
      "event.date": "Samedi 15 août 2026 · 18h30",
      "event.directions": "Itinéraire",
      "album.title": "Album Souvenir",
      "album.subtitle": "Partagez avec nous vos photos de ce beau jour 💐",
      "album.photo": "Photo",
      "album.video": "Vidéo",
      "album.voice": "Note vocale",
      "rec.hint": "Enregistrez votre note vocale",
      "rec.start": "● Démarrer",
      "rec.stop": "■ Arrêter",
      "rec.save": "Ajouter à l'album",
      "rec.cancel": "Annuler",
      "rec.recording": "Enregistrement…",
      "rec.preview": "Écoutez, puis ajoutez à l'album",
      "rec.noSupport": "Votre navigateur ne prend pas en charge l'enregistrement audio.",
      "rec.micPerm": "Autorisation du micro requise. Veuillez l'autoriser dans votre navigateur.",
      "rsvp.title": "Formulaire d'invité",
      "rsvp.name": "Nom complet",
      "rsvp.status": "Présence",
      "rsvp.select": "Choisir",
      "rsvp.optYes": "Je serai présent(e)",
      "rsvp.optMaybe": "Incertain(e)",
      "rsvp.optNo": "Malheureusement absent(e)",
      "rsvp.count": "Nombre total d'invités",
      "rsvp.note": "Votre message",
      "rsvp.send": "ENVOYER",
      "rsvp.sending": "Envoi…",
      "rsvp.thanks": "Merci ! Votre réponse a bien été reçue. 💐",
      "rsvp.validate": "Veuillez indiquer votre nom et votre présence.",
      "rsvp.botCheck": "Vérification de sécurité en cours, réessayez dans quelques secondes.",
      "rsvp.noServer": "Connexion au serveur impossible.",
      "rsvp.error": "Échec de l'envoi, veuillez réessayer.",
      "mem.alt": "Souvenir",
      "mem.voiceAria": "Lire/mettre en pause la note vocale",
      "mem.uploadingAria": "Téléchargement",
      "up.noUrl": "Impossible d'obtenir l'URL de téléchargement",
      "up.r2err": "Erreur de téléchargement R2",
      "up.error": "Échec du téléchargement, veuillez réessayer.",
      "ics.summary": "Aleyna & Şahan — Mariage",
      "ics.desc": "Vous êtes invité(e) à notre mariage !",
    },

    en: {
      "meta.titleSuffix": "Wedding Invitation",
      "meta.desc": "Aleyna & Şahan's wedding invitation",
      "music.hint": "🎵 tap",
      "music.aria": "Toggle music",
      "hero.tagline": "Special days are better together..",
      "cd.aria": "Time until the wedding",
      "cd.days": "DAYS",
      "cd.hours": "HOURS",
      "cd.minutes": "MINUTES",
      "cd.seconds": "SECONDS",
      "cta.calendar": "Add reminder",
      "scroll.cue": "Scroll down",
      "meet.title": "When & Where",
      "event.type": "Wedding",
      "event.date": "Saturday, August 15, 2026 · 6:30 PM",
      "event.directions": "Directions",
      "album.title": "Memory Album",
      "album.subtitle": "Share the moments you capture on this beautiful day 💐",
      "album.photo": "Photo",
      "album.video": "Video",
      "album.voice": "Voice Note",
      "rec.hint": "Record your voice note",
      "rec.start": "● Start Recording",
      "rec.stop": "■ Stop",
      "rec.save": "Add to Album",
      "rec.cancel": "Cancel",
      "rec.recording": "Recording…",
      "rec.preview": "Preview, then add to the album",
      "rec.noSupport": "Your browser doesn't support audio recording.",
      "rec.micPerm": "Microphone permission required. Please allow it in your browser.",
      "rsvp.title": "Guest Form",
      "rsvp.name": "Full Name",
      "rsvp.status": "Attendance",
      "rsvp.select": "Select",
      "rsvp.optYes": "I'll attend",
      "rsvp.optMaybe": "Not sure",
      "rsvp.optNo": "Sadly can't attend",
      "rsvp.count": "Total number of guests",
      "rsvp.note": "Your message",
      "rsvp.send": "SUBMIT",
      "rsvp.sending": "Sending…",
      "rsvp.thanks": "Thank you! Your RSVP has been received. 💐",
      "rsvp.validate": "Please fill in your name and attendance.",
      "rsvp.botCheck": "Security check in progress, please try again in a few seconds.",
      "rsvp.noServer": "Couldn't connect to the server.",
      "rsvp.error": "Couldn't send, please try again.",
      "mem.alt": "Memory",
      "mem.voiceAria": "Play/pause voice note",
      "mem.uploadingAria": "Uploading",
      "up.noUrl": "Couldn't get upload URL",
      "up.r2err": "R2 upload error",
      "up.error": "Upload failed, please try again.",
      "ics.summary": "Aleyna & Şahan — Wedding",
      "ics.desc": "You're invited to our wedding!",
    },
  };

  function detect() {
    const saved = localStorage.getItem("lang");
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    const navs =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || "tr"];
    for (let i = 0; i < navs.length; i++) {
      const code = String(navs[i]).toLowerCase().split("-")[0];
      if (code === "tr") return "tr";
      if (code === "fr") return "fr";
      if (code === "en") return "en";
    }
    return "en"; // uluslararası varsayılan (bayraklarla değiştirilebilir)
  }

  let lang = detect();

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.tr[key] || key;
  }

  function applyDom() {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = "ltr";

    document.title = "Aleyna & Şahan — " + t("meta.titleSuffix");
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", t("meta.desc"));

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });

    document.querySelectorAll(".lang-btn").forEach((b) => {
      const on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });

    // script.js dinamik metinleri (örn. açık kayıt arayüzü) güncelleyebilsin
    document.dispatchEvent(new CustomEvent("i18n:changed", { detail: { lang: lang } }));
  }

  function setLang(l) {
    if (SUPPORTED.indexOf(l) === -1 || l === lang) return;
    lang = l;
    try { localStorage.setItem("lang", l); } catch (_) {}
    applyDom();
  }

  // Dışa açık API
  window.i18n = {
    t: t,
    setLang: setLang,
    get lang() { return lang; },
    supported: SUPPORTED.slice(),
  };
  window.t = t;

  function wireSwitcher() {
    const dock = document.getElementById("langDock");
    if (!dock) return;
    dock.addEventListener("click", (e) => {
      const btn = e.target.closest(".lang-btn");
      if (btn) setLang(btn.getAttribute("data-lang"));
    });
  }

  // Bu script <body> sonunda yüklendiği için çevrilecek tüm elemanlar zaten parse edildi
  // → hemen uygula (dil yanıp sönmesini önler).
  wireSwitcher();
  applyDom();
})();
