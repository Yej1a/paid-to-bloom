(() => {
  "use strict";

  const W = 1080;
  const H = 1440;
  const C = {
    cream: "#F4EFE3",
    paper: "#FAF6EA",
    paperDeep: "#E9DEC5",
    forest: "#24382C",
    forest2: "#35533D",
    forest3: "#4E6B4C",
    coral: "#E56B4A",
    coralDark: "#C54E32",
    butter: "#F2C14E",
    mist: "#B9D4D7",
    sage: "#70866D",
    sageLight: "#A7B49A",
    inkSoft: "#6F7A63"
  };
  const SERIF = '"Songti SC", "STSong", "SimSun", "Noto Serif SC", Georgia, serif';
  const SANS = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif';
  const MONO = '"Courier New", "SFMono-Regular", Consolas, monospace';

  let seed = 20261027;
  function random() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function setFont(ctx, size, family = SANS, weight = "400") {
    ctx.font = `${weight} ${size}px ${family}`;
  }

  function drawSpacedText(ctx, text, x, y, spacing, align = "left") {
    const chars = Array.from(text);
    const widths = chars.map((char) => ctx.measureText(char).width);
    const total = widths.reduce((sum, width) => sum + width, 0) + spacing * Math.max(0, chars.length - 1);
    let cursor = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    const previousAlign = ctx.textAlign;
    ctx.textAlign = "left";
    chars.forEach((char, index) => {
      ctx.fillText(char, cursor, y);
      cursor += widths[index] + spacing;
    });
    ctx.textAlign = previousAlign;
  }

  function wrapLines(ctx, text, maxWidth) {
    const chars = Array.from(text);
    const lines = [];
    let current = "";
    chars.forEach((char) => {
      const candidate = current + char;
      if (ctx.measureText(candidate).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function drawWrapped(ctx, text, x, y, maxWidth, lineHeight, align = "left") {
    ctx.textAlign = align;
    const lines = wrapLines(ctx, text, maxWidth);
    lines.forEach((line, index) => {
      const drawX = align === "center" ? x : align === "right" ? x : x;
      ctx.fillText(line, drawX, y + index * lineHeight);
    });
    return lines.length;
  }

  function drawPaperBackground(ctx) {
    ctx.fillStyle = C.cream;
    ctx.fillRect(0, 0, W, H);

    const gradient = ctx.createRadialGradient(560, 260, 40, 560, 640, 900);
    gradient.addColorStop(0, "rgba(255,253,246,0.72)");
    gradient.addColorStop(0.55, "rgba(244,239,227,0)");
    gradient.addColorStop(1, "rgba(112,134,109,0.08)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    for (let i = 0; i < 3600; i += 1) {
      const x = random() * W;
      const y = random() * H;
      const a = random() * 0.045;
      ctx.fillStyle = `rgba(36,56,44,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, random() * 1.1 + 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFrame(ctx) {
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 3;
    ctx.strokeRect(38, 38, W - 76, H - 76);
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 50, W - 100, H - 100);

    ctx.strokeStyle = "rgba(36,56,44,0.55)";
    const marks = [
      [38, 38, 1, 1],
      [W - 38, 38, -1, 1],
      [38, H - 38, 1, -1],
      [W - 38, H - 38, -1, -1]
    ];
    marks.forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx * 26, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * 26);
      ctx.stroke();
    });
  }

  function drawHeader(ctx, result) {
    setFont(ctx, 23, MONO, "700");
    ctx.fillStyle = C.forest;
    drawSpacedText(ctx, "OFFICE BOTANY CLUB", 82, 112, 4.1);

    setFont(ctx, 18, MONO, "700");
    ctx.fillStyle = C.coralDark;
    ctx.textAlign = "right";
    drawSpacedText(ctx, "SHIFT No. 045", 998, 112, 1.6, "right");

    ctx.fillStyle = C.forest;
    setFont(ctx, 60, SERIF, "700");
    ctx.textAlign = "left";
    ctx.fillText("工位战报", 80, 213);

    setFont(ctx, 17, MONO, "400");
    ctx.fillStyle = C.inkSoft;
    drawSpacedText(ctx, "SHIFT REPORT / PAID TO BLOOM", 83, 245, 1.8);

    ctx.textAlign = "right";
    setFont(ctx, 18, MONO, "700");
    ctx.fillStyle = C.forest;
    ctx.fillText(result.dateText, 998, 213);
    setFont(ctx, 15, MONO, "400");
    ctx.fillStyle = C.inkSoft;
    ctx.fillText("17:59 / FRIDAY", 998, 239);

    ctx.strokeStyle = "rgba(36,56,44,0.26)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(78, 264);
    ctx.lineTo(1002, 264);
    ctx.stroke();
  }

  function drawDottedPanel(ctx, x, y, width, height) {
    ctx.save();
    roundRect(ctx, x, y, width, height, 3);
    ctx.clip();
    ctx.fillStyle = "#EFE6D2";
    ctx.fillRect(x, y, width, height);

    for (let py = y + 14; py < y + height; py += 18) {
      for (let px = x + 14; px < x + width; px += 18) {
        ctx.fillStyle = "rgba(36,56,44,0.055)";
        ctx.beginPath();
        ctx.arc(px, py, 1.05, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, width, height, 3);
    ctx.stroke();

    ctx.strokeStyle = "rgba(36,56,44,0.22)";
    ctx.lineWidth = 1;
    roundRect(ctx, x + 6, y + 6, width - 12, height - 12, 2);
    ctx.stroke();
  }

  function drawSpreadsheet(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.065);
    ctx.fillStyle = "rgba(36,56,44,0.13)";
    roundRect(ctx, 8, 10, 304, 190, 3);
    ctx.fill();
    ctx.fillStyle = C.paper;
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 2;
    roundRect(ctx, 0, 0, 304, 190, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = C.forest2;
    ctx.fillRect(0, 0, 304, 27);
    ctx.fillStyle = C.coral;
    ctx.beginPath();
    ctx.arc(15, 14, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.butter;
    ctx.beginPath();
    ctx.arc(26, 14, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.mist;
    ctx.beginPath();
    ctx.arc(37, 14, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.cream;
    setFont(ctx, 9, SANS, "400");
    ctx.fillText("Q4_方案_最终版_真的最终.xlsx", 49, 17);

    ctx.strokeStyle = "rgba(36,56,44,0.22)";
    ctx.lineWidth = 0.7;
    for (let i = 1; i < 6; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 48, 27);
      ctx.lineTo(i * 48, 190);
      ctx.stroke();
    }
    for (let j = 1; j < 5; j += 1) {
      ctx.beginPath();
      ctx.moveTo(0, 27 + j * 32);
      ctx.lineTo(304, 27 + j * 32);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(111,143,99,0.24)";
    ctx.fillRect(96, 91, 48, 32);
    ctx.strokeStyle = C.forest3;
    ctx.strokeRect(96, 91, 48, 32);

    setFont(ctx, 8, SANS, "400");
    ctx.fillStyle = C.forest;
    const cells = [
      ["增长", 10, 42],
      ["我", 58, 42],
      ["68%", 106, 42],
      ["再改一版", 154, 42],
      ["降本", 10, 74],
      ["还是我", 58, 74],
      ["42%", 106, 74],
      ["先放着", 154, 74],
      ["增效", 10, 106],
      ["我本人", 58, 106],
      ["12%", 106, 106],
      ["花在长", 154, 106]
    ];
    cells.forEach(([text, cx, cy]) => {
      ctx.fillText(text, cx, cy);
    });
    setFont(ctx, 7, MONO, "700");
    ctx.fillStyle = C.coralDark;
    ctx.fillText("暗中进行", 206, 118);
    ctx.restore();
  }

  function drawBoss(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = C.forest;
    ctx.beginPath();
    ctx.arc(x, y + 78, 104, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 62, y + 2);
    ctx.quadraticCurveTo(x, y - 33, x + 61, y + 1);
    ctx.stroke();

    ctx.fillStyle = C.paper;
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y + 44, 47, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = C.forest;
    ctx.beginPath();
    ctx.arc(x - 8, y + 46, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.paper;
    ctx.beginPath();
    ctx.arc(x - 13, y + 40, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 46, y + 68);
    ctx.quadraticCurveTo(x, y + 78, x + 46, y + 68);
    ctx.stroke();
    ctx.restore();

    // partition
    ctx.save();
    roundRect(ctx, x - 118, y + 98, 306, 278, 3);
    ctx.fillStyle = C.sage;
    ctx.fill();
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.strokeStyle = "rgba(244,239,227,0.15)";
    ctx.lineWidth = 1;
    for (let i = -100; i < 300; i += 18) {
      ctx.beginPath();
      ctx.moveTo(x - 118 + i, y + 376);
      ctx.lineTo(x - 118 + i + 278, y + 98);
      ctx.stroke();
    }
    ctx.restore();

    // speech bubble
    ctx.save();
    ctx.translate(x - 164, y - 104);
    ctx.rotate(-0.018);
    ctx.fillStyle = C.paper;
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 2;
    roundRect(ctx, 0, 0, 172, 76, 4);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(132, 76);
    ctx.lineTo(151, 92);
    ctx.lineTo(157, 76);
    ctx.fill();
    ctx.stroke();
    setFont(ctx, 10, MONO, "700");
    ctx.fillStyle = C.inkSoft;
    ctx.fillText("老板", 16, 24);
    setFont(ctx, 30, SERIF, "700");
    ctx.fillStyle = C.forest;
    ctx.fillText("在吗？", 16, 58);
    ctx.restore();
  }

  function drawMug(ctx, cx, topY, scale = 1) {
    const w = 154 * scale;
    const h = 90 * scale;
    ctx.save();
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 2.6 * scale;
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(cx + w * 0.42, topY + h * 0.2);
    ctx.bezierCurveTo(cx + w * 0.96, topY + h * 0.05, cx + w * 0.92, topY + h * 0.72, cx + w * 0.42, topY + h * 0.68);
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 9 * scale;
    ctx.stroke();
    ctx.strokeStyle = C.paper;
    ctx.lineWidth = 5 * scale;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - w / 2, topY);
    ctx.lineTo(cx - w * 0.41, topY + h);
    ctx.quadraticCurveTo(cx, topY + h + 12 * scale, cx + w * 0.41, topY + h);
    ctx.lineTo(cx + w / 2, topY);
    ctx.closePath();
    ctx.fillStyle = C.paper;
    ctx.fill();
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 2.6 * scale;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, topY, w / 2, 17 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#3B2E21";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, topY - 2 * scale, w * 0.4, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#57442E";
    ctx.fill();

    ctx.fillStyle = C.forest;
    roundRect(ctx, cx - w * 0.36, topY + h * 0.39, w * 0.72, h * 0.37, 2);
    ctx.fill();
    setFont(ctx, 22 * scale, SANS, "700");
    ctx.fillStyle = C.cream;
    ctx.textAlign = "center";
    ctx.fillText("摸 鱼", cx, topY + h * 0.68);

    setFont(ctx, 6.5 * scale, MONO, "400");
    ctx.fillStyle = C.inkSoft;
    ctx.fillText("PAID TO BLOOM", cx, topY + h * 0.92);
    ctx.restore();
  }

  function drawLeaf(ctx, x, y, length, angle, fill, droop = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + droop);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-length * 0.42, -length * 0.44, -length * 0.9, -length * 0.05, -length, length * 0.18);
    ctx.bezierCurveTo(-length * 0.7, length * 0.58, -length * 0.24, length * 0.44, 0, 0);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4, 2);
    ctx.quadraticCurveTo(-length * 0.48, -length * 0.06, -length * 0.82, length * 0.17);
    ctx.strokeStyle = "rgba(36,56,44,0.44)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  function drawPlant(ctx, cx, baseY, options) {
    const { bloom, growth = 100, wilt = false } = options;
    const stemTop = baseY - (wilt ? 196 : 244);
    const stemSway = wilt ? 55 : 4;
    const flowerY = stemTop;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.bezierCurveTo(
      cx - 24,
      baseY - 70,
      cx + 24 + stemSway * 0.35,
      stemTop + 72,
      cx + stemSway,
      flowerY + 10
    );
    ctx.strokeStyle = C.forest3;
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.strokeStyle = C.sageLight;
    ctx.lineWidth = 1.7;
    ctx.stroke();

    const leafDefs = [
      { y: baseY - 58, len: 73, side: -1, fill: C.sage },
      { y: baseY - 104, len: 82, side: 1, fill: "#7F9C6E" },
      { y: baseY - 146, len: 67, side: -1, fill: C.sageLight },
      { y: baseY - 184, len: 58, side: 1, fill: "#6F8F63" }
    ];
    leafDefs.forEach((leaf, index) => {
      if (growth < 18 + index * 16 && !wilt) return;
      const droop = wilt ? 0.38 + index * 0.04 : 0;
      drawLeaf(
        ctx,
        cx + (leaf.side * 4),
        leaf.y,
        leaf.len,
        leaf.side < 0 ? 0.22 : Math.PI - 0.22,
        leaf.fill,
        leaf.side < 0 ? droop : -droop
      );
    });

    if (bloom) {
      ctx.save();
      ctx.translate(cx + stemSway, flowerY);
      for (let i = 0; i < 8; i += 1) {
        ctx.save();
        ctx.rotate((Math.PI * 2 * i) / 8);
        ctx.beginPath();
        ctx.ellipse(0, -37, 19, 38, 0, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? C.coral : C.butter;
        ctx.fill();
        ctx.strokeStyle = C.forest;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fillStyle = C.butter;
      ctx.fill();
      ctx.strokeStyle = C.forest;
      ctx.lineWidth = 2;
      ctx.stroke();

      // happy face
      ctx.strokeStyle = C.forest;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-7, -2, 4, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(7, -2, 4, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 7, 5, 0.15, Math.PI - 0.15);
      ctx.stroke();

      // sparkles
      ctx.strokeStyle = C.coral;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-76, -32);
      ctx.lineTo(-92, -48);
      ctx.moveTo(78, -16);
      ctx.lineTo(98, -28);
      ctx.stroke();
      ctx.restore();
    } else {
      const budY = flowerY + 8;
      ctx.save();
      ctx.translate(cx + stemSway, budY);
      ctx.beginPath();
      ctx.moveTo(0, -46);
      ctx.bezierCurveTo(-21, -20, -25, 12, -15, 31);
      ctx.quadraticCurveTo(0, 43, 15, 31);
      ctx.bezierCurveTo(25, 12, 21, -20, 0, -46);
      ctx.fillStyle = wilt ? "#A7B49A" : "#8FA77D";
      ctx.fill();
      ctx.strokeStyle = C.forest;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.strokeStyle = "rgba(36,56,44,0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -35);
      ctx.lineTo(0, 28);
      ctx.stroke();

      // tiny face on the bud
      ctx.strokeStyle = C.forest;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-6, 2, 2.6, 0, Math.PI * 2);
      ctx.arc(6, 2, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = C.forest;
      ctx.fill();
      if (wilt) {
        ctx.beginPath();
        ctx.arc(0, 17, 5, Math.PI + 0.15, Math.PI * 2 - 0.15);
      } else {
        ctx.beginPath();
        ctx.arc(0, 10, 4.5, 0.2, Math.PI - 0.2);
      }
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function drawIllustration(ctx, result) {
    const x = 72;
    const y = 282;
    const width = 936;
    const height = 528;
    drawDottedPanel(ctx, x, y, width, height);

    ctx.save();
    roundRect(ctx, x + 1, y + 1, width - 2, height - 2, 3);
    ctx.clip();

    // desk
    ctx.fillStyle = "#D9C6A4";
    ctx.fillRect(x, y + 380, width, height - 380);
    ctx.fillStyle = "#C9B38C";
    ctx.fillRect(x, y + 380, width, 8);
    ctx.strokeStyle = "rgba(168,140,99,0.22)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x, y + 414 + i * 17);
      ctx.bezierCurveTo(x + 260, y + 406 + i * 17, x + 630, y + 421 + i * 17, x + width, y + 411 + i * 17);
      ctx.stroke();
    }

    // a little wall label / clock
    ctx.fillStyle = C.paper;
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x + 60, y + 57, 29, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 60, y + 57);
    ctx.lineTo(x + 60, y + 40);
    ctx.moveTo(x + 60, y + 57);
    ctx.lineTo(x + 72, y + 68);
    ctx.stroke();
    setFont(ctx, 9, MONO, "700");
    ctx.fillStyle = C.forest;
    ctx.textAlign = "center";
    ctx.fillText("17:59", x + 60, y + 104);
    ctx.textAlign = "left";

    // note on desk
    ctx.save();
    ctx.translate(x + 34, y + 395);
    ctx.rotate(0.06);
    ctx.fillStyle = C.butter;
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 1.3;
    ctx.fillRect(0, 0, 108, 78);
    ctx.strokeRect(0, 0, 108, 78);
    setFont(ctx, 14, SANS, "700");
    ctx.fillStyle = C.forest;
    ctx.textAlign = "center";
    ctx.fillText("18:00", 54, 30);
    ctx.fillText("准点下班", 54, 50);
    setFont(ctx, 8, SANS, "400");
    ctx.fillStyle = "#7C5C2C";
    ctx.fillText("这次是真的", 54, 66);
    ctx.restore();

    drawSpreadsheet(ctx, x + 58, y + 112);
    drawBoss(ctx, x + 836, y + 108);

    // desk mat
    ctx.fillStyle = C.forest2;
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 2;
    roundRect(ctx, x + 333, y + 406, 402, 103, 8);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(244,239,227,0.24)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    roundRect(ctx, x + 344, y + 417, 380, 81, 5);
    ctx.stroke();
    ctx.setLineDash([]);

    // plant shadow + mug + plant
    ctx.fillStyle = "rgba(36,56,44,0.18)";
    ctx.beginPath();
    ctx.ellipse(x + 536, y + 496, 102, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    drawPlant(ctx, x + 536, y + 410, {
      bloom: result.bloomed,
      growth: result.growth,
      wilt: !result.bloomed
    });
    drawMug(ctx, x + 536, y + 410, 0.94);

    // figure label
    setFont(ctx, 10, MONO, "700");
    ctx.fillStyle = C.inkSoft;
    ctx.textAlign = "left";
    drawSpacedText(ctx, "FIG. 01 — 工位微景观", x + 24, y + height - 18, 1.2);
    ctx.textAlign = "right";
    ctx.fillText("PAID TO BLOOM / 045", x + width - 24, y + height - 18);

    ctx.restore();
  }

  function drawGrade(ctx, grade, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.14);
    ctx.strokeStyle = C.coral;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(229,107,74,0.58)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 41, 0, Math.PI * 2);
    ctx.stroke();
    setFont(ctx, 45, SERIF, "700");
    ctx.fillStyle = C.coralDark;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(grade, 0, 3);
    ctx.restore();
    ctx.textBaseline = "alphabetic";
  }

  function drawPersona(ctx, result) {
    setFont(ctx, 14, MONO, "700");
    ctx.fillStyle = C.coralDark;
    drawSpacedText(ctx, "你的工位人格 / OFFICE PERSONA", 82, 869, 1.8);

    setFont(ctx, 65, SERIF, "700");
    ctx.fillStyle = C.forest;
    ctx.textAlign = "left";
    ctx.fillText(result.title, 79, 947);

    drawGrade(ctx, result.grade, 973, 923);

    setFont(ctx, 23, SANS, "400");
    ctx.fillStyle = "#4F5B4C";
    drawWrapped(ctx, result.desc, 81, 996, 860, 35, "left");
  }

  function drawStats(ctx, result) {
    const stats = [
      ["摸鱼值", result.score.toLocaleString("zh-CN")],
      ["开花用时", result.timeValue],
      ["完美切屏", `${result.perfects} 次`],
      ["被抓包", `${result.caught} 次`]
    ];
    const startX = 76;
    const gap = 15;
    const boxW = (928 - gap * 3) / 4;
    const y = 1080;
    const h = 94;

    stats.forEach(([label, value], index) => {
      const x = startX + index * (boxW + gap);
      ctx.fillStyle = "rgba(233,222,197,0.42)";
      ctx.strokeStyle = "rgba(36,56,44,0.22)";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, boxW, h, 2);
      ctx.fill();
      ctx.stroke();

      setFont(ctx, 13, SANS, "400");
      ctx.fillStyle = C.inkSoft;
      ctx.textAlign = "left";
      ctx.fillText(label, x + 12, y + 27);

      setFont(ctx, 29, MONO, "700");
      ctx.fillStyle = C.forest;
      ctx.fillText(value, x + 12, y + 70);
    });
  }

  function drawQuote(ctx, result) {
    ctx.fillStyle = "rgba(242,193,78,0.18)";
    ctx.fillRect(82, 1211, 4, 82);

    ctx.save();
    setFont(ctx, 30, SERIF, "700");
    ctx.fillStyle = C.forest;
    ctx.textAlign = "left";
    const lines = wrapLines(ctx, `“${result.quote}”`, 820);
    lines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, 108, 1244 + index * 38);
    });
    ctx.restore();

    setFont(ctx, 11, MONO, "400");
    ctx.fillStyle = C.inkSoft;
    ctx.textAlign = "left";
    ctx.fillText(result.bloomed ? "BLOOMED / 100%" : `GROWTH / ${result.growthPct}%`, 84, 1313);
  }

  function drawFooter(ctx, result) {
    ctx.strokeStyle = "rgba(36,56,44,0.24)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(78, 1342);
    ctx.lineTo(1002, 1342);
    ctx.stroke();

    setFont(ctx, 20, SERIF, "700");
    ctx.fillStyle = C.forest;
    ctx.textAlign = "left";
    ctx.fillText("#带薪养花挑战", 80, 1374);

    setFont(ctx, 11, MONO, "700");
    ctx.fillStyle = C.coralDark;
    ctx.textAlign = "right";
    drawSpacedText(ctx, "WORK CAN WAIT. THE FLOWER CAN'T.", 1000, 1373, 1.1, "right");
  }

  function drawMonitorBackground(ctx) {
    ctx.fillStyle = "#111F18";
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(540, 540, 80, 540, 620, 850);
    glow.addColorStop(0, "rgba(83, 123, 91, 0.24)");
    glow.addColorStop(0.55, "rgba(21, 45, 32, 0.08)");
    glow.addColorStop(1, "rgba(4, 12, 8, 0.55)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    for (let i = 0; i < 4200; i += 1) {
      const x = random() * W;
      const y = random() * H;
      ctx.fillStyle = `rgba(244,239,227,${random() * 0.035})`;
      ctx.beginPath();
      ctx.arc(x, y, random() * 1.1 + 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(244,239,227,0.035)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(0,0,0,0.08)";
    for (let y = 0; y < H; y += 5) {
      ctx.fillRect(0, y, W, 1);
    }

    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 3;
    ctx.strokeRect(38, 38, W - 76, H - 76);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(244,239,227,0.36)";
    ctx.strokeRect(50, 50, W - 100, H - 100);

    const marks = [
      [38, 38, 1, 1],
      [W - 38, 38, -1, 1],
      [38, H - 38, 1, -1],
      [W - 38, H - 38, -1, -1]
    ];
    ctx.strokeStyle = C.coral;
    ctx.lineWidth = 2;
    marks.forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx * 30, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * 30);
      ctx.stroke();
    });
  }

  function drawMonitorHeader(ctx, result) {
    setFont(ctx, 21, MONO, "700");
    ctx.fillStyle = C.cream;
    ctx.textAlign = "left";
    drawSpacedText(ctx, "OFFICE CAM 03", 80, 108, 4.2);

    ctx.fillStyle = C.coral;
    ctx.beginPath();
    ctx.arc(864, 102, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(229,107,74,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(864, 102, 13, 0, Math.PI * 2);
    ctx.stroke();
    setFont(ctx, 18, MONO, "700");
    ctx.fillStyle = C.coral;
    ctx.fillText("REC", 886, 109);

    setFont(ctx, 18, MONO, "700");
    ctx.fillStyle = C.cream;
    ctx.textAlign = "right";
    ctx.fillText("17:59:59", 1000, 140);

    setFont(ctx, 60, SERIF, "700");
    ctx.fillStyle = C.cream;
    ctx.textAlign = "left";
    ctx.fillText("工位监控", 78, 212);

    setFont(ctx, 16, MONO, "400");
    ctx.fillStyle = C.sageLight;
    drawSpacedText(ctx, "MOTION REPORT / SHIFT 045", 82, 242, 1.8);

    ctx.textAlign = "right";
    setFont(ctx, 17, MONO, "400");
    ctx.fillStyle = C.sageLight;
    ctx.fillText(result.dateText, 1000, 190);
    ctx.fillText("FRI / 17:59", 1000, 214);

    ctx.strokeStyle = "rgba(229,107,74,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(78, 258);
    ctx.lineTo(1000, 258);
    ctx.stroke();
  }

  function drawMonitorSpreadsheet(ctx, x, y, width, height) {
    ctx.fillStyle = "#0A1510";
    roundRect(ctx, x, y, width, height, 9);
    ctx.fill();
    ctx.strokeStyle = "rgba(244,239,227,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#A9BDA7";
    roundRect(ctx, x + 10, y + 10, width - 20, height - 20, 4);
    ctx.fill();

    ctx.fillStyle = "#425E4A";
    ctx.fillRect(x + 10, y + 10, width - 20, 22);
    ctx.fillStyle = C.cream;
    setFont(ctx, 8.5, MONO, "700");
    ctx.textAlign = "left";
    ctx.fillText("Q4 / EXCEL / ACTIVE", x + 18, y + 25);

    ctx.strokeStyle = "rgba(36,56,44,0.24)";
    ctx.lineWidth = 0.8;
    for (let i = 1; i < 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 10 + i * 40, y + 32);
      ctx.lineTo(x + 10 + i * 40, y + height - 10);
      ctx.stroke();
    }
    for (let i = 1; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 32 + i * 28);
      ctx.lineTo(x + width - 10, y + 32 + i * 28);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(78,107,76,0.24)";
    ctx.fillRect(x + 90, y + 88, 40, 28);
    ctx.strokeStyle = "#35533D";
    ctx.strokeRect(x + 90, y + 88, 40, 28);

    setFont(ctx, 7, SANS, "400");
    ctx.fillStyle = "#3B4D3C";
    ctx.fillText("增长", x + 20, y + 52);
    ctx.fillText("我", x + 60, y + 52);
    ctx.fillText("68%", x + 100, y + 52);
    ctx.fillText("再改一版", x + 146, y + 52);
    ctx.fillText("花在长", x + 100, y + 108);
  }

  function drawMonitorBoss(ctx) {
    ctx.save();
    ctx.fillStyle = "#08130D";
    ctx.beginPath();
    ctx.arc(940, 424, 96, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(244,239,227,0.88)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(887, 342);
    ctx.quadraticCurveTo(940, 320, 993, 342);
    ctx.stroke();

    ctx.fillStyle = "#E9E2D0";
    ctx.strokeStyle = "#0A1510";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(940, 390, 47, 33, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = C.coral;
    ctx.beginPath();
    ctx.arc(951, 394, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#101B14";
    ctx.beginPath();
    ctx.arc(951, 394, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(946, 388, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(244,239,227,0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(909, 408);
    ctx.quadraticCurveTo(940, 418, 971, 408);
    ctx.stroke();
    ctx.restore();

    // cubicle partition in front
    ctx.fillStyle = "#354D3C";
    ctx.fillRect(760, 478, 260, 432);
    ctx.strokeStyle = "rgba(244,239,227,0.24)";
    ctx.lineWidth = 2;
    ctx.strokeRect(760, 478, 260, 432);
    ctx.strokeStyle = "rgba(244,239,227,0.08)";
    ctx.lineWidth = 1;
    for (let i = -400; i < 300; i += 18) {
      ctx.beginPath();
      ctx.moveTo(760 + i, 910);
      ctx.lineTo(760 + i + 260, 478);
      ctx.stroke();
    }
    ctx.strokeStyle = "#1A2B20";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(760, 510);
    ctx.lineTo(1020, 510);
    ctx.stroke();

    // sticky note
    ctx.save();
    ctx.translate(796, 542);
    ctx.rotate(-0.03);
    ctx.fillStyle = C.butter;
    ctx.strokeStyle = "#0A1510";
    ctx.lineWidth = 1.5;
    ctx.fillRect(0, 0, 96, 84);
    ctx.strokeRect(0, 0, 96, 84);
    setFont(ctx, 13, SANS, "700");
    ctx.fillStyle = "#24382C";
    ctx.textAlign = "center";
    ctx.fillText("18:00", 48, 27);
    ctx.fillText("准点下班", 48, 47);
    setFont(ctx, 7.5, SANS, "400");
    ctx.fillStyle = "#7C5C2C";
    ctx.fillText("这次是真的", 48, 66);
    ctx.restore();
  }

  function drawMonitorScene(ctx, result) {
    const x = 60;
    const y = 270;
    const width = 960;
    const height = 640;

    ctx.save();
    roundRect(ctx, x, y, width, height, 4);
    ctx.clip();

    ctx.fillStyle = "#1D3025";
    ctx.fillRect(x, y, width, 500);
    ctx.fillStyle = "#342A20";
    ctx.fillRect(x, y + 500, width, 140);
    ctx.fillStyle = "#5C4A35";
    ctx.fillRect(x, y + 500, width, 7);

    ctx.strokeStyle = "rgba(10,21,16,0.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x, y + 540 + i * 15);
      ctx.bezierCurveTo(x + 260, y + 532 + i * 15, x + 680, y + 548 + i * 15, x + width, y + 538 + i * 15);
      ctx.stroke();
    }

    drawMonitorSpreadsheet(ctx, 94, 355, 320, 218);
    drawMonitorBoss(ctx);

    // speech bubble
    ctx.save();
    ctx.translate(690, 292);
    ctx.rotate(0.015);
    ctx.fillStyle = "#F1EAD8";
    ctx.strokeStyle = "#0A1510";
    ctx.lineWidth = 2;
    roundRect(ctx, 0, 0, 130, 62, 4);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(99, 62);
    ctx.lineTo(116, 78);
    ctx.lineTo(122, 62);
    ctx.fill();
    ctx.stroke();
    setFont(ctx, 24, SERIF, "700");
    ctx.fillStyle = "#24382C";
    ctx.textAlign = "left";
    ctx.fillText("在吗？", 15, 41);
    ctx.restore();

    // desk mat
    ctx.fillStyle = "#101D15";
    ctx.strokeStyle = "rgba(244,239,227,0.34)";
    ctx.lineWidth = 2;
    roundRect(ctx, 342, 690, 396, 164, 9);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(244,239,227,0.17)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    roundRect(ctx, 354, 702, 372, 140, 5);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.beginPath();
    ctx.ellipse(540, 824, 106, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    drawPlant(ctx, 540, 735, {
      bloom: result.bloomed,
      growth: result.growth,
      wilt: !result.bloomed
    });
    drawMug(ctx, 540, 735, 0.94);

    // low-light tint
    ctx.fillStyle = "rgba(5,24,15,0.18)";
    ctx.fillRect(x, y, width, height);

    const lamp = ctx.createRadialGradient(540, 610, 80, 540, 610, 390);
    lamp.addColorStop(0, "rgba(244,239,227,0.12)");
    lamp.addColorStop(0.52, "rgba(244,239,227,0.03)");
    lamp.addColorStop(1, "rgba(0,0,0,0.2)");
    ctx.fillStyle = lamp;
    ctx.fillRect(x, y, width, height);

    // scanlines and feed grain
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let sy = y; sy < y + height; sy += 5) {
      ctx.fillRect(x, sy, width, 1);
    }
    for (let i = 0; i < 1200; i += 1) {
      ctx.fillStyle = `rgba(244,239,227,${random() * 0.06})`;
      ctx.fillRect(x + random() * width, y + random() * height, 1, 1);
    }

    const vignette = ctx.createRadialGradient(540, 590, 200, 540, 590, 660);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.72, "rgba(0,0,0,0.12)");
    vignette.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vignette;
    ctx.fillRect(x, y, width, height);

    drawMonitorCameraUi(ctx, result);

    ctx.restore();

    ctx.strokeStyle = C.cream;
    ctx.lineWidth = 2.5;
    roundRect(ctx, x, y, width, height, 4);
    ctx.stroke();
    ctx.strokeStyle = "rgba(244,239,227,0.28)";
    ctx.lineWidth = 1;
    roundRect(ctx, x + 8, y + 8, width - 16, height - 16, 2);
    ctx.stroke();
  }

  function drawMonitorCameraUi(ctx, result) {
    setFont(ctx, 10, MONO, "700");
    ctx.fillStyle = C.cream;
    ctx.textAlign = "left";
    drawSpacedText(ctx, "CAM 03 / WIDE", 82, 300, 1.2);
    ctx.fillStyle = C.coral;
    ctx.fillText("● LIVE", 210, 300);

    ctx.textAlign = "right";
    ctx.fillStyle = C.cream;
    ctx.fillText("17:59:59", 1002, 300);

    ctx.textAlign = "left";
    ctx.fillStyle = C.sageLight;
    ctx.fillText("NO AUDIO", 82, 884);

    ctx.textAlign = "center";
    setFont(ctx, 10, MONO, "700");
    ctx.fillStyle = C.coral;
    drawSpacedText(ctx, "MOTION DETECTED", 540, 300, 1.6, "center");

    ctx.textAlign = "left";
    setFont(ctx, 9, MONO, "700");
    ctx.fillStyle = C.cream;
    drawSpacedText(ctx, "SUBJECT 01 / " + (result.bloomed ? "BLOOM 100%" : "NO BLOOM"), 424, 374, 0.9);

    // subject box
    ctx.strokeStyle = "rgba(244,239,227,0.65)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([8, 7]);
    ctx.strokeRect(418, 386, 252, 470);
    ctx.setLineDash([]);
    ctx.strokeStyle = C.coral;
    ctx.lineWidth = 3;
    const corners = [
      [418, 386, 1, 1],
      [670, 386, -1, 1],
      [418, 856, 1, -1],
      [670, 856, -1, -1]
    ];
    corners.forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx + dx * 15, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * 15);
      ctx.stroke();
    });

    // crosshair
    ctx.strokeStyle = "rgba(229,107,74,0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(540, 612);
    ctx.lineTo(540, 644);
    ctx.moveTo(524, 628);
    ctx.lineTo(556, 628);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(540, 628, 10, 0, Math.PI * 2);
    ctx.stroke();

    // manager box
    ctx.strokeStyle = "rgba(229,107,74,0.7)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(852, 322, 174, 192);
    ctx.setLineDash([]);
    setFont(ctx, 9, MONO, "700");
    ctx.fillStyle = C.coral;
    ctx.textAlign = "left";
    drawSpacedText(ctx, "MANAGER", 858, 314, 1.3);

    // sight line
    ctx.strokeStyle = "rgba(229,107,74,0.35)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 9]);
    ctx.beginPath();
    ctx.moveTo(900, 410);
    ctx.lineTo(710, 520);
    ctx.stroke();
    ctx.setLineDash([]);

    // rec corner
    ctx.fillStyle = C.coral;
    ctx.beginPath();
    ctx.arc(1004, 878, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.cream;
    setFont(ctx, 9, MONO, "700");
    ctx.textAlign = "right";
    ctx.fillText("REC", 988, 882);
  }

  function drawMonitorPanel(ctx, result) {
    const x = 60;
    const y = 940;
    const width = 960;
    const height = 400;

    ctx.fillStyle = C.cream;
    ctx.strokeStyle = C.forest;
    ctx.lineWidth = 2.5;
    roundRect(ctx, x, y, width, height, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = C.coral;
    ctx.fillRect(x, y, width, 7);

    setFont(ctx, 13, MONO, "700");
    ctx.fillStyle = C.coralDark;
    ctx.textAlign = "left";
    drawSpacedText(ctx, "CASE FILE / 工位人格", 84, 986, 1.5);

    setFont(ctx, 57, SERIF, "700");
    ctx.fillStyle = C.forest;
    ctx.fillText(result.title, 80, 1055);

    drawGrade(ctx, result.grade, 972, 1028);

    setFont(ctx, 21, SANS, "400");
    ctx.fillStyle = "#4F5B4C";
    drawWrapped(ctx, result.desc, 82, 1092, 850, 30, "left");

    const stats = [
      ["摸鱼值", result.score.toLocaleString("zh-CN")],
      ["开花用时", result.timeValue],
      ["完美切屏", `${result.perfects} 次`],
      ["被抓包", `${result.caught} 次`]
    ];
    const startX = 82;
    const gap = 12;
    const boxW = (876 - gap * 3) / 4;
    const statY = 1162;
    const statH = 80;
    stats.forEach(([label, value], index) => {
      const sx = startX + index * (boxW + gap);
      ctx.fillStyle = "rgba(36,56,44,0.055)";
      ctx.strokeStyle = "rgba(36,56,44,0.2)";
      ctx.lineWidth = 1;
      roundRect(ctx, sx, statY, boxW, statH, 2);
      ctx.fill();
      ctx.stroke();
      setFont(ctx, 12, SANS, "400");
      ctx.fillStyle = C.inkSoft;
      ctx.textAlign = "left";
      ctx.fillText(label, sx + 10, statY + 24);
      setFont(ctx, 25, MONO, "700");
      ctx.fillStyle = C.forest;
      ctx.fillText(value, sx + 10, statY + 60);
    });

    ctx.fillStyle = "rgba(242,193,78,0.34)";
    ctx.fillRect(82, 1269, 4, 59);
    setFont(ctx, 26, SERIF, "700");
    ctx.fillStyle = C.forest;
    ctx.textAlign = "left";
    const quoteLines = wrapLines(ctx, `“${result.quote}”`, 824);
    quoteLines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, 106, 1297 + index * 32);
    });
  }

  function drawMonitorFooter(ctx, result) {
    setFont(ctx, 20, SERIF, "700");
    ctx.fillStyle = C.cream;
    ctx.textAlign = "left";
    ctx.fillText("#带薪养花挑战", 82, 1376);

    const bars = [2, 4, 2, 3, 2, 5, 2, 2, 4, 3, 2, 4, 2, 3, 5, 2, 2, 4, 3, 2];
    let bx = 780;
    ctx.fillStyle = "rgba(244,239,227,0.6)";
    bars.forEach((bar, index) => {
      ctx.fillRect(bx, 1356, bar, index % 4 === 0 ? 24 : 18);
      bx += bar + 3;
    });

    setFont(ctx, 10, MONO, "700");
    ctx.fillStyle = C.sageLight;
    ctx.textAlign = "right";
    drawSpacedText(ctx, "EVIDENCE No. 045", 1000, 1376, 1.1, "right");
  }

  function drawMonitorCard(ctx, result) {
    drawMonitorBackground(ctx);
    drawMonitorHeader(ctx, result);
    drawMonitorScene(ctx, result);
    drawMonitorPanel(ctx, result);
    drawMonitorFooter(ctx, result);
  }

  function render(result, style = "botanical") {
    const cardStyle = style === "monitor" ? "monitor" : "botanical";
    seed = 20261027 + (result.score || 0) + (cardStyle === "monitor" ? 907 : 0);
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");

    if (cardStyle === "monitor") {
      drawMonitorCard(ctx, result);
    } else {
      drawPaperBackground(ctx);
      drawFrame(ctx);
      drawHeader(ctx, result);
      drawIllustration(ctx, result);
      drawPersona(ctx, result);
      drawStats(ctx, result);
      drawQuote(ctx, result);
      drawFooter(ctx, result);
    }

    return canvas.toDataURL("image/png");
  }

  function shareText(result) {
    const opener = result.bloomed
      ? "我在工位养开了一朵花，老板没发现。"
      : "我在工位养花，花没开，人先麻了。";
    return [
      opener,
      `我的工位人格是「${result.title}」：完美切屏 ${result.perfects} 次，被抓包 ${result.caught} 次，摸鱼值 ${result.score.toLocaleString("zh-CN")}。`,
      result.quote,
      "#带薪养花 #打工人小游戏 #网页小游戏 #工位日常 #摸鱼文学"
    ].join("\n");
  }

  window.PaidToBloomCard = { render, shareText };
})();
