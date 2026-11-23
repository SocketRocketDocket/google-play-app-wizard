// Google Play App Wizard — Pro Launch Kit Generators
// 1. Play Store Screenshot Studio (1080x1920 24-bit opaque PNG)
// 2. Feature Graphic Generator (1024x500 24-bit opaque PNG)
// 3. Privacy Policy & Account-Deletion HTML Generator (auto-filled from Quiz + SDKs)

(function (global) {
  'use strict';

  const THEMES = [
    { id: 'emerald', name: 'Play Emerald', c1: '#101819', c2: '#016847', accent: '#66e0a3', text: '#ffffff', sub: '#c8e6da' },
    { id: 'midnight', name: 'Midnight Dark', c1: '#0f172a', c2: '#1e293b', accent: '#38bdf8', text: '#ffffff', sub: '#cbd5e1' },
    { id: 'ocean', name: 'Ocean Blue', c1: '#0b2545', c2: '#1a73e8', accent: '#93c5fd', text: '#ffffff', sub: '#dbeafe' },
    { id: 'indigo', name: 'Royal Indigo', c1: '#1e1b4b', c2: '#4f46e5', accent: '#c4b5fd', text: '#ffffff', sub: '#e0e7ff' },
    { id: 'sunset', name: 'Sunset Coral', c1: '#3b0764', c2: '#db2777', accent: '#fde047', text: '#ffffff', sub: '#fce7f3' },
    { id: 'clean', name: 'Clean Light', c1: '#f8fafc', c2: '#e2e8f0', accent: '#01875f', text: '#0f172a', sub: '#475569' }
  ];

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function roundRectPath(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function wrapLines(g, text, maxWidth) {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const lines = [];
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = cur + ' ' + words[i];
      if (g.measureText(test).width <= maxWidth) cur = test;
      else { lines.push(cur); cur = words[i]; }
    }
    lines.push(cur);
    return lines;
  }

  // Export canvas as PNG (native Android Share/Filesystem when inside Capacitor, browser download on web)
  async function exportCanvasPng(canvas, filename, ctx) {
    const dataUrl = canvas.toDataURL('image/png');
    const cap = window.Capacitor;
    if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
      const Filesystem = cap.Plugins && cap.Plugins.Filesystem;
      const Share = cap.Plugins && cap.Plugins.Share;
      if (Filesystem && Share) {
        try {
          const base64 = dataUrl.split(',')[1];
          const written = await Filesystem.writeFile({ path: filename, data: base64, directory: 'CACHE' });
          await Share.share({ title: filename, url: written.uri, dialogTitle: 'Save or share PNG' });
          ctx.toast('Opened share sheet');
          return;
        } catch (e) {
          console.warn('Native PNG share failed:', e);
        }
      }
    }
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    ctx.toast(`Exported ${filename}`);
  }

  function renderProGate(title, description, features, ctx) {
    const box = document.createElement('div');
    box.className = 'tool-box pro-locked-box';
    box.innerHTML = `
      <div class="tool-box-header">
        <div class="tool-box-title">${title}</div>
        <span class="pro-badge">⭐ PRO</span>
      </div>
      <p class="tool-subtext">${description}</p>
      <ul class="pro-lock-list">${features.map(f => `<li>✓ ${esc(f)}</li>`).join('')}</ul>
      <button type="button" class="btn-primary pro-unlock-btn">Unlock Pro Launch Kit</button>`;
    box.querySelector('.pro-unlock-btn').addEventListener('click', () => ctx.openProModal());
    return box;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. PLAY STORE SCREENSHOT STUDIO (1080 × 1920 PNG)
  // ═══════════════════════════════════════════════════════════════════
  function renderScreenshotStudio(ctx) {
    if (!ctx.isPro()) {
      return renderProGate(
        '📸 Play Store Screenshot Studio',
        'Turn raw phone captures into framed, captioned 1080×1920 Play Store screenshots in seconds.',
        ['6 Play Store-ready gradient themes', 'Sleek Android device frame + headline & subtitle', 'Exports exact 1080×1920 opaque PNGs ready to upload'],
        ctx
      );
    }

    const saved = ctx.getToolData('shotStudio');
    const cfg = {
      headline: saved.headline || 'Launch to Google Play\nWithout Missing a Step',
      subtitle: saved.subtitle || 'Guided checklists, asset validation & 14-day test tracking',
      theme: saved.theme || 'emerald',
      deviceFrame: saved.deviceFrame !== false,
      captionPos: saved.captionPos || 'top'
    };
    let uploadedImg = null;

    const wrap = document.createElement('div');
    wrap.className = 'tool-box pro-tool-box';
    wrap.innerHTML = `
      <div class="tool-box-header">
        <div class="tool-box-title">📸 Play Store Screenshot Studio</div>
        <span class="pro-badge unlocked">⭐ PRO</span>
      </div>
      <div class="studio-layout">
        <div class="studio-controls">
          <div class="drafter-field">
            <label class="studio-label">1. Upload raw screenshot</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" class="tool-input studio-file" data-shot-file>
          </div>
          <div class="drafter-field">
            <label class="studio-label">2. Headline</label>
            <textarea class="tool-input" rows="2" data-shot="headline">${esc(cfg.headline)}</textarea>
          </div>
          <div class="drafter-field">
            <label class="studio-label">3. Subtitle</label>
            <input type="text" class="tool-input" data-shot="subtitle" value="${esc(cfg.subtitle)}">
          </div>
          <div class="drafter-field">
            <label class="studio-label">4. Theme</label>
            <div class="theme-swatches">
              ${THEMES.map(t => `
                <button type="button" class="theme-swatch ${t.id === cfg.theme ? 'active' : ''}"
                  data-theme="${t.id}" title="${t.name}"
                  style="background:linear-gradient(135deg, ${t.c1}, ${t.c2});"></button>`).join('')}
            </div>
          </div>
          <div class="studio-toggles">
            <label class="sdk-chip"><input type="checkbox" data-shot-frame ${cfg.deviceFrame ? 'checked' : ''}><span>Device frame</span></label>
            <label class="sdk-chip">
              <span>Caption:</span>
              <select class="studio-inline-select" data-shot-pos>
                <option value="top" ${cfg.captionPos === 'top' ? 'selected' : ''}>Top</option>
                <option value="bottom" ${cfg.captionPos === 'bottom' ? 'selected' : ''}>Bottom</option>
              </select>
            </label>
          </div>
          <button type="button" class="btn-primary studio-export-btn" data-export-shot>⬇️ Export 1080×1920 PNG</button>
        </div>
        <div class="studio-preview-col">
          <canvas class="studio-canvas shot" width="1080" height="1920"></canvas>
          <div class="studio-dim-note">Output: 1080 × 1920 px (9:16) · Opaque PNG</div>
        </div>
      </div>`;

    const canvas = wrap.querySelector('canvas');
    const g = canvas.getContext('2d');

    function draw() {
      const W = 1080, H = 1920;
      const th = THEMES.find(t => t.id === cfg.theme) || THEMES[0];

      // Opaque gradient background
      const grad = g.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, th.c1);
      grad.addColorStop(1, th.c2);
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);

      // Soft decorative glow
      g.fillStyle = th.id === 'clean' ? 'rgba(1,135,95,0.08)' : 'rgba(255,255,255,0.05)';
      g.beginPath(); g.arc(W * 0.85, H * 0.14, 340, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(W * 0.12, H * 0.82, 300, 0, Math.PI * 2); g.fill();

      const captionTop = cfg.captionPos !== 'bottom';
      const textStartY = captionTop ? 130 : 1540;

      // Headline
      g.textAlign = 'center';
      g.fillStyle = th.text;
      g.font = 'bold 74px "Segoe UI", system-ui, sans-serif';
      const rawLines = cfg.headline.split('\n');
      const hLines = [];
      for (const rl of rawLines) hLines.push(...wrapLines(g, rl, W - 140));
      let y = textStartY;
      for (const line of hLines.slice(0, 3)) {
        g.fillText(line, W / 2, y);
        y += 88;
      }

      // Subtitle
      if (cfg.subtitle.trim()) {
        g.fillStyle = th.sub;
        g.font = '400 38px "Segoe UI", system-ui, sans-serif';
        const sLines = wrapLines(g, cfg.subtitle, W - 160);
        y += 12;
        for (const sl of sLines.slice(0, 2)) {
          g.fillText(sl, W / 2, y);
          y += 50;
        }
      }

      // Phone frame / screenshot placement
      const phoneW = 790;
      const phoneH = 1420;
      const phoneX = (W - phoneW) / 2;
      const phoneY = captionTop ? Math.max(y + 40, 440) : 70;
      const bezel = cfg.deviceFrame ? 24 : 0;
      const radius = cfg.deviceFrame ? 64 : 32;

      // Drop shadow
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.42)';
      g.shadowBlur = 60;
      g.shadowOffsetY = 26;
      roundRectPath(g, phoneX, phoneY, phoneW, phoneH, radius);
      g.fillStyle = cfg.deviceFrame ? '#111315' : th.c1;
      g.fill();
      g.restore();

      if (cfg.deviceFrame) {
        g.strokeStyle = 'rgba(255,255,255,0.18)';
        g.lineWidth = 4;
        roundRectPath(g, phoneX, phoneY, phoneW, phoneH, radius);
        g.stroke();
      }

      const sx = phoneX + bezel;
      const sy = phoneY + bezel;
      const sw = phoneW - bezel * 2;
      const sh = phoneH - bezel * 2;

      g.save();
      roundRectPath(g, sx, sy, sw, sh, Math.max(radius - 16, 16));
      g.clip();
      if (uploadedImg) {
        // Cover-fit image cleanly
        const scale = Math.max(sw / uploadedImg.naturalWidth, sh / uploadedImg.naturalHeight);
        const dw = uploadedImg.naturalWidth * scale;
        const dh = uploadedImg.naturalHeight * scale;
        g.drawImage(uploadedImg, sx + (sw - dw) / 2, sy, dw, dh);
      } else {
        // Clean built-in mock UI preview so canvas looks great even before upload
        g.fillStyle = '#181a1c';
        g.fillRect(sx, sy, sw, sh);
        g.fillStyle = '#01875f';
        g.fillRect(sx, sy, sw, 130);
        g.fillStyle = '#ffffff';
        g.textAlign = 'left';
        g.font = 'bold 42px "Segoe UI", system-ui, sans-serif';
        g.fillText(ctx.getAppName(), sx + 48, sy + 84);
        for (let i = 0; i < 4; i++) {
          const cy = sy + 180 + i * 240;
          roundRectPath(g, sx + 40, cy, sw - 80, 200, 24);
          g.fillStyle = '#24262a';
          g.fill();
          g.fillStyle = '#10a36f';
          g.beginPath(); g.arc(sx + 100, cy + 100, 32, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#ffffff';
          g.font = 'bold 34px "Segoe UI", system-ui, sans-serif';
          g.fillText(`✓  Checklist Stage ${i + 1}`, sx + 158, cy + 92);
          g.fillStyle = '#9aa0a6';
          g.font = '400 26px "Segoe UI", system-ui, sans-serif';
          g.fillText('Upload your own screenshot on the left', sx + 158, cy + 138);
        }
      }
      g.restore();

      // Punch-hole camera dot when device frame is on
      if (cfg.deviceFrame) {
        g.fillStyle = '#0b0c0d';
        g.beginPath();
        g.arc(W / 2, sy + 26, 12, 0, Math.PI * 2);
        g.fill();
      }
    }

    function persist() { ctx.setToolData('shotStudio', cfg); }

    wrap.querySelector('[data-shot-file]').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => { uploadedImg = img; draw(); URL.revokeObjectURL(url); };
      img.src = url;
    });
    wrap.querySelectorAll('[data-shot]').forEach(el => {
      el.addEventListener('input', () => { cfg[el.dataset.shot] = el.value; persist(); draw(); });
    });
    wrap.querySelectorAll('.theme-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        cfg.theme = btn.dataset.theme;
        wrap.querySelectorAll('.theme-swatch').forEach(b => b.classList.toggle('active', b === btn));
        persist(); draw();
      });
    });
    wrap.querySelector('[data-shot-frame]').addEventListener('change', e => { cfg.deviceFrame = e.target.checked; persist(); draw(); });
    wrap.querySelector('[data-shot-pos]').addEventListener('change', e => { cfg.captionPos = e.target.value; persist(); draw(); });
    wrap.querySelector('[data-export-shot]').addEventListener('click', () => {
      exportCanvasPng(canvas, `play-screenshot-1080x1920.png`, ctx);
    });

    draw();
    return wrap;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. FEATURE GRAPHIC GENERATOR (1024 × 500 24-bit opaque PNG)
  // ═══════════════════════════════════════════════════════════════════
  function renderFeatureGenerator(ctx) {
    if (!ctx.isPro()) {
      return renderProGate(
        '🎨 Feature Graphic Generator (1024×500)',
        'Design an opaque 1024×500 Google Play banner with center safe-zone guide and instant PNG export.',
        ['Exact 1024×500 dimensions (no transparency)', 'Drop your app icon + title, tagline & feature pills', 'Toggle Google Play 15% safe-zone overlay'],
        ctx
      );
    }

    const saved = ctx.getToolData('featureGen');
    const draft = ctx.getToolData('draft');
    const cfg = {
      title: saved.title || draft.appName || ctx.getAppName(),
      tagline: saved.tagline || draft.shortDesc || 'Fast, simple & built for Android',
      pills: saved.pills || 'Offline Ready, Dark Mode, Free',
      theme: saved.theme || 'emerald',
      showSafeZone: false
    };
    let iconImg = null;

    const wrap = document.createElement('div');
    wrap.className = 'tool-box pro-tool-box';
    wrap.innerHTML = `
      <div class="tool-box-header">
        <div class="tool-box-title">🎨 Feature Graphic Generator (1024×500)</div>
        <span class="pro-badge unlocked">⭐ PRO</span>
      </div>
      <div class="fg-preview-wrap">
        <canvas class="studio-canvas fg" width="1024" height="500"></canvas>
      </div>
      <div class="fg-controls-grid">
        <div class="drafter-field">
          <label class="studio-label">App Icon (optional)</label>
          <input type="file" accept="image/png,image/jpeg,image/webp" class="tool-input studio-file" data-fg-icon>
        </div>
        <div class="drafter-field">
          <label class="studio-label">Headline</label>
          <input type="text" class="tool-input" data-fg="title" value="${esc(cfg.title)}">
        </div>
        <div class="drafter-field">
          <label class="studio-label">Tagline</label>
          <input type="text" class="tool-input" data-fg="tagline" value="${esc(cfg.tagline)}">
        </div>
        <div class="drafter-field">
          <label class="studio-label">Pills (comma-separated, up to 3)</label>
          <input type="text" class="tool-input" data-fg="pills" value="${esc(cfg.pills)}">
        </div>
      </div>
      <div class="fg-bottom-bar">
        <div class="theme-swatches">
          ${THEMES.map(t => `
            <button type="button" class="theme-swatch ${t.id === cfg.theme ? 'active' : ''}"
              data-theme="${t.id}" title="${t.name}"
              style="background:linear-gradient(135deg, ${t.c1}, ${t.c2});"></button>`).join('')}
        </div>
        <label class="sdk-chip"><input type="checkbox" data-fg-safe><span>Safe-zone guide</span></label>
        <button type="button" class="btn-primary" data-export-fg>⬇️ Export 1024×500 PNG</button>
      </div>`;

    const canvas = wrap.querySelector('canvas');
    const g = canvas.getContext('2d');

    function draw(includeGuide) {
      const W = 1024, H = 500;
      const th = THEMES.find(t => t.id === cfg.theme) || THEMES[0];

      const grad = g.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, th.c1);
      grad.addColorStop(1, th.c2);
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);

      g.fillStyle = th.id === 'clean' ? 'rgba(1,135,95,0.08)' : 'rgba(255,255,255,0.06)';
      g.beginPath(); g.arc(880, 70, 220, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(60, 440, 190, 0, Math.PI * 2); g.fill();

      // Icon box
      const ix = 136, iy = 155, isz = 190;
      if (iconImg) {
        g.save();
        roundRectPath(g, ix, iy, isz, isz, 40);
        g.clip();
        g.drawImage(iconImg, ix, iy, isz, isz);
        g.restore();
      } else {
        roundRectPath(g, ix, iy, isz, isz, 40);
        g.fillStyle = th.accent;
        g.fill();
        g.fillStyle = th.id === 'clean' ? '#ffffff' : th.c1;
        g.textAlign = 'center';
        g.font = 'bold 92px "Segoe UI", system-ui, sans-serif';
        g.fillText((cfg.title || 'A').trim().charAt(0).toUpperCase(), ix + isz / 2, iy + 128);
      }

      // Text
      g.textAlign = 'left';
      g.fillStyle = th.text;
      g.font = 'bold 52px "Segoe UI", system-ui, sans-serif';
      const titleLines = wrapLines(g, cfg.title, 540).slice(0, 2);
      let ty = titleLines.length > 1 ? 185 : 215;
      for (const l of titleLines) { g.fillText(l, 362, ty); ty += 60; }

      g.fillStyle = th.sub;
      g.font = '400 24px "Segoe UI", system-ui, sans-serif';
      const tagLines = wrapLines(g, cfg.tagline, 540).slice(0, 2);
      ty += 6;
      for (const l of tagLines) { g.fillText(l, 362, ty); ty += 32; }

      // Pills
      const pills = cfg.pills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
      let px = 362;
      const py = Math.min(ty + 14, 345);
      g.font = '600 16px "Segoe UI", system-ui, sans-serif';
      for (const p of pills) {
        const pw = Math.ceil(g.measureText(p).width) + 28;
        if (px + pw > W - 80) break;
        roundRectPath(g, px, py, pw, 34, 17);
        g.fillStyle = th.id === 'clean' ? 'rgba(1,135,95,0.14)' : 'rgba(255,255,255,0.18)';
        g.fill();
        g.fillStyle = th.id === 'clean' ? '#016847' : '#ffffff';
        g.fillText(p, px + 14, py + 22);
        px += pw + 10;
      }

      // Optional 15% safe zone guide (never exported)
      if (includeGuide && cfg.showSafeZone) {
        g.save();
        g.strokeStyle = '#facc15';
        g.lineWidth = 3;
        g.setLineDash([12, 8]);
        g.strokeRect(W * 0.12, H * 0.12, W * 0.76, H * 0.76);
        g.fillStyle = '#facc15';
        g.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
        g.fillText('Safe Zone (avoid text outside dashed box)', W * 0.12 + 10, H * 0.12 + 24);
        g.restore();
      }
    }

    function persist() { ctx.setToolData('featureGen', { title: cfg.title, tagline: cfg.tagline, pills: cfg.pills, theme: cfg.theme }); }

    wrap.querySelector('[data-fg-icon]').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => { iconImg = img; draw(true); URL.revokeObjectURL(url); };
      img.src = url;
    });
    wrap.querySelectorAll('[data-fg]').forEach(el => {
      el.addEventListener('input', () => { cfg[el.dataset.fg] = el.value; persist(); draw(true); });
    });
    wrap.querySelectorAll('.theme-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        cfg.theme = btn.dataset.theme;
        wrap.querySelectorAll('.theme-swatch').forEach(b => b.classList.toggle('active', b === btn));
        persist(); draw(true);
      });
    });
    wrap.querySelector('[data-fg-safe]').addEventListener('change', e => { cfg.showSafeZone = e.target.checked; draw(true); });
    wrap.querySelector('[data-export-fg]').addEventListener('click', async () => {
      draw(false); // strip guide overlay before exporting
      await exportCanvasPng(canvas, 'feature-graphic-1024x500.png', ctx);
      draw(true);
    });

    draw(true);
    return wrap;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. PRIVACY POLICY & ACCOUNT-DELETION HTML GENERATOR
  // ═══════════════════════════════════════════════════════════════════
  function renderPrivacyGenerator(ctx) {
    if (!ctx.isPro()) {
      return renderProGate(
        '📜 Privacy Policy & Account-Deletion HTML Generator',
        'Auto-generate a ready-to-host privacy.html page tailored to your quiz answers and selected SDKs.',
        ['Auto-fills sections for AdMob, Firebase, Play Billing & Login', 'Includes Google Play\'s required Account Deletion instructions', 'Download clean, mobile-friendly privacy.html ready for GitHub Pages'],
        ctx
      );
    }

    const saved = ctx.getToolData('privacyGen');
    const profile = ctx.getProfile() || {};
    const sdks = (ctx.getToolData('sdks').list) || [];
    const draft = ctx.getToolData('draft');

    const cfg = {
      appName: saved.appName || draft.appName || ctx.getAppName(),
      devName: saved.devName || 'Your Developer Name',
      email: saved.email || 'support@example.com',
      packageId: saved.packageId || 'com.example.myapp',
      hasAds: saved.hasAds != null ? saved.hasAds : (profile.ads === 'yes' || sdks.includes('admob')),
      hasAnalytics: saved.hasAnalytics != null ? saved.hasAnalytics : (sdks.includes('firebase-analytics') || sdks.includes('crashlytics')),
      hasLogin: saved.hasLogin != null ? saved.hasLogin : (profile.login === 'yes' || sdks.includes('auth')),
      hasIap: saved.hasIap != null ? saved.hasIap : (profile.iap === 'yes' || sdks.includes('billing')),
      targetsKids: saved.targetsKids != null ? saved.targetsKids : (profile.kids === 'yes')
    };

    function buildHtml() {
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const collects = cfg.hasAds || cfg.hasAnalytics || cfg.hasLogin || cfg.hasIap;
      const bullets = [];
      if (cfg.hasLogin) bullets.push('<li><strong>Account Information:</strong> Name, email address, and authentication identifiers used to sign you in and manage your account.</li>');
      if (cfg.hasAnalytics) bullets.push('<li><strong>Diagnostics &amp; Usage Analytics:</strong> Crash logs, device model, OS version, and anonymized interaction events to improve app stability.</li>');
      if (cfg.hasAds) bullets.push('<li><strong>Advertising Data:</strong> Advertising ID (<code>AD_ID</code>), approximate IP-based location, and ad interaction metrics via third-party ad networks (such as Google AdMob).</li>');
      if (cfg.hasIap) bullets.push('<li><strong>Purchase History:</strong> Transaction receipts and subscription/unlock status processed securely through Google Play Billing. We never see your full payment card details.</li>');

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — ${esc(cfg.appName)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 760px; margin: 0 auto; padding: 32px 20px; line-height: 1.7; color: #202124; }
    h1 { color: #01875f; } h2 { margin-top: 24px; font-size: 18px; }
    .meta { color: #5f6368; font-size: 13px; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p class="meta">App: <strong>${esc(cfg.appName)}</strong> (<code>${esc(cfg.packageId)}</code>)<br>Developer: ${esc(cfg.devName)} · Effective Date: ${today}</p>

  <h2>1. Information We Collect</h2>
  ${collects
    ? `<p>${esc(cfg.appName)} may collect or process the following categories of data:</p><ul>${bullets.join('\n    ')}</ul>`
    : `<p>${esc(cfg.appName)} does <strong>not</strong> collect, transmit, or sell personal data. All preferences and data you enter remain stored locally on your device.</p>`}

  <h2>2. How We Use Information</h2>
  <p>${collects
    ? 'We use the data listed above solely to provide core app functionality, fix crashes, process purchases, and (where enabled) display relevant ads.'
    : 'Because we do not collect personal data, no user information is shared with third parties or external servers.'}</p>

  ${cfg.hasLogin ? `<h2>3. Account &amp; Data Deletion</h2>
  <p>You may request deletion of your account and all associated personal data at any time by using the in-app account deletion option or emailing <a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a> with your account email. Requests are processed within 30 days.</p>` : ''}

  <h2>${cfg.hasLogin ? '4' : '3'}. Children's Privacy</h2>
  <p>${cfg.targetsKids
    ? 'This app complies with COPPA and Google Play Families Policy. We limit data collection from children under 13 and only use Families Self-Certified SDKs.'
    : 'This app is intended for users aged 13 and older and does not knowingly collect personal information from children under 13.'}</p>

  <h2>${cfg.hasLogin ? '5' : '4'}. Contact Us</h2>
  <p>If you have questions about this Privacy Policy, contact ${esc(cfg.devName)} at <a href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a>.</p>
</body>
</html>`;
    }

    const wrap = document.createElement('div');
    wrap.className = 'tool-box pro-tool-box';
    wrap.innerHTML = `
      <div class="tool-box-header">
        <div class="tool-box-title">📜 Privacy Policy &amp; Account-Deletion Generator</div>
        <span class="pro-badge unlocked">⭐ PRO</span>
      </div>
      <div class="fg-controls-grid">
        <div class="drafter-field"><label class="studio-label">App Name</label><input type="text" class="tool-input" data-pp="appName" value="${esc(cfg.appName)}"></div>
        <div class="drafter-field"><label class="studio-label">Developer / Studio Name</label><input type="text" class="tool-input" data-pp="devName" value="${esc(cfg.devName)}"></div>
        <div class="drafter-field"><label class="studio-label">Support Email</label><input type="email" class="tool-input" data-pp="email" value="${esc(cfg.email)}"></div>
        <div class="drafter-field"><label class="studio-label">Package ID</label><input type="text" class="tool-input" data-pp="packageId" value="${esc(cfg.packageId)}"></div>
      </div>
      <div class="sdk-grid" style="margin-top:10px;">
        <label class="sdk-chip"><input type="checkbox" data-pp-flag="hasAds" ${cfg.hasAds ? 'checked' : ''}><span>Ads (AdMob)</span></label>
        <label class="sdk-chip"><input type="checkbox" data-pp-flag="hasAnalytics" ${cfg.hasAnalytics ? 'checked' : ''}><span>Analytics / Crash Logs</span></label>
        <label class="sdk-chip"><input type="checkbox" data-pp-flag="hasLogin" ${cfg.hasLogin ? 'checked' : ''}><span>User Accounts + Deletion</span></label>
        <label class="sdk-chip"><input type="checkbox" data-pp-flag="hasIap" ${cfg.hasIap ? 'checked' : ''}><span>In-App Purchases</span></label>
        <label class="sdk-chip"><input type="checkbox" data-pp-flag="targetsKids" ${cfg.targetsKids ? 'checked' : ''}><span>Targets Under-13</span></label>
      </div>
      <pre class="pp-preview"></pre>
      <div class="backup-actions" style="margin-top:10px;">
        <button type="button" class="btn-primary" data-pp-download>⬇️ Download privacy.html</button>
        <button type="button" class="btn-secondary" data-pp-copy>Copy HTML</button>
      </div>`;

    const pre = wrap.querySelector('.pp-preview');
    function update() {
      ctx.setToolData('privacyGen', cfg);
      pre.textContent = buildHtml();
    }

    wrap.querySelectorAll('[data-pp]').forEach(el => {
      el.addEventListener('input', () => { cfg[el.dataset.pp] = el.value; update(); });
    });
    wrap.querySelectorAll('[data-pp-flag]').forEach(cb => {
      cb.addEventListener('change', () => { cfg[cb.dataset.ppFlag] = cb.checked; update(); });
    });
    wrap.querySelector('[data-pp-download]').addEventListener('click', () => {
      ctx.saveFile('privacy.html', buildHtml(), 'text/html;charset=utf-8', 'Privacy Policy HTML');
    });
    wrap.querySelector('[data-pp-copy]').addEventListener('click', () => {
      const text = buildHtml();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => ctx.toast('Privacy policy HTML copied'));
      } else {
        ctx.toast('Download privacy.html to save');
      }
    });

    update();
    return wrap;
  }

  // Returns an array of tool DOM nodes for a given step (can pair alongside free tools!)
  function renderProStepTool(sectionId, stepId, ctx) {
    const key = `${sectionId}.${stepId}`;
    switch (key) {
      case 'store-listing.screenshots': return renderScreenshotStudio(ctx);
      case 'store-listing.feature-graphic': return renderFeatureGenerator(ctx);
      case 'app-content.privacy-policy': return renderPrivacyGenerator(ctx);
      default: return null;
    }
  }

  global.WIZARD_PRO = { renderProStepTool };
})(window);
