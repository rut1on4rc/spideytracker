// =========================================
// CONFIGURATION & PLAYLIST
// =========================================
const CONFIG = {
  name: "Nanda Kurnia Ramadani",
  date: "29 SEPTEMBER",
  pin: "2988",
  signature: "Gustavo",
  responseEmail: "rution969@gmail.com",
  discordWebhookUrl: "",
  telegramBotToken: "",
  telegramChatId: ""
};

const PLAYLIST = [
  {
    title: "Love",
    artist: "Wave To Earth",
    src: "music1.mp3"
  },
  {
    title: "Love Songs",
    artist: "Kaash Paige",
    src: "music2.mp3"
  },
  {
    title: "See You Again (feat. Kali Uchis)",
    artist: "Tyler, The Creator",
    src: "music3.mp3"
  },
  {
    title: "Here With Me",
    artist: "d4vd",
    src: "music4.mp3"
  },
  {
    title: "Want U",
    artist: "Clara La San",
    src: "music5.mp3"
  }
];

let currentTrackIndex = 0;
const IS_MOBILE = window.innerWidth <= 768;

// =========================================
// PROCEDURAL SFX & HAPTIC
// =========================================
let sfxAudioCtx = null;
function getSfxContext() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sfxAudioCtx) sfxAudioCtx = new AudioCtx();
    if (sfxAudioCtx.state === "suspended") sfxAudioCtx.resume();
    return sfxAudioCtx;
  } catch (e) {
    return null;
  }
}

function triggerHaptic(pattern = 50) {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (e) {}
}

function playWebThwipSfx() {
  try {
    const ctx = getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  } catch (e) {}
}
const playThwipSfx = playWebThwipSfx;

function playButtonPopSfx() {
  try {
    const ctx = getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {}
}

function playCandlePuffSfx() {
  try {
    const ctx = getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.2);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) {}
}

function playCameraShutterSfx() {
  try {
    const ctx = getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1500, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.08);
  } catch (e) {}
}

const screens = Array.from(document.querySelectorAll(".screen"));
const dots = Array.from(document.querySelectorAll("#dots i"));

let pinInput = "";
let selectedAnswer = "";
let musicStarted = false;

const trackerTabUnlocks = {
  radar: true,
  story: false,
  hero: false
};

function unlockTrackerTab(key) {
  if (key === "story" && !trackerTabUnlocks.story) {
    trackerTabUnlocks.story = true;
    const tabStory = document.getElementById("trackerTabStory");
    if (tabStory) {
      tabStory.classList.remove("locked");
      const icon = tabStory.querySelector(".tab-icon");
      if (icon) icon.textContent = "🕷️";
      tabStory.setAttribute("title", "Menuju Cerita & Misi (Terbuka)");
    }
  }

  if (key === "hero" && !trackerTabUnlocks.hero) {
    trackerTabUnlocks.hero = true;
    const tabHero = document.getElementById("trackerTabHero");
    if (tabHero) {
      tabHero.classList.remove("locked");
      const icon = tabHero.querySelector(".tab-icon");
      if (icon) icon.textContent = "💖";
      tabHero.setAttribute("title", "Menuju Kartu Spider-Hero (Terbuka)");
    }
  }
}

let lcdFlashTimer = null;
let defaultLcdContent = null;

function flashTrackerLcd(text, duration = 2500) {
  const lcd = document.getElementById("trackerLcdText");
  if (!lcd) return;
  if (!defaultLcdContent) {
    defaultLcdContent = lcd.innerHTML;
  }
  if (lcdFlashTimer) {
    clearTimeout(lcdFlashTimer);
  }
  lcd.innerHTML = `<span class="lcd-dot">●</span> ${text}`;
  lcdFlashTimer = setTimeout(() => {
    if (defaultLcdContent) lcd.innerHTML = defaultLcdContent;
    lcdFlashTimer = null;
  }, duration);
}

// =========================================
// NAVIGATION
// =========================================
function go(id) {
  const target = document.getElementById(id);
  if (!target) return;

  if (id === "mainStory" || (typeof id === "string" && id.startsWith("screenGame"))) {
    unlockTrackerTab("story");
  }
  if (id === "finale") {
    unlockTrackerTab("story");
    unlockTrackerTab("hero");
  }

  const allScreens = Array.from(document.querySelectorAll(".screen"));
  allScreens.forEach(screen => {
    const active = screen === target;
    screen.classList.toggle("active", active);
    screen.setAttribute("aria-hidden", active ? "false" : "true");
  });

  if (typeof window.stopSpiderCam === "function") {
    window.stopSpiderCam();
  }

  target.scrollTop = 0;
  const trackerViewport = document.getElementById("trackerScreenViewport");
  if (trackerViewport) trackerViewport.scrollTop = 0;
  window.scrollTo(0, 0);

  if (typeof updateSpideyTrackerHud === "function") {
    updateSpideyTrackerHud(id);
  }

  if (id === "screenGameSlingshot" && typeof window.initSlingshotGame === "function") {
    setTimeout(window.initSlingshotGame, 80);
  }
}

window.go = go;
window.unlockTrackerTab = unlockTrackerTab;
window.trackerTabUnlocks = trackerTabUnlocks;

// =========================================
// SKY CYCLE
// =========================================
const TIME_MODES = [
  { id: "night", icon: "🌙", label: "Malam", buttonClass: "night-mode" },
  { id: "day", icon: "☀️", label: "Siang", buttonClass: "day-mode" },
  { id: "sunset", icon: "🌅", label: "Sore (Sunset)", buttonClass: "sunset-mode" }
];

let currentTimeIndex = 0;
const spideyBackground = document.getElementById("spideyBackground");
const timeToggleBtn = document.getElementById("timeToggle");

function setTimeOfDay(indexOrId) {
  if (typeof indexOrId === "string") {
    const foundIdx = TIME_MODES.findIndex(m => m.id === indexOrId);
    if (foundIdx !== -1) currentTimeIndex = foundIdx;
  } else {
    currentTimeIndex = (indexOrId + TIME_MODES.length) % TIME_MODES.length;
  }

  const currentMode = TIME_MODES[currentTimeIndex];
  if (spideyBackground) spideyBackground.setAttribute("data-time", currentMode.id);
  if (timeToggleBtn) {
    timeToggleBtn.textContent = currentMode.icon;
    timeToggleBtn.className = `time-toggle ${currentMode.buttonClass}`;
  }
}

if (timeToggleBtn) {
  timeToggleBtn.addEventListener("click", e => {
    e.preventDefault();
    setTimeOfDay(currentTimeIndex + 1);
  });
}
setTimeOfDay("night");
setInterval(() => setTimeOfDay(currentTimeIndex + 1), 15000);

// =========================================
// SPIDER-MAN ANIMATION ENGINE
// =========================================
const spideyFigure = document.getElementById("spideySwingerFigure");
const spideyWebStrand = document.getElementById("spideyWebStrand");
const spideyWebGlow = document.getElementById("spideyWebGlow");
const spideyWebAnchorNode = document.getElementById("spideyWebAnchorNode");
const spideySpeechBubble = document.getElementById("spideySpeechBubble");
const spideySpeechText = document.getElementById("spideySpeechText");

let isSpideyActive = false;
let spideyAnimationId = null;

const SPIDEY_GREETINGS = [
  "Happy Birthday Nanda! 🕷️✨",
  "Semoga harimu selalu seru & bahagia! 🕸️🎉",
  "Multiverse aja kalah keren sama kamu! ⚡",
  "Enjoy your special day, Nanda! 💖",
  "Thwip! Hari ini harinya Nanda! 🕷️🎂",
  "Spider-Sense mendeteksi orang paling spesial! ✨"
];

// Helper: Responsive figure dimensions matching media query breakpoints
function getSpideyDimensions() {
  const isSmallMobile = window.innerWidth <= 600;
  const isTablet = window.innerWidth <= 768;
  const figW = isSmallMobile ? 68 : (isTablet ? 80 : 100);
  const figH = isSmallMobile ? 88 : (isTablet ? 104 : 125);
  return { figW, figH };
}

// Helper: Anchor web strand cleanly at the bottom edge of the top bezel
function getWebAnchorY() {
  const topBezel = document.querySelector(".tracker-top-bezel");
  if (topBezel) {
    const rect = topBezel.getBoundingClientRect();
    return Math.max(0, Math.round(rect.bottom));
  }
  return window.innerWidth <= 768 ? 42 : 48;
}

// Helper: Sync clipping bounds so Spidey & web never bleed over chassis bezels
function updateSpideyContainerClip() {
  const container = document.getElementById("spideySwingerContainer");
  if (!container) return;
  const topBezel = document.querySelector(".tracker-top-bezel");
  const bottomBezel = document.querySelector(".tracker-bottom-bezel");
  const topClip = topBezel ? Math.max(0, Math.round(topBezel.getBoundingClientRect().bottom)) : 0;
  const bottomClip = bottomBezel ? Math.max(0, Math.round(window.innerHeight - bottomBezel.getBoundingClientRect().top)) : 0;
  container.style.setProperty("--spidey-clip-top", `${topClip}px`);
  container.style.setProperty("--spidey-clip-bottom", `${bottomClip}px`);
}

function setWebLine(x1, y1, x2, y2, visible = true) {
  const webSvg = document.querySelector(".spidey-web-line-svg");
  if (!webSvg) return;

  if (!visible) {
    webSvg.classList.remove("active");
    if (spideyWebAnchorNode) spideyWebAnchorNode.setAttribute("opacity", "0");
    return;
  }

  webSvg.classList.add("active");
  if (spideyWebStrand) {
    spideyWebStrand.setAttribute("x1", x1);
    spideyWebStrand.setAttribute("y1", y1);
    spideyWebStrand.setAttribute("x2", x2);
    spideyWebStrand.setAttribute("y2", y2);
  }
  if (spideyWebGlow) {
    spideyWebGlow.setAttribute("x1", x1);
    spideyWebGlow.setAttribute("y1", y1);
    spideyWebGlow.setAttribute("x2", x2);
    spideyWebGlow.setAttribute("y2", y2);
  }
  if (spideyWebAnchorNode) {
    spideyWebAnchorNode.setAttribute("transform", `translate(${x1}, ${y1})`);
    spideyWebAnchorNode.setAttribute("opacity", "1");
  }
}

function triggerSpideySwing() {
  if (isSpideyActive || !spideyFigure) return;
  isSpideyActive = true;

  playThwipSfx();
  spideyFigure.classList.remove("is-hanging");
  spideyFigure.classList.add("is-swinging");
  spideyFigure.style.opacity = "1";
  if (spideySpeechBubble) spideySpeechBubble.classList.remove("active");

  updateSpideyContainerClip();

  const isMobile = window.innerWidth <= 768;
  const screenW = window.innerWidth;
  const { figW, figH } = getSpideyDimensions();
  const anchorY = getWebAnchorY();
  const anchorX = Math.round(screenW * 0.48);
  const swingRadius = isMobile ? Math.min(220, Math.round(window.innerHeight * 0.28)) : 330;
  const startTime = performance.now();
  const duration = 2400;

  // Local hand vector from figure center (figW/2, figH/2)
  // Lead Hand is at viewBox (86, 14) out of (120, 150)
  const handRatioX = 86 / 120;
  const handRatioY = 14 / 150;
  const dx = figW * (handRatioX - 0.5);
  const dy = figH * (handRatioY - 0.5);

  function animateSwing(now) {
    const elapsed = now - startTime;
    const p = Math.min(1, elapsed / duration);

    if (p < 0.8) {
      // Phase 1: Natural Pendulum Swing (smooth gravity acceleration)
      const swingP = p / 0.8;
      const pendulumEase = (1 - Math.cos(swingP * Math.PI)) / 2;
      const angle = -1.25 + 2.45 * pendulumEase;

      const bodyX = anchorX + Math.sin(angle) * swingRadius;
      const bodyY = anchorY + Math.cos(angle) * (swingRadius * 0.82);

      const figureX = bodyX - figW * 0.5;
      const figureY = bodyY - 10;
      const bodyRot = angle * (180 / Math.PI) * 0.5;

      const rotRad = bodyRot * (Math.PI / 180);
      const rotDx = dx * Math.cos(rotRad) - dy * Math.sin(rotRad);
      const rotDy = dx * Math.sin(rotRad) + dy * Math.cos(rotRad);

      const handX = figureX + figW * 0.5 + rotDx;
      const handY = figureY + figH * 0.5 + rotDy;

      setWebLine(anchorX, anchorY, handX, handY, true);
      spideyFigure.style.opacity = "1";
      spideyFigure.style.transform = `translate3d(${figureX}px, ${figureY}px, 0) rotate(${bodyRot}deg)`;
    } else {
      // Phase 2: Web Release & Aerial Inertia Swoop
      setWebLine(0, 0, 0, 0, false);
      const flyP = (p - 0.8) / 0.2;

      // Base position at the moment of release
      const releaseAngle = 1.20;
      const releaseX = anchorX + Math.sin(releaseAngle) * swingRadius;
      const releaseY = anchorY + Math.cos(releaseAngle) * (swingRadius * 0.82);

      // Trajectory continues forward and glides upward smoothly
      const forwardDist = isMobile ? 130 : 200;
      const flyX = releaseX + flyP * forwardDist;
      const flyY = releaseY - Math.sin(flyP * Math.PI * 0.5) * 45;

      const figureX = flyX - figW * 0.5;
      const figureY = flyY - 10;
      const flyRot = 35 - flyP * 15;

      // Smooth fade out as he flies off screen into the skyline
      spideyFigure.style.opacity = String(Math.max(0, 1 - flyP * 1.6));
      spideyFigure.style.transform = `translate3d(${figureX}px, ${figureY}px, 0) rotate(${flyRot}deg)`;
    }

    if (p < 1) {
      spideyAnimationId = requestAnimationFrame(animateSwing);
    } else {
      resetSpidey();
    }
  }

  spideyAnimationId = requestAnimationFrame(animateSwing);
}

