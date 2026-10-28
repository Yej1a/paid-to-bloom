(() => {
  "use strict";

  const CONFIG = {
    totalSeconds: 45,
    growthRate: 4.2,
    growthPenalty: 9,
    perfectGrowth: 1.2,
    perfectWindow: 0.55,
    scorePerfect: 180
  };

  const FLOWERS = {
    daisy: {
      key: "daisy",
      name: "小雏菊",
      en: "DAISY",
      tagline: "普通，但很耐看。",
      coral: "#E56B4A",
      butter: "#F2C14E"
    },
    sunflower: {
      key: "sunflower",
      name: "向日葵",
      en: "SUNFLOWER",
      tagline: "今天也要向着光。",
      coral: "#F2C14E",
      butter: "#E8A93B"
    },
    cactus: {
      key: "cactus",
      name: "仙人掌",
      en: "CACTUS",
      tagline: "带刺，也会开。",
      coral: "#E59A9A",
      butter: "#F2C14E"
    }
  };

  const BOSSES = {
    inquiry: {
      key: "inquiry",
      name: "在吗型",
      tag: "高频 · 短盯",
      bubble: "在吗？",
      feintLine: "电话。",
      safeLine: "接个电话。",
      leanLine: "过来一下。",
      doubleLine: "还没走。",
      quip: "在吗？这个花比报表长得快。",
      config: {
        firstQuiet: 4.0,
        quietBase: 3.0,
        quietMin: 1.9,
        quietStep: 0.1,
        warnBase: 1.4,
        warnMin: 1.0,
        warnStep: 0.045,
        watchBase: 1.0,
        watchStep: 0.015,
        watchMax: 1.12,
        leaveBase: 0.7
      }
    },
    coffee: {
      key: "coffee",
      name: "咖啡型",
      tag: "长静默 · 长盯",
      bubble: "续杯。",
      feintLine: "咖啡好了。",
      safeLine: "出去续杯。",
      leanLine: "这表谁做的？",
      doubleLine: "杯还没洗。",
      quip: "出去续杯，回来续命。你的土比我咖啡还湿。",
      config: {
        firstQuiet: 4.8,
        quietBase: 4.0,
        quietMin: 2.9,
        quietStep: 0.08,
        warnBase: 1.6,
        warnMin: 1.2,
        warnStep: 0.03,
        watchBase: 1.9,
        watchStep: 0.02,
        watchMax: 2.2,
        leaveBase: 0.85
      }
    },
    patrol: {
      key: "patrol",
      name: "巡查型",
      tag: "慢转头 · 长预警",
      bubble: "路过。",
      feintLine: "有人叫。",
      safeLine: "被叫走了。",
      leanLine: "我看看。",
      doubleLine: "再巡一遍。",
      quip: "只是路过，顺便看看你的花。",
      config: {
        firstQuiet: 4.4,
        quietBase: 3.5,
        quietMin: 2.3,
        quietStep: 0.07,
        warnBase: 1.8,
        warnMin: 1.3,
        warnStep: 0.04,
        watchBase: 1.35,
        watchStep: 0.015,
        watchMax: 1.55,
        leaveBase: 0.8
      }
    }
  };

  const FLOWER_KEYS = Object.keys(FLOWERS);
  const BOSS_KEYS = Object.keys(BOSSES);

  const BOSS_ACTIONS = {
    inquiry: {
      1: [["look", 0.58], ["feint", 0.3], ["safe", 0.12]],
      2: [["look", 0.42], ["feint", 0.2], ["double", 0.2], ["lean", 0.1], ["safe", 0.08]]
    },
    coffee: {
      1: [["look", 0.45], ["safe", 0.35], ["feint", 0.2]],
      2: [["look", 0.32], ["lean", 0.26], ["double", 0.17], ["safe", 0.18], ["feint", 0.07]]
    },
    patrol: {
      1: [["look", 0.42], ["double", 0.28], ["feint", 0.2], ["safe", 0.1]],
      2: [["look", 0.3], ["double", 0.32], ["lean", 0.26], ["feint", 0.12]]
    }
  };

  const PERSONAS = {
    god: {
      title: "天选摸鱼圣体",
      desc: "零失误开花。老板全程以为你在做 Q4，实际上你在做一件更伟大的事。",
      quote: "工作可以明天再做，花今天必须开。",
      grade: "S"
    },
    actor: {
      title: "奥斯卡在逃影帝",
      desc: "被抓 1 次，花还是开了。你的表情管理和 Ctrl+S 一样快，建议直接报名金像奖。",
      quote: "不是没被发现，是演技刚刚好。",
      grade: "S"
    },
    athlete: {
      title: "工位极限运动员",
      desc: "被抓 2 次仍把花养开。心跳 180，鼠标 180，只有 KPI 还停在原地。",
      quote: "心跳 180，花开 100%。",
      grade: "A"
    },
    watched: {
      title: "老板的重点观察对象",
      desc: "三次被抓。老板已经把你的工位加入今日巡检路线，并在备注里写了“爱养花”。",
      quote: "花没开，工位先被点名了。",
      grade: "!"
    },
    almost: {
      title: "就差一点点选手",
      desc: "离开花只差一点，像极了离下班只差一分钟。土是湿的，心是热的，花是没开的。",
      quote: "差一点开花，也差一点下班。",
      grade: "B"
    },
    wilt: {
      title: "花没开，人先麻了",
      desc: "土还是湿的，花没来得及开。没关系，今天的失败不会写进周报。",
      quote: "今天没开花，不代表明天不会。",
      grade: "C"
    }
  };

  const STORAGE = {
    muted: "paidToBloom.muted",
    daily: "paidToBloom.daily",
    flower: "paidToBloom.flower",
    codex: "paidToBloom.codex.v1"
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

  function safeStorageGet(key, fallback = null) {
    try {
      return window.localStorage.getItem(key) ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (error) {
      /* The game works fine without storage. */
    }
  }

  function todayKey() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }

  function readDailyCount() {
    try {
      const raw = window.localStorage.getItem(STORAGE.daily);
      if (!raw) return 0;
      const stored = JSON.parse(raw);
      if (!stored || stored.date !== todayKey()) return 0;
      return clamp(parseInt(stored.count, 10) || 0, 0, 9999);
    } catch (error) {
      return 0;
    }
  }

  function saveDailyCount(count) {
    safeStorageSet(STORAGE.daily, JSON.stringify({ date: todayKey(), count }));
  }

  function emptyCodex() {
    const entries = {};
    FLOWER_KEYS.forEach((key) => {
      entries[key] = { seen: false, bloomed: false };
    });
    return entries;
  }

  function readCodex() {
    const fallback = emptyCodex();
    try {
      const raw = safeStorageGet(STORAGE.codex, "");
      if (!raw) return fallback;
      const stored = JSON.parse(raw);
      FLOWER_KEYS.forEach((key) => {
        if (stored && stored[key]) {
          fallback[key].seen = Boolean(stored[key].seen);
          fallback[key].bloomed = Boolean(stored[key].bloomed);
        }
      });
    } catch (error) {
      /* Ignore malformed local codex data. */
    }
    return fallback;
  }

  function saveCodex() {
    safeStorageSet(STORAGE.codex, JSON.stringify(codexState));
  }

  function markFlowerSeen(key) {
    if (!codexState[key]) return;
    if (!codexState[key].seen) {
      codexState[key].seen = true;
      saveCodex();
    }
  }

  function markFlowerBloomed(key) {
    if (!codexState[key]) return;
    codexState[key].seen = true;
    codexState[key].bloomed = true;
    saveCodex();
  }

  function codexCounts() {
    let seen = 0;
    let bloomed = 0;
    FLOWER_KEYS.forEach((key) => {
      if (codexState[key] && codexState[key].seen) seen += 1;
      if (codexState[key] && codexState[key].bloomed) bloomed += 1;
    });
    return { seen, bloomed, total: FLOWER_KEYS.length };
  }

  const storedFlower = safeStorageGet(STORAGE.flower, "daisy");
  let currentFlowerKey = FLOWERS[storedFlower] ? storedFlower : "daisy";
  let selectedFlowerKey = currentFlowerKey;
  let currentBossKey = "inquiry";
  let lastBossKey = null;
  let codexState = readCodex();
  let codexReturnFocus = null;

  const el = {
    app: $("#app"),
    stage: $("#stage"),
    timerBox: $("#timerBox"),
    timer: $("#timer"),
    hearts: $("#hearts"),
    heartEls: $$(".heart"),
    muteBtn: $("#muteBtn"),
    bossBubble: $("#bossBubble"),
    bossLine: $("#bossLine"),
    bossTurn: $("#bossTurn"),
    bossEye: $("#bossEye"),
    bossPupil: $("#bossPupil"),
    bossLid: $("#bossLid"),
    bossBrow: $("#bossBrow"),
    warnMeter: $("#warnMeter"),
    warnFill: $("#warnFill"),
    perfectZone: $(".perfect-zone"),
    perfectStamp: $("#perfectStamp"),
    toast: $("#toast"),
    modeText: $("#modeText"),
    bloomBurst: $("#bloomBurst"),
    growthPct: $("#growthPct"),
    growthFill: $("#growthFill"),
    growthMarker: $("#growthMarker"),
    stageName: $("#stageName"),
    stageLabels: $$(".stage-labels span"),
    holdHint: $("#holdHint"),
    holdStrong: $("#holdStrong"),
    holdSmall: $("#holdSmall"),
    holdBarFill: $("#holdBarFill"),
    startScreen: $("#startScreen"),
    startBtn: $("#startBtn"),
    startCodexBtn: $("#startCodexBtn"),
    startCodexCount: $("#startCodexCount"),
    shiftCount: $("#shiftCount"),
    setupScreen: $("#setupScreen"),
    setupDate: $("#setupDate"),
    flowerPicker: $("#flowerPicker"),
    flowerOptions: $$(".flower-option"),
    setupBossName: $("#setupBossName"),
    setupBossTag: $("#setupBossTag"),
    setupBossQuip: $("#setupBossQuip"),
    setupBossPortrait: $("#setupBossPortrait"),
    setupStartBtn: $("#setupStartBtn"),
    setupStartSub: $("#setupStartSub"),
    setupBackBtn: $("#setupBackBtn"),
    setupCodexBtn: $("#setupCodexBtn"),
    setupCodexCount: $("#setupCodexCount"),
    codexScreen: $("#codexScreen"),
    codexList: $("#codexList"),
    codexSummary: $("#codexSummary"),
    closeCodexBtn: $("#closeCodexBtn"),
    resultScreen: $("#resultScreen"),
    resultDate: $("#resultDate"),
    personaTitle: $("#personaTitle"),
    resultGrade: $("#resultGrade"),
    personaDesc: $("#personaDesc"),
    resultContext: $("#resultContext"),
    resultBossLine: $("#resultBossLine"),
    statScore: $("#statScore"),
    statTime: $("#statTime"),
    statPerfect: $("#statPerfect"),
    statCaught: $("#statCaught"),
    quoteText: $("#quoteText"),
    cardBtn: $("#cardBtn"),
    retryBtn: $("#retryBtn"),
    cardScreen: $("#cardScreen"),
    closeCardBtn: $("#closeCardBtn"),
    cardImage: $("#cardImage"),
    cardStyleSwitch: $("#cardStyleSwitch"),
    cardStyleButtons: $$("#cardStyleSwitch [data-style]"),
    shareBtn: $("#shareBtn"),
    copyBtn: $("#copyBtn"),
    srStatus: $("#srStatus"),
    screenFlash: $("#screenFlash"),
    caughtFlash: $("#caughtFlash"),
    plantGrowth: $("#plantGrowth"),
    plantSway: $("#plantSway"),
    leaf1: $("#leaf1"),
    leaf2: $("#leaf2"),
    leaf3: $("#leaf3"),
    leaf4: $("#leaf4"),
    budGroup: $("#budGroup"),
    plantFace: $("#plantFace"),
    sproutFace: $("#sproutFace"),
    flowerPetals: $("#flowerPetals"),
    cactusGrowth: $("#cactusGrowth"),
    cactusBud: $("#cactusBud"),
    cactusFlower: $("#cactusFlower"),
    cactusFace: $("#cactusFace"),
    wateringCan: $("#wateringCan")
  };

  const appClasses = [
    "is-holding",
    "boss-warning",
    "boss-watching",
    "is-caught",
    "is-bloom",
    "is-perfect"
  ];

  const HR = {
    app: "app-shake",
    flash: "flash",
    toast: "show",
    stamp: "show",
    bloom: "show",
    leaf: "on",
    heartLost: "lost",
    heartBreaking: "breaking",
    timerUrgent: "is-urgent",
    holdDanger: "is-danger",
    holdPerfect: "is-perfect",
    toastCoral: "is-coral",
    toastGold: "is-gold",
    screenFlash: "screen-flash",
    screenOn: "is-on"
  };

  function makeState() {
    return {
      phase: "menu",
      timeLeft: CONFIG.totalSeconds,
      elapsed: 0,
      growth: 0,
      hearts: 3,
      caught: 0,
      perfects: 0,
      perfectThisWarning: false,
      perfectWindow: CONFIG.perfectWindow,
      perfectChain: 0,
      bestChain: 0,
      holding: false,
      pointerId: null,
      boss: "away",
      bossAction: "look",
      bossT: BOSSES[currentBossKey].config.firstQuiet,
      warnTotal: BOSSES[currentBossKey].config.warnBase,
      bubbleLine: BOSSES[currentBossKey].bubble,
      safeLine: BOSSES[currentBossKey].safeLine,
      pendingDouble: false,
      doubleReturn: false,
      lastAction: "look",
      act: 0,
      cycle: 0,
      endReason: null,
      endTimer: 0,
      bloomed: false,
      finished: false
    };
  }

  let G = makeState();
  let result = null;
  let cardStyle = "botanical";
  let cardDataUrls = Object.create(null);
  let cardDataUrl = "";
  let toastTimer = 0;
  let stampTimer = 0;
  let caughtTimer = 0;
  let lastHeartCount = G.hearts;
  let lastHintSignature = "";
  let lastModeText = "";
  let rafId = 0;
  let lastFrame = performance.now();
  let shiftCount = readDailyCount();

  const Sound = {
    ctx: null,
    master: null,
    waterSource: null,
    waterGain: null,
    noiseBuffer: null,
    muted: safeStorageGet(STORAGE.muted, "0") === "1",

    init() {
      if (this.ctx) {
        if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
        return;
      }
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      try {
        this.ctx = new AudioCtor();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.52;
        this.master.connect(this.ctx.destination);
        this.noiseBuffer = this.createNoiseBuffer();
      } catch (error) {
        this.ctx = null;
      }
    },

    createNoiseBuffer() {
      if (!this.ctx) return null;
      const length = Math.floor(this.ctx.sampleRate * 1.5);
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        last = last * 0.82 + white * 0.18;
        data[i] = last;
      }
      return buffer;
    },

    setMuted(muted) {
      this.muted = muted;
      safeStorageSet(STORAGE.muted, muted ? "1" : "0");
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(muted ? 0 : 0.52, this.ctx.currentTime, 0.03);
      }
      if (muted) this.waterOff();
    },

    tone(freq, duration = 0.12, options = {}) {
      if (!this.ctx || this.muted) return;
      const {
        type = "sine",
        gain = 0.06,
        delay = 0,
        endFreq = null
      } = options;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(gain, now + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(env);
      env.connect(this.master);
      osc.start(now);
      osc.stop(now + duration + 0.04);
    },

    start() {
      this.init();
      this.tone(523.25, 0.1, { type: "triangle", gain: 0.035 });
      this.tone(659.25, 0.13, { type: "triangle", gain: 0.03, delay: 0.08 });
    },

    warn(action = "look") {
      const base = action === "double" ? 1046.5 : action === "lean" ? 740 : 880;
      this.tone(base, 0.08, { type: "sine", gain: 0.055 });
      this.tone(base * 0.75, 0.12, { type: "sine", gain: 0.045, delay: 0.11 });
      if (action === "lean") {
        this.tone(196, 0.18, { type: "triangle", gain: 0.028, delay: 0.2, endFreq: 146 });
      }
    },

    double() {
      this.tone(1046.5, 0.07, { type: "square", gain: 0.04 });
      this.tone(880, 0.07, { type: "square", gain: 0.035, delay: 0.08 });
      this.tone(1046.5, 0.1, { type: "square", gain: 0.03, delay: 0.16 });
    },

    feint() {
      this.tone(760, 0.045, { type: "square", gain: 0.025 });
      this.tone(760, 0.045, { type: "square", gain: 0.025, delay: 0.09 });
      this.tone(520, 0.12, { type: "sine", gain: 0.02, delay: 0.18 });
    },

    safe() {
      this.tone(392, 0.12, { type: "sine", gain: 0.03 });
      this.tone(587.33, 0.18, { type: "sine", gain: 0.025, delay: 0.08 });
    },

    act() {
      this.tone(523.25, 0.08, { type: "triangle", gain: 0.025 });
      this.tone(783.99, 0.1, { type: "triangle", gain: 0.02, delay: 0.08 });
    },

    watch() {
      this.tone(174, 0.22, { type: "sine", gain: 0.04, endFreq: 130 });
    },

    release() {
      this.tone(520, 0.045, { type: "square", gain: 0.018, endFreq: 390 });
    },

    perfect(chain = 1) {
      const lift = Math.min(4, Math.max(0, chain - 1)) * 60;
      this.tone(659.25 + lift, 0.1, { type: "triangle", gain: 0.065 });
      this.tone(880 + lift, 0.12, { type: "triangle", gain: 0.055, delay: 0.07 });
      this.tone(1174.66 + lift, 0.18, { type: "sine", gain: 0.045, delay: 0.14 });
    },

    caught() {
      this.tone(196, 0.28, { type: "sawtooth", gain: 0.045, endFreq: 82 });
      this.tone(146, 0.3, { type: "triangle", gain: 0.035, delay: 0.06, endFreq: 70 });
    },

    stageUp() {
      this.tone(523.25, 0.08, { type: "sine", gain: 0.03 });
      this.tone(783.99, 0.11, { type: "sine", gain: 0.025, delay: 0.06 });
    },

    bloom() {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, index) => {
        this.tone(freq, 0.27, {
          type: index === 4 ? "sine" : "triangle",
          gain: 0.055 - index * 0.005,
          delay: index * 0.1
        });
      });
    },

    waterOn() {
      this.init();
      if (!this.ctx || this.muted || this.waterSource) return;
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        source.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 620;
        filter.Q.value = 0.55;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.0001;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        source.start();
        gain.gain.setTargetAtTime(0.034, this.ctx.currentTime, 0.06);
        this.waterSource = source;
        this.waterGain = gain;
      } catch (error) {
        this.waterSource = null;
        this.waterGain = null;
      }
    },

    waterOff() {
      if (!this.waterSource || !this.ctx) {
        this.waterSource = null;
        this.waterGain = null;
        return;
      }
      const source = this.waterSource;
      const gain = this.waterGain;
      this.waterSource = null;
      this.waterGain = null;
      try {
        gain.gain.cancelScheduledValues(this.ctx.currentTime);
        gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.04);
        source.stop(this.ctx.currentTime + 0.22);
      } catch (error) {
        /* Already stopped. */
      }
    }
  };

  function showToast(message, tone = "", duration = 1200) {
    window.clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.classList.remove(HR.toastCoral, HR.toastGold);
    if (tone === "coral") el.toast.classList.add(HR.toastCoral);
    if (tone === "gold") el.toast.classList.add(HR.toastGold);
    el.toast.classList.add(HR.toast);
    toastTimer = window.setTimeout(() => el.toast.classList.remove(HR.toast), duration);
  }

  function announce(message) {
    if (!el.srStatus) return;
    el.srStatus.textContent = "";
    window.setTimeout(() => {
      el.srStatus.textContent = message;
    }, 20);
  }

  function flashStage() {
    el.caughtFlash.classList.remove(HR.flash);
    void el.caughtFlash.offsetWidth;
    el.caughtFlash.classList.add(HR.flash);
    window.setTimeout(() => el.caughtFlash.classList.remove(HR.flash), 520);
  }

  function flashExcel() {
    el.screenFlash.classList.remove(HR.screenFlash);
    void el.screenFlash.getBoundingClientRect();
    el.screenFlash.classList.add(HR.screenFlash);
    window.setTimeout(() => el.screenFlash.classList.remove(HR.screenFlash), 360);
  }

  function showStamp(chain = 1) {
    const title = el.perfectStamp.querySelector("b");
    const score = el.perfectStamp.querySelector(".stamp-score");
    if (title) title.textContent = chain > 1 ? `秒切 x${chain}` : "秒切！";
    if (score) score.textContent = chain > 1 ? `连击 · 演技 +180` : "演技 +180";
    window.clearTimeout(stampTimer);
    el.perfectStamp.classList.remove(HR.stamp);
    void el.perfectStamp.offsetWidth;
    el.perfectStamp.classList.add(HR.stamp);
    stampTimer = window.setTimeout(() => el.perfectStamp.classList.remove(HR.stamp), 1180);
  }

  const screenTimers = new WeakMap();

  function showScreen(screen) {
    if (!screen) return;
    const timer = screenTimers.get(screen);
    if (timer) {
      window.clearTimeout(timer);
      screenTimers.delete(screen);
    }
    screen.hidden = false;
    requestAnimationFrame(() => screen.classList.add(HR.screenOn));
  }

  function hideScreen(screen, delay = 240) {
    if (!screen) return;
    const existing = screenTimers.get(screen);
    if (existing) window.clearTimeout(existing);
    screen.classList.remove(HR.screenOn);
    const timer = window.setTimeout(() => {
      screen.hidden = true;
      screenTimers.delete(screen);
    }, delay);
    screenTimers.set(screen, timer);
  }

  function getFlower() {
    return FLOWERS[currentFlowerKey] || FLOWERS.daisy;
  }

  function getBoss() {
    return BOSSES[currentBossKey] || BOSSES.inquiry;
  }

  function applyProfileClasses() {
    const body = document.body;
    FLOWER_KEYS.forEach((key) => body.classList.remove(`flower-${key}`));
    BOSS_KEYS.forEach((key) => body.classList.remove(`boss-${key}`));
    body.classList.add(`flower-${currentFlowerKey}`, `boss-${currentBossKey}`);
    const labels = currentFlowerKey === "cactus"
      ? ["冒芽", "长个", "花苞", "开花"]
      : ["发芽", "长叶", "花苞", "开花"];
    el.stageLabels.forEach((label, index) => {
      if (labels[index]) label.textContent = labels[index];
    });
  }

  function rollBoss() {
    let key = BOSS_KEYS[Math.floor(Math.random() * BOSS_KEYS.length)];
    if (BOSS_KEYS.length > 1 && key === lastBossKey) {
      const alternatives = BOSS_KEYS.filter((item) => item !== lastBossKey);
      key = alternatives[Math.floor(Math.random() * alternatives.length)];
    }
    lastBossKey = key;
    currentBossKey = key;
    applyProfileClasses();
  }

  function flowerIconSvg(key) {
    if (key === "sunflower") {
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 55V36" stroke="#3E5C43" stroke-width="3" stroke-linecap="round"/>
        <path d="M32 47c-8-8-16-8-20-4 4 8 12 10 20 4Z" fill="#7D9A6E" stroke="#24382C" stroke-width="1.4"/>
        <path d="M32 43c8-7 15-7 19-3-3 8-11 10-19 3Z" fill="#A7B49A" stroke="#24382C" stroke-width="1.4"/>
        <g transform="translate(32 27)">
          <g fill="#F2C14E" stroke="#24382C" stroke-width="1.2">
            <ellipse cx="0" cy="-17" rx="5" ry="11"/><ellipse cx="10" cy="-14" rx="5" ry="11" transform="rotate(30 10 -14)"/>
            <ellipse cx="17" cy="-6" rx="5" ry="11" transform="rotate(60 17 -6)"/><ellipse cx="17" cy="6" rx="5" ry="11" transform="rotate(90 17 6)"/>
            <ellipse cx="10" cy="14" rx="5" ry="11" transform="rotate(120 10 14)"/><ellipse cx="0" cy="17" rx="5" ry="11" transform="rotate(150 0 17)"/>
            <ellipse cx="-10" cy="14" rx="5" ry="11" transform="rotate(180 -10 14)"/><ellipse cx="-17" cy="6" rx="5" ry="11" transform="rotate(210 -17 6)"/>
            <ellipse cx="-17" cy="-6" rx="5" ry="11" transform="rotate(240 -17 -6)"/><ellipse cx="-10" cy="-14" rx="5" ry="11" transform="rotate(270 -10 -14)"/>
          </g>
          <circle cx="0" cy="0" r="12" fill="#7A4A2A" stroke="#24382C" stroke-width="1.4"/>
          <circle cx="-4" cy="-2" r="1.4" fill="#F4EFE3"/><circle cx="4" cy="-2" r="1.4" fill="#F4EFE3"/>
          <path d="M-4 4c3 2 5 2 8 0" fill="none" stroke="#F4EFE3" stroke-width="1.4" stroke-linecap="round"/>
        </g>
      </svg>`;
    }
    if (key === "cactus") {
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M23 53c-8 0-11-5-11-11V31" fill="none" stroke="#6F8F63" stroke-width="9" stroke-linecap="round"/>
        <path d="M41 47c8 0 11-5 11-11V34" fill="none" stroke="#7D9A6E" stroke-width="8" stroke-linecap="round"/>
        <rect x="22" y="18" width="20" height="40" rx="10" fill="#7D9A6E" stroke="#24382C" stroke-width="1.6"/>
        <path d="M28 23v30M36 21v33" stroke="#4E6B4C" stroke-width="1" opacity=".7"/>
        <circle cx="28" cy="34" r="1.4" fill="#24382C"/><circle cx="36" cy="34" r="1.4" fill="#24382C"/>
        <path d="M29 39c2 2 4 2 6 0" fill="none" stroke="#24382C" stroke-width="1.3" stroke-linecap="round"/>
        <g transform="translate(32 14)">
          <ellipse cx="0" cy="-5" rx="4" ry="8" fill="#E59A9A" stroke="#24382C" stroke-width="1.2" transform="rotate(-30)"/>
          <ellipse cx="0" cy="-5" rx="4" ry="8" fill="#E56B4A" stroke="#24382C" stroke-width="1.2" transform="rotate(30)"/>
          <ellipse cx="0" cy="-5" rx="4" ry="8" fill="#E59A9A" stroke="#24382C" stroke-width="1.2" transform="rotate(90)"/>
          <ellipse cx="0" cy="-5" rx="4" ry="8" fill="#E56B4A" stroke="#24382C" stroke-width="1.2" transform="rotate(150)"/>
          <circle cx="0" cy="0" r="5" fill="#F2C14E" stroke="#24382C" stroke-width="1.2"/>
        </g>
      </svg>`;
    }
    return `<svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 55V32" stroke="#3E5C43" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 48c-8-8-16-8-20-4 4 8 12 10 20 4Z" fill="#7D9A6E" stroke="#24382C" stroke-width="1.4"/>
      <path d="M32 43c8-7 15-7 19-3-3 8-11 10-19 3Z" fill="#A7B49A" stroke="#24382C" stroke-width="1.4"/>
      <g transform="translate(32 25)">
        <g stroke="#24382C" stroke-width="1.2">
          <ellipse cx="0" cy="-14" rx="6" ry="11" fill="#E56B4A"/>
          <ellipse cx="10" cy="-10" rx="6" ry="11" fill="#F2C14E" transform="rotate(45 10 -10)"/>
          <ellipse cx="14" cy="0" rx="6" ry="11" fill="#E56B4A" transform="rotate(90 14 0)"/>
          <ellipse cx="10" cy="10" rx="6" ry="11" fill="#F2C14E" transform="rotate(135 10 10)"/>
          <ellipse cx="0" cy="14" rx="6" ry="11" fill="#E56B4A" transform="rotate(180 0 14)"/>
          <ellipse cx="-10" cy="10" rx="6" ry="11" fill="#F2C14E" transform="rotate(225 -10 10)"/>
          <ellipse cx="-14" cy="0" rx="6" ry="11" fill="#E56B4A" transform="rotate(270 -14 0)"/>
          <ellipse cx="-10" cy="-10" rx="6" ry="11" fill="#F2C14E" transform="rotate(315 -10 -10)"/>
        </g>
        <circle cx="0" cy="0" r="11" fill="#F2C14E" stroke="#24382C" stroke-width="1.4"/>
        <circle cx="-4" cy="-2" r="1.3" fill="#24382C"/><circle cx="4" cy="-2" r="1.3" fill="#24382C"/>
        <path d="M-3 4c2 2 4 2 6 0" fill="none" stroke="#24382C" stroke-width="1.3" stroke-linecap="round"/>
      </g>
    </svg>`;
  }

  function fillFlowerIcons() {
    $$("[data-flower-icon]").forEach((node) => {
      node.innerHTML = flowerIconSvg(node.dataset.flowerIcon);
    });
  }

  function updateCodexLabels() {
    const counts = codexCounts();
    const text = `${counts.seen}/${counts.total}`;
    if (el.startCodexCount) el.startCodexCount.textContent = text;
    if (el.setupCodexCount) el.setupCodexCount.textContent = text;
  }

  function renderFlowerPicker() {
    el.flowerOptions.forEach((option) => {
      const key = option.dataset.flower;
      const flower = FLOWERS[key];
      if (!flower) return;
      const state = codexState[key] || { seen: false, bloomed: false };
      const active = key === selectedFlowerKey;
      option.classList.toggle("is-active", active);
      option.classList.toggle("is-seen", state.seen);
      option.classList.toggle("is-bloomed", state.bloomed);
      option.setAttribute("aria-pressed", active ? "true" : "false");
      const stamp = option.querySelector(".flower-stamp");
      if (stamp) stamp.textContent = state.bloomed ? "已养开" : state.seen ? "已认识" : "";
    });
  }

  function renderBossPreview() {
    const boss = getBoss();
    if (el.setupBossName) el.setupBossName.textContent = boss.name;
    if (el.setupBossTag) el.setupBossTag.textContent = boss.tag;
    if (el.setupBossQuip) el.setupBossQuip.textContent = boss.quip;
    if (el.setupBossPortrait) {
      el.setupBossPortrait.classList.toggle("is-coffee", currentBossKey === "coffee");
      el.setupBossPortrait.classList.toggle("is-patrol", currentBossKey === "patrol");
    }
    if (el.setupStartSub) {
      el.setupStartSub.textContent = `${FLOWERS[selectedFlowerKey].name} · ${boss.name}老板`;
    }
  }

  function renderSetup() {
    if (el.setupDate) {
      el.setupDate.textContent = new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).replaceAll("/", ".");
    }
    renderFlowerPicker();
    renderBossPreview();
    updateCodexLabels();
  }

  function openSetup() {
    if (G.phase === "playing" || G.phase === "ending") return;
    result = null;
    cardStyle = "botanical";
    cardDataUrls = Object.create(null);
    cardDataUrl = "";
    selectedFlowerKey = FLOWERS[currentFlowerKey] ? currentFlowerKey : "daisy";
    rollBoss();
    applyProfileClasses();
    renderSetup();
    hideScreen(el.startScreen, 220);
    hideScreen(el.resultScreen, 180);
    hideScreen(el.cardScreen, 180);
    showScreen(el.setupScreen);
    updateCardStyleButtons();
  }

  function backToStart() {
    hideScreen(el.setupScreen, 220);
    hideScreen(el.codexScreen, 140);
    showScreen(el.startScreen);
    updateCodexLabels();
  }

  function renderCodex() {
    const counts = codexCounts();
    if (el.codexSummary) {
      el.codexSummary.textContent = `认识 ${counts.seen}/${counts.total} · 养开 ${counts.bloomed}/${counts.total}`;
    }
    if (!el.codexList) return;
    el.codexList.innerHTML = FLOWER_KEYS.map((key) => {
      const flower = FLOWERS[key];
      const state = codexState[key] || { seen: false, bloomed: false };
      const classes = [
        "codex-entry",
        state.seen ? "is-seen" : "is-unseen",
        state.bloomed ? "is-bloomed" : ""
      ].join(" ");
      return `<div class="${classes}">
        <div class="codex-thumb">${flowerIconSvg(key)}</div>
        <div class="codex-copy"><b>${flower.name}</b><span>${flower.tagline}</span></div>
        <div class="codex-stamps">
          <span class="codex-status ${state.seen ? "is-seen" : "is-empty"}">${state.seen ? "已认识" : "未认识"}</span>
          <span class="codex-status ${state.bloomed ? "is-bloomed" : "is-empty"}">${state.bloomed ? "已养开" : "未养开"}</span>
        </div>
      </div>`;
    }).join("");
  }

  function openCodex() {
    codexReturnFocus = document.activeElement;
    renderCodex();
    showScreen(el.codexScreen);
  }

  function closeCodex() {
    hideScreen(el.codexScreen, 180);
    if (codexReturnFocus && typeof codexReturnFocus.focus === "function") {
      codexReturnFocus.focus();
    }
    codexReturnFocus = null;
  }

  function setBodyState() {
    const body = document.body;
    const active = G.phase === "playing" || G.phase === "ending";
    const warning = G.boss === "warning" && active;
    const watching = G.boss === "watching" && active;
    const safe = G.boss === "safe" && active;
    const feint = G.boss === "feint" && active;
    const pending = G.boss === "leaving" && G.pendingDouble && active;
    const locked = active && (
      watching ||
      (warning && G.bossT <= G.perfectWindow)
    );
    body.classList.toggle("boss-warning", warning);
    body.classList.toggle("boss-watching", watching);
    body.classList.toggle("boss-safe", safe);
    body.classList.toggle("boss-feint", feint);
    body.classList.toggle("boss-pending", pending);
    body.classList.toggle("boss-lean", warning && G.bossAction === "lean");
    body.classList.toggle("boss-double", warning && G.bossAction === "double");
    body.classList.toggle("boss-locked", locked);
    el.app.classList.toggle("is-holding", G.holding);
  }

  function setHearts(animateIndex = -1) {
    el.heartEls.forEach((heart, index) => {
      const lost = index >= G.hearts;
      heart.classList.toggle(HR.heartLost, lost);
      if (index === animateIndex) {
        heart.classList.remove(HR.heartBreaking);
        void heart.offsetWidth;
        heart.classList.add(HR.heartBreaking);
        window.setTimeout(() => heart.classList.remove(HR.heartBreaking), 620);
      }
    });
    el.hearts.setAttribute("aria-label", `剩余 ${G.hearts} 颗心`);
    lastHeartCount = G.hearts;
  }

  function updateTimer() {
    const seconds = Math.max(0, Math.ceil(G.timeLeft));
    const text = `00:${String(seconds).padStart(2, "0")}`;
    if (el.timer.textContent !== text) el.timer.textContent = text;
    const urgent = G.phase === "playing" && G.timeLeft <= 10;
    el.timerBox.classList.toggle(HR.timerUrgent, urgent);
  }

  function stageForGrowth(growth) {
    if (currentFlowerKey === "cactus") {
      if (growth >= 90) return "开花";
      if (growth >= 55) return "花苞";
      if (growth >= 25) return "长个";
      return "冒芽";
    }
    if (growth >= 90) return "开花";
    if (growth >= 55) return "花苞";
    if (growth >= 25) return "长叶";
    return "发芽";
  }

  function renderPlant(growth) {
    const normalized = clamp(growth / 100, 0, 1);
    const scale = 0.36 + 0.78 * Math.pow(normalized, 0.68);
    const transform = `translate(450 992) scale(${scale.toFixed(4)}) translate(-450 -992)`;
    el.plantGrowth.setAttribute("transform", transform);
    if (el.cactusGrowth) el.cactusGrowth.setAttribute("transform", transform);

    el.leaf1.classList.toggle(HR.leaf, growth >= 14);
    el.leaf2.classList.toggle(HR.leaf, growth >= 34);
    el.leaf3.classList.toggle(HR.leaf, growth >= 51);
    el.leaf4.classList.toggle(HR.leaf, growth >= 3);

    const budOn = growth >= 52;
    el.budGroup.classList.toggle(HR.leaf, budOn);
    el.budGroup.style.opacity = growth >= 84 ? String(clamp((88 - growth) / 4, 0, 1)) : "";
    const budScale = 0.72 + 0.38 * clamp((growth - 52) / 34, 0, 1);
    el.budGroup.style.transform = `scale(${budScale.toFixed(3)})`;

    el.sproutFace.classList.toggle(HR.leaf, growth < 48);
    el.plantFace.classList.toggle(HR.leaf, growth >= 64);
    el.flowerPetals.classList.toggle(HR.leaf, growth >= 82);

    if (el.cactusBud) el.cactusBud.classList.toggle(HR.leaf, growth >= 50 && growth < 82);
    if (el.cactusFlower) el.cactusFlower.classList.toggle(HR.leaf, growth >= 82);

    const bloom = clamp((growth - 82) / 18, 0, 1);
    const flowerScale = currentFlowerKey === "sunflower" ? 1.08 : 1;
    const petalScale = (0.1 + 1.2 * easeOutCubic(bloom)) * flowerScale;
    el.flowerPetals.setAttribute(
      "transform",
      `translate(446 710) scale(${petalScale.toFixed(4)}) translate(-446 -710)`
    );

    const faceScale = 0.62 + 0.58 * easeOutCubic(clamp((growth - 48) / 52, 0, 1));
    el.plantFace.style.transform = `scale(${faceScale.toFixed(3)})`;
    if (el.cactusFlower) {
      el.cactusFlower.style.transform = `scale(${(1 + 0.24 * bloom).toFixed(3)})`;
    }

    const pct = growth >= 100 ? 100 : Math.floor(growth);
    el.growthPct.textContent = `${pct}%`;
    el.growthFill.style.width = `${clamp(growth, 0, 100)}%`;
    el.growthMarker.style.left = `${clamp(growth, 0, 100)}%`;
    const stageName = stageForGrowth(growth);
    if (el.stageName.textContent !== stageName) el.stageName.textContent = stageName;
  }

  function updateHoldHint() {
    let strong = "按住屏幕 · 浇水";
    let small = "老板回头前松手，切回 Excel";
    let state = "";

    if (G.phase === "ending") {
      if (G.endReason === "bloom") {
        strong = "开花了";
        small = "老板没发现 · 正在生成战报";
      } else if (G.endReason === "caught3") {
        strong = "三次被抓";
        small = "老板已经记住你了";
        state = "danger";
      } else {
        strong = "17:59 了";
        small = "花没开，明天再浇";
      }
    } else if (G.phase === "playing") {
      if (G.boss === "watching") {
        strong = "停手，别动";
        small = "老板正在看你";
        state = "danger";
      } else if (G.boss === "leaving" && G.pendingDouble) {
        strong = "还没走，先别动";
        small = "老板只是转了个身";
        state = "danger";
      } else if (G.boss === "warning") {
        if (!G.holding) {
          strong = "已切回 Excel";
          small = "屏住呼吸，等老板走";
        } else if (G.perfectThisWarning) {
          strong = "松手，别贪";
          small = "这一轮秒切已经拿到了";
          state = "danger";
        } else if (G.bossT <= G.perfectWindow) {
          strong = G.bossAction === "lean" ? "贴脸秒切！" : "松手！秒切";
          small = `最后 ${G.perfectWindow.toFixed(1)} 秒 · 演技 +180`;
          state = "perfect";
        } else {
          strong = G.bossAction === "double"
            ? "又回来了"
            : G.bossAction === "lean" ? "老板探身了" : "老板要回头了";
          small = "现在松手，切回 Excel";
          state = "danger";
        }
      } else if (G.boss === "safe") {
        strong = G.holding ? "老板不在 · 多浇一点" : "安全窗口 · 赶紧浇";
        small = "接电话 / 续杯的时间，不用切屏";
        state = G.holding ? "holding" : "";
      } else if (G.boss === "feint") {
        strong = G.holding ? "老板接电话 · 继续浇" : "老板接电话 · 可以贪";
        small = "红条收回去，这次是假动作";
        state = G.holding ? "holding" : "";
      } else if (G.holding) {
        strong = "正在浇水";
        small = "按住不放，花长得更快";
        state = "holding";
      } else if (G.timeLeft <= 10) {
        strong = "按住屏幕 · 浇水";
        small = "最后十秒，花就差一点";
      }
    }

    const signature = `${strong}|${small}|${state}`;
    if (signature !== lastHintSignature) {
      lastHintSignature = signature;
      el.holdStrong.textContent = strong;
      el.holdSmall.textContent = small;
      el.holdHint.classList.toggle(HR.holdDanger, state === "danger");
      el.holdHint.classList.toggle(HR.holdPerfect, state === "perfect");
    }
    el.holdBarFill.style.width = G.holding ? "100%" : "0%";
  }

  function updateMode() {
    let text = "EXCEL · Q4_方案_最终版_真的最终.xlsx";
    if (G.phase === "playing" || G.phase === "ending") {
      if (G.boss === "watching") text = "EXCEL · 光标已冻结";
      else if (G.boss === "safe") text = "老板不在 · 可以贪水";
      else if (G.boss === "feint") text = "EXCEL · 老板接电话";
      else if (G.boss === "leaving" && G.pendingDouble) text = "EXCEL · 他还没走";
      else if (G.holding) text = "摸鱼模式 · 正在浇灌 Q4";
      else if (G.boss === "warning") text = "EXCEL · 已按 Ctrl+S";
    }
    if (text !== lastModeText) {
      lastModeText = text;
      el.modeText.textContent = text;
    }
  }

  function updateBossBubble() {
    const bubbleVisible =
      G.boss === "warning" ||
      G.boss === "watching" ||
      G.boss === "feint" ||
      G.boss === "safe" ||
      (G.boss === "leaving" && G.pendingDouble);
    if (bubbleVisible) {
      el.bossLine.textContent = G.boss === "watching" ? "……" : (G.bubbleLine || getBoss().bubble);
    } else {
      el.bossLine.textContent = G.bubbleLine || getBoss().bubble;
    }

    const warning = G.boss === "warning";
    const progress = warning ? clamp(1 - G.bossT / G.warnTotal, 0, 1) : 0;
    el.warnFill.style.width = `${progress * 100}%`;
    el.warnFill.classList.toggle("is-perfect", warning && G.bossT <= G.perfectWindow);
    el.perfectZone.style.width = `${clamp(G.perfectWindow / Math.max(0.01, G.warnTotal), 0, 1) * 100}%`;
  }

  function smoothstep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function updateBossTurn() {
    if (G.boss === "feint") {
      el.bossTurn.setAttribute("transform", "translate(11 0) rotate(4 804 660)");
      el.bossPupil.style.transform = "translateX(22px) scale(0.9)";
      el.bossEye.style.transform = "scale(0.96)";
      el.bossLid.style.transform = "translateY(2px)";
      el.bossBrow.style.transform = "translateY(1px)";
      return;
    }

    if (G.boss !== "warning" && G.boss !== "watching") {
      el.bossTurn.removeAttribute("transform");
      el.bossEye.style.transform = "";
      el.bossPupil.style.transform = "";
      el.bossLid.style.transform = "";
      el.bossBrow.style.transform = "";
      return;
    }

    if (G.boss === "watching") {
      el.bossTurn.setAttribute("transform", "translate(-6 0) rotate(-2 804 660)");
      el.bossEye.style.transform = "";
      el.bossPupil.style.transform = "";
      el.bossLid.style.transform = "";
      el.bossBrow.style.transform = "";
      return;
    }

    const warningProgress = clamp(1 - G.bossT / G.warnTotal, 0, 1);
    const perfectStart = clamp(1 - G.perfectWindow / G.warnTotal, 0.2, 0.92);
    const delayed = clamp((warningProgress - 0.06) / Math.max(0.001, perfectStart - 0.06), 0, 1);
    const turn = smoothstep(delayed);
    const intensity = G.bossAction === "lean" ? 1.18 : G.bossAction === "double" ? 1.08 : 1;

    const headX = 4 - 11 * turn * intensity;
    const headRotate = 6 - 9 * turn * intensity;
    const pupilX = 27 - 44 * turn * intensity;
    const pupilScale = 0.9 - 0.04 * turn;
    const eyeScale = 0.96 + 0.13 * turn;
    const lidY = 10 * (1 - turn);
    const browY = 4 - 9 * turn;

    el.bossTurn.setAttribute(
      "transform",
      `translate(${headX.toFixed(2)} 0) rotate(${headRotate.toFixed(2)} 804 660)`
    );
    el.bossPupil.style.transform = `translateX(${pupilX.toFixed(2)}px) scale(${pupilScale.toFixed(3)})`;
    el.bossEye.style.transform = `scale(${eyeScale.toFixed(3)})`;
    el.bossLid.style.transform = `translateY(${lidY.toFixed(2)}px)`;
    el.bossBrow.style.transform = `translateY(${browY.toFixed(2)}px)`;
  }

  function render() {
    updateTimer();
    renderPlant(G.growth);
    updateBossBubble();
    updateBossTurn();
    updateHoldHint();
    updateMode();
    setBodyState();
    el.timerBox.setAttribute("aria-label", `剩余时间 ${Math.max(0, Math.ceil(G.timeLeft))} 秒`);
  }

  function changeGrowth(amount) {
    const beforeStage = stageForGrowth(G.growth);
    G.growth = clamp(G.growth + amount, 0, 100);
    const afterStage = stageForGrowth(G.growth);
    if (afterStage !== beforeStage && G.growth < 100) {
      Sound.stageUp();
      el.app.classList.remove("is-stage-up");
      void el.app.offsetWidth;
      el.app.classList.add("is-stage-up");
      window.setTimeout(() => el.app.classList.remove("is-stage-up"), 560);
      const message = afterStage === "花苞"
        ? "花苞鼓起来了"
        : afterStage === "开花"
          ? "花瓣要打开了"
          : currentFlowerKey === "cactus" ? "仙人掌长高了一点" : "长出了新叶子";
      showToast(message, "gold", 1100);
    }
    if (G.growth >= 100 && G.phase === "playing") {
      triggerBloom();
    }
  }

  function getAct() {
    if (G.elapsed >= 30) return 2;
    if (G.elapsed >= 15) return 1;
    return 0;
  }

  function updateAct() {
    if (G.phase !== "playing") return;
    const act = getAct();
    if (act <= G.act) return;
    G.act = act;
    if (act === 1) {
      showToast("离下班 30 秒 · 老板开始来回走", "gold", 1600);
      announce("离下班还有三十秒，老板开始来回走。");
    } else {
      showToast("最后 15 秒 · 老板认真了", "gold", 1600);
      announce("最后十五秒，老板开始认真了。");
    }
    Sound.act();
  }

  function chooseBossAction(act) {
    const deck = BOSS_ACTIONS[currentBossKey] && BOSS_ACTIONS[currentBossKey][act];
    const fallback = [["look", 1]];
    const source = deck || fallback;
    const filtered = source.filter(([action]) => action !== G.lastAction);
    const pool = filtered.length ? filtered : source;
    const total = pool.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * total;
    for (const [action, weight] of pool) {
      roll -= weight;
      if (roll <= 0) return action;
    }
    return pool[pool.length - 1][0];
  }

  function beginNextBossAction() {
    const action = G.act === 0 ? "look" : chooseBossAction(G.act);
    if (action === "safe") beginSafe();
    else beginWarning(action);
  }

  function beginBossQuiet(first = false, afterSafe = false) {
    const cfg = getBoss().config;
    G.boss = "away";
    G.bossAction = "look";
    G.pendingDouble = false;
    G.doubleReturn = false;
    G.bubbleLine = getBoss().bubble;
    let quiet = first
      ? cfg.firstQuiet
      : Math.max(cfg.quietMin, cfg.quietBase - G.cycle * cfg.quietStep);
    if (G.act >= 2) quiet *= 0.8;
    else if (G.act === 1) quiet *= 0.92;
    if (afterSafe) quiet = Math.min(quiet, 1.6);
    G.bossT = quiet;
  }

  function beginWarning(action = "look") {
    const cfg = getBoss().config;
    const boss = getBoss();
    const isReturn = action === "double" && G.pendingDouble;
    G.cycle += 1;
    G.boss = "warning";
    G.bossAction = action;
    G.pendingDouble = false;
    G.doubleReturn = isReturn;
    G.perfectThisWarning = false;
    let warn = Math.max(cfg.warnMin, cfg.warnBase - (G.cycle - 1) * cfg.warnStep);
    let perfect = CONFIG.perfectWindow;
    if (action === "lean") {
      warn = Math.max(1.65, warn * 1.35 + 0.15);
      perfect = 0.7;
    } else if (action === "double") {
      warn = Math.max(0.82, warn * 0.62);
      perfect = 0.4;
    } else if (action === "feint") {
      warn *= 1.03;
      perfect = 0.55;
    } else if (G.act >= 2) {
      warn *= 0.92;
    }
    G.warnTotal = warn;
    G.bossT = warn;
    G.perfectWindow = perfect;
    G.bubbleLine = action === "feint"
      ? boss.feintLine
      : action === "lean"
        ? boss.leanLine
        : action === "double"
          ? boss.doubleLine
          : boss.bubble;
    G.lastAction = action;
    if (action === "double") Sound.double();
    else Sound.warn(action);
    announce(
      action === "double"
        ? "老板又回来了，先别浇水。"
        : action === "lean"
          ? "老板探身过来了，准备松手。"
          : "老板要回头了，准备松手。"
    );
  }

  function beginFeintBreak() {
    if (G.boss !== "warning") return;
    G.boss = "feint";
    G.bossT = 0.75;
    G.bubbleLine = getBoss().feintLine;
    Sound.feint();
    announce("老板接电话了，暂时安全。");
  }

  function beginSafe() {
    const boss = getBoss();
    G.boss = "safe";
    G.bossAction = "safe";
    G.bossT = 2.8 + Math.random() * 1.5;
    G.pendingDouble = false;
    G.doubleReturn = false;
    G.safeLine = boss.safeLine;
    G.bubbleLine = boss.safeLine;
    G.lastAction = "safe";
    Sound.safe();
    announce("老板暂时离开，可以放心浇水。");
  }

  function beginWatching() {
    const cfg = getBoss().config;
    G.boss = "watching";
    G.bossT = Math.min(
      cfg.watchMax,
      cfg.watchBase + Math.max(0, G.cycle - 1) * cfg.watchStep
    );
    if (G.bossAction === "lean") G.bossT *= 1.2;
    else if (G.bossAction === "double") G.bossT *= 0.85;
    Sound.watch();
    if (G.holding) {
      catchPlayer();
    } else {
      announce("老板正在看你的屏幕。");
    }
  }

  function beginLeaving() {
    const isDouble = G.bossAction === "double" && !G.doubleReturn;
    G.boss = "leaving";
    G.pendingDouble = isDouble;
    G.bossT = isDouble ? 0.34 : getBoss().config.leaveBase;
    if (isDouble) G.bubbleLine = getBoss().doubleLine;
  }

  function updateBoss(dt) {
    G.bossT -= dt;
    if (
      G.boss === "warning" &&
      G.bossAction === "feint" &&
      G.bossT <= G.warnTotal * 0.55
    ) {
      beginFeintBreak();
      return;
    }
    if (G.bossT > 0) return;
    if (G.boss === "away") {
      beginNextBossAction();
    } else if (G.boss === "warning") {
      beginWatching();
    } else if (G.boss === "watching") {
      beginLeaving();
    } else if (G.boss === "feint") {
      beginLeaving();
    } else if (G.boss === "safe") {
      beginBossQuiet(false, true);
    } else if (G.boss === "leaving") {
      if (G.pendingDouble) {
        beginWarning("double");
      } else {
        beginBossQuiet();
      }
    }
  }

  function startHold() {
    if (G.phase !== "playing") return;
    if (G.holding) return;
    if (G.boss === "watching") {
      showToast("老板在看，先别浇水", "coral", 900);
      return;
    }
    G.holding = true;
    Sound.waterOn();
    setBodyState();
    render();
  }

  function stopHold() {
    if (!G.holding) return;
    G.holding = false;
    Sound.waterOff();
    setBodyState();
    render();
  }

  function releaseHold(options = {}) {
    if (!G.holding) return;
    const wasWarning = G.boss === "warning";
    const remaining = G.bossT;
    G.holding = false;
    Sound.waterOff();
    el.app.classList.remove("is-holding");

    if (G.phase !== "playing") {
      render();
      return;
    }

    flashExcel();
    Sound.release();

    if (wasWarning && remaining > 0 && remaining <= G.perfectWindow && !G.perfectThisWarning) {
      G.perfectThisWarning = true;
      G.perfects += 1;
      G.perfectChain += 1;
      G.bestChain = Math.max(G.bestChain, G.perfectChain);
      showStamp(G.perfectChain);
      Sound.perfect(G.perfectChain);
      announce(G.perfectChain > 1
        ? `完美连击 ${G.perfectChain} 次，演技加一百八十。`
        : "完美切屏，演技加一百八十。");
      el.app.classList.add("is-perfect");
      window.setTimeout(() => el.app.classList.remove("is-perfect"), 700);
      const bonus = G.bossAction === "lean" ? CONFIG.perfectGrowth + 1 : CONFIG.perfectGrowth;
      changeGrowth(bonus);
    } else if (wasWarning) {
      G.perfectChain = 0;
    }

    render();
  }

  function catchPlayer() {
    if (G.phase !== "playing") return;
    G.holding = false;
    Sound.waterOff();
    G.hearts -= 1;
    G.caught += 1;
    G.perfectChain = 0;
    G.growth = Math.max(0, G.growth - CONFIG.growthPenalty);
    setBodyState();
    el.app.classList.remove("is-holding");
    el.app.classList.add("is-caught");
    el.app.classList.remove(HR.app);
    void el.app.offsetWidth;
    el.app.classList.add(HR.app);
    flashStage();
    Sound.caught();
    setHearts(G.hearts);
    showToast(`被抓包了 · 成长 -${CONFIG.growthPenalty}`, "coral", 1450);
    announce(`被抓包了，还剩 ${Math.max(0, G.hearts)} 颗心。`);
    window.clearTimeout(caughtTimer);
    caughtTimer = window.setTimeout(() => el.app.classList.remove("is-caught"), 900);

    if (G.hearts <= 0) {
      endGame("caught3");
    } else {
      render();
    }
  }

  function triggerBloom() {
    if (G.phase !== "playing") return;
    G.growth = 100;
    G.bloomed = true;
    G.holding = false;
    G.boss = "away";
    Sound.waterOff();
    Sound.bloom();
    el.app.classList.remove("is-holding");
    document.body.classList.remove("boss-warning", "boss-watching", "boss-locked");
    el.app.classList.add("is-bloom");
    el.bloomBurst.classList.remove(HR.bloom);
    void el.bloomBurst.offsetWidth;
    el.bloomBurst.classList.add(HR.bloom);
    announce("花开了，老板没有发现。");
    endGame("bloom");
  }

  function endGame(reason) {
    if (G.phase === "ending" || G.phase === "over") return;
    G.endReason = reason;
    G.phase = "ending";
    G.holding = false;
    Sound.waterOff();
    el.app.classList.remove("is-holding");
    G.endTimer = reason === "bloom" ? 1.9 : reason === "caught3" ? 1.35 : 1.0;
    if (reason === "timeout") {
      showToast("17:59 了，花还没开。", "coral", 1300);
    }
    setBodyState();
    render();
  }

  function choosePersona() {
    if (G.endReason === "caught3") return { key: "watched", ...PERSONAS.watched };
    if (G.bloomed && G.caught === 0) return { key: "god", ...PERSONAS.god };
    if (G.bloomed && G.caught === 1) return { key: "actor", ...PERSONAS.actor };
    if (G.bloomed && G.caught >= 2) return { key: "athlete", ...PERSONAS.athlete };
    if (G.growth >= 85) return { key: "almost", ...PERSONAS.almost };
    return { key: "wilt", ...PERSONAS.wilt };
  }

  function buildResult() {
    const persona = choosePersona();
    const bloomTime = G.bloomed ? Math.min(CONFIG.totalSeconds, G.elapsed) : null;
    const timeValue = bloomTime === null ? "未开花" : `${bloomTime.toFixed(1)}s`;
    const score = Math.max(0, Math.round(
      G.growth * 7 +
      G.perfects * CONFIG.scorePerfect +
      G.timeLeft * 12 +
      G.hearts * 90 +
      (G.bloomed ? 200 : 0)
    ));
    return {
      ...persona,
      flowerKey: currentFlowerKey,
      flowerName: getFlower().name,
      flowerTagline: getFlower().tagline,
      bossKey: currentBossKey,
      bossName: getBoss().name,
      bossTag: getBoss().tag,
      bossQuip: getBoss().quip,
      bloomed: G.bloomed,
      growth: G.growth,
      growthPct: Math.min(100, Math.floor(G.growth)),
      hearts: G.hearts,
      caught: G.caught,
      perfects: G.perfects,
      timeLeft: G.timeLeft,
      bloomTime,
      timeValue,
      score,
      dateText: new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).replaceAll("/", ".")
    };
  }

  function finish() {
    if (G.finished) return;
    G.finished = true;
    G.phase = "over";
    result = buildResult();
    setBodyState();
    el.resultDate.textContent = result.dateText;
    el.personaTitle.textContent = result.title;
    el.personaTitle.classList.toggle("is-long", result.title.length >= 8);
    el.personaDesc.textContent = result.desc;
    if (el.resultContext) {
      el.resultContext.textContent = `花：${result.flowerName} · 老板：${result.bossName} / 17:59`;
    }
    if (el.resultBossLine) {
      el.resultBossLine.textContent = `老板批注：${result.bossQuip}`;
    }
    el.resultGrade.textContent = result.grade;
    el.quoteText.textContent = result.quote;
    el.statScore.textContent = result.score.toLocaleString("zh-CN");
    el.statTime.textContent = result.timeValue;
    el.statPerfect.textContent = `${result.perfects}`;
    el.statCaught.textContent = `${result.caught}`;
    if (result.bloomed) {
      markFlowerBloomed(currentFlowerKey);
    }
    updateCodexLabels();
    cardStyle = "botanical";
    cardDataUrls = Object.create(null);
    cardDataUrl = "";
    updateCardStyleButtons();
    el.cardImage.removeAttribute("src");

    shiftCount += 1;
    saveDailyCount(shiftCount);
    el.shiftCount.textContent = `今日第 ${shiftCount} 盆`;

    showScreen(el.resultScreen);
    announce(`本局结束。你的工位人格是${result.title}。摸鱼值 ${result.score}。`);
  }

  function loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;

    if (G.phase === "playing") {
      G.timeLeft = Math.max(0, G.timeLeft - dt);
      G.elapsed += dt;

      if (G.holding && G.boss !== "watching") {
        const speed = CONFIG.growthRate * (G.timeLeft <= 8 ? 1.06 : 1);
        changeGrowth(dt * speed);
      }

      updateAct();
      if (G.phase === "playing") updateBoss(dt);

      if (G.timeLeft <= 0 && G.phase === "playing") {
        endGame("timeout");
      }
    } else if (G.phase === "ending") {
      G.endTimer -= dt;
      if (G.endTimer <= 0) finish();
    }

    render();
    rafId = requestAnimationFrame(loop);
  }

  function resetVisuals() {
    appClasses.forEach((className) => el.app.classList.remove(className));
    el.app.classList.remove("is-stage-up");
    document.body.classList.remove(
      "boss-warning",
      "boss-watching",
      "boss-safe",
      "boss-feint",
      "boss-pending",
      "boss-lean",
      "boss-double",
      "boss-locked",
      "is-caught"
    );
    el.timerBox.classList.remove(HR.timerUrgent);
    el.holdHint.classList.remove(HR.holdDanger, HR.holdPerfect);
    el.toast.classList.remove(HR.toast);
    el.perfectStamp.classList.remove(HR.stamp);
    el.bloomBurst.classList.remove(HR.bloom);
    el.caughtFlash.classList.remove(HR.flash);
    el.screenFlash.classList.remove(HR.screenFlash);
    el.flowerPetals.style.opacity = "";
    el.plantFace.style.opacity = "";
    el.budGroup.style.opacity = "";
    lastHintSignature = "";
    lastModeText = "";
    G.holding = false;
    setHearts();
    renderPlant(0);
  }

  function beginGame() {
    if (G.phase === "playing" || G.phase === "ending") return;
    window.clearTimeout(toastTimer);
    window.clearTimeout(stampTimer);
    window.clearTimeout(caughtTimer);
    currentFlowerKey = FLOWERS[selectedFlowerKey] ? selectedFlowerKey : "daisy";
    selectedFlowerKey = currentFlowerKey;
    if (!BOSSES[currentBossKey]) rollBoss();
    safeStorageSet(STORAGE.flower, currentFlowerKey);
    markFlowerSeen(currentFlowerKey);
    updateCodexLabels();
    applyProfileClasses();
    G = makeState();
    G.phase = "playing";
    G.bossT = getBoss().config.firstQuiet;
    G.warnTotal = getBoss().config.warnBase;
    result = null;
    cardStyle = "botanical";
    cardDataUrls = Object.create(null);
    cardDataUrl = "";
    updateCardStyleButtons();
    hideScreen(el.resultScreen, 160);
    hideScreen(el.cardScreen, 160);
    hideScreen(el.setupScreen, 220);
    hideScreen(el.startScreen, 220);
    hideScreen(el.codexScreen, 120);
    resetVisuals();
    applyProfileClasses();
    Sound.init();
    Sound.start();
    showToast(`${getFlower().name} · ${getBoss().name}老板当值`, "", 1600);
    render();
    lastFrame = performance.now();
  }

  function retry() {
    hideScreen(el.resultScreen, 200);
    window.setTimeout(() => {
      openSetup();
    }, 230);
  }

  function pointerDown(event) {
    if (event.button !== undefined && event.button !== 0 && event.pointerType === "mouse") return;
    if (event.target.closest("button, a, .screen, [data-ui], .icon-btn")) return;
    if (G.phase !== "playing") return;
    if (G.pointerId !== null) return;
    G.pointerId = event.pointerId;
    event.preventDefault();
    Sound.init();
    startHold();
  }

  function pointerUp(event) {
    if (G.pointerId === null || event.pointerId !== G.pointerId) return;
    G.pointerId = null;
    releaseHold();
  }

  function pointerCancel(event) {
    if (G.pointerId === null || event.pointerId !== G.pointerId) return;
    G.pointerId = null;
    stopHold();
  }

  function keyDown(event) {
    if (event.key === "Escape" && !el.codexScreen.hidden) {
      closeCodex();
      return;
    }
    if (event.key === "Escape" && !el.cardScreen.hidden) {
      closeCard();
      return;
    }
    if (event.code !== "Space" && event.key !== " ") return;
    if (event.repeat) return;
    const active = document.activeElement;
    if (active && active.closest("button") && G.phase !== "playing") return;
    event.preventDefault();
    if (G.phase === "menu") {
      beginGame();
      return;
    }
    if (G.phase === "over") return;
    startHold();
  }

  function keyUp(event) {
    if (event.code !== "Space" && event.key !== " ") return;
    event.preventDefault();
    releaseHold();
  }

  function updateCardStyleButtons() {
    el.cardStyleButtons.forEach((button) => {
      const active = button.dataset.style === cardStyle;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function renderCardForStyle(style) {
    if (!result) return false;
    const normalized = style === "monitor" ? "monitor" : "botanical";
    if (cardDataUrls[normalized]) {
      cardStyle = normalized;
      cardDataUrl = cardDataUrls[normalized];
      el.cardImage.src = cardDataUrl;
      el.cardImage.alt = normalized === "monitor"
        ? "工位监控版战报卡，包含工位人格和本局数据"
        : "植物图鉴版战报卡，包含工位人格和本局数据";
      updateCardStyleButtons();
      return true;
    }

    if (!window.PaidToBloomCard || typeof window.PaidToBloomCard.render !== "function") {
      showToast("战报生成失败，再试一次", "coral", 1200);
      return false;
    }
    try {
      const dataUrl = window.PaidToBloomCard.render(result, normalized);
      cardDataUrls[normalized] = dataUrl;
      cardStyle = normalized;
      cardDataUrl = dataUrl;
      el.cardImage.src = dataUrl;
      el.cardImage.alt = normalized === "monitor"
        ? "工位监控版战报卡，包含工位人格和本局数据"
        : "植物图鉴版战报卡，包含工位人格和本局数据";
      updateCardStyleButtons();
      return true;
    } catch (error) {
      console.error(error);
      showToast("战报生成失败，再试一次", "coral", 1200);
      return false;
    }
  }

  function selectCardStyle(style) {
    if (style === cardStyle && cardDataUrl) return;
    renderCardForStyle(style);
  }

  function openCard() {
    if (!result) return;
    if (!renderCardForStyle(cardStyle)) return;
    el.cardScreen.hidden = false;
    requestAnimationFrame(() => el.cardScreen.classList.add(HR.screenOn));
  }

  function closeCard() {
    el.cardScreen.classList.remove(HR.screenOn);
    window.setTimeout(() => {
      el.cardScreen.hidden = true;
    }, 240);
  }

  async function dataUrlToFile(dataUrl) {
    const [header, encoded] = dataUrl.split(",");
    const mime = /data:([^;]+)/.exec(header)?.[1] || "image/png";
    const binary = window.atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], `带薪养花_${result ? result.title : "工位战报"}.png`, {
      type: mime
    });
  }

  async function shareCard() {
    if (!cardDataUrl) return;
    const shareText = window.PaidToBloomCard
      ? window.PaidToBloomCard.shareText(result)
      : "我的工位战报";

    if (window.AndroidBridge && typeof window.AndroidBridge.shareImage === "function") {
      try {
        window.AndroidBridge.shareImage(
          cardDataUrl,
          `带薪养花_${result ? result.title : "工位战报"}.png`,
          shareText
        );
        showToast("正在打开分享…", "gold", 900);
        return;
      } catch (error) {
        console.error(error);
      }
    }

    Sound.init();
    try {
      const file = await dataUrlToFile(cardDataUrl);
      const shareData = {
        files: [file],
        title: "带薪养花 · 工位战报",
        text: shareText
      };
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
    const anchor = document.createElement("a");
    anchor.download = `带薪养花_${result ? result.title : "工位战报"}.png`;
    anchor.href = cardDataUrl;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    showToast("战报已保存到下载", "gold", 1200);
  }

  async function copyCaption() {
    if (!result) return;
    if (!window.PaidToBloomCard || typeof window.PaidToBloomCard.shareText !== "function") return;
    const text = window.PaidToBloomCard.shareText(result);
    if (window.AndroidBridge && typeof window.AndroidBridge.copyText === "function") {
      try {
        window.AndroidBridge.copyText(text);
        return;
      } catch (error) {
        console.error(error);
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("文案已复制", "gold", 1000);
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showToast("文案已复制", "gold", 1000);
      } catch (copyError) {
        showToast("复制失败，请长按图片", "coral", 1200);
      }
      textarea.remove();
    }
  }

  function updateMuteButton() {
    el.muteBtn.classList.toggle("is-muted", Sound.muted);
    el.muteBtn.setAttribute("aria-label", Sound.muted ? "打开声音" : "关闭声音");
  }

  function handleVisibility() {
    if (document.hidden && G.holding) {
      G.pointerId = null;
      stopHold();
    }
    lastFrame = performance.now();
  }

  function init() {
    if (window.AndroidBridge) {
      document.body.classList.add("android-app");
    }
    currentFlowerKey = FLOWERS[currentFlowerKey] ? currentFlowerKey : "daisy";
    selectedFlowerKey = currentFlowerKey;
    applyProfileClasses();
    fillFlowerIcons();
    resetVisuals();
    renderSetup();
    updateCodexLabels();
    updateMuteButton();
    el.shiftCount.textContent = shiftCount > 0 ? `今日第 ${shiftCount + 1} 盆` : "今日第 1 盆";
    el.resultDate.textContent = new Date().toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).replaceAll("/", ".");

    el.startBtn.addEventListener("click", () => {
      Sound.init();
      openSetup();
    });
    el.startCodexBtn.addEventListener("click", openCodex);
    el.setupStartBtn.addEventListener("click", () => {
      Sound.init();
      beginGame();
    });
    el.setupBackBtn.addEventListener("click", backToStart);
    el.setupCodexBtn.addEventListener("click", openCodex);
    el.closeCodexBtn.addEventListener("click", closeCodex);
    el.flowerOptions.forEach((option) => {
      option.addEventListener("click", () => {
        selectedFlowerKey = option.dataset.flower;
        currentFlowerKey = selectedFlowerKey;
        applyProfileClasses();
        renderFlowerPicker();
        renderBossPreview();
      });
    });
    el.retryBtn.addEventListener("click", retry);
    el.cardBtn.addEventListener("click", openCard);
    el.closeCardBtn.addEventListener("click", closeCard);
    el.cardStyleButtons.forEach((button) => {
      button.addEventListener("click", () => selectCardStyle(button.dataset.style));
    });
    el.shareBtn.addEventListener("click", shareCard);
    el.copyBtn.addEventListener("click", copyCaption);
    el.muteBtn.addEventListener("click", () => {
      Sound.init();
      Sound.setMuted(!Sound.muted);
      updateMuteButton();
      if (!Sound.muted && G.holding) Sound.waterOn();
    });

    document.addEventListener("pointerdown", pointerDown, { passive: false });
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerCancel);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", () => {
      G.pointerId = null;
      stopHold();
      lastFrame = performance.now();
    });
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    el.cardScreen.addEventListener("pointerdown", (event) => {
      if (event.target === el.cardScreen && !el.cardScreen.hidden) closeCard();
    });
    el.codexScreen.addEventListener("pointerdown", (event) => {
      if (event.target === el.codexScreen && !el.codexScreen.hidden) closeCodex();
    });

    lastFrame = performance.now();
    rafId = requestAnimationFrame(loop);

    window.__paidToBloom = {
      getState: () => ({ ...G }),
      getResult: () => result,
      getProfile: () => ({
        flower: currentFlowerKey,
        boss: currentBossKey,
        codex: codexCounts()
      }),
      beginGame,
      startWith: (flowerKey, bossKey) => {
        if (!FLOWERS[flowerKey] || !BOSSES[bossKey]) return false;
        selectedFlowerKey = flowerKey;
        currentFlowerKey = flowerKey;
        currentBossKey = bossKey;
        applyProfileClasses();
        beginGame();
        return true;
      },
      forceAction: (action) => {
        if (!["look", "feint", "safe", "double", "lean"].includes(action)) return false;
        if (G.phase !== "playing") return false;
        if (action === "safe") beginSafe();
        else beginWarning(action);
        return true;
      },
      triggerBloom,
      endGame,
      setGrowth: (value) => {
        G.growth = clamp(value, 0, 100);
        render();
      },
      releaseHold,
      startHold
    };
  }

  init();
})();
