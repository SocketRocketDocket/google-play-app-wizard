// Google Play App Wizard — Interactive Publishing Tools
// Store Listing Drafter, Asset Validator, SDK → Data Safety Mapper, 14-Day Closed Test Tracker

(function (global) {
  'use strict';

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function copyText(text, toast) {
    if (!text) { toast('Nothing to copy yet'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard')).catch(() => fallbackCopy(text, toast));
    } else {
      fallbackCopy(text, toast);
    }
  }

  function fallbackCopy(text, toast) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Copied to clipboard'); }
    catch (e) { toast('Could not copy automatically'); }
    ta.remove();
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. STORE LISTING DRAFTER & CHARACTER COUNTER
  // ═══════════════════════════════════════════════════════════════════
  const DRAFT_FIELDS = {
    listing: [
      { key: 'appName', label: 'App Name', max: 30, single: true, placeholder: 'e.g. BudgetBuddy — Expense Tracker' },
      { key: 'shortDesc', label: 'Short Description', max: 80, single: true, placeholder: 'Shown in search results — make every word count' },
      { key: 'fullDesc', label: 'Full Description', max: 4000, single: false, rows: 6, placeholder: 'Key features, benefits, what makes your app useful…' }
    ],
    release: [
      { key: 'releaseNotes', label: 'Release Notes ("What\'s new")', max: 500, single: false, rows: 4, placeholder: '• Initial release!\n• Added dark mode and offline checklist\n• Fixed minor layout bugs' }
    ]
  };

  function renderListingDrafter(mode, ctx) {
    const data = ctx.getToolData('draft');
    const fields = DRAFT_FIELDS[mode];
    const wrap = document.createElement('div');
    wrap.className = 'tool-box';

    const title = mode === 'listing' ? '✍️ Store Listing Drafter & Preview' : '✍️ Release Notes Drafter';
    wrap.innerHTML = `
      <div class="tool-box-header">
        <div class="tool-box-title">${title}</div>
        <button type="button" class="tool-mini-btn" data-copy-all>Copy all</button>
      </div>
      <div class="drafter-fields">
        ${fields.map(f => {
          const val = data[f.key] || '';
          const len = val.length;
          const cls = len > f.max ? 'over' : (len > f.max * 0.9 ? 'warn' : '');
          return `
            <div class="drafter-field">
              <div class="drafter-field-top">
                <label>${f.label}</label>
                <div class="drafter-field-meta">
                  <span class="char-count ${cls}" data-count="${f.key}">${len} / ${f.max}</span>
                  <button type="button" class="tool-mini-btn" data-copy="${f.key}">Copy</button>
                </div>
              </div>
              ${f.single
                ? `<input type="text" class="tool-input" data-field="${f.key}" value="${esc(val)}" placeholder="${esc(f.placeholder)}">`
                : `<textarea class="tool-input" data-field="${f.key}" rows="${f.rows}" placeholder="${esc(f.placeholder)}">${esc(val)}</textarea>`}
            </div>`;
        }).join('')}
      </div>
      ${mode === 'listing' ? `
        <div class="store-preview">
          <div class="store-preview-label">Play Store Preview</div>
          <div class="store-preview-card">
            <div class="sp-icon" id="spIconPreview">${data.iconPreview ? `<img src="${data.iconPreview}" alt="Icon">` : '📱'}</div>
            <div class="sp-info">
              <div class="sp-name" data-preview="appName">${esc(data.appName || 'Your App Name')}</div>
              <div class="sp-dev">${esc(ctx.getAppName())}</div>
              <div class="sp-short" data-preview="shortDesc">${esc(data.shortDesc || 'Your short description appears here in search results.')}</div>
            </div>
            <span class="sp-install">Install</span>
          </div>
        </div>` : ''}`;

    let saveTimer;
    wrap.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('input', () => {
        const key = el.dataset.field;
        const fieldDef = fields.find(f => f.key === key);
        const val = el.value;
        const counter = wrap.querySelector(`[data-count="${key}"]`);
        counter.textContent = `${val.length} / ${fieldDef.max}`;
        counter.classList.toggle('over', val.length > fieldDef.max);
        counter.classList.toggle('warn', val.length <= fieldDef.max && val.length > fieldDef.max * 0.9);

        if (mode === 'listing') {
          const prev = wrap.querySelector(`[data-preview="${key}"]`);
          if (prev) prev.textContent = val || (key === 'appName' ? 'Your App Name' : 'Your short description appears here in search results.');
        }

        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          const d = ctx.getToolData('draft');
          d[key] = val;
          ctx.setToolData('draft', d);
        }, 250);
      });
    });

    wrap.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const el = wrap.querySelector(`[data-field="${btn.dataset.copy}"]`);
        copyText(el ? el.value : '', ctx.toast);
      });
    });

    wrap.querySelector('[data-copy-all]').addEventListener('click', () => {
      const out = fields.map(f => {
        const el = wrap.querySelector(`[data-field="${f.key}"]`);
        return `${f.label}:\n${el ? el.value : ''}`;
      }).join('\n\n');
      copyText(out.trim(), ctx.toast);
    });

    return wrap;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. DRAG-AND-DROP ASSET CHECKER (100% client-side)
  // ═══════════════════════════════════════════════════════════════════
  const ASSET_SPECS = {
    icon: {
      title: '🖼️ App Icon Validator',
      hint: 'Required: 512 × 512 px · 32-bit PNG · ≤ 1 MB',
      accept: 'image/png,image/jpeg,image/webp',
      multiple: false
    },
    feature: {
      title: '🖼️ Feature Graphic Validator',
      hint: 'Required: 1024 × 500 px · JPG or 24-bit PNG (no transparency) · ≤ 1 MB',
      accept: 'image/png,image/jpeg,image/webp',
      multiple: false
    },
    screenshot: {
      title: '🖼️ Screenshot Validator',
      hint: 'Required: 320–3840 px each side · max 2:1 aspect ratio · JPG or 24-bit PNG (no transparency)',
      accept: 'image/png,image/jpeg,image/webp',
      multiple: true
    }
  };

  function detectAlpha(img) {
    try {
      const c = document.createElement('canvas');
      const w = Math.min(img.naturalWidth, 256);
      const h = Math.min(img.naturalHeight, 256);
      c.width = w; c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0, w, h);
      const pixels = g.getImageData(0, 0, w, h).data;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 250) return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function validateAssetFile(kind, file) {
    return new Promise(resolve => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const sizeKB = Math.round(file.size / 1024);
        const type = file.type || '';
        const isPng = type === 'image/png' || /\.png$/i.test(file.name);
        const isJpg = type === 'image/jpeg' || /\.jpe?g$/i.test(file.name);
        const hasAlpha = isPng ? detectAlpha(img) : false;
        const checks = [];

        if (kind === 'icon') {
          checks.push({ ok: w === 512 && h === 512, text: `Dimensions: ${w} × ${h} px (must be 512 × 512)` });
          checks.push({ ok: isPng, text: `Format: ${type || file.name} (must be PNG)` });
          checks.push({ ok: file.size <= 1024 * 1024, text: `File size: ${sizeKB} KB (max 1,024 KB)` });
        } else if (kind === 'feature') {
          checks.push({ ok: w === 1024 && h === 500, text: `Dimensions: ${w} × ${h} px (must be 1024 × 500)` });
          checks.push({ ok: isPng || isJpg, text: `Format: ${type || file.name} (must be JPG or PNG)` });
          checks.push({ ok: !hasAlpha, text: hasAlpha ? 'Transparency detected — must be 24-bit PNG (no alpha) or JPG' : 'No transparency detected (OK)' });
          checks.push({ ok: file.size <= 1024 * 1024, text: `File size: ${sizeKB} KB (max 1,024 KB)` });
        } else {
          const minSide = Math.min(w, h);
          const maxSide = Math.max(w, h);
          const ratio = maxSide / (minSide || 1);
          checks.push({ ok: minSide >= 320 && maxSide <= 3840, text: `Dimensions: ${w} × ${h} px (320–3840 px allowed)` });
          checks.push({ ok: ratio <= 2.01, text: `Aspect ratio: ${ratio.toFixed(2)}:1 (max 2:1)` });
          checks.push({ ok: isPng || isJpg, text: `Format: ${type || file.name} (must be JPG or PNG)` });
          checks.push({ ok: !hasAlpha, text: hasAlpha ? 'Transparency detected — must be 24-bit PNG (no alpha) or JPG' : 'No transparency detected (OK)' });
        }

        const allPass = checks.every(c => c.ok);
        resolve({ file, url, w, h, sizeKB, checks, allPass });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ file, url: null, checks: [{ ok: false, text: 'Could not read image file' }], allPass: false });
      };
      img.src = url;
    });
  }

  function renderAssetChecker(kind) {
    const spec = ASSET_SPECS[kind];
    const wrap = document.createElement('div');
    wrap.className = 'tool-box';
    wrap.innerHTML = `
      <div class="tool-box-header">
        <div class="tool-box-title">${spec.title}</div>
        <span class="tool-badge">100% Offline</span>
      </div>
      <div class="dropzone" tabindex="0">
        <input type="file" accept="${spec.accept}" ${spec.multiple ? 'multiple' : ''} hidden>
        <div class="dropzone-icon">📁</div>
        <div class="dropzone-text">Drop ${spec.multiple ? 'image(s)' : 'an image'} here or <span class="dropzone-browse">browse</span></div>
        <div class="dropzone-hint">${spec.hint}</div>
      </div>
      <div class="asset-results"></div>`;

    const zone = wrap.querySelector('.dropzone');
    const input = zone.querySelector('input');
    const results = wrap.querySelector('.asset-results');

    async function handleFiles(fileList) {
      const files = Array.from(fileList || []).filter(f => f.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(f.name));
      if (!files.length) return;
      results.innerHTML = '';
      const toCheck = spec.multiple ? files : [files[0]];
      for (const file of toCheck) {
        const res = await validateAssetFile(kind, file);
        const item = document.createElement('div');
        item.className = `asset-result ${res.allPass ? 'pass' : 'fail'}`;
        item.innerHTML = `
          ${res.url ? `
            <div class="asset-thumb-group">
              <img class="asset-thumb ${kind}" src="${res.url}" alt="${esc(file.name)}">
              ${kind === 'icon' ? `<img class="asset-thumb icon-round" src="${res.url}" alt="Circular preview" title="Play Store circular mask preview">` : ''}
            </div>` : ''}
          <div class="asset-result-body">
            <div class="asset-result-name">
              <strong>${esc(file.name)}</strong>
              <span class="asset-pill ${res.allPass ? 'pass' : 'fail'}">${res.allPass ? '✓ Ready for Play' : '✕ Needs fixes'}</span>
            </div>
            <ul class="asset-checks">
              ${res.checks.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${c.ok ? '✓' : '✕'} ${esc(c.text)}</li>`).join('')}
            </ul>
          </div>`;
        results.appendChild(item);
      }
    }

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', () => { handleFiles(input.files); input.value = ''; });
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });

    return wrap;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. SDK → DATA SAFETY MAPPER
  // ═══════════════════════════════════════════════════════════════════
  const SDKS = [
    {
      id: 'firebase-analytics', name: 'Firebase / Google Analytics',
      declares: [
        ['App activity', 'App interactions, page views (Collected · Analytics)'],
        ['Device or other IDs', 'App instance ID, advertising ID if enabled (Collected · Analytics)'],
        ['Location (Approximate)', 'Derived from IP address (Collected · Analytics)']
      ]
    },
    {
      id: 'crashlytics', name: 'Firebase Crashlytics / Sentry',
      declares: [
        ['App info and performance', 'Crash logs, diagnostics (Collected · Analytics / Functionality)'],
        ['Device or other IDs', 'Installation UUID (Collected · Analytics / Functionality)']
      ]
    },
    {
      id: 'admob', name: 'Google AdMob / Ad SDKs',
      declares: [
        ['Device or other IDs', 'Advertising ID — requires AD_ID declaration (Collected & Shared · Advertising)'],
        ['App activity', 'Ad interactions, impressions (Collected & Shared · Advertising)'],
        ['Location (Approximate)', 'IP-based location for ad targeting (Collected & Shared · Advertising)'],
        ['App info and performance', 'Diagnostics / fraud prevention (Collected & Shared · Fraud prevention)']
      ]
    },
    {
      id: 'auth', name: 'Firebase Auth / Google Sign-In',
      declares: [
        ['Personal info', 'Name, email address, user IDs (Collected · Account management)'],
        ['Account deletion', 'Must provide an in-app + web link for users to request account deletion']
      ]
    },
    {
      id: 'billing', name: 'Google Play Billing / RevenueCat / Stripe',
      declares: [
        ['Financial info', 'Purchase history (Collected · App functionality / Analytics)'],
        ['Personal info', 'User ID / billing email if using Stripe (Collected · App functionality)']
      ]
    },
    {
      id: 'push', name: 'Firebase Cloud Messaging / OneSignal',
      declares: [
        ['Device or other IDs', 'Push registration token (Collected · App functionality)']
      ]
    },
    {
      id: 'maps', name: 'Google Maps / Location Services',
      declares: [
        ['Location', 'Approximate and/or Precise location depending on permissions (Collected · Functionality)']
      ]
    },
    {
      id: 'offline', name: 'None — Purely offline / no SDKs',
      declares: [
        ['No user data collected', 'Select "No" on "Does your app collect or share any of the required user data types?" (Double-check third-party libraries!)']
      ]
    }
  ];

  function renderSdkMapper(ctx) {
    const saved = ctx.getToolData('sdks');
    let selected = Array.isArray(saved.list) ? saved.list.slice() : [];

    const wrap = document.createElement('div');
    wrap.className = 'tool-box';
    wrap.innerHTML = `
      <div class="tool-box-header">
        <div class="tool-box-title">🧩 SDK → Data Safety Cheat Sheet</div>
        <button type="button" class="tool-mini-btn" data-copy-sdk>Copy to Notes</button>
      </div>
      <p class="tool-subtext">Check the SDKs in your app to see which Play Console Data Safety sections they typically trigger:</p>
      <div class="sdk-grid">
        ${SDKS.map(s => `
          <label class="sdk-chip">
            <input type="checkbox" value="${s.id}" ${selected.includes(s.id) ? 'checked' : ''}>
            <span>${esc(s.name)}</span>
          </label>`).join('')}
      </div>
      <div class="sdk-output"></div>`;

    const outEl = wrap.querySelector('.sdk-output');

    function buildRows() {
      const byCat = new Map();
      for (const id of selected) {
        const sdk = SDKS.find(s => s.id === id);
        if (!sdk) continue;
        for (const [cat, desc] of sdk.declares) {
          if (!byCat.has(cat)) byCat.set(cat, []);
          if (!byCat.get(cat).includes(desc)) byCat.get(cat).push(desc);
        }
      }
      return byCat;
    }

    function update() {
      const byCat = buildRows();
      if (!byCat.size) {
        outEl.innerHTML = '<div class="tool-empty">Select at least one SDK above to preview likely declarations.</div>';
        return;
      }
      let html = '<div class="sdk-results">';
      for (const [cat, list] of byCat.entries()) {
        html += `<div class="sdk-row"><strong>${esc(cat)}</strong><ul>${list.map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>`;
      }
      html += '<div class="sdk-disclaimer">Verify each SDK\'s official Google Play Data Safety guide — exact declarations depend on your configuration.</div></div>';
      outEl.innerHTML = html;
    }

    wrap.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.value === 'offline' && cb.checked) {
          selected = ['offline'];
          wrap.querySelectorAll('input[type="checkbox"]').forEach(other => {
            if (other.value !== 'offline') other.checked = false;
          });
        } else {
          if (cb.checked) {
            selected = selected.filter(x => x !== 'offline');
            const off = wrap.querySelector('input[value="offline"]');
            if (off) off.checked = false;
            if (!selected.includes(cb.value)) selected.push(cb.value);
          } else {
            selected = selected.filter(x => x !== cb.value);
          }
        }
        ctx.setToolData('sdks', { list: selected });
        update();
      });
    });

    wrap.querySelector('[data-copy-sdk]').addEventListener('click', () => {
      const byCat = buildRows();
      if (!byCat.size) { ctx.toast('Select at least one SDK first'); return; }
      const lines = ['Data Safety declarations (from SDKs):'];
      for (const [cat, list] of byCat.entries()) {
        lines.push(`- ${cat}: ${list.join('; ')}`);
      }
      ctx.appendNote('app-content.data-safety', lines.join('\n'));
      ctx.toast('Added summary to My Notes');
    });

    update();
    return wrap;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. 14-DAY CLOSED TEST TRACKER (12 testers × 14 consecutive days)
  // ═══════════════════════════════════════════════════════════════════
  function renderClosedTestTracker(ctx) {
    const saved = ctx.getToolData('closedTest');
    const data = {
      startDate: saved.startDate || '',
      testers: Array.isArray(saved.testers) ? saved.testers.slice() : []
    };

    const wrap = document.createElement('div');
    wrap.className = 'tool-box';

    function persist() {
      ctx.setToolData('closedTest', data);
    }

    function render() {
      const optedIn = data.testers.filter(t => t.optedIn).length;
      const needed = 12;
      let dayText = 'Set start date once 12+ testers are opted in';
      let dayPct = 0;
      let readyDateText = '';

      if (data.startDate) {
        const start = new Date(data.startDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - start) / 86400000);
        const target = new Date(start.getTime() + 14 * 86400000);
        readyDateText = target.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        if (diffDays < 0) {
          dayText = `Starts in ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} · Eligible ${readyDateText}`;
          dayPct = 0;
        } else if (diffDays >= 14) {
          dayText = `✓ 14 days complete! Eligible since ${readyDateText}`;
          dayPct = 100;
        } else {
          dayText = `Day ${diffDays + 1} of 14 · ${14 - diffDays} day${14 - diffDays === 1 ? '' : 's'} left (eligible ${readyDateText})`;
          dayPct = Math.round((diffDays / 14) * 100);
        }
      }

      const testerStatus = optedIn >= 15
        ? 'Great — includes drop-out buffer!'
        : (optedIn >= needed ? 'Minimum met — consider adding 3+ extras as buffer' : `${needed - optedIn} more opted-in tester${needed - optedIn === 1 ? '' : 's'} needed`);

      wrap.innerHTML = `
        <div class="tool-box-header">
          <div class="tool-box-title">⏱️ 14-Day Closed Test Tracker</div>
          <span class="tool-badge ${optedIn >= needed && dayPct === 100 ? 'pass' : ''}">${optedIn}/${needed} opted in</span>
        </div>
        <div class="tracker-grid">
          <div class="tracker-stat">
            <label for="ctStartDate">14-day clock start date</label>
            <input type="date" id="ctStartDate" class="tool-input" value="${esc(data.startDate)}">
            <div class="tracker-bar"><div class="tracker-bar-fill" style="width:${dayPct}%"></div></div>
            <div class="tracker-meta">${esc(dayText)}</div>
          </div>
          <div class="tracker-stat">
            <label>Opted-in testers (${optedIn} of ${data.testers.length})</label>
            <div class="tracker-bar"><div class="tracker-bar-fill" style="width:${Math.min(100, Math.round(optedIn / needed * 100))}%"></div></div>
            <div class="tracker-meta">${esc(testerStatus)}</div>
          </div>
        </div>
        <form class="tester-add-form">
          <input type="text" class="tool-input" placeholder="Add tester name or email (e.g. alex@gmail.com)" required>
          <button type="submit" class="btn-primary tool-add-btn">Add</button>
        </form>
        ${data.testers.length ? `
          <ul class="tester-list">
            ${data.testers.map((t, idx) => `
              <li class="tester-row ${t.optedIn ? 'opted' : ''}">
                <label class="tester-toggle">
                  <input type="checkbox" data-idx="${idx}" ${t.optedIn ? 'checked' : ''}>
                  <span>${esc(t.name)}</span>
                </label>
                <span class="tester-state">${t.optedIn ? 'Opted in ✓' : 'Invited'}</span>
                <button type="button" class="tester-del" data-del="${idx}" title="Remove tester" aria-label="Remove tester">✕</button>
              </li>`).join('')}
          </ul>` : '<div class="tool-empty">No testers logged yet. Add testers above and tick them off once they opt in.</div>'}`;

      wrap.querySelector('#ctStartDate').addEventListener('change', e => {
        data.startDate = e.target.value;
        persist();
        render();
      });

      wrap.querySelector('.tester-add-form').addEventListener('submit', e => {
        e.preventDefault();
        const inp = e.target.querySelector('input');
        const val = inp.value.trim();
        if (!val) return;
        data.testers.push({ name: val, optedIn: false });
        persist();
        render();
      });

      wrap.querySelectorAll('.tester-toggle input').forEach(cb => {
        cb.addEventListener('change', () => {
          const i = Number(cb.dataset.idx);
          if (data.testers[i]) {
            data.testers[i].optedIn = cb.checked;
            persist();
            render();
          }
        });
      });

      wrap.querySelectorAll('.tester-del').forEach(btn => {
        btn.addEventListener('click', () => {
          data.testers.splice(Number(btn.dataset.del), 1);
          persist();
          render();
        });
      });
    }

    render();
    return wrap;
  }

  // ─── Dispatcher: returns DOM element or null for a given step ──────
  function renderStepTool(sectionId, stepId, ctx) {
    const key = `${sectionId}.${stepId}`;
    switch (key) {
      case 'store-listing.app-details': return renderListingDrafter('listing', ctx);
      case 'build-upload.upload-release': return renderListingDrafter('release', ctx);
      case 'store-listing.app-icon': return renderAssetChecker('icon');
      case 'store-listing.feature-graphic': return renderAssetChecker('feature');
      case 'store-listing.screenshots': return renderAssetChecker('screenshot');
      case 'app-content.data-safety': return renderSdkMapper(ctx);
      case 'testing.closed-testing': return renderClosedTestTracker(ctx);
      default: return null;
    }
  }

  global.WIZARD_TOOLS = { renderStepTool };
})(window);