function triggerSpideyHang() {
  if (isSpideyActive || !spideyFigure) return;
  isSpideyActive = true;

  playThwipSfx();
  spideyFigure.classList.remove("is-swinging");
  spideyFigure.classList.add("is-hanging");
  spideyFigure.style.opacity = "1";

  updateSpideyContainerClip();

  const isMobile = window.innerWidth <= 768;
  const screenW = window.innerWidth;
  const { figW, figH } = getSpideyDimensions();
  const anchorY = getWebAnchorY();

  // Center horizontally with safe margin
  const posX = Math.max(12, Math.min(screenW - figW - 12, Math.round((screenW - figW) * 0.5)));
  const webX = Math.round(posX + figW * 0.5);

  // Inverted hanging pose: Web attaches cleanly to top center ankles
  // Ankles are at SVG y=8 out of 150
  const ankleOffsetY = Math.round(figH * (8 / 150));

  // Target Y: Suspended gracefully below top bezel with visible web strand
  const targetY = isMobile ? Math.max(anchorY + 34, 78) : Math.max(anchorY + 45, 110);
  const startTime = performance.now();

  if (spideySpeechText) {
    spideySpeechText.textContent = SPIDEY_GREETINGS[Math.floor(Math.random() * SPIDEY_GREETINGS.length)];
  }

  function animateHang(now) {
    if (!isSpideyActive) return;
    const elapsed = now - startTime;

    if (elapsed < 850) {
      // 1. Descend with smooth elastic bounce
      const p = elapsed / 850;
      const easeBounce = 1 + 1.2 * Math.pow(p - 1, 3) + 0.6 * Math.pow(p - 1, 2);
      const startY = anchorY - figH - 20;
      const curY = startY + (targetY - startY) * Math.min(1.05, easeBounce);
      const ankleY = curY + ankleOffsetY;

      if (ankleY > anchorY) {
        setWebLine(webX, anchorY, webX, ankleY, true);
      } else {
        setWebLine(webX, anchorY, webX, anchorY, false);
      }
      spideyFigure.style.transform = `translate3d(${posX}px, ${curY}px, 0)`;
      spideyAnimationId = requestAnimationFrame(animateHang);
    } else if (elapsed < 5200) {
      // 2. Idle greeting state with gentle natural organic bobbing
      const idleElapsed = elapsed - 850;
      const bobOffset = Math.sin(idleElapsed * 0.005) * 3;
      const curY = targetY + bobOffset;
      const ankleY = curY + ankleOffsetY;

      setWebLine(webX, anchorY, webX, ankleY, true);
      spideyFigure.style.transform = `translate3d(${posX}px, ${curY}px, 0)`;

      if (spideySpeechBubble && !spideySpeechBubble.classList.contains("active")) {
        spideySpeechBubble.classList.add("active");
      }
      spideyAnimationId = requestAnimationFrame(animateHang);
    } else if (elapsed < 5900) {
      // 3. Retract back up behind the top bezel
      if (spideySpeechBubble) spideySpeechBubble.classList.remove("active");
      const p = (elapsed - 5200) / 700;
      const curY = targetY - (targetY - anchorY + figH + 30) * (p * p);
      const ankleY = curY + ankleOffsetY;

      if (ankleY > anchorY) {
        setWebLine(webX, anchorY, webX, ankleY, true);
      } else {
        setWebLine(webX, anchorY, webX, anchorY, false);
      }
      spideyFigure.style.transform = `translate3d(${posX}px, ${curY}px, 0)`;
      spideyAnimationId = requestAnimationFrame(animateHang);
    } else {
      resetSpidey();
    }
  }

  spideyAnimationId = requestAnimationFrame(animateHang);
}

function resetSpidey() {
  if (spideyAnimationId) cancelAnimationFrame(spideyAnimationId);
  setWebLine(0, 0, 0, 0, false);
  if (spideyFigure) {
    spideyFigure.style.opacity = "0";
    spideyFigure.style.transform = "translate3d(-250px, -250px, 0)";
    spideyFigure.classList.remove("is-swinging", "is-hanging");
  }
  if (spideySpeechBubble) spideySpeechBubble.classList.remove("active");
  isSpideyActive = false;
}

function triggerSpideyRoutine() {
  if (isSpideyActive) return;
  Math.random() > 0.45 ? triggerSpideySwing() : triggerSpideyHang();
}

// Click/tap interaction: Tap Spidey to hear thwip sound and switch speech quote!
if (spideyFigure) {
  spideyFigure.addEventListener("click", (e) => {
    e.stopPropagation();
    playThwipSfx();
    if (spideySpeechText && spideySpeechBubble && spideySpeechBubble.classList.contains("active")) {
      const current = spideySpeechText.textContent;
      let nextGreeting = current;
      let attempts = 0;
      while (nextGreeting === current && attempts < 5) {
        nextGreeting = SPIDEY_GREETINGS[Math.floor(Math.random() * SPIDEY_GREETINGS.length)];
        attempts++;
      }
      spideySpeechText.textContent = nextGreeting;
    }
  });
}

// Responsive resize listener: keep web coordinates & clipping aligned
window.addEventListener("resize", () => {
  updateSpideyContainerClip();
  if (!isSpideyActive) {
    resetSpidey();
  }
});

setTimeout(() => {
  updateSpideyContainerClip();
  triggerSpideyHang();
  setInterval(triggerSpideyRoutine, 14000);
}, 2200);

// =========================================
// AUDIO ENGINE & VOLUME CONTROLLER
// =========================================
const bgMusic = document.getElementById("bgMusic");
// Default awal masuk web: Volume 100% (1.0)
let currentVolume = 1.0;
let previousVolume = 1.0;

// Bersihkan cache volume lama agar selalu mulai di 100% saat awal masuk web
try {
  localStorage.removeItem("spidey_tracker_volume");
} catch (e) {}

function getVolumeIcon(vol) {
  if (vol <= 0.001) return "🔇";
  if (vol < 0.5) return "🔉";
  return "🔊";
}

function updateSliderTrackFill(slider, percent) {
  if (!slider) return;
  slider.style.background = `linear-gradient(to right, #06b6d4 0%, #ec4899 ${percent}%, #0f172a ${percent}%, #0f172a 100%)`;
}

function setAudioVolume(vol, flashLcd = true, save = true) {
  vol = Math.max(0, Math.min(1, vol));
  currentVolume = vol;
  if (vol > 0.001) {
    previousVolume = vol;
  }
  if (bgMusic) {
    bgMusic.volume = vol;
  }

  if (save) {
    try {
      localStorage.setItem("spidey_tracker_volume", vol.toString());
    } catch (e) {}
  }

  const percent = Math.round(vol * 100);
  const icon = getVolumeIcon(vol);

  // Bottom Bezel HUD elements
  const volBtn = document.getElementById("trackerVolBtn");
  const volIcon = document.getElementById("trackerVolIcon");
  const volPercent = document.getElementById("trackerVolPercent");
  const hudVolVal = document.getElementById("hudVolVal");
  const hudVolSlider = document.getElementById("hudVolSlider");
  const hudMuteBtn = document.getElementById("hudMuteBtn");

  if (volIcon) volIcon.textContent = icon;
  if (volPercent) volPercent.textContent = `${percent}%`;
  if (hudVolVal) hudVolVal.textContent = `${percent}%`;
  if (hudVolSlider && parseInt(hudVolSlider.value) !== percent) hudVolSlider.value = percent;
  if (hudMuteBtn) hudMuteBtn.textContent = icon;
  if (volBtn) volBtn.classList.toggle("muted", vol <= 0.001);

  // Modal elements
  const modalVolPercent = document.getElementById("modalVolPercent");
  const modalVolSlider = document.getElementById("modalVolSlider");
  const modalMuteBtn = document.getElementById("modalMuteBtn");

  if (modalVolPercent) modalVolPercent.textContent = `${percent}%`;
  if (modalVolSlider && parseInt(modalVolSlider.value) !== percent) modalVolSlider.value = percent;
  if (modalMuteBtn) modalMuteBtn.textContent = icon;

  updateSliderTrackFill(hudVolSlider, percent);
  updateSliderTrackFill(modalVolSlider, percent);

  if (flashLcd) {
    flashTrackerLcd(`VOL: ${percent}% ${icon}`);
  }
}

function toggleAudioMute() {
  playButtonPopSfx();
  triggerHaptic(20);
  if (currentVolume > 0.001) {
    previousVolume = currentVolume;
    setAudioVolume(0, true, true);
  } else {
    setAudioVolume(previousVolume > 0.05 ? previousVolume : 1.0, true, true);
  }
}

function loadTrack(index, autoPlay = true) {
  if (!bgMusic || !PLAYLIST[index]) return;
  currentTrackIndex = index;
  bgMusic.src = PLAYLIST[index].src;
  bgMusic.volume = currentVolume;

  renderPlaylistUI();

  if (autoPlay) {
    bgMusic.play().then(() => {
      musicStarted = true;
      updateAudioButtonUI();
      flashTrackerLcd(`PLAYING: ${PLAYLIST[index].title.toUpperCase()} 🎧`);
    }).catch(() => {});
  }
}

function startMusic() {
  if (!bgMusic) return;
  bgMusic.volume = currentVolume;
  if (!bgMusic.src || !bgMusic.src.includes("music1.mp3")) {
    loadTrack(0, true);
  } else {
    bgMusic.play().then(() => {
      musicStarted = true;
      updateAudioButtonUI();
    }).catch(() => {});
  }
}

function updateAudioButtonUI() {
  const trackerAudioBtn = document.getElementById("trackerAudioBtn");
  if (!trackerAudioBtn || !bgMusic) return;
  const isPlaying = !bgMusic.paused;
  trackerAudioBtn.classList.toggle("playing", isPlaying);
  const cone = trackerAudioBtn.querySelector(".speaker-cone");
  if (cone) cone.textContent = isPlaying ? "🔊" : "🔇";
}

