(() => {
  "use strict";

  const CONFIG = {
    totalSeconds: 45,
    growthRate: 4.2,
    growthPenalty: 9,
    perfectGrowth: 1.2,
    perfectWindow: 0.55,
    firstQuiet: 4.2,
    quietBase: 3.35,
    quietMin: 2.12,
    quietStep: 0.105,
    warnBase: 1.45,
    warnMin: 1.02,
    warnStep: 0.045,
    watchBase: 1.12,
    watchStep: 0.018,
    watchMax: 1.34,
    leaveBase: 0.72,
    scorePerfect: 180
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
    daily: "paidToBloom.daily"
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
    holdHint: $("#holdHint"),
    holdStrong: $("#holdStrong"),
    holdSmall: $("#holdSmall"),
    holdBarFill: $("#holdBarFill"),
    startScreen: $("#startScreen"),
    startBtn: $("#startBtn"),
    shiftCount: $("#shiftCount"),
    resultScreen: $("#resultScreen"),
    resultDate: $("#resultDate"),
    personaTitle: $("#personaTitle"),
    resultGrade: $("#resultGrade"),
    personaDesc: $("#personaDesc"),
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
    shareBtn: $("#shareBtn"),
    copyBtn: $("#copyBtn"),
    srStatus: $("#srStatus"),
    screenFlash: $("#screenFlash"),
    caughtFlash: $("#caughtFlash"),
    plantGrowth: $("#plantGrowth"),
    leaf1: $("#leaf1"),
    leaf2: $("#leaf2"),
    leaf3: $("#leaf3"),
    leaf4: $("#leaf4"),
    budGroup: $("#budGroup"),
    plantFace: $("#plantFace"),
    sproutFace: $("#sproutFace"),
    flowerPetals: $("#flowerPetals"),
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
      holding: false,
      pointerId: null,
      boss: "away",
      bossT: CONFIG.firstQuiet,
      warnTotal: CONFIG.warnBase,
      cycle: 0,
      endReason: null,
      endTimer: 0,
      bloomed: false,
      finished: false
    };
  }

  let G = makeState();
  let result = null;
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

    warn() {
      this.tone(880, 0.08, { type: "sine", gain: 0.055 });
      this.tone(660, 0.12, { type: "sine", gain: 0.045, delay: 0.11 });
    },

    watch() {
      this.tone(174, 0.22, { type: "sine", gain: 0.04, endFreq: 130 });
    },

    release() {
      this.tone(520, 0.045, { type: "square", gain: 0.018, endFreq: 390 });
    },

    perfect() {
      this.tone(659.25, 0.1, { type: "triangle", gain: 0.065 });
      this.tone(880, 0.12, { type: "triangle", gain: 0.055, delay: 0.07 });
      this.tone(1174.66, 0.18, { type: "sine", gain: 0.045, delay: 0.14 });
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

  function showStamp() {
    window.clearTimeout(stampTimer);
    el.perfectStamp.classList.remove(HR.stamp);
    void el.perfectStamp.offsetWidth;
    el.perfectStamp.classList.add(HR.stamp);
    stampTimer = window.setTimeout(() => el.perfectStamp.classList.remove(HR.stamp), 1180);
  }

  function setBodyState() {
    const body = document.body;
    const active = G.phase === "playing" || G.phase === "ending";
    const warning = G.boss === "warning" && active;
    const watching = G.boss === "watching" && active;
    const locked = active && (
      watching ||
      (G.boss === "warning" && G.bossT <= CONFIG.perfectWindow)
    );
    body.classList.toggle("boss-warning", warning);
    body.classList.toggle("boss-watching", watching);
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
    if (growth >= 90) return "开花";
    if (growth >= 55) return "花苞";
    if (growth >= 25) return "长叶";
    return "发芽";
  }

  function renderPlant(growth) {
    const normalized = clamp(growth / 100, 0, 1);
    const scale = 0.44 + 0.56 * Math.pow(normalized, 0.78);
    el.plantGrowth.setAttribute(
      "transform",
      `translate(450 992) scale(${scale.toFixed(4)}) translate(-450 -992)`
    );

    el.leaf1.classList.toggle(HR.leaf, growth >= 14);
    el.leaf2.classList.toggle(HR.leaf, growth >= 34);
    el.leaf3.classList.toggle(HR.leaf, growth >= 51);
    el.leaf4.classList.toggle(HR.leaf, growth >= 3);

    const budOn = growth >= 52;
    el.budGroup.classList.toggle(HR.leaf, budOn);
    el.budGroup.style.opacity = growth >= 94 ? String(clamp((100 - growth) / 6, 0, 1)) : "";

    el.sproutFace.classList.toggle(HR.leaf, growth < 48);
    el.plantFace.classList.toggle(HR.leaf, growth >= 50);
    el.flowerPetals.classList.toggle(HR.leaf, growth >= 82);

    const bloom = clamp((growth - 82) / 18, 0, 1);
    const petalScale = bloom > 0 ? 0.16 + 0.84 * easeOutCubic(bloom) : 0.16;
    el.flowerPetals.setAttribute(
      "transform",
      `translate(446 710) scale(${petalScale.toFixed(4)}) translate(-446 -710)`
    );

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
      } else if (G.boss === "warning") {
        if (!G.holding) {
          strong = "已切回 Excel";
          small = "屏住呼吸，等老板走";
        } else if (G.perfectThisWarning) {
          strong = "松手，别贪";
          small = "这一轮秒切已经拿到了";
          state = "danger";
        } else if (G.bossT <= CONFIG.perfectWindow) {
          strong = "松手！秒切";
          small = "最后 0.5 秒 · 演技 +180";
          state = "perfect";
        } else {
          strong = "老板要回头了";
          small = "现在松手，切回 Excel";
          state = "danger";
        }
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
      else if (G.holding) text = "摸鱼模式 · 正在浇灌 Q4";
      else if (G.boss === "warning") text = "EXCEL · 已按 Ctrl+S";
    }
    if (text !== lastModeText) {
      lastModeText = text;
      el.modeText.textContent = text;
    }
  }

  function updateBossBubble() {
    if (G.boss === "warning") {
      el.bossLine.textContent = "在吗？";
    } else if (G.boss === "watching") {
      el.bossLine.textContent = "……";
    } else {
      el.bossLine.textContent = "在吗？";
    }

    const progress = G.boss === "warning" ? clamp(1 - G.bossT / G.warnTotal, 0, 1) : 1;
    el.warnFill.style.width = `${progress * 100}%`;
    el.warnFill.classList.toggle("is-perfect", G.boss === "warning" && G.bossT <= CONFIG.perfectWindow);
    el.perfectZone.style.width = `${clamp(CONFIG.perfectWindow / G.warnTotal, 0, 1) * 100}%`;
  }

  function smoothstep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function updateBossTurn() {
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
    const perfectStart = clamp(1 - CONFIG.perfectWindow / G.warnTotal, 0.2, 0.92);
    const delayed = clamp((warningProgress - 0.06) / Math.max(0.001, perfectStart - 0.06), 0, 1);
    const turn = smoothstep(delayed);

    const headX = 4 - 10 * turn;
    const headRotate = 6 - 8 * turn;
    const pupilX = 27 - 39 * turn;
    const pupilScale = 0.9 - 0.04 * turn;
    const eyeScale = 0.96 + 0.1 * turn;
    const lidY = 10 * (1 - turn);
    const browY = 4 - 8 * turn;

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
      if (afterStage === "长叶" || afterStage === "花苞") {
        Sound.stageUp();
        showToast(afterStage === "长叶" ? "长出了第一片叶子" : "结了一个小花苞", "", 1000);
      }
    }
    if (G.growth >= 100 && G.phase === "playing") {
      triggerBloom();
    }
  }

  function beginBossQuiet(first = false) {
    G.boss = "away";
    if (first) {
      G.bossT = CONFIG.firstQuiet;
    } else {
      G.bossT = Math.max(CONFIG.quietMin, CONFIG.quietBase - G.cycle * CONFIG.quietStep);
    }
  }

  function beginWarning() {
    G.cycle += 1;
    G.boss = "warning";
    G.perfectThisWarning = false;
    G.warnTotal = Math.max(CONFIG.warnMin, CONFIG.warnBase - (G.cycle - 1) * CONFIG.warnStep);
    G.bossT = G.warnTotal;
    Sound.warn();
    announce("老板要回头了，准备松手。");
  }

  function beginWatching() {
    G.boss = "watching";
    G.bossT = Math.min(
      CONFIG.watchMax,
      CONFIG.watchBase + Math.max(0, G.cycle - 1) * CONFIG.watchStep
    );
    Sound.watch();
    if (G.holding) {
      catchPlayer();
    } else {
      announce("老板正在看你的屏幕。");
    }
  }

  function beginLeaving() {
    G.boss = "leaving";
    G.bossT = CONFIG.leaveBase;
  }

  function updateBoss(dt) {
    G.bossT -= dt;
    if (G.bossT > 0) return;
    if (G.boss === "away") {
      beginWarning();
    } else if (G.boss === "warning") {
      beginWatching();
    } else if (G.boss === "watching") {
      beginLeaving();
    } else if (G.boss === "leaving") {
      beginBossQuiet();
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

    if (wasWarning && remaining > 0 && remaining <= CONFIG.perfectWindow && !G.perfectThisWarning) {
      G.perfectThisWarning = true;
      G.perfects += 1;
      showStamp();
      Sound.perfect();
      announce("完美切屏，演技加一百八十。");
      el.app.classList.add("is-perfect");
      window.setTimeout(() => el.app.classList.remove("is-perfect"), 700);
      changeGrowth(CONFIG.perfectGrowth);
    }

    render();
  }

  function catchPlayer() {
    if (G.phase !== "playing") return;
    G.holding = false;
    Sound.waterOff();
    G.hearts -= 1;
    G.caught += 1;
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
    el.resultGrade.textContent = result.grade;
    el.quoteText.textContent = result.quote;
    el.statScore.textContent = result.score.toLocaleString("zh-CN");
    el.statTime.textContent = result.timeValue;
    el.statPerfect.textContent = `${result.perfects}`;
    el.statCaught.textContent = `${result.caught}`;
    cardDataUrl = "";
    el.cardImage.removeAttribute("src");

    shiftCount += 1;
    saveDailyCount(shiftCount);
    el.shiftCount.textContent = `今日第 ${shiftCount} 盆`;

    el.resultScreen.hidden = false;
    requestAnimationFrame(() => el.resultScreen.classList.add(HR.screenOn));
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
    document.body.classList.remove("boss-warning", "boss-watching", "boss-locked", "is-caught");
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
    window.clearTimeout(toastTimer);
    window.clearTimeout(stampTimer);
    window.clearTimeout(caughtTimer);
    G = makeState();
    G.phase = "playing";
    result = null;
    cardDataUrl = "";
    el.resultScreen.classList.remove(HR.screenOn);
    el.resultScreen.hidden = true;
    el.cardScreen.classList.remove(HR.screenOn);
    el.cardScreen.hidden = true;
    el.startScreen.classList.remove(HR.screenOn);
    window.setTimeout(() => {
      el.startScreen.hidden = true;
    }, 320);
    resetVisuals();
    Sound.init();
    Sound.start();
    showToast("按住屏幕，开始浇水", "", 1600);
    render();
    lastFrame = performance.now();
  }

  function retry() {
    el.resultScreen.classList.remove(HR.screenOn);
    window.setTimeout(() => {
      el.resultScreen.hidden = true;
      beginGame();
    }, 220);
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

  function openCard() {
    if (!result) return;
    if (!cardDataUrl) {
      if (!window.PaidToBloomCard || typeof window.PaidToBloomCard.render !== "function") {
        showToast("战报生成失败，再试一次", "coral", 1200);
        return;
      }
      try {
        cardDataUrl = window.PaidToBloomCard.render(result);
        el.cardImage.src = cardDataUrl;
      } catch (error) {
        console.error(error);
        showToast("战报生成失败，再试一次", "coral", 1200);
        return;
      }
    }
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
    resetVisuals();
    updateMuteButton();
    el.shiftCount.textContent = shiftCount > 0 ? `今日第 ${shiftCount + 1} 盆` : "今日第 1 盆";
    el.resultDate.textContent = new Date().toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).replaceAll("/", ".");

    el.startBtn.addEventListener("click", () => {
      Sound.init();
      beginGame();
    });
    el.retryBtn.addEventListener("click", retry);
    el.cardBtn.addEventListener("click", openCard);
    el.closeCardBtn.addEventListener("click", closeCard);
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

    lastFrame = performance.now();
    rafId = requestAnimationFrame(loop);

    window.__paidToBloom = {
      getState: () => ({ ...G }),
      getResult: () => result,
      beginGame,
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