function createTopLayerPlaylistModal() {
  let modal = document.getElementById("spideySongModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "spideySongModal";
  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(3, 7, 18, 0.88) !important;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
    z-index: 99999999 !important;
    display: none;
    align-items: center !important;
    justify-content: center !important;
    padding: 16px !important;
    box-sizing: border-box !important;
  `;

  modal.innerHTML = `
    <div style="position:relative; width:100%; max-width:380px; background:#0b1329; border:3px solid #06b6d4; box-shadow:0 0 0 3px #000, 0 25px 60px rgba(0,0,0,0.95); padding:20px 16px; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-family:'Press Start 2P', monospace; font-size:8px; color:#38bdf8; letter-spacing:1px;">✦ SPIDER-PLAYLIST ✦</span>
        <button type="button" id="spideyModalClose" style="background:#e11d48; color:#fff; border:2px solid #000; width:26px; height:26px; font-weight:bold; cursor:pointer; font-family:monospace;">✕</button>
      </div>
      <p style="font-family:'Pixelify Sans', monospace; font-size:12px; color:#94a3b8; margin:0 0 10px 0;">Pilih soundtrack buat Nanda 🎧✨</p>

      <!-- Master Volume Control Card -->
      <div class="spidey-modal-volume-box" style="margin-bottom:12px; background:#070d1e; border:2px solid #1e293b; padding:10px; border-radius:4px; box-shadow:inset 0 2px 4px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-family:'Press Start 2P', monospace; font-size:7px; color:#38bdf8; letter-spacing:0.5px;">✦ VOLUME LEVEL ✦</span>
          <span id="modalVolPercent" style="font-family:'Press Start 2P', monospace; font-size:8px; color:#facc15;">100%</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" id="modalMuteBtn" style="background:#1e293b; color:#fff; border:2px solid #000; border-radius:3px; padding:4px 6px; font-size:12px; cursor:pointer; line-height:1;" title="Mute / Unmute">🔊</button>
          <input type="range" min="0" max="100" value="100" class="spidey-range-slider" id="modalVolSlider" style="flex:1;" aria-label="Volume Slider">
        </div>
        <div style="display:flex; justify-content:space-between; gap:4px; margin-top:8px;">
          <button type="button" class="modal-vol-preset" data-vol="25">25%</button>
          <button type="button" class="modal-vol-preset" data-vol="50">50%</button>
          <button type="button" class="modal-vol-preset" data-vol="75">75%</button>
          <button type="button" class="modal-vol-preset" data-vol="100">MAX</button>
        </div>
      </div>

      <div id="spideySongItems" style="display:flex; flex-direction:column; gap:8px; max-height:230px; overflow-y:auto; padding-right:2px;"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = document.getElementById("spideyModalClose");
  closeBtn.addEventListener("click", () => {
    playButtonPopSfx();
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      playButtonPopSfx();
      modal.style.display = "none";
    }
  });

  // Modal volume event listeners
  const modalVolSlider = modal.querySelector("#modalVolSlider");
  const modalMuteBtn = modal.querySelector("#modalMuteBtn");
  const modalPresets = modal.querySelectorAll(".modal-vol-preset");

  if (modalVolSlider) {
    modalVolSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value) / 100;
      setAudioVolume(val, true, false);
    });
    modalVolSlider.addEventListener("change", (e) => {
      const val = parseInt(e.target.value) / 100;
      setAudioVolume(val, true, true);
    });
  }

  if (modalMuteBtn) {
    modalMuteBtn.addEventListener("click", toggleAudioMute);
  }

  modalPresets.forEach(btn => {
    btn.addEventListener("click", () => {
      playButtonPopSfx();
      triggerHaptic(15);
      const val = parseInt(btn.dataset.vol) / 100;
      setAudioVolume(val, true, true);
    });
  });

  if (bgMusic) {
    bgMusic.addEventListener("ended", () => {
      loadTrack((currentTrackIndex + 1) % PLAYLIST.length, true);
    });
    bgMusic.addEventListener("play", updateAudioButtonUI);
    bgMusic.addEventListener("pause", updateAudioButtonUI);
  }

  return modal;
}

function renderPlaylistUI() {
  createTopLayerPlaylistModal();
  const container = document.getElementById("spideySongItems");
  if (!container) return;
  container.innerHTML = "";

  PLAYLIST.forEach((track, idx) => {
    const isActive = idx === currentTrackIndex;
    const isPlaying = isActive && bgMusic && !bgMusic.paused;

    const item = document.createElement("div");
    item.style.cssText = `
      display:flex; align-items:center; justify-content:space-between; padding:10px 12px;
      background:${isActive ? '#164e63' : '#0f172a'}; border:2px solid ${isActive ? '#38bdf8' : '#000'};
      box-shadow:inset 1px 1px 0 rgba(255,255,255,0.1), 0 2px 0 #000; cursor:pointer;
      transition:transform 0.1s ease;
    `;

    item.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:2px; text-align:left; max-width:70%;">
        <span style="font-family:'Press Start 2P', monospace; font-size:9px; color:#fff; word-break:break-word;">${idx + 1}. ${track.title}</span>
        <span style="font-family:'Pixelify Sans', monospace; font-size:11px; color:#38bdf8;">${track.artist}</span>
      </div>
      <span style="font-family:'Press Start 2P', monospace; font-size:8px; color:#facc15;">${isPlaying ? '▶ ON' : (isActive ? 'PAUSE' : 'PLAY')}</span>
    `;

    item.addEventListener("click", () => {
      playButtonPopSfx();
      triggerHaptic(30);
      if (isActive) {
        bgMusic.paused ? bgMusic.play() : bgMusic.pause();
        updateAudioButtonUI();
        renderPlaylistUI();
      } else {
        loadTrack(idx, true);
      }
    });

    container.appendChild(item);
  });
}

function setupSongListButton() {
  const oldBtn = document.getElementById("trackerActionBtn");
  if (!oldBtn) return;

  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);

  newBtn.innerHTML = `<span style="display:inline-block;width:8px;height:8px;background:#ef4444;margin-right:6px;vertical-align:middle;"></span> 🎵 SONGS FOR YOU`;
  newBtn.setAttribute("title", "Buka Daftar Lagu");

  function openSongModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    playButtonPopSfx();
    triggerHaptic(35);
    const modal = createTopLayerPlaylistModal();
    renderPlaylistUI();
    setAudioVolume(currentVolume, false, false);
    modal.style.display = "flex";
  }

  newBtn.addEventListener("click", openSongModal);
  newBtn.addEventListener("touchstart", openSongModal, { passive: false });
}

function initVolumeControls() {
  if (bgMusic) {
    bgMusic.volume = currentVolume;
  }

  const volBtn = document.getElementById("trackerVolBtn");
  const volPopup = document.getElementById("trackerVolPopup");
  const hudVolSlider = document.getElementById("hudVolSlider");
  const hudMuteBtn = document.getElementById("hudMuteBtn");
  const presetBtns = document.querySelectorAll(".vol-preset-tag");

  if (volBtn && volPopup) {
    volBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      playButtonPopSfx();
      triggerHaptic(15);
      const isVisible = volPopup.classList.contains("show");
      if (isVisible) {
        volPopup.classList.remove("show");
        volBtn.classList.remove("active");
        volPopup.setAttribute("aria-hidden", "true");
      } else {
        volPopup.classList.add("show");
        volBtn.classList.add("active");
        volPopup.setAttribute("aria-hidden", "false");
      }
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!volPopup.contains(e.target) && !volBtn.contains(e.target)) {
        volPopup.classList.remove("show");
        volBtn.classList.remove("active");
        volPopup.setAttribute("aria-hidden", "true");
      }
    });

    // Prevent clicks inside popup from bubbling to document click
    volPopup.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  if (hudVolSlider) {
    hudVolSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value) / 100;
      setAudioVolume(val, true, false);
    });
    hudVolSlider.addEventListener("change", (e) => {
      const val = parseInt(e.target.value) / 100;
      setAudioVolume(val, true, true);
    });
  }

  if (hudMuteBtn) {
    hudMuteBtn.addEventListener("click", toggleAudioMute);
  }

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      playButtonPopSfx();
      triggerHaptic(15);
      const val = parseInt(btn.dataset.vol) / 100;
      setAudioVolume(val, true, true);
    });
  });

  // Sync initial volume UI
  setAudioVolume(currentVolume, false, false);
}

const trackerAudioBtn = document.getElementById("trackerAudioBtn");
if (trackerAudioBtn) {
  trackerAudioBtn.addEventListener("click", e => {
    e.preventDefault();
    playButtonPopSfx();
    triggerHaptic(25);
    if (bgMusic) {
      bgMusic.paused ? startMusic() : bgMusic.pause();
      updateAudioButtonUI();
    }
  });
}

// =========================================
// SCREEN 1: START TRIGGER
// =========================================
const tapStartBtn = document.getElementById("tapStartBtn");
if (tapStartBtn) {
  tapStartBtn.addEventListener("click", e => {
    e.preventDefault();
    startMusic();
    go("pin");
  });
}

const openingScreen = document.getElementById("opening");
if (openingScreen) {
  openingScreen.addEventListener("click", () => {
    startMusic();
    go("pin");
  });
}

// =========================================
// SCREEN 2: PIN KEYPAD
// =========================================
function updateDots() {
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index < pinInput.length);
  });
}

function handleKey(key) {
  playButtonPopSfx();
  triggerHaptic(15);
  if (key === "clear") {
    pinInput = "";
    updateDots();
    return;
  }
  if (key === "back") {
    pinInput = pinInput.slice(0, -1);
    updateDots();
    return;
  }
  if (pinInput.length < 4 && /^\d$/.test(key)) {
    pinInput += key;
    updateDots();
    if (pinInput.length === 4) setTimeout(checkPin, 180);
  }
}

function checkPin() {
  const pinCard = document.querySelector(".pin-card");
  if (pinInput === CONFIG.pin) {
    playWebThwipSfx();
    startMusic();
    go("gift");
  } else {
    triggerHaptic([60, 40, 60]);
    if (pinCard) pinCard.classList.add("shake");
    setTimeout(() => {
      if (pinCard) pinCard.classList.remove("shake");
      pinInput = "";
      updateDots();
    }, 350);
  }
}

const keypad = document.querySelector(".keypad");
if (keypad) {
  keypad.addEventListener("click", e => {
    const btn = e.target.closest("button[data-key]");
    if (btn) handleKey(btn.getAttribute("data-key"));
  });
}

// =========================================
// SCREEN 3: MYSTERY BOX & CONFETTI
// =========================================
const giftBox = document.getElementById("giftBox");
let isUnboxing = false;
let activeParticles = [];
let isParticleLoopRunning = false;

function launchParticleCannon(originX, originY, count = 25) {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const cx = originX || canvas.width / 2;
  const cy = originY || canvas.height / 2;
  const colors = ["#ff2d55", "#06b6d4", "#f59e0b", "#ffffff"];
  const finalCount = IS_MOBILE ? 16 : count;

  for (let i = 0; i < finalCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    activeParticles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      width: Math.random() * 6 + 4,
      height: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1
    });
  }

  if (!isParticleLoopRunning) {
    isParticleLoopRunning = true;
    requestAnimationFrame(renderParticles);
  }
}

function renderParticles() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const p = activeParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.alpha -= 0.02;

    if (p.alpha <= 0 || p.y > canvas.height) {
      activeParticles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }

  if (activeParticles.length > 0) {
    requestAnimationFrame(renderParticles);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isParticleLoopRunning = false;
  }
}

function triggerConfetti() {
  launchParticleCannon(window.innerWidth / 2, window.innerHeight / 2, 25);
}

if (giftBox) {
  giftBox.addEventListener("click", () => {
    if (isUnboxing) return;
    isUnboxing = true;
    startMusic();
    playWebThwipSfx();
    giftBox.classList.add("opened");
    triggerConfetti();

    setTimeout(() => {
      go("mainStory");
      isUnboxing = false;
    }, 900);
  });
}

// =========================================
// SCREEN 4: SUITS & CANDLE
// =========================================
const SPIDEY_SUITS_NOTES = [
  { name: "Classic Peter Parker", tag: "✦ SPIDER VARIANT 1 / 9 ✦", emoji: "🕷️", note: "Keberanian dan rasa tanggung jawab yang luar biasa." },
  { name: "Miles Morales", tag: "✦ SPIDER VARIANT 2 / 9 ✦", emoji: "⚡", note: "Keunikan dan bakat istimewa yang menjadi dirimu sendiri." },
  { name: "Ghost-Spider", tag: "✦ SPIDER VARIANT 3 / 9 ✦", emoji: "🌸", note: "Keanggunan dan senyuman manis yang membawa ketenangan." },
  { name: "Iron Spider", tag: "✦ SPIDER VARIANT 4 / 9 ✦", emoji: "🛡️", note: "Tekad kuat yang selalu melindungi impianmu." },
  { name: "Spider-Man 2099", tag: "✦ SPIDER VARIANT 5 / 9 ✦", emoji: "🌌", note: "Visi masa depan yang hebat dan tekad maju." },
  { name: "Spider-Noir", tag: "✦ SPIDER VARIANT 6 / 9 ✦", emoji: "🕵️", note: "Ketenangan dan kedewasaan di balik hatimu yang tulus." },
  { name: "Spider-Punk", tag: "✦ SPIDER VARIANT 7 / 9 ✦", emoji: "🎸", note: "Jiwa bebas dan keceriaan yang mewarnai suasana." },
  { name: "Superior Spider-Tech", tag: "✦ SPIDER VARIANT 8 / 9 ✦", emoji: "🔮", note: "Kecerdasan dan ketelitian dalam setiap langkah." },
  { name: "Special Spider-Heart", tag: "✦ SPECIAL VARIANT 9 / 9 ✦", emoji: "💖", note: "Varian teristimewa — simbol rasa kagumku buat Nanda." }
];

function initPlanetarium() {
  const planetButtons = Array.from(document.querySelectorAll("#planetariumGrid .planet-btn"));
  const planetTag = document.getElementById("planetTag");
  const planetTitle = document.getElementById("planetTitle");
  const planetNote = document.getElementById("planetNote");
  const planetOrbLarge = document.getElementById("planetOrbLarge");

  planetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-index"), 10);
      if (isNaN(idx) || !SPIDEY_SUITS_NOTES[idx]) return;

      planetButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const data = SPIDEY_SUITS_NOTES[idx];
      if (planetTag) planetTag.textContent = data.tag;
      if (planetTitle) planetTitle.textContent = data.name;
      if (planetNote) planetNote.textContent = data.note;
      if (planetOrbLarge) planetOrbLarge.textContent = data.emoji;
    });
  });
}

function initCake() {
  const birthdayCake = document.getElementById("birthdayCake");
  const flame = document.getElementById("flame");
  const cakeHint = document.getElementById("cakeHint");
  const wishMessage = document.getElementById("wishMessage");
  let blown = false;

  if (!birthdayCake || !flame) return;
  birthdayCake.addEventListener("click", () => {
    if (blown) return;
    blown = true;
    playCandlePuffSfx();
    flame.classList.add("extinguished");
    triggerConfetti();
    if (cakeHint) cakeHint.style.display = "none";
    if (wishMessage) wishMessage.style.display = "block";
  });
}

// =========================================
// 3 MINI GAMES
// =========================================
function initArcadeGames() {
  const btnStartArcade = document.getElementById("btnStartArcade");
  if (btnStartArcade) btnStartArcade.addEventListener("click", () => go("screenGameMemory"));

  document.querySelectorAll(".minigame-nav-btn, .btn-next-minigame").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target) go(target);
    });
  });

  // GAME 1: MEMORY MATCH
  const memoryGrid = document.getElementById("memoryGrid");
  const pairsLeftEl = document.getElementById("pairsLeft");
  const memoryVictoryBox = document.getElementById("memoryVictoryBox");

  const SPIDEY_CARDS = [
    { id: "spidey-classic", svg: `<svg viewBox="0 0 40 40" fill="none" class="game-card-svg"><circle cx="20" cy="20" r="18" fill="#dc2626" stroke="#1e293b" stroke-width="1.5"/><path d="M2 20 H38 M20 2 V38 M7 7 L33 33 M7 33 L33 7" stroke="rgba(0,0,0,0.35)" stroke-width="1"/><path d="M10 16 C12 13 16 12 19 18 C17 22 12 21 10 16 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/><path d="M30 16 C28 13 24 12 21 18 C23 22 28 21 30 16 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/></svg>` },
    { id: "spidey-miles", svg: `<svg viewBox="0 0 40 40" fill="none" class="game-card-svg"><circle cx="20" cy="20" r="18" fill="#0f172a" stroke="#ef4444" stroke-width="1.5"/><path d="M2 20 H38 M20 2 V38 M7 7 L33 33 M7 33 L33 7" stroke="rgba(239,68,68,0.4)" stroke-width="1"/><path d="M10 16 C12 13 16 12 19 18 C17 22 12 21 10 16 Z" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/><path d="M30 16 C28 13 24 12 21 18 C23 22 28 21 30 16 Z" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/></svg>` },
    { id: "spidey-gwen", svg: `<svg viewBox="0 0 40 40" fill="none" class="game-card-svg"><circle cx="20" cy="20" r="18" fill="#f1f5f9" stroke="#ec4899" stroke-width="1.5"/><path d="M6 10 Q20 4 34 10 Q32 32 20 36 Q8 32 6 10 Z" fill="none" stroke="#06b6d4" stroke-width="1.2" opacity="0.6"/><path d="M10 16 C12 13 16 12 19 18 C17 22 12 21 10 16 Z" fill="#ec4899" stroke="#06b6d4" stroke-width="1.5"/><path d="M30 16 C28 13 24 12 21 18 C23 22 28 21 30 16 Z" fill="#ec4899" stroke="#06b6d4" stroke-width="1.5"/></svg>` },
    { id: "spidey-iron", svg: `<svg viewBox="0 0 40 40" fill="none" class="game-card-svg"><circle cx="20" cy="20" r="18" fill="#b91c1c" stroke="#f59e0b" stroke-width="1.5"/><path d="M10 15 L20 24 L30 15 M20 24 V36" stroke="#fbbf24" stroke-width="1.8"/><path d="M10 16 C12 13 16 12 19 18 C17 22 12 21 10 16 Z" fill="#38bdf8" stroke="#fbbf24" stroke-width="1.5"/><path d="M30 16 C28 13 24 12 21 18 C23 22 28 21 30 16 Z" fill="#38bdf8" stroke="#fbbf24" stroke-width="1.5"/></svg>` },
    { id: "spidey-venom", svg: `<svg viewBox="0 0 40 40" fill="none" class="game-card-svg"><circle cx="20" cy="20" r="18" fill="#090d16" stroke="#ffffff" stroke-width="1.5"/><path d="M8 14 C12 10 18 10 18 18 C16 22 10 20 8 14 Z" fill="#ffffff"/><path d="M32 14 C28 10 22 10 22 18 C24 22 30 20 32 14 Z" fill="#ffffff"/><path d="M13 26 L15 23 L17 26 L19 23 L21 26 L23 23 L25 26 L27 23" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/></svg>` },
    { id: "spidey-heart", svg: `<svg viewBox="0 0 40 40" fill="none" class="game-card-svg"><circle cx="20" cy="20" r="18" fill="#e11d48" stroke="#fde047" stroke-width="1.5"/><path d="M20 10 C17 6 10 8 10 14 C10 20 20 28 20 28 C20 28 30 20 30 14 C30 8 23 6 20 10 Z" fill="#ffffff" stroke="#fde047" stroke-width="1.2"/><circle cx="20" cy="17" r="2" fill="#fb7185"/></svg>` }
  ];

  let flippedCards = [];
  let matchedPairs = 0;
  let lockBoard = false;

  function initMemoryGame() {
    if (!memoryGrid) return;
    memoryGrid.innerHTML = "";
    flippedCards = [];
    matchedPairs = 0;
    lockBoard = false;
    if (pairsLeftEl) pairsLeftEl.textContent = "6";
    if (memoryVictoryBox) memoryVictoryBox.style.display = "none";

    const memoryDeck = [...SPIDEY_CARDS, ...SPIDEY_CARDS].sort(() => Math.random() - 0.5);

    memoryDeck.forEach((cardData, index) => {
      const card = document.createElement("div");
      card.className = "memory-card";
      card.dataset.iconId = cardData.id;
      card.dataset.index = index;

      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <svg viewBox="0 0 32 32" fill="none" class="card-back-web">
              <circle cx="16" cy="16" r="13" stroke="rgba(225, 29, 72, 0.4)" stroke-width="1"/>
              <path d="M16 3 V29 M3 16 H29 M7 7 L25 25 M7 25 L25 7" stroke="rgba(225, 29, 72, 0.5)" stroke-width="1"/>
              <polygon points="16,8 24,16 16,24 8,16" stroke="rgba(225, 29, 72, 0.6)" stroke-width="1" fill="none"/>
              <circle cx="16" cy="16" r="3" fill="#e11d48"/>
            </svg>
          </div>
          <div class="card-back">${cardData.svg}</div>
        </div>
      `;

      card.addEventListener("click", () => {
        if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched")) return;
        card.classList.add("flipped");
        flippedCards.push(card);

        if (flippedCards.length === 2) {
          lockBoard = true;
          const [c1, c2] = flippedCards;

          if (c1.dataset.iconId === c2.dataset.iconId) {
            c1.classList.add("matched");
            c2.classList.add("matched");
            matchedPairs++;
            if (pairsLeftEl) pairsLeftEl.textContent = (6 - matchedPairs).toString();
            flippedCards = [];
            lockBoard = false;
            if (matchedPairs === 6) {
              triggerConfetti();
              if (memoryVictoryBox) memoryVictoryBox.style.display = "block";
            }
          } else {
            setTimeout(() => {
              c1.classList.remove("flipped");
              c2.classList.remove("flipped");
              flippedCards = [];
              lockBoard = false;
            }, 600);
          }
        }
      });
      memoryGrid.appendChild(card);
    });
  }

  const btnRestartMemory = document.getElementById("btnRestartMemory");
  if (btnRestartMemory) btnRestartMemory.addEventListener("click", initMemoryGame);
  initMemoryGame();

  // GAME 2: MOLE
  const btnStartMole = document.getElementById("btnStartMole");
  const moleScoreEl = document.getElementById("moleScore");
  const moleVictoryBox = document.getElementById("moleVictoryBox");
  const moleHoles = Array.from(document.querySelectorAll(".mole-hole"));
  let moleScore = 0;
  let moleTimer = null;

  function startMoleGame() {
    moleScore = 0;
    if (moleScoreEl) moleScoreEl.textContent = "0";
    if (moleVictoryBox) moleVictoryBox.style.display = "none";
    clearInterval(moleTimer);

    moleTimer = setInterval(() => {
      moleHoles.forEach(h => h.classList.remove("active"));
      if (moleScore >= 10) {
        clearInterval(moleTimer);
        triggerConfetti();
        if (moleVictoryBox) moleVictoryBox.style.display = "block";
        return;
      }
      moleHoles[Math.floor(Math.random() * moleHoles.length)].classList.add("active");
    }, 850);
  }

  if (btnStartMole) btnStartMole.addEventListener("click", startMoleGame);
  moleHoles.forEach(hole => {
    hole.addEventListener("click", () => {
      if (hole.classList.contains("active")) {
        hole.classList.remove("active");
        moleScore++;
        if (moleScoreEl) moleScoreEl.textContent = moleScore.toString();
        if (moleScore >= 10) {
          clearInterval(moleTimer);
          triggerConfetti();
          if (moleVictoryBox) moleVictoryBox.style.display = "block";
        }
      }
    });
  });

  // GAME 3: SLINGSHOT
  const slingshotStage = document.getElementById("slingshotStage");
  const slingshotBird = document.getElementById("slingshotBird");
  const rubberLine1 = document.getElementById("rubberLine1");
  const rubberLine2 = document.getElementById("rubberLine2");
  const slingshotScoreEl = document.getElementById("slingshotScore");
  const slingshotVictoryBox = document.getElementById("slingshotVictoryBox");
  const btnRestartSlingshot = document.getElementById("btnRestartSlingshot");

  const targetBlocks = [
    document.getElementById("targetBlock1"),
    document.getElementById("targetBlock2"),
    document.getElementById("targetBlock3")
  ];

  let isDragging = false;
  let isFlying = false;
  let currentBirdX = 76;
  let currentBirdY = 115;
  let slingshotHits = 0;
  let flightId = null;
  let flightSafetyTimeout = null;

  function getSlingshotOrigin() {
    if (slingshotStage) {
      const fork = slingshotStage.querySelector(".spidey-fork");
      if (fork) {
        const sRect = slingshotStage.getBoundingClientRect();
        const fRect = fork.getBoundingClientRect();
        if (sRect.width > 0 && fRect.width > 0) {
          const cx = Math.round((fRect.left - sRect.left) + fRect.width / 2);
          const cy = Math.round(fRect.top - sRect.top);
          return {
            x: cx,
            y: cy,
            prong1X: cx - 7,
            prong2X: cx + 7,
            prongY: cy
          };
        }
      }
    }
    const isMobile = window.innerWidth <= 768;
    const cx = isMobile ? 53 : 76;
    const cy = isMobile ? 95 : 115;
    return { x: cx, y: cy, prong1X: cx - 7, prong2X: cx + 7, prongY: cy };
  }

  function updateRubberBands(x, y) {
    const origin = getSlingshotOrigin();
    if (rubberLine1) {
      rubberLine1.setAttribute("x1", origin.prong1X);
      rubberLine1.setAttribute("y1", origin.prongY);
      rubberLine1.setAttribute("x2", x);
      rubberLine1.setAttribute("y2", y);
    }
    if (rubberLine2) {
      rubberLine2.setAttribute("x1", origin.prong2X);
      rubberLine2.setAttribute("y1", origin.prongY);
      rubberLine2.setAttribute("x2", x);
      rubberLine2.setAttribute("y2", y);
    }
  }

  function snapRubberBandsRest() {
    const origin = getSlingshotOrigin();
    updateRubberBands(origin.x, origin.y);
  }

  function resetBird() {
    if (flightId) {
      cancelAnimationFrame(flightId);
      flightId = null;
    }
    if (flightSafetyTimeout) {
      clearTimeout(flightSafetyTimeout);
      flightSafetyTimeout = null;
    }
    isFlying = false;
    isDragging = false;

    const origin = getSlingshotOrigin();
    currentBirdX = origin.x;
    currentBirdY = origin.y;

    if (slingshotBird) {
      slingshotBird.style.transition = "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
      slingshotBird.style.transform = `translate3d(${origin.x - 22}px, ${origin.y - 22}px, 0)`;
      slingshotBird.style.opacity = "1";
    }
    snapRubberBandsRest();
  }

  function initSlingshotGame() {
    slingshotHits = 0;
    if (slingshotScoreEl) slingshotScoreEl.textContent = "0";
    if (slingshotVictoryBox) slingshotVictoryBox.style.display = "none";
    targetBlocks.forEach(t => t && t.classList.remove("hit"));
    setTimeout(resetBird, 30);
  }

  function launchBird(pullX, pullY) {
    if (isFlying) return;
    isFlying = true;

    const origin = getSlingshotOrigin();
    const pullDx = origin.x - pullX;
    const pullDy = origin.y - pullY;
    const pullDist = Math.hypot(pullDx, pullDy);

    // If user barely dragged, cancel and reset
    if (pullDist < 10) {
      resetBird();
      return;
    }

    // Immediately snap rubber bands back to rest
    snapRubberBandsRest();

    // Determine launch velocity
    // Pulling left (pullDx > 0): classic slingshot launches right
    // Pulling right (pullDx < 0): forgiving aim also throws right towards targets
    let vx = (pullDx >= 0 ? pullDx : Math.abs(pullDx)) * 0.45;
    let vy = pullDy * 0.45;

    // Minimum forward propulsion
    if (vx < 9) vx = 9;

    let posX = pullX;
    let posY = pullY;

    if (slingshotBird) slingshotBird.style.transition = "none";
    playWebThwipSfx();
    triggerHaptic(20);

    const stageW = slingshotStage ? slingshotStage.clientWidth || 360 : 360;
    const stageH = slingshotStage ? slingshotStage.clientHeight || 200 : 200;

    // Safety timeout: guaranteed reset after 2.2 seconds max
    flightSafetyTimeout = setTimeout(() => {
      resetBird();
    }, 2200);

    function flight() {
      // Sub-stepping for precise collision without tunneling
      let hitRegistered = false;
      const substeps = 2;
      const stepVx = (vx * 1.8) / substeps;
      const stepVy = (vy * 1.8) / substeps;

      for (let s = 0; s < substeps; s++) {
        posX += stepVx;
        posY += stepVy;

        targetBlocks.forEach(target => {
          if (!target || target.classList.contains("hit")) return;
          const rect = target.getBoundingClientRect();
          const stageRect = slingshotStage ? slingshotStage.getBoundingClientRect() : { left: 0, top: 0 };
          const relX = rect.left - stageRect.left;
          const relY = rect.top - stageRect.top;
          const tw = rect.width || 34;
          const th = rect.height || 34;

          if (
            posX >= relX - 18 && posX <= relX + tw + 18 &&
            posY >= relY - 18 && posY <= relY + th + 18
          ) {
            hitRegistered = true;
            target.classList.add("hit");
            slingshotHits++;
            playButtonPopSfx();
            triggerHaptic([30, 50]);
            if (slingshotScoreEl) slingshotScoreEl.textContent = slingshotHits.toString();

            if (slingshotHits >= 10) {
              triggerConfetti();
              if (slingshotVictoryBox) slingshotVictoryBox.style.display = "block";
            } else {
              setTimeout(() => target && target.classList.remove("hit"), 600);
            }
          }
        });
      }

      if (slingshotBird) {
        slingshotBird.style.transform = `translate3d(${posX - 22}px, ${posY - 22}px, 0)`;
      }

      // Check bounds: within visible stage area
      const inBounds = posX > -40 && posX < stageW + 60 && posY > -60 && posY < stageH + 60;

      if (inBounds && !hitRegistered) {
        flightId = requestAnimationFrame(flight);
      } else {
        setTimeout(resetBird, 220);
      }
    }

    flightId = requestAnimationFrame(flight);
  }

  if (slingshotBird && slingshotStage) {
    function getEventPos(e) {
      const rect = slingshotStage.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function startDrag(e) {
      if (isFlying) return;
      const pos = getEventPos(e);
      const origin = getSlingshotOrigin();
      const distFromOrigin = Math.hypot(pos.x - origin.x, pos.y - origin.y);

      // Allow dragging if touching bird or near slingshot fork
      if (e.target === slingshotBird || slingshotBird.contains(e.target) || distFromOrigin < 65) {
        if (e.cancelable) e.preventDefault();
        isDragging = true;
        if (flightId) {
          cancelAnimationFrame(flightId);
          flightId = null;
        }
        slingshotBird.style.transition = "none";
        moveDrag(e);
      }
    }

    function moveDrag(e) {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
      const pos = getEventPos(e);
      const origin = getSlingshotOrigin();

      const dx = pos.x - origin.x;
      const dy = pos.y - origin.y;
      const dist = Math.hypot(dx, dy);
      const maxPull = 70;

      let x = pos.x;
      let y = pos.y;
      if (dist > maxPull) {
        x = origin.x + (dx / dist) * maxPull;
        y = origin.y + (dy / dist) * maxPull;
      }

      currentBirdX = x;
      currentBirdY = y;
      slingshotBird.style.transform = `translate3d(${x - 22}px, ${y - 22}px, 0)`;
      updateRubberBands(x, y);
    }

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      launchBird(currentBirdX, currentBirdY);
    }

    slingshotBird.addEventListener("mousedown", startDrag);
    slingshotStage.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", moveDrag);
    window.addEventListener("mouseup", endDrag);

    slingshotBird.addEventListener("touchstart", startDrag, { passive: false });
    slingshotStage.addEventListener("touchstart", startDrag, { passive: false });
    window.addEventListener("touchmove", moveDrag, { passive: false });
    window.addEventListener("touchend", endDrag);

    window.addEventListener("resize", () => {
      if (!isFlying && !isDragging) {
        resetBird();
      }
    });
  }

  if (btnRestartSlingshot) btnRestartSlingshot.addEventListener("click", initSlingshotGame);
  window.initSlingshotGame = initSlingshotGame;
  initSlingshotGame();

  document.querySelectorAll(".btn-to-finale").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      playWebThwipSfx();
      triggerConfetti();
      go("finale");
    });
  });
}

// =========================================
// SCREEN 5: FINALE & FORMSUBMIT
// =========================================
const answerYes = document.getElementById("answerYes");
const answerNo = document.getElementById("answerNo");
const answerNote = document.getElementById("answerNote");
const customMessage = document.getElementById("customMessage");
const messageSend = document.getElementById("messageSend");
const messageStatus = document.getElementById("messageStatus");

if (answerYes) {
  answerYes.addEventListener("click", () => {
    selectedAnswer = "YES";
    playWebThwipSfx();
    triggerConfetti();
    if (answerNote) {
      answerNote.textContent = "Makasih banyak udah percaya dan memilih aku, Nanda! 🕷️💖✨";
      answerNote.style.color = "#ff2d55";
    }
  });
}

function initEvasiveNoButton() {
  const btnNo = document.getElementById("answerNo");
  if (!btnNo) return;
  const offsets = [{ x: 40, y: 20 }, { x: -30, y: 30 }, { x: 50, y: 0 }];
  let idx = 0;

  function dodge() {
    playWebThwipSfx();
    const o = offsets[idx % offsets.length];
    btnNo.style.transform = `translate3d(${o.x}px, ${o.y}px, 0)`;
    idx++;
  }
  btnNo.addEventListener("click", dodge);
  btnNo.addEventListener("touchstart", e => { e.preventDefault(); dodge(); });
}

if (messageSend && customMessage) {
  messageSend.addEventListener("click", async () => {
    const text = customMessage.value.trim();
    if (!text && !selectedAnswer) return;

    messageSend.disabled = true;
    messageSend.textContent = "Mengirim...";

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONFIG.responseEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: "Nanda baru aja ngirim balasan...",
          Jawaban: selectedAnswer || "-",
          Pesan: text || "-",
          Waktu: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
        })
      });

      if (response.ok) {
        if (messageStatus) {
          messageStatus.textContent = "✨ Pesan berhasil dikirim ke Gustavo! 💖🕷️";
          messageStatus.style.color = "#34d399";
        }
        messageSend.textContent = "Terkirim! ✅";
        customMessage.value = "";
        triggerConfetti();
      } else {
        throw new Error();
      }
    } catch (err) {
      if (messageStatus) messageStatus.textContent = "Gagal kirim, coba lagi nanti.";
      messageSend.textContent = "Gagal ❌";
    }

    setTimeout(() => {
      messageSend.disabled = false;
      messageSend.textContent = "Kirim Pesan";
    }, 4000);
  });
}

// =========================================
// SPIDER-SOCIETY ID CARD DOWNLOAD
// =========================================
function initSpiderHeroIdCard() {
  const card = document.getElementById("spideyIdCard");
  const downloadBadge = document.querySelector(".id-card-download-badge");

  function showIdToast(msg) {
    let toast = document.querySelector(".spidey-save-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "spidey-save-toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3500);
  }

  function downloadGeneratedCard() {
    playButtonPopSfx();
    playWebThwipSfx();
    triggerHaptic([40, 60]);
    triggerConfetti();

    if (window.SPIDEY_CARD_DATA_URL) {
      const link = document.createElement("a");
      link.download = "Spider-Hero-Nanda-Earth-2909-ID.png";
      link.href = window.SPIDEY_CARD_DATA_URL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showIdToast("🎉 <strong>Kartu ID HD Berhasil Diunduh!</strong><br><small>Tersimpan langsung di galerimu!</small>");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#090e1a";
    ctx.fillRect(0, 0, 600, 360);
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 594, 354);

    ctx.fillStyle = "#e11d48";
    ctx.fillRect(20, 20, 40, 40);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText("SPIDER-SOCIETY", 75, 38);
    ctx.fillStyle = "#06b6d4";
    ctx.font = "10px monospace";
    ctx.fillText("MULTIVERSE HERO REGISTRY · EARTH-2909", 75, 52);

    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(30, 80, 110, 140);
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 80, 110, 140);
    ctx.font = "50px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🕷️", 85, 170);

    ctx.textAlign = "left";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.fillText("HERO NAME", 160, 100);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Nanda Kurnia Ramadani", 160, 122);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.fillText("HERO ALIAS", 160, 150);
    ctx.fillStyle = "#f472b6";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("Spider-Nanda 🌸💖", 160, 170);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.fillText("SECURITY CLEARANCE", 160, 198);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 12px monospace";
    ctx.fillText("LEVEL 10 · GUSTAVO'S FAVORITE", 160, 215);

    ctx.fillStyle = "#ffffff";
    ctx.font = "14px monospace";
    ctx.fillText("||| | || |||| | | ||| || |||| | |||", 30, 310);
    ctx.font = "9px monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("29-09-2026 // EARTH-2909 // CANON-EVENT", 30, 326);

    const a = document.createElement("a");
    a.download = "Spider-Hero-Nanda-Earth-2909-ID.png";
    a.href = canvas.toDataURL("image/png");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showIdToast("🎉 <strong>Kartu ID HD Berhasil Diunduh!</strong><br><small>Tersimpan langsung di perangkatmu!</small>");
  }

  if (card) card.addEventListener("click", downloadGeneratedCard);
  if (downloadBadge) downloadBadge.addEventListener("click", downloadGeneratedCard);
}

// Global shared state for Spider-Cam & Memory Cards integration
let activeSpiderCamSlotTarget = null;
let latestCapturedPolaroidData = null;

// =========================================
// SPIDER-CAM PHOTO BOOTH (MULTIVERSE POLAROID)
// =========================================
function initSpiderCamPhotobooth() {
  const modal = document.getElementById("spiderCamModal");
  const openBtn = document.getElementById("openSpiderCamBtn");
  const closeBtn = document.getElementById("camCloseBtn");
  const backdrop = document.getElementById("camBackdrop");
  const video = document.getElementById("camVideo");
  const snapBtn = document.getElementById("camSnapBtn");
  const flipBtn = document.getElementById("camFlipBtn");
  const galleryTriggerBtn = document.getElementById("camGalleryTriggerBtn");
  const fileInput = document.getElementById("camFileInput");
  const fallbackBox = document.getElementById("camFallbackBox");
  const uploadFallbackBtn = document.getElementById("camUploadBtn");
  const flashEl = document.getElementById("camFlashEffect");
  const filterPills = document.querySelectorAll(".cam-filter-pill");
  const filterLayers = {
    gwen: document.getElementById("filterLayerGwen"),
    miles: document.getElementById("filterLayerMiles"),
    miguel: document.getElementById("filterLayerMiguel"),
    canon: document.getElementById("filterLayerCanon"),
    heart: document.getElementById("filterLayerHeart"),
    none: document.getElementById("filterLayerNone")
  };
  const viewSection = document.getElementById("camViewSection");
  const printSection = document.getElementById("polaroidPrintSection");
  const canvas = document.getElementById("polaroidCanvas");
  const retakeBtn = document.getElementById("camRetakeBtn");
  const downloadBtn = document.getElementById("camDownloadBtn");
  const instantDateText = document.getElementById("instantDateText");
  const doneViewBtn = document.getElementById("camDoneViewBtn");

  // Hapus riwayat legacy gallery photo jika pernah ada di browser
  try {
    localStorage.removeItem("spidey_cam_captured_photos_v1");
  } catch (e) {}

  let photoCapturedThisSession = false;
  let lastAssignedSlot = 0;

  let currentStream = null;
  let currentFacingMode = "user"; // "user" (selfie) or "environment" (rear)
  let activeFilter = "gwen";
  let capturedImageData = null;

  function setFilter(filterName) {
    activeFilter = filterName;
    filterPills.forEach(pill => {
      pill.classList.toggle("active", pill.dataset.filter === filterName);
    });
    Object.keys(filterLayers).forEach(key => {
      if (filterLayers[key]) {
        filterLayers[key].style.display = key === filterName ? "flex" : "none";
      }
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      playButtonPopSfx();
      triggerHaptic(15);
      setFilter(pill.dataset.filter);
    });
  });

  async function startCamera() {
    if (fallbackBox) fallbackBox.style.display = "none";
    if (video) {
      video.style.display = "block";
      video.classList.toggle("no-mirror", currentFacingMode === "environment");
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showFallbackUI();
      return;
    }

    stopCamera();

    try {
      const constraints = {
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 720 },
          height: { ideal: 720 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStream = stream;
      if (video) {
        video.srcObject = stream;
        video.play().catch(() => {});
      }
    } catch (err) {
      console.warn("Kamera tidak dapat diakses langsung, beralih ke mode upload:", err);
      showFallbackUI();
    }
  }

  function stopCamera() {
    if (currentStream) {
      currentStream.getTracks().forEach(t => t.stop());
      currentStream = null;
    }
    if (video) {
      video.srcObject = null;
    }
  }
  window.stopSpiderCam = stopCamera;

  function showFallbackUI() {
    stopCamera();
    if (video) video.style.display = "none";
    if (fallbackBox) fallbackBox.style.display = "flex";
  }

  function openCamModal(targetSlot = null) {
    playButtonPopSfx();
    triggerHaptic(25);
    if (!modal) return;
    if (targetSlot !== null) {
      activeSpiderCamSlotTarget = targetSlot;
    }
    const tagTxt = modal.querySelector(".cam-tag-txt");
    if (tagTxt) {
      if (activeSpiderCamSlotTarget !== null) {
        const slotNames = ["SENYUM MANISMU 🌸", "OBROLAN BERSAMAMU ☕", "KETULUSAN HATIMU 💖"];
        tagTxt.textContent = `✦ TARGET: ${slotNames[activeSpiderCamSlotTarget] || 'KENANGAN'} ✦`;
      } else {
        tagTxt.textContent = "✦ SPIDER-CAM // EARTH-2909 ✦";
      }
    }
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    if (viewSection) viewSection.style.display = "flex";
    if (printSection) printSection.style.display = "none";
    startCamera();
  }
  window.openSpiderCamModal = openCamModal;

  function scrollToMemoryCard(cardIndex = 0) {
    const card = document.getElementById(`memoryCard${cardIndex}`);
    if (card) {
      setTimeout(() => {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("highlight-pulse");
        setTimeout(() => card.classList.remove("highlight-pulse"), 2200);
      }, 200);
    }
  }

  function closeCamModal() {
    playButtonPopSfx();
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    stopCamera();

    const tagTxt = modal.querySelector(".cam-tag-txt");
    if (tagTxt) tagTxt.textContent = "✦ SPIDER-CAM // EARTH-2909 ✦";

    if (photoCapturedThisSession) {
      scrollToMemoryCard(lastAssignedSlot);
      photoCapturedThisSession = false;
    }
  }
  window.closeSpiderCamModal = closeCamModal;

  if (openBtn) openBtn.addEventListener("click", () => {
    activeSpiderCamSlotTarget = null;
    openCamModal();
  });
  if (closeBtn) closeBtn.addEventListener("click", closeCamModal);
  if (backdrop) backdrop.addEventListener("click", closeCamModal);
  if (doneViewBtn) doneViewBtn.addEventListener("click", closeCamModal);

  // Flip camera toggle
  if (flipBtn) {
    flipBtn.addEventListener("click", () => {
      playButtonPopSfx();
      triggerHaptic(20);
      currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
      startCamera();
    });
  }

  // File upload fallback handlers
  function triggerFileInput() {
    playButtonPopSfx();
    if (fileInput) fileInput.click();
  }

  if (galleryTriggerBtn) galleryTriggerBtn.addEventListener("click", triggerFileInput);
  if (uploadFallbackBtn) uploadFallbackBtn.addEventListener("click", triggerFileInput);

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          capturedImageData = img;
          bakePolaroidPhoto(img);
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Snap photo handler
  function snapPhoto() {
    playCameraShutterSfx();
    triggerHaptic([30, 80]);
    if (flashEl) {
      flashEl.classList.add("flash");
      setTimeout(() => flashEl.classList.remove("flash"), 250);
    }

    if (video && video.videoWidth > 0 && currentStream) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const tCtx = tempCanvas.getContext("2d");

      if (currentFacingMode === "user") {
        tCtx.translate(tempCanvas.width, 0);
        tCtx.scale(-1, 1);
      }
      tCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

      const img = new Image();
      img.onload = () => {
        capturedImageData = img;
        bakePolaroidPhoto(img);
      };
      img.src = tempCanvas.toDataURL("image/jpeg", 0.95);
    } else {
      triggerFileInput();
    }
  }

  if (snapBtn) snapBtn.addEventListener("click", snapPhoto);

  // Composite photo onto classic Polaroid frame
  function bakePolaroidPhoto(sourceImg) {
    if (!canvas) return;
    const POLAROID_W = 720;
    const POLAROID_H = 920;
    const PHOTO_PAD = 40;
    const PHOTO_SIZE = 640;

    canvas.width = POLAROID_W;
    canvas.height = POLAROID_H;
    const ctx = canvas.getContext("2d");

    // 1. Vintage Polaroid Paper Base with subtle warm gradient
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, POLAROID_W, POLAROID_H);

    const paperGrad = ctx.createLinearGradient(0, 0, POLAROID_W, POLAROID_H);
    paperGrad.addColorStop(0, "rgba(255, 255, 255, 0.7)");
    paperGrad.addColorStop(1, "rgba(241, 245, 249, 0.85)");
    ctx.fillStyle = paperGrad;
    ctx.fillRect(0, 0, POLAROID_W, POLAROID_H);

    // Vintage paper border line
    ctx.strokeStyle = "rgba(15, 23, 42, 0.15)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, POLAROID_W - 2, POLAROID_H - 2);

    // 2. Square Photo Area (640x640)
    ctx.save();
    ctx.beginPath();
    ctx.rect(PHOTO_PAD, PHOTO_PAD, PHOTO_SIZE, PHOTO_SIZE);
    ctx.clip();

    ctx.fillStyle = "#090d16";
    ctx.fillRect(PHOTO_PAD, PHOTO_PAD, PHOTO_SIZE, PHOTO_SIZE);

    // Aspect-ratio cover calculation
    const imgW = sourceImg.width || sourceImg.naturalWidth;
    const imgH = sourceImg.height || sourceImg.naturalHeight;
    const scale = Math.max(PHOTO_SIZE / imgW, PHOTO_SIZE / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = PHOTO_PAD + (PHOTO_SIZE - drawW) / 2;
    const drawY = PHOTO_PAD + (PHOTO_SIZE - drawH) / 2;

    ctx.drawImage(sourceImg, drawX, drawY, drawW, drawH);

    // Subtle film color grade
    ctx.fillStyle = "rgba(6, 182, 212, 0.08)";
    ctx.fillRect(PHOTO_PAD, PHOTO_PAD, PHOTO_SIZE, PHOTO_SIZE);

    // Draw active AR filter onto photo
    drawFilterToCanvas(ctx, activeFilter, PHOTO_PAD, PHOTO_PAD, PHOTO_SIZE, PHOTO_SIZE);

    ctx.restore();

    // Photo border
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(PHOTO_PAD, PHOTO_PAD, PHOTO_SIZE, PHOTO_SIZE);

    // 3. Vintage Washi Tape & Web Pin decoration
    drawPolaroidPins(ctx, POLAROID_W);

    // 4. Polaroid Caption Typography
    const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    if (instantDateText) {
      instantDateText.textContent = `Earth-2909 · ${dateStr}`;
    }

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 32px 'Outfit', 'Bangers', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Nanda Kurnia Ramadani", POLAROID_W / 2, 745);

    ctx.fillStyle = "#e11d48";
    ctx.font = "bold 18px 'Outfit', sans-serif";
    ctx.fillText("✦ Earth-2909 · Canon Memory 💖 ✦", POLAROID_W / 2, 785);

    ctx.fillStyle = "#64748b";
    ctx.font = "14px monospace";
    ctx.fillText(`Special Multiverse Polaroid // ${dateStr}`, POLAROID_W / 2, 825);

    ctx.fillStyle = "#06b6d4";
    ctx.font = "bold 11.5px monospace";
    ctx.fillText("SPIDER-SOCIETY MULTIVERSE ARCHIVE · CANON EVENT LOCKED", POLAROID_W / 2, 865);

    // Display Polaroid Result
    if (viewSection) viewSection.style.display = "none";
    if (printSection) printSection.style.display = "flex";
    triggerConfetti();
    playWebThwipSfx();

    // Extract clean square photo with filter for on-page display
    try {
      const squareCanvas = document.createElement("canvas");
      squareCanvas.width = PHOTO_SIZE;
      squareCanvas.height = PHOTO_SIZE;
      const sqCtx = squareCanvas.getContext("2d");
      sqCtx.drawImage(canvas, PHOTO_PAD, PHOTO_PAD, PHOTO_SIZE, PHOTO_SIZE, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
      const squarePhotoDataUrl = squareCanvas.toDataURL("image/jpeg", 0.92);
      const fullPolaroidDataUrl = canvas.toDataURL("image/png");

      const filterNames = {
        gwen: "🌸 Ghost-Spider Gwen",
        miles: "⚡ Miles Morales",
        miguel: "👹 Miguel O'Hara 2099",
        canon: "✦ Canon Event Locked",
        heart: "💖 Special for Nanda",
        none: "📷 Natural Retro Cam"
      };
      const filterLabel = filterNames[activeFilter] || "Multiverse Selfie";

      photoCapturedThisSession = true;

      window.latestCapturedPolaroidData = {
        squareUrl: squarePhotoDataUrl,
        fullUrl: fullPolaroidDataUrl,
        filter: activeFilter,
        filterName: filterLabel
      };
      window.getRecentSpiderCamPhotos = () => [
        {
          photoUrl: squarePhotoDataUrl,
          fullPolaroidUrl: fullPolaroidDataUrl,
          filterName: filterLabel
        }
      ];

      // Hanya pasang ke kartu kenangan jika user secara sengaja membuka kamera dari tombol "Pasang Foto" di kartu tersebut
      if (activeSpiderCamSlotTarget !== null && activeSpiderCamSlotTarget !== undefined) {
        const slotNames = ["Senyum Manismu", "Obrolan Bersamamu", "Ketulusan Hatimu"];
        const assignedSlot = activeSpiderCamSlotTarget;
        if (typeof setMemoryCardPhoto === "function") {
          setMemoryCardPhoto(assignedSlot, squarePhotoDataUrl, slotNames[assignedSlot]);
          lastAssignedSlot = assignedSlot;
        }
        activeSpiderCamSlotTarget = null;
      }
    } catch (err) {
      console.warn("Gagal memproses hasil foto:", err);
    }
  }

  // Draw filter overlays onto canvas with 100% SVG-matching scale and positions
  function drawFilterToCanvas(ctx, filter, x, y, w, h) {
    if (filter === "gwen") {
      drawGwenFilter(ctx, x, y, w, h);
    } else if (filter === "miles") {
      drawMilesFilter(ctx, x, y, w, h);
    } else if (filter === "miguel") {
      drawMiguelFilter(ctx, x, y, w, h);
    } else if (filter === "canon") {
      drawCanonFilter(ctx, x, y, w, h);
    } else if (filter === "heart") {
      drawHeartFilter(ctx, x, y, w, h);
    }
  }

  function drawGwenFilter(ctx, x, y, w, h) {
    const s = w / 300;
    const topOffset = (h - 220 * s) / 2;

    ctx.save();
    ctx.translate(x, y + topOffset);
    ctx.scale(s, s);

    // Gwen Delicate Cyan Web Rays
    const rays = new Path2D("M25 95 L80 106 M275 95 L220 106 M150 25 L150 70 M40 65 L82 85 M260 65 L218 85");
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke(rays);

    // Left Cat-Eye (Gwen: Sleek Almond Pink & Cyan)
    const leftOuter = new Path2D("M60 94 C80 72 118 78 138 116 C118 136 82 128 60 94 Z");
    ctx.fillStyle = "#ec4899";
    ctx.fill(leftOuter);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.stroke(leftOuter);

    const leftInner = new Path2D("M68 96 C84 80 114 84 130 114 C114 130 86 124 68 96 Z");
    ctx.fillStyle = "#ffffff";
    ctx.fill(leftInner);

    const leftAccent = new Path2D("M64 98 C84 130 116 136 136 116");
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke(leftAccent);

    // Right Cat-Eye (Gwen: Mirrored)
    const rightOuter = new Path2D("M240 94 C220 72 182 78 162 116 C182 136 218 128 240 94 Z");
    ctx.fillStyle = "#ec4899";
    ctx.fill(rightOuter);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.stroke(rightOuter);

    const rightInner = new Path2D("M232 96 C216 80 186 84 170 114 C186 130 214 124 232 96 Z");
    ctx.fillStyle = "#ffffff";
    ctx.fill(rightInner);

    const rightAccent = new Path2D("M236 98 C216 130 184 136 164 116");
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke(rightAccent);

    ctx.restore();

    drawBadge(ctx, "🌸 GHOST-SPIDER // EARTH-65", x + 16, y + h - 16, "#ec4899", "#ffffff", "#06b6d4");
  }

  function drawMilesFilter(ctx, x, y, w, h) {
    const s = w / 300;
    const topOffset = (h - 220 * s) / 2;

    ctx.save();
    ctx.translate(x, y + topOffset);
    ctx.scale(s, s);

    // Comic Spider-Sense Web Spikes
    const blackSpikes = new Path2D("M22 108 L76 112 M278 108 L224 112 M150 20 L150 64 M34 76 L78 96 M266 76 L222 96");
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.stroke(blackSpikes);

    const redSpikes = new Path2D("M25 106 L75 110 M275 106 L225 110 M150 22 L150 62 M36 74 L77 94 M264 74 L223 94");
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.stroke(redSpikes);

    const whiteFlare = new Path2D("M144 38 L150 22 L156 38");
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke(whiteFlare);

    // Left Eye (Black bezel, red inner border, white lens, white arc glare)
    const leftBlack = new Path2D("M64 108 C72 74 106 64 140 116 C130 148 96 150 64 108 Z");
    ctx.fillStyle = "#000000";
    ctx.fill(leftBlack);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.stroke(leftBlack);

    const leftRed = new Path2D("M68 108 C76 78 106 70 136 116 C127 142 98 144 68 108 Z");
    ctx.fillStyle = "#ef4444";
    ctx.fill(leftRed);
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke(leftRed);

    const leftWhite = new Path2D("M76 108 C82 85 104 80 128 115 C120 134 100 135 76 108 Z");
    ctx.fillStyle = "#ffffff";
    ctx.fill(leftWhite);

    const leftGlare = new Path2D("M86 92 Q102 86 118 96");
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke(leftGlare);

    // Right Eye
    const rightBlack = new Path2D("M236 108 C228 74 194 64 160 116 C170 148 204 150 236 108 Z");
    ctx.fillStyle = "#000000";
    ctx.fill(rightBlack);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.stroke(rightBlack);

    const rightRed = new Path2D("M232 108 C224 78 194 70 164 116 C173 142 202 144 232 108 Z");
    ctx.fillStyle = "#ef4444";
    ctx.fill(rightRed);
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke(rightRed);

    const rightWhite = new Path2D("M224 108 C218 85 196 80 172 115 C180 134 200 135 224 108 Z");
    ctx.fillStyle = "#ffffff";
    ctx.fill(rightWhite);

    const rightGlare = new Path2D("M214 92 Q198 86 182 96");
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke(rightGlare);

    ctx.restore();

    drawBadge(ctx, "⚡ MILES MORALES · EARTH-1610", x + 16, y + h - 16, "#000000", "#ffffff", "#ef4444");
  }

  function drawMiguelFilter(ctx, x, y, w, h) {
    const s = w / 300;
    const topOffset = (h - 220 * s) / 2;

    ctx.save();
    ctx.translate(x, y + topOffset);
    ctx.scale(s, s);

    // 2099 Cyber Spikes & Laser Grid
    const redSpikes = new Path2D("M25 105 L80 115 M275 105 L220 115 M150 25 L150 65");
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.stroke(redSpikes);

    const cyanRays = new Path2D("M35 85 L75 105 M265 85 L225 105");
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke(cyanRays);

    // Center reticle
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(150, 98, 7, 0, Math.PI * 2);
    ctx.stroke();

    const reticleCross = new Path2D("M142 98 H158 M150 90 V106");
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.stroke(reticleCross);

    // Left Visor Eye
    const leftOuter = new Path2D("M80 98 C92 76 122 78 138 106 C132 120 120 136 112 150 C106 136 98 123 80 98 Z");
    ctx.fillStyle = "#dc2626";
    ctx.fill(leftOuter);
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke(leftOuter);

    const leftInner = new Path2D("M86 100 C96 84 118 86 132 108 C124 120 114 134 110 142 C104 130 98 118 86 100 Z");
    ctx.fillStyle = "#ff003f";
    ctx.fill(leftInner);

    const leftHighlight = new Path2D("M96 96 Q115 93 125 104");
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke(leftHighlight);

    // Right Visor Eye
    const rightOuter = new Path2D("M220 98 C208 76 178 78 162 106 C168 120 180 136 188 150 C194 136 202 123 220 98 Z");
    ctx.fillStyle = "#dc2626";
    ctx.fill(rightOuter);
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke(rightOuter);

    const rightInner = new Path2D("M214 100 C204 84 182 86 168 108 C176 120 186 134 190 142 C196 130 202 118 214 100 Z");
    ctx.fillStyle = "#ff003f";
    ctx.fill(rightInner);

    const rightHighlight = new Path2D("M204 96 Q185 93 175 104");
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke(rightHighlight);

    ctx.restore();

    drawBadge(ctx, "👹 SPIDER-MAN 2099 · EARTH-928", x + 16, y + h - 16, "#991b1b", "#ffffff", "#06b6d4");
  }

  function drawCanonFilter(ctx, x, y, w, h) {
    ctx.save();
    // Hologram Banner
    const bannerW = w - 60;
    const bannerH = 42;
    const bannerX = x + 30;
    const bannerY = y + 24;

    ctx.fillStyle = "rgba(9, 14, 26, 0.92)";
    ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ CANON EVENT LOCKED · EARTH-2909 ✦", bannerX + bannerW / 2, bannerY + bannerH / 2);

    // Spider Crest
    const cx = x + w / 2;
    const cy = y + h * 0.52;

    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 65); ctx.lineTo(cx, cy + 65);
    ctx.moveTo(cx - 65, cy); ctx.lineTo(cx + 65, cy);
    ctx.stroke();

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 14, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - 20, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    drawBadge(ctx, "✦ CANON EVENT LOCKED ✦", x + 16, y + h - 16, "#facc15", "#090e1a", "#000000");
  }

  function drawHeartFilter(ctx, x, y, w, h) {
    ctx.save();
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("🕸️💖", x + 55, y + 50);
    ctx.fillText("✨🌸", x + w - 55, y + 50);

    ctx.font = "26px sans-serif";
    ctx.fillText("💖", x + 40, y + h * 0.45);
    ctx.fillText("⭐", x + w - 40, y + h * 0.45);
    ctx.fillText("🕷️", x + w / 2, y + 42);

    ctx.restore();

    drawBadge(ctx, "💖 SPECIAL FOR NANDA 💖", x + 16, y + h - 16, "#e11d48", "#ffffff", "#fda4af");
  }

  function drawBadge(ctx, text, x, y, bg = "#e11d48", textCol = "#ffffff", borderCol = "#000000") {
    ctx.save();
    ctx.font = "bold 13px monospace";
    const textW = ctx.measureText(text).width;
    const padX = 9;
    const badgeH = 24;
    const badgeW = textW + padX * 2;
    const badgeY = y - badgeH;

    // Badge shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(x + 2, badgeY + 2, badgeW, badgeH);

    // Badge body
    ctx.fillStyle = bg;
    ctx.fillRect(x, badgeY, badgeW, badgeH);

    // Border
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(x, badgeY, badgeW, badgeH);

    // Text
    ctx.fillStyle = textCol;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + padX, badgeY + badgeH / 2);
    ctx.restore();
  }

  function drawPolaroidPins(ctx, width) {
    ctx.save();
    // Washi tape at top left (tilted slightly, semi-transparent warm yellow)
    ctx.translate(34, 12);
    ctx.rotate(-0.06);
    ctx.fillStyle = "rgba(254, 240, 138, 0.82)";
    ctx.fillRect(0, 0, 85, 20);
    ctx.strokeStyle = "rgba(180, 83, 9, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 85, 20);
    ctx.restore();

    // Spider web pin at top center
    ctx.save();
    ctx.font = "26px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🕸️", width / 2, 26);
    ctx.restore();
  }

  // Retake button
  if (retakeBtn) {
    retakeBtn.addEventListener("click", () => {
      playButtonPopSfx();
      triggerHaptic(20);
      if (printSection) printSection.style.display = "none";
      if (viewSection) viewSection.style.display = "flex";
      startCamera();
    });
  }

  // Download Polaroid HD button
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      playButtonPopSfx();
      playWebThwipSfx();
      triggerHaptic([40, 80]);
      triggerConfetti();

      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "Spider-Polaroid-Nanda-Earth2909.png";
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      let toast = document.querySelector(".spidey-save-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "spidey-save-toast";
        document.body.appendChild(toast);
      }
      toast.innerHTML = "📸 <strong>Polaroid HD Berhasil Disimpan!</strong><br><small>Tersimpan langsung di galerimu!</small>";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3500);
    });
  }

  // Selesai inisialisasi Spider-Cam Photobooth
}

// =========================================
// MEMORY POLAROID CARDS PHOTO MANAGEMENT
// =========================================
const SPIDEY_MEMORY_STORAGE_KEY = "spidey_memory_cards_photos_v1";
let memoryCardPhotos = {};
let currentPickerCardIndex = null;

// Bersihkan riwayat foto selfie sebelumnya dari browser storage secara otomatis
try {
  localStorage.removeItem(SPIDEY_MEMORY_STORAGE_KEY);
  localStorage.removeItem("spidey_cam_captured_photos_v1");
} catch (e) {}

function loadMemoryCardPhotos() {
  try {
    const raw = localStorage.getItem(SPIDEY_MEMORY_STORAGE_KEY);
    memoryCardPhotos = raw ? JSON.parse(raw) : {};
    if (typeof memoryCardPhotos !== "object" || memoryCardPhotos === null) memoryCardPhotos = {};
  } catch (e) {
    memoryCardPhotos = {};
  }
}

function saveMemoryCardPhotos() {
  try {
    localStorage.setItem(SPIDEY_MEMORY_STORAGE_KEY, JSON.stringify(memoryCardPhotos));
  } catch (e) {
    console.warn("Storage error for memory photos:", e);
  }
}

function getMemoryCardPhotoUrl(idx) {
  return (memoryCardPhotos && memoryCardPhotos[idx]) ? memoryCardPhotos[idx].photoUrl : null;
}

function renderMemoryCards() {
  [0, 1, 2].forEach((idx) => {
    const card = document.getElementById(`memoryCard${idx}`);
    if (!card) return;
    const img = card.querySelector(".polaroid-img");
    const placeholderArt = card.querySelector(".polaroid-placeholder-art");
    const changeBtnText = card.querySelector(".change-btn-text");
    const resetBtn = card.querySelector(".btn-reset-photo");

    const record = memoryCardPhotos[idx];
    if (record && record.photoUrl) {
      if (img) {
        img.src = record.photoUrl;
        img.style.display = "block";
      }
      if (placeholderArt) placeholderArt.style.display = "none";
      if (changeBtnText) changeBtnText.textContent = "Ganti Foto";
      if (resetBtn) resetBtn.style.display = "inline-flex";
      card.classList.add("has-custom-photo");
    } else {
      if (img) {
        img.src = card.dataset.img || `nanda${idx + 1}.jpg`;
        img.style.display = "none";
      }
      if (placeholderArt) placeholderArt.style.display = "flex";
      if (changeBtnText) changeBtnText.textContent = "Pasang Foto";
      if (resetBtn) resetBtn.style.display = "none";
      card.classList.remove("has-custom-photo");
    }
  });
}

function setMemoryCardPhoto(cardIndex, photoUrl, cardTitle = "") {
  memoryCardPhotos[cardIndex] = {
    photoUrl: photoUrl,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    timestamp: Date.now()
  };
  saveMemoryCardPhotos();
  renderMemoryCards();

  const card = document.getElementById(`memoryCard${cardIndex}`);
  if (card) {
    setTimeout(() => {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("highlight-pulse");
      setTimeout(() => card.classList.remove("highlight-pulse"), 2000);
    }, 150);
  }

  triggerConfetti();
  playWebThwipSfx();

  const cardTitles = ["Senyum Manismu", "Obrolan Bersamamu", "Ketulusan Hatimu"];
  const title = cardTitle || cardTitles[cardIndex] || "Kartu Kenangan";

  let toast = document.querySelector(".spidey-save-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "spidey-save-toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `✨ <strong>Foto Terpasang di "${title}"!</strong><br><small>Tersimpan rapi di archive kenangan 💖</small>`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

function removeMemoryCardPhoto(cardIndex) {
  if (memoryCardPhotos[cardIndex]) {
    delete memoryCardPhotos[cardIndex];
    saveMemoryCardPhotos();
    renderMemoryCards();

    const card = document.getElementById(`memoryCard${cardIndex}`);
    if (card) {
      const img = card.querySelector(".polaroid-img");
      const placeholder = card.querySelector(".polaroid-placeholder-art");
      if (img) img.style.display = "none";
      if (placeholder) placeholder.style.display = "flex";
    }

    let toast = document.querySelector(".spidey-save-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "spidey-save-toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `🗑️ <strong>Foto dihapus, kembali ke seni default</strong>`;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }
}

function initMemoryCardsInteraction() {
  loadMemoryCardPhotos();
  renderMemoryCards();

  const pickerModal = document.getElementById("spideyPhotoPickerModal");
  const pickerCloseBtn = document.getElementById("pickerCloseBtn");
  const pickerOverlay = document.getElementById("pickerOverlay");
  const pickerTargetTitle = document.getElementById("pickerTargetTitle");
  const pickerOptCamBtn = document.getElementById("pickerOptCamBtn");
  const pickerOptUploadBtn = document.getElementById("pickerOptUploadBtn");
  const pickerOptRecentBtn = document.getElementById("pickerOptRecentBtn");
  const memoryFileInput = document.getElementById("memoryCardFileInput");

  const cardNames = ["Senyum Manismu", "Obrolan Bersamamu", "Ketulusan Hatimu"];

  function openPickerModal(cardIndex) {
    playButtonPopSfx();
    triggerHaptic(15);
    currentPickerCardIndex = cardIndex;
    if (pickerTargetTitle) {
      pickerTargetTitle.textContent = `Pasang Foto: "${cardNames[cardIndex] || 'Kenangan'}"`;
    }

    // Check if there are recent Spider-Cam photos
    const recentPhotos = (typeof window.getRecentSpiderCamPhotos === "function") ? window.getRecentSpiderCamPhotos() : [];
    if (pickerOptRecentBtn) {
      pickerOptRecentBtn.style.display = (recentPhotos && recentPhotos.length > 0) ? "flex" : "none";
    }

    if (pickerModal) {
      pickerModal.style.display = "flex";
      pickerModal.setAttribute("aria-hidden", "false");
    }
  }

  function closePickerModal() {
    playButtonPopSfx();
    if (pickerModal) {
      pickerModal.style.display = "none";
      pickerModal.setAttribute("aria-hidden", "true");
    }
  }

  if (pickerCloseBtn) pickerCloseBtn.addEventListener("click", closePickerModal);
  if (pickerOverlay) pickerOverlay.addEventListener("click", closePickerModal);

  // Click "Pasang / Ganti Foto" button on cards
  document.querySelectorAll(".btn-change-photo").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.cardIndex, 10);
      openPickerModal(idx);
    });
  });

  // Click "Reset" button on cards
  document.querySelectorAll(".btn-reset-photo").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      playButtonPopSfx();
      triggerHaptic(20);
      const idx = parseInt(btn.dataset.cardIndex, 10);
      removeMemoryCardPhoto(idx);
    });
  });

  // Option 1: Open Spider-Cam for this card
  if (pickerOptCamBtn) {
    pickerOptCamBtn.addEventListener("click", () => {
      closePickerModal();
      activeSpiderCamSlotTarget = currentPickerCardIndex;
      if (window.openSpiderCamModal) {
        window.openSpiderCamModal(currentPickerCardIndex);
      }
    });
  }

  // Option 2: Upload from Device/Gallery
  if (pickerOptUploadBtn) {
    pickerOptUploadBtn.addEventListener("click", () => {
      closePickerModal();
      if (memoryFileInput) {
        memoryFileInput.value = "";
        memoryFileInput.click();
      }
    });
  }

  // Handle file chosen from device
  if (memoryFileInput) {
    memoryFileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file || currentPickerCardIndex === null) return;
      playButtonPopSfx();

      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 720;
          let w = img.width;
          let h = img.height;
          const maxSide = Math.max(w, h);
          if (maxSide > MAX_SIZE) {
            const ratio = MAX_SIZE / maxSide;
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

          setMemoryCardPhoto(currentPickerCardIndex, dataUrl, cardNames[currentPickerCardIndex]);
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Option 3: Use recent Spider-Cam photo
  if (pickerOptRecentBtn) {
    pickerOptRecentBtn.addEventListener("click", () => {
      const recentPhotos = (typeof window.getRecentSpiderCamPhotos === "function") ? window.getRecentSpiderCamPhotos() : [];
      if (recentPhotos.length > 0 && currentPickerCardIndex !== null) {
        const photo = recentPhotos[0];
        closePickerModal();
        setMemoryCardPhoto(currentPickerCardIndex, photo.photoUrl || photo.fullPolaroidUrl, cardNames[currentPickerCardIndex]);
      }
    });
  }

  // Connect quick assign chips in Spider-Cam modal
  document.querySelectorAll(".assign-chip-btn").forEach((chip) => {
    chip.addEventListener("click", () => {
      const slot = parseInt(chip.dataset.slot, 10);
      if (window.latestCapturedPolaroidData) {
        const photoUrl = window.latestCapturedPolaroidData.squareUrl || window.latestCapturedPolaroidData.fullUrl;
        setMemoryCardPhoto(slot, photoUrl, cardNames[slot]);
        if (window.closeSpiderCamModal) {
          window.closeSpiderCamModal();
        }
      } else {
        activeSpiderCamSlotTarget = slot;
        let toast = document.querySelector(".spidey-save-toast");
        if (toast) {
          toast.innerHTML = `🎯 <strong>Target Diset: ${cardNames[slot]}!</strong><br><small>Jepret foto untuk langsung memasangnya!</small>`;
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 2500);
        }
      }
    });
  });
}

// =========================================
// POLAROID HD LIGHTBOX MODAL
// =========================================
function initPolaroidLightbox() {
  const modal = document.getElementById("polaroidLightboxModal");
  if (!modal) return;
  const overlay = modal.querySelector(".lightbox-overlay");
  const closeBtn = modal.querySelector(".lightbox-close-btn");
  const imgEl = modal.querySelector("#lightboxImg");
  const titleEl = modal.querySelector("#lightboxTitle");
  const descEl = modal.querySelector("#lightboxDesc");
  const fallbackEl = modal.querySelector("#lightboxArtFallback");
  const emojiEl = modal.querySelector("#lightboxArtEmoji");
  const badgeEl = modal.querySelector("#lightboxArtBadge");
  const actionsEl = modal.querySelector("#lightboxActions");
  const downloadBtn = modal.querySelector("#lightboxDownloadBtn");

  let currentPhotoSrc = null;

  const themeGradients = [
    "radial-gradient(circle at 50% 40%, #881337, #0f172a 75%)", // 0: Senyum Manis
    "radial-gradient(circle at 50% 40%, #0369a1, #0f172a 75%)", // 1: Obrolan Bersamamu
    "radial-gradient(circle at 50% 40%, #701a75, #0f172a 75%)", // 2: Ketulusan Hatimu
    "radial-gradient(circle at 50% 40%, #e11d48, #0f172a 75%)"  // 3: Spider-Cam
  ];

  function openLightbox(imgSrc, title, desc, emoji = "🌸", badge = "Seni Spesial", themeIndex = 0) {
    playButtonPopSfx();
    triggerHaptic(20);
    if (titleEl) titleEl.textContent = title || "Spidey Polaroid";
    if (descEl) descEl.textContent = desc || "";

    const hasValidCustomPhoto = imgSrc && typeof imgSrc === "string" && (
      imgSrc.startsWith("data:image/") ||
      imgSrc.startsWith("blob:") ||
      (imgSrc.startsWith("http") && !imgSrc.includes("nanda"))
    );

    currentPhotoSrc = hasValidCustomPhoto ? imgSrc : null;

    if (hasValidCustomPhoto) {
      if (imgEl) {
        imgEl.src = imgSrc;
        imgEl.style.display = "block";
        imgEl.onerror = () => {
          imgEl.style.display = "none";
          if (fallbackEl) {
            fallbackEl.style.display = "flex";
            const grad = themeGradients[themeIndex] || themeGradients[0];
            fallbackEl.style.background = grad;
            if (emojiEl) emojiEl.textContent = emoji;
            if (badgeEl) badgeEl.textContent = badge;
          }
          if (actionsEl) actionsEl.style.display = "none";
        };
      }
      if (fallbackEl) fallbackEl.style.display = "none";
      if (actionsEl) actionsEl.style.display = "flex";
    } else {
      if (imgEl) {
        imgEl.style.display = "none";
        imgEl.removeAttribute("src");
      }
      if (fallbackEl) {
        fallbackEl.style.display = "flex";
        const grad = themeGradients[themeIndex] || themeGradients[0];
        fallbackEl.style.background = grad;
        if (emojiEl) emojiEl.textContent = emoji;
        if (badgeEl) badgeEl.textContent = badge;
      }
      if (actionsEl) actionsEl.style.display = "none";
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    playButtonPopSfx();
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (overlay) overlay.addEventListener("click", closeLightbox);

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!currentPhotoSrc) return;
      playButtonPopSfx();
      playWebThwipSfx();
      triggerHaptic([30, 60]);
      triggerConfetti();

      const link = document.createElement("a");
      link.download = `Spidey-Polaroid-${Date.now()}.png`;
      link.href = currentPhotoSrc;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      let toast = document.querySelector(".spidey-save-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "spidey-save-toast";
        document.body.appendChild(toast);
      }
      toast.innerHTML = `💾 <strong>Foto Polaroid Berhasil Diunduh!</strong>`;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2500);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeLightbox();
    }
  });

  // Attach click listener to existing memory polaroid cards
  document.querySelectorAll(".polaroid-card:not(.spidey-cam-result-card)").forEach((card) => {
    const idx = parseInt(card.dataset.index, 10);
    const cardTitle = card.dataset.title || (card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "Momen Indah");
    const cardDesc = card.dataset.desc || (card.querySelector("p") ? card.querySelector("p").textContent.trim() : "");
    const emojiEl = card.querySelector(".placeholder-emoji");
    const emoji = emojiEl ? emojiEl.textContent.trim() : (idx === 0 ? "🌸" : idx === 1 ? "☕" : "💖");
    const badgeEl = card.querySelector(".placeholder-badge");
    const badge = badgeEl ? badgeEl.textContent.trim() : (idx === 0 ? "Senyum Manis" : idx === 1 ? "Momen Ngobrol" : "Hati Tulus");

    card.addEventListener("click", (e) => {
      // Don't trigger zoom if user clicked on action buttons
      if (e.target.closest(".polaroid-memory-actions") || e.target.closest("button")) {
        return;
      }
      const customPhoto = (typeof getMemoryCardPhotoUrl === "function") ? getMemoryCardPhotoUrl(idx) : null;
      const imgSrc = customPhoto || "";
      openLightbox(imgSrc, cardTitle, cardDesc, emoji, badge, idx);
    });
  });

  window.openPolaroidLightbox = openLightbox;
}

// =========================================
// PRELOADER DENGAN ANIMASI PROGRESS OTOMATIS
// =========================================
function initPreloader() {
  const preloader = document.getElementById("spideyPreloader");
  const bar = document.getElementById("preloaderBar");
  const percent = document.getElementById("preloaderPercent");
  if (!preloader) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 10;
    if (progress > 100) progress = 100;

    if (bar) bar.style.width = `${progress}%`;
    if (percent) percent.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add("loaded");
        setTimeout(() => {
          preloader.style.display = "none";
        }, 500);
      }, 250);
    }
  }, 50);
}

function updateSpideyTrackerHud(screenId) {
  const lcd = document.getElementById("trackerLcdText");
  if (lcd) lcd.innerHTML = `<span class="lcd-dot">●</span> SPIDEY TRACKER // TARGET: NANDA // EARTH-2909 💖`;
}

function initSpideyTrackerDevice() {
  const tabRadar = document.getElementById("trackerTabRadar");
  const tabStory = document.getElementById("trackerTabStory");
  const tabHero = document.getElementById("trackerTabHero");

  if (tabRadar) tabRadar.addEventListener("click", () => go("opening"));
  if (tabStory) tabStory.addEventListener("click", () => trackerTabUnlocks.story && go("mainStory"));
  if (tabHero) tabHero.addEventListener("click", () => trackerTabUnlocks.hero && go("finale"));
}

// =========================================
// INITIALIZE
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  const personName = document.getElementById("personName");
  if (personName) personName.textContent = CONFIG.name;

  if (bgMusic) bgMusic.src = PLAYLIST[0].src;

  initPreloader();
  initSpideyTrackerDevice();
  initEvasiveNoButton();
  initPlanetarium();
  initCake();
  initArcadeGames();
  initSpiderHeroIdCard();
  setupSongListButton();
  initVolumeControls();
  initSpiderCamPhotobooth();
  initMemoryCardsInteraction();
  initPolaroidLightbox();
});
