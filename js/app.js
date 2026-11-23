// Google Play App Wizard — Application Logic
// Multi-app projects, personalization quiz, search & filters, notes, tools, export/backup, native Android share

(function () {
  'use strict';

  const ICONS = {
    rocket: '🚀', phone: '📱', storefront: '🏪', shield: '📋', dollar: '💰',
    upload: '📤', flask: '🧪', flag: '🎯', chart: '📊'
  };

  // ─── Personalization Quiz ──────────────────────────────────────────
  const QUIZ = [
    { id: 'accountType', q: 'What type of developer account do you have?',
      options: [['personal', 'Personal'], ['organization', 'Organization / Business']] },
    { id: 'pricing', q: 'Will users pay to download the app?',
      options: [['free', 'Free'], ['paid', 'Paid upfront']] },
    { id: 'iap', q: 'Will it have in-app purchases or subscriptions?',
      options: [['yes', 'Yes'], ['no', 'No']] },
    { id: 'ads', q: 'Will the app show ads?',
      options: [['yes', 'Yes'], ['no', 'No']] },
    { id: 'kids', q: 'Is the app aimed at children under 13 (even partly)?',
      options: [['yes', 'Yes'], ['no', 'No']] },
    { id: 'login', q: 'Do users need to log in to use features?',
      options: [['yes', 'Yes'], ['no', 'No']] },
    { id: 'regulated', q: 'Does it involve finance, health, government, news, or VPN features?',
      options: [['yes', 'Yes'], ['no', 'No']] }
  ];

  const RULES = {
    'identity-verification': {
      note: p => p.accountType === 'organization'
        ? 'Organization account: you\'ll need a D-U-N-S number. Requesting one can take 30+ days, so start now.'
        : 'Personal account: have a government-issued ID ready, and make sure your legal name matches it exactly.'
    },
    'payment-profile': {
      show: p => p.pricing === 'paid' || p.iap === 'yes',
      required: () => true,
      note: () => 'You plan to earn money in the app, so a payments profile is required to get paid.'
    },
    'create-app-entry': {
      note: p => p.pricing === 'paid'
        ? 'Select "Paid" when creating the app. (You can switch to free later, but not back to paid.)'
        : 'Select "Free". ' + (p.iap === 'yes' ? 'In-app purchases still work fine in free apps.' : 'Remember: a free app can never become a paid app.')
    },
    'app-access': {
      note: p => p.login === 'yes'
        ? 'Your app needs a login, so give reviewers a working test account. Missing credentials is a top rejection reason.'
        : 'Select "All functionality is available without special access".'
    },
    'data-safety': {
      note: p => {
        const parts = [];
        if (p.ads === 'yes') parts.push('ad SDKs usually collect the device or advertising ID, so declare it (and the AD_ID permission)');
        if (p.login === 'yes') parts.push('account data such as email and name must be declared');
        if (p.iap === 'yes' || p.pricing === 'paid') parts.push('purchase history counts as "Financial info"');
        return parts.length ? 'For your app: ' + parts.join('; ') + '.' : null;
      }
    },
    'ads-declaration': {
      note: p => p.ads === 'yes'
        ? (p.kids === 'yes'
          ? 'Answer "Yes". Because you target children, you may ONLY use Families Self-Certified ad SDKs.'
          : 'Answer "Yes, my app contains ads".')
        : 'Answer "No", but double-check that no SDK shows promotional content, including ads for your own apps.'
    },
    'content-rating': {
      note: p => p.kids === 'yes' ? 'Kids\' apps must earn an all-ages rating, so answer carefully.' : null
    },
    'target-audience': {
      note: p => p.kids === 'yes'
        ? '⚠️ Including under-13s means the Families Policy applies: COPPA compliance, certified ad SDKs only, and limits on data collection.'
        : 'Select only 13+ age groups, and make sure your store listing doesn\'t unintentionally appeal to children.'
    },
    'government-apps': {
      show: p => p.regulated === 'yes',
      required: () => true,
      note: () => 'Your app involves regulated features, so complete the matching declaration(s) and have your documentation ready.'
    },
    'set-pricing': {
      note: p => p.pricing === 'paid' ? 'Set a base price; Play converts it into local currencies automatically.' : null
    },
    'closed-testing': {
      required: p => p.accountType === 'personal',
      note: p => p.accountType === 'personal'
        ? '⚠️ REQUIRED for you: run a closed test with at least 12 testers opted in for 14 straight days before applying for production access.'
        : 'Optional for organization accounts, but strongly recommended.'
    }
  };

  // ─── Multi-App State ───────────────────────────────────────────────
  const STORAGE_KEY = 'gplay-wizard-state';

  function newProject(name) {
    return {
      id: 'app-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      name: name || 'My First App',
      checkedItems: {},
      expandedSteps: {},
      notes: {},
      profile: null,
      showAll: false,
      tools: {}
    };
  }

  let store = {
    version: 2,
    theme: null,
    activeProjectId: null,
    projects: []
  };

  let ui = {
    currentSection: null,
    sectionFilter: 'all', // 'all' | 'remaining' | 'required' | 'notes'
    searchQuery: ''
  };

  function proj() {
    let p = store.projects.find(x => x.id === store.activeProjectId);
    if (!p) {
      if (!store.projects.length) store.projects.push(newProject('My First App'));
      p = store.projects[0];
      store.activeProjectId = p.id;
    }
    if (!p.tools) p.tools = {};
    return p;
  }

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw) {
        const first = newProject('My First App');
        store = { version: 2, theme: null, activeProjectId: first.id, projects: [first] };
        return;
      }
      if (raw.version === 2 && Array.isArray(raw.projects) && raw.projects.length) {
        store = {
          version: 2,
          theme: raw.theme || null,
          activeProjectId: raw.activeProjectId || raw.projects[0].id,
          projects: raw.projects.map(p => ({
            id: p.id || newProject().id,
            name: p.name || 'Untitled App',
            checkedItems: p.checkedItems || {},
            expandedSteps: p.expandedSteps || {},
            notes: p.notes || {},
            profile: p.profile || null,
            showAll: !!p.showAll,
            tools: p.tools || {}
          }))
        };
      } else {
        // Migrate v1 single-app state seamlessly
        const migrated = newProject('My First App');
        migrated.checkedItems = raw.checkedItems || {};
        migrated.expandedSteps = raw.expandedSteps || {};
        migrated.notes = raw.notes || {};
        migrated.profile = raw.profile || null;
        migrated.showAll = !!raw.showAll;
        store = { version: 2, theme: raw.theme || null, activeProjectId: migrated.id, projects: [migrated] };
        saveState();
      }
    } catch (e) {
      console.warn('Could not load saved state:', e);
      const first = newProject('My First App');
      store = { version: 2, theme: null, activeProjectId: first.id, projects: [first] };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn('Could not save state:', e);
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function $(id) { return document.getElementById(id); }

  // ─── Personalization Logic ─────────────────────────────────────────
  function isStepApplicable(step) {
    const p = proj();
    const rule = RULES[step.id];
    if (!p.profile || !rule || !rule.show) return true;
    return rule.show(p.profile);
  }

  function isStepVisible(step) {
    return proj().showAll || isStepApplicable(step);
  }

  function isStepRequired(step) {
    const p = proj();
    const rule = RULES[step.id];
    if (p.profile && rule && rule.required && isStepApplicable(step)) return rule.required(p.profile);
    return step.required;
  }

  function getStepNote(step) {
    const p = proj();
    const rule = RULES[step.id];
    if (!p.profile || !rule || !rule.note || !isStepApplicable(step)) return null;
    return rule.note(p.profile);
  }

  function visibleSteps(section) {
    return section.steps.filter(isStepVisible);
  }

  function hiddenStepCount() {
    let n = 0;
    for (const s of WIZARD_DATA.sections) n += s.steps.filter(st => !isStepApplicable(st)).length;
    return n;
  }

  // ─── Progress ──────────────────────────────────────────────────────
  function getStepProgress(section, step) {
    const checkedItems = proj().checkedItems;
    const total = step.checklist.length;
    let checked = 0;
    for (let i = 0; i < total; i++) if (checkedItems[`${section.id}.${step.id}.${i}`]) checked++;
    return { total, checked, percent: total ? Math.round(checked / total * 100) : 0 };
  }

  function getSectionProgress(section) {
    let total = 0, checked = 0;
    for (const step of visibleSteps(section)) {
      const p = getStepProgress(section, step);
      total += p.total; checked += p.checked;
    }
    return { total, checked, percent: total ? Math.round(checked / total * 100) : 0 };
  }

  function getOverallProgress() {
    let total = 0, checked = 0;
    for (const s of WIZARD_DATA.sections) {
      const p = getSectionProgress(s);
      total += p.total; checked += p.checked;
    }
    return { total, checked, percent: total ? Math.round(checked / total * 100) : 0 };
  }

  // ─── Project Switcher ──────────────────────────────────────────────
  function renderProjectSwitcher() {
    const sel = $('projectSelect');
    if (!sel) return;
    sel.innerHTML = store.projects
      .map(p => `<option value="${escapeHtml(p.id)}" ${p.id === store.activeProjectId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`)
      .join('');
  }

  function openProjectModal() {
    renderProjectModalList();
    $('newProjectName').value = '';
    openModal('projectModal');
  }

  function renderProjectModalList() {
    const list = $('projectList');
    list.innerHTML = store.projects.map(p => {
      const isActive = p.id === store.activeProjectId;
      return `
        <div class="project-row ${isActive ? 'active' : ''}" data-pid="${escapeHtml(p.id)}">
          <div class="project-row-main">
            <strong>${escapeHtml(p.name)}</strong>
            ${isActive ? '<span class="project-active-pill">Active</span>' : ''}
          </div>
          <div class="project-row-actions">
            ${!isActive ? `<button type="button" class="tool-mini-btn" data-switch="${escapeHtml(p.id)}">Switch</button>` : ''}
            <button type="button" class="tool-mini-btn" data-rename="${escapeHtml(p.id)}">Rename</button>
            ${store.projects.length > 1 ? `<button type="button" class="tool-mini-btn danger" data-delete="${escapeHtml(p.id)}">Delete</button>` : ''}
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('[data-switch]').forEach(btn => {
      btn.addEventListener('click', () => {
        store.activeProjectId = btn.dataset.switch;
        saveState();
        closeModal('projectModal');
        rerender();
        toast(`Switched to "${proj().name}"`);
      });
    });

    list.querySelectorAll('[data-rename]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = store.projects.find(x => x.id === btn.dataset.rename);
        if (!target) return;
        const next = window.prompt('Rename app project:', target.name);
        if (next && next.trim()) {
          target.name = next.trim();
          saveState();
          renderProjectModalList();
          rerender();
          toast('Project renamed');
        }
      });
    });

    list.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (store.projects.length <= 1) return;
        const target = store.projects.find(x => x.id === btn.dataset.delete);
        if (!target) return;
        if (!window.confirm(`Delete "${target.name}" and all its checklist progress & notes?`)) return;
        store.projects = store.projects.filter(x => x.id !== target.id);
        if (store.activeProjectId === target.id) store.activeProjectId = store.projects[0].id;
        saveState();
        renderProjectModalList();
        rerender();
        toast('Project deleted');
      });
    });
  }

  function isPro() {
    return !!(window.PLAY_BILLING && window.PLAY_BILLING.isPro());
  }

  function updateProUi() {
    const unlocked = isPro();
    const btn = $('proBtn');
    if (btn) {
      btn.classList.toggle('pro-active', unlocked);
      btn.innerHTML = unlocked ? '⭐ <span>Pro Launch Kit Active</span>' : '⭐ <span>Unlock Pro Launch Kit</span>';
    }
    const priceEl = $('proPriceTag');
    if (priceEl && window.PLAY_BILLING) priceEl.textContent = window.PLAY_BILLING.getPrice();

    const lockTags = document.querySelectorAll('[data-pro-lock]');
    lockTags.forEach(el => { el.hidden = unlocked; });
  }

  function openProModal(reason) {
    const unlocked = isPro();
    const isNative = !!(window.PLAY_BILLING && window.PLAY_BILLING.isNative());
    const price = window.PLAY_BILLING ? window.PLAY_BILLING.getPrice() : '$4.99';

    $('proPriceTag').textContent = price;
    $('proReason').textContent = reason || '';
    $('proReason').hidden = !reason;
    $('proUnlockedBanner').hidden = !unlocked;
    $('proPurchaseBtn').hidden = unlocked || !isNative;
    $('proPurchaseBtn').textContent = `Unlock Pro Launch Kit — ${price}`;
    $('proRestoreBtn').hidden = unlocked || !isNative;

    const webBox = $('proWebDemoBox');
    webBox.hidden = isNative;
    if (!isNative) {
      $('proWebToggleBtn').textContent = unlocked ? 'Switch back to Free tier (Preview)' : '✨ Enable Pro Preview (Web Demo)';
    }

    openModal('proModal');
  }

  function createProjectFromModal() {
    if (!isPro() && store.projects.length >= 1) {
      closeModal('projectModal');
      openProModal('Free includes 1 app project. Unlock Pro Launch Kit for unlimited apps & JSON backups.');
      return;
    }
    const inp = $('newProjectName');
    const name = inp.value.trim();
    if (!name) { inp.focus(); return; }
    const created = newProject(name);
    store.projects.push(created);
    store.activeProjectId = created.id;
    saveState();
    closeModal('projectModal');
    navigateToHome();
    toast(`Created "${name}"`);
  }

  // ─── Global Search ─────────────────────────────────────────────────
  function runSearch(query) {
    ui.searchQuery = query;
    const q = query.trim().toLowerCase();
    const box = $('searchResults');
    const clearBtn = $('searchClear');
    clearBtn.hidden = !q;

    if (!q) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }

    const p = proj();
    const matches = [];
    for (const section of WIZARD_DATA.sections) {
      for (const step of section.steps) {
        const stepKey = `${section.id}.${step.id}`;
        const noteText = p.notes[stepKey] || '';
        const hay = [
          section.title,
          step.title,
          step.description,
          ...step.checklist,
          ...(step.tips || []),
          noteText
        ].join(' ').toLowerCase();

        if (hay.includes(q)) {
          let hit = step.description;
          const clHit = step.checklist.find(c => c.toLowerCase().includes(q));
          if (clHit) hit = clHit;
          else if (noteText.toLowerCase().includes(q)) hit = '📝 ' + noteText;
          matches.push({ section, step, hit });
        }
      }
    }

    box.hidden = false;
    if (!matches.length) {
      box.innerHTML = `<div class="search-empty">No steps match "${escapeHtml(query)}"</div>`;
      return;
    }

    box.innerHTML = matches.slice(0, 10).map(m => `
      <button type="button" class="search-result-item" data-sec="${m.section.id}" data-step="${m.step.id}">
        <div class="search-result-title">${ICONS[m.section.icon]} ${escapeHtml(m.step.title)}</div>
        <div class="search-result-meta">${escapeHtml(m.section.title)} · ${escapeHtml(m.hit.slice(0, 72))}${m.hit.length > 72 ? '…' : ''}</div>
      </button>`).join('') +
      (matches.length > 10 ? `<div class="search-more">+${matches.length - 10} more matches</div>` : '');

    box.querySelectorAll('.search-result-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const secId = btn.dataset.sec;
        const stepId = btn.dataset.step;
        const sec = WIZARD_DATA.sections.find(s => s.id === secId);
        const st = sec && sec.steps.find(x => x.id === stepId);
        if (st && !isStepVisible(st)) proj().showAll = true;
        proj().expandedSteps[`${secId}.${stepId}`] = true;
        ui.sectionFilter = 'all';
        saveState();
        $('searchInput').value = '';
        runSearch('');
        navigateToSection(secId, stepId);
      });
    });
  }

  // ─── Sidebar ───────────────────────────────────────────────────────
  function renderSidebar() {
    renderProjectSwitcher();
    const nav = $('sidebarNav');
    nav.innerHTML = '';

    for (const section of WIZARD_DATA.sections) {
      const progress = getSectionProgress(section);
      const isActive = ui.currentSection === section.id;
      const isCompleted = progress.total > 0 && progress.percent === 100;

      const item = document.createElement('div');
      item.className = `nav-item${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}`;
      item.innerHTML = `
        <div class="nav-icon">${isCompleted ? '✓' : ICONS[section.icon]}</div>
        <div class="nav-item-info">
          <div class="nav-item-title">${section.title}</div>
          <div class="nav-item-progress">
            <div class="nav-progress-bar"><div class="nav-progress-fill" style="width:${progress.percent}%"></div></div>
            <span class="nav-progress-text">${progress.percent}%</span>
          </div>
        </div>`;
      item.addEventListener('click', () => navigateToSection(section.id));
      nav.appendChild(item);
    }

    const overall = getOverallProgress();
    $('overallProgressFill').style.width = overall.percent + '%';
    $('overallProgressText').textContent = `${overall.percent}% Complete · ${overall.checked}/${overall.total} items`;
    $('mobileProgress').textContent = overall.percent + '%';
  }

  // ─── Welcome ───────────────────────────────────────────────────────
  function renderWelcome() {
    const active = proj();
    const pc = $('profileCard');
    if (active.profile) {
      const p = active.profile;
      const tags = [
        p.accountType === 'organization' ? 'Organization' : 'Personal account',
        p.pricing === 'paid' ? 'Paid app' : 'Free app',
        p.iap === 'yes' && 'In-app purchases',
        p.ads === 'yes' && 'Ads',
        p.kids === 'yes' && 'Targets kids',
        p.login === 'yes' && 'Requires login',
        p.regulated === 'yes' && 'Regulated features'
      ].filter(Boolean);
      const hidden = hiddenStepCount();
      pc.innerHTML = `
        <div class="profile-card-body">
          <div>
            <h3>✨ Checklist personalized for ${escapeHtml(active.name)}</h3>
            <div class="profile-tags">${tags.map(t => `<span class="profile-tag">${t}</span>`).join('')}</div>
            <p class="profile-meta">${hidden} step${hidden === 1 ? '' : 's'} hidden as not applicable · personalized advice added to the relevant steps</p>
          </div>
          <button class="btn-secondary" data-action="quiz">Edit answers</button>
        </div>`;
    } else {
      pc.innerHTML = `
        <div class="profile-card-body">
          <div>
            <h3>🎯 Personalize for ${escapeHtml(active.name)}</h3>
            <p class="profile-meta">Answer 7 quick questions, and we'll hide steps that don't apply and add advice specific to your app.</p>
          </div>
          <button class="btn-primary" data-action="quiz">Take the quiz</button>
        </div>`;
    }
    pc.querySelector('[data-action="quiz"]').addEventListener('click', openQuiz);

    // Quick launch shortcuts for built-in interactive tools
    const tb = $('toolsBanner');
    if (tb) {
      const proTag = isPro() ? '' : ' <span class="mini-pro">PRO</span>';
      tb.innerHTML = `
        <div class="tools-banner-title">🧰 Built-in Launch Workbench Tools</div>
        <div class="tools-shortcuts">
          <button type="button" class="tool-shortcut" data-jump="store-listing.app-details">✍️ Store Listing Drafter</button>
          <button type="button" class="tool-shortcut" data-jump="store-listing.app-icon">🖼️ Asset Validator</button>
          <button type="button" class="tool-shortcut" data-jump="app-content.data-safety">🧩 SDK → Data Safety</button>
          <button type="button" class="tool-shortcut" data-jump="testing.closed-testing">⏱️ 14-Day Test Tracker</button>
          <button type="button" class="tool-shortcut pro-shortcut" data-jump="store-listing.screenshots">📸 Screenshot Studio${proTag}</button>
          <button type="button" class="tool-shortcut pro-shortcut" data-jump="store-listing.feature-graphic">🎨 Feature Graphic${proTag}</button>
          <button type="button" class="tool-shortcut pro-shortcut" data-jump="app-content.privacy-policy">📜 Privacy Policy Gen${proTag}</button>
        </div>`;
      tb.querySelectorAll('[data-jump]').forEach(btn => {
        btn.addEventListener('click', () => {
          const [secId, stepId] = btn.dataset.jump.split('.');
          proj().expandedSteps[`${secId}.${stepId}`] = true;
          saveState();
          navigateToSection(secId, stepId);
        });
      });
    }

    const container = $('welcomeSections');
    container.innerHTML = '';
    for (const section of WIZARD_DATA.sections) {
      const progress = getSectionProgress(section);
      const card = document.createElement('div');
      card.className = 'welcome-section-card';
      card.innerHTML = `
        <div class="welcome-section-icon">${ICONS[section.icon]}</div>
        <div class="welcome-section-info">
          <h4>${section.title}</h4>
          <p>${visibleSteps(section).length} steps · ${progress.percent}% done</p>
        </div>`;
      card.addEventListener('click', () => navigateToSection(section.id));
      container.appendChild(card);
    }
  }

  // ─── Section ───────────────────────────────────────────────────────
  function filterSteps(section, steps) {
    const p = proj();
    switch (ui.sectionFilter) {
      case 'remaining': return steps.filter(st => getStepProgress(section, st).percent < 100);
      case 'required': return steps.filter(st => isStepApplicable(st) && isStepRequired(st));
      case 'notes': return steps.filter(st => (p.notes[`${section.id}.${st.id}`] || '').trim().length > 0);
      default: return steps;
    }
  }

  function renderSection(sectionId, focusStepId) {
    const section = WIZARD_DATA.sections.find(s => s.id === sectionId);
    if (!section) return;
    const active = proj();
    const sp = getSectionProgress(section);
    const hiddenHere = section.steps.filter(st => !isStepApplicable(st)).length;
    const allVisible = visibleSteps(section);
    const filtered = filterSteps(section, allVisible);

    const header = $('sectionHeader');
    header.innerHTML = `
      <div class="section-breadcrumb">
        <a href="#" id="backToHome">Home</a><span>›</span><span>${escapeHtml(active.name)}</span><span>›</span><span>${section.title}</span>
      </div>
      <div class="section-title-row">
        <div class="section-icon">${ICONS[section.icon]}</div>
        <h2 class="section-title">${section.title}</h2>
      </div>
      <p class="section-description">${section.description}</p>
      <div class="section-progress-summary">
        <div class="section-progress-bar"><div class="section-progress-fill" style="width:${sp.percent}%"></div></div>
        <span class="section-progress-text">${sp.checked}/${sp.total} items</span>
      </div>
      <div class="filter-bar" role="group" aria-label="Filter steps">
        ${[
          ['all', `All (${allVisible.length})`],
          ['remaining', 'Remaining'],
          ['required', 'Required only'],
          ['notes', 'Has notes']
        ].map(([val, label]) => `<button type="button" class="filter-pill ${ui.sectionFilter === val ? 'active' : ''}" data-filter="${val}">${label}</button>`).join('')}
      </div>
      ${hiddenHere > 0 ? `
        <div class="hidden-steps-note">
          ${active.showAll
            ? `Showing ${hiddenHere} step${hiddenHere > 1 ? 's' : ''} that don't apply to your app.`
            : `${hiddenHere} step${hiddenHere > 1 ? 's' : ''} hidden because they don't apply to your app.`}
          <button class="link-btn" id="toggleShowAll">${active.showAll ? 'Hide them' : 'Show anyway'}</button>
        </div>` : ''}`;

    $('backToHome').addEventListener('click', e => { e.preventDefault(); navigateToHome(); });
    header.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        ui.sectionFilter = btn.dataset.filter;
        renderSection(sectionId);
      });
    });

    const tsa = $('toggleShowAll');
    if (tsa) tsa.addEventListener('click', () => {
      active.showAll = !active.showAll;
      saveState();
      renderSection(sectionId);
      renderSidebar();
    });

    const container = $('stepsContainer');
    container.innerHTML = '';
    if (!filtered.length) {
      container.innerHTML = `
        <div class="filter-empty">
          <p>No steps match this filter in <strong>${section.title}</strong>.</p>
          <button type="button" class="btn-secondary" id="clearFilterBtn">Show all steps</button>
        </div>`;
      $('clearFilterBtn').addEventListener('click', () => { ui.sectionFilter = 'all'; renderSection(sectionId); });
    } else {
      for (const step of filtered) {
        container.appendChild(renderStepCard(section, step, header));
      }
    }

    renderSectionNavButtons(section);

    if (focusStepId) {
      const targetEl = container.querySelector(`[data-step-id="${focusStepId}"]`);
      if (targetEl) setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  function makeToolContext() {
    return {
      getAppName: () => proj().name,
      getProfile: () => proj().profile,
      isPro,
      openProModal,
      saveFile: saveOrShareFile,
      getToolData: key => {
        const t = proj().tools;
        return t[key] ? Object.assign({}, t[key]) : {};
      },
      setToolData: (key, val) => {
        proj().tools[key] = val;
        saveState();
      },
      appendNote: (stepKey, text) => {
        const p = proj();
        const prev = (p.notes[stepKey] || '').trim();
        p.notes[stepKey] = prev ? `${prev}\n\n${text}` : text;
        saveState();
        const ta = document.getElementById(`note-${stepKey.replace(/\./g, '-')}`);
        if (ta) {
          ta.value = p.notes[stepKey];
          const card = ta.closest('.step-card');
          if (card) {
            const ind = card.querySelector('.note-indicator');
            if (ind) ind.hidden = false;
          }
        }
      },
      toast
    };
  }

  function renderStepCard(section, step, header) {
    const active = proj();
    const stepKey = `${section.id}.${step.id}`;
    const prog = getStepProgress(section, step);
    const isExpanded = active.expandedSteps[stepKey];
    const isCompleted = prog.percent === 100;
    const isPartial = prog.checked > 0 && !isCompleted;
    const required = isStepRequired(step);
    const applicable = isStepApplicable(step);
    const note = getStepNote(step);
    const userNote = active.notes[stepKey] || '';

    const card = document.createElement('div');
    card.className = `step-card${isExpanded ? ' expanded' : ''}${isCompleted ? ' completed' : ''}${isPartial ? ' partial' : ''}${applicable ? '' : ' not-applicable'}`;
    card.dataset.stepId = step.id;

    card.innerHTML = `
      <div class="step-header">
        <div class="step-status">${isCompleted ? '✓' : (isPartial ? '…' : '')}</div>
        <div class="step-header-info">
          <div class="step-title">${step.title}</div>
          <div class="step-subtitle">${prog.checked}/${prog.total} completed<span class="note-indicator" ${userNote.trim() ? '' : 'hidden'}> · 📝 has notes</span></div>
        </div>
        ${applicable
          ? `<span class="step-required ${required ? 'required' : 'optional'}">${required ? 'Required' : 'Optional'}</span>`
          : `<span class="step-required optional">Not applicable</span>`}
        <div class="step-expand">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
        </div>
      </div>
      <div class="step-body">
        <div class="step-body-inner">
          <p class="step-description">${step.description}</p>
          ${note ? `<div class="personal-note"><div class="personal-note-title">🎯 For your app</div>${note}</div>` : ''}
          <ul class="checklist">
            ${step.checklist.map((item, i) => {
              const key = `${stepKey}.${i}`;
              const checked = active.checkedItems[key];
              const id = `cb-${key.replace(/\./g, '-')}`;
              return `
                <li class="checklist-item${checked ? ' checked' : ''}">
                  <span class="checklist-checkbox">
                    <input type="checkbox" id="${id}" data-key="${key}" ${checked ? 'checked' : ''}>
                    <span class="checkmark"></span>
                  </span>
                  <label class="checklist-label" for="${id}">${item}</label>
                </li>`;
            }).join('')}
          </ul>
          <div class="step-tool-slot"></div>
          ${step.tips && step.tips.length ? `
            <div class="tips-section">
              <div class="tips-title">💡 Pro Tips</div>
              ${step.tips.map(t => `<div class="tip-item">${t}</div>`).join('')}
            </div>` : ''}
          ${step.links && step.links.length ? `
            <div class="links-section">
              ${step.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="link-chip">${l.text}</a>`).join('')}
            </div>` : ''}
          <div class="notes-section">
            <div class="notes-header">
              <label class="notes-title" for="note-${stepKey.replace(/\./g, '-')}">📝 My Notes</label>
              <span class="notes-saved">Saved ✓</span>
            </div>
            <textarea class="notes-input" id="note-${stepKey.replace(/\./g, '-')}" rows="3"
              placeholder="Test account details, where you stored keys, URLs, decisions, to-dos…">${escapeHtml(userNote)}</textarea>
          </div>
        </div>
      </div>`;

    // Mount interactive tool(s) if this step has any (free + Pro)
    const toolSlot = card.querySelector('.step-tool-slot');
    const toolCtx = makeToolContext();
    if (window.WIZARD_TOOLS) {
      const toolEl = window.WIZARD_TOOLS.renderStepTool(section.id, step.id, toolCtx);
      if (toolEl) toolSlot.appendChild(toolEl);
    }
    if (window.WIZARD_PRO) {
      const proEl = window.WIZARD_PRO.renderProStepTool(section.id, step.id, toolCtx);
      if (proEl) toolSlot.appendChild(proEl);
    }

    // Expand / collapse
    card.querySelector('.step-header').addEventListener('click', () => {
      active.expandedSteps[stepKey] = !active.expandedSteps[stepKey];
      card.classList.toggle('expanded');
      saveState();
    });

    // Checkboxes
    card.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', e => {
        active.checkedItems[e.target.dataset.key] = e.target.checked;
        e.target.closest('.checklist-item').classList.toggle('checked', e.target.checked);

        const p = getStepProgress(section, step);
        card.querySelector('.step-subtitle').firstChild.textContent = `${p.checked}/${p.total} completed`;
        card.classList.toggle('completed', p.percent === 100);
        card.classList.toggle('partial', p.checked > 0 && p.percent < 100);
        card.querySelector('.step-status').textContent = p.percent === 100 ? '✓' : (p.checked > 0 ? '…' : '');

        const s = getSectionProgress(section);
        header.querySelector('.section-progress-fill').style.width = s.percent + '%';
        header.querySelector('.section-progress-text').textContent = `${s.checked}/${s.total} items`;

        renderSidebar();
        saveState();
        if (p.percent === 100 && getOverallProgress().percent === 100) celebrate();
      });
    });

    // Notes
    const ta = card.querySelector('.notes-input');
    const savedEl = card.querySelector('.notes-saved');
    const indicator = card.querySelector('.note-indicator');
    let t;
    ta.addEventListener('input', () => {
      active.notes[stepKey] = ta.value;
      indicator.hidden = !ta.value.trim();
      clearTimeout(t);
      t = setTimeout(() => {
        if (!ta.value.trim()) delete active.notes[stepKey];
        saveState();
        savedEl.classList.add('show');
        setTimeout(() => savedEl.classList.remove('show'), 1200);
      }, 400);
    });

    return card;
  }

  function renderSectionNavButtons(current) {
    const nav = $('sectionNavButtons');
    const sections = WIZARD_DATA.sections;
    const idx = sections.findIndex(s => s.id === current.id);
    const prev = sections[idx - 1];
    const next = sections[idx + 1];

    nav.innerHTML = `
      <button class="btn-nav" ${prev ? '' : 'disabled'} id="prevSectionBtn">← ${prev ? prev.title : 'Previous'}</button>
      <button class="btn-nav primary" id="nextSectionBtn">${next ? next.title + ' →' : '🏁 Back to Overview'}</button>`;

    if (prev) $('prevSectionBtn').addEventListener('click', () => navigateToSection(prev.id));
    $('nextSectionBtn').addEventListener('click', () => next ? navigateToSection(next.id) : navigateToHome());
  }

  // ─── Navigation ────────────────────────────────────────────────────
  function navigateToSection(sectionId, focusStepId) {
    ui.currentSection = sectionId;
    $('welcomeScreen').style.display = 'none';
    $('sectionView').style.display = 'block';
    renderSection(sectionId, focusStepId);
    renderSidebar();
    if (!focusStepId) window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobileSidebar();
  }

  function navigateToHome() {
    ui.currentSection = null;
    $('welcomeScreen').style.display = 'block';
    $('sectionView').style.display = 'none';
    renderWelcome();
    renderSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobileSidebar();
  }

  function rerender() {
    if (ui.currentSection) renderSection(ui.currentSection); else renderWelcome();
    renderSidebar();
  }

  // ─── Quiz Modal ────────────────────────────────────────────────────
  function openQuiz() {
    const body = $('quizBody');
    const current = proj().profile || {};
    body.innerHTML = QUIZ.map(item => `
      <fieldset class="quiz-question">
        <legend>${item.q}</legend>
        <div class="segmented">
          ${item.options.map(([val, label]) => `
            <label class="segment">
              <input type="radio" name="${item.id}" value="${val}" ${current[item.id] === val ? 'checked' : ''}>
              <span>${label}</span>
            </label>`).join('')}
        </div>
      </fieldset>`).join('');
    $('quizError').textContent = '';
    $('quizClear').style.display = proj().profile ? '' : 'none';
    openModal('quizModal');
  }

  function saveQuiz() {
    const profile = {};
    for (const item of QUIZ) {
      const sel = document.querySelector(`#quizBody input[name="${item.id}"]:checked`);
      if (!sel) {
        $('quizError').textContent = 'Please answer every question.';
        return;
      }
      profile[item.id] = sel.value;
    }
    proj().profile = profile;
    proj().showAll = false;
    saveState();
    closeModal('quizModal');
    rerender();
    toast('Checklist personalized ✨');
  }

  function clearQuiz() {
    proj().profile = null;
    proj().showAll = false;
    saveState();
    closeModal('quizModal');
    rerender();
    toast('Personalization cleared: showing all steps');
  }

  // ─── Modals & Toast ────────────────────────────────────────────────
  function openModal(id) { $(id).classList.add('active'); }
  function closeModal(id) { $(id).classList.remove('active'); }
  function closeAllModals() { document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')); }

  let toastTimer;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function celebrate() {
    toast('🎉 Every item is complete. Congratulations on your launch!');
  }

  // ─── File Export Helper (Native Android Share + Browser Download) ──
  async function saveOrShareFile(filename, content, mimeType, title) {
    // When running inside Capacitor native Android app, use Filesystem + Share sheet
    const cap = window.Capacitor;
    if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
      const Filesystem = cap.Plugins && cap.Plugins.Filesystem;
      const Share = cap.Plugins && cap.Plugins.Share;
      if (Filesystem && Share) {
        try {
          const written = await Filesystem.writeFile({
            path: filename,
            data: content,
            directory: 'CACHE',
            encoding: 'utf8'
          });
          await Share.share({
            title: title || filename,
            text: title || filename,
            url: written.uri,
            dialogTitle: 'Share or save file'
          });
          toast('Opened share sheet');
          return;
        } catch (err) {
          console.warn('Native share failed, falling back:', err);
        }
      }
    }

    // Standard browser download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Downloaded ${filename}`);
  }

  // ─── Export: Markdown ──────────────────────────────────────────────
  function stripHtml(s) { return String(s).replace(/<[^>]+>/g, ''); }

  function slugify(name) {
    return (name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'app';
  }

  function buildMarkdown() {
    const active = proj();
    const overall = getOverallProgress();
    const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    let md = `# Google Play Publishing Checklist — ${active.name}\n\n`;
    md += `_Exported ${date}: **${overall.percent}% complete** (${overall.checked}/${overall.total} items)_\n\n`;

    if (active.profile) {
      md += `## App Profile\n\n`;
      for (const item of QUIZ) {
        const opt = item.options.find(o => o[0] === active.profile[item.id]);
        md += `- **${item.q}** ${opt ? opt[1] : '-'}\n`;
      }
      md += `\n`;
    }

    const draft = active.tools && active.tools.draft;
    if (draft && (draft.appName || draft.shortDesc || draft.fullDesc || draft.releaseNotes)) {
      md += `## Store Listing Draft\n\n`;
      if (draft.appName) md += `- **App Name:** ${draft.appName}\n`;
      if (draft.shortDesc) md += `- **Short Description:** ${draft.shortDesc}\n`;
      if (draft.fullDesc) md += `\n**Full Description:**\n\n${draft.fullDesc}\n`;
      if (draft.releaseNotes) md += `\n**Release Notes:**\n\n${draft.releaseNotes}\n`;
      md += `\n`;
    }

    const ct = active.tools && active.tools.closedTest;
    if (ct && (ct.startDate || (ct.testers && ct.testers.length))) {
      const opted = (ct.testers || []).filter(t => t.optedIn).length;
      md += `## 14-Day Closed Test Tracker\n\n`;
      if (ct.startDate) md += `- **Start Date:** ${ct.startDate}\n`;
      md += `- **Opted-in Testers:** ${opted} / ${(ct.testers || []).length} (12 required)\n\n`;
    }

    for (const section of WIZARD_DATA.sections) {
      const sp = getSectionProgress(section);
      md += `## ${ICONS[section.icon]} ${section.title} (${sp.percent}%)\n\n`;
      for (const step of visibleSteps(section)) {
        const p = getStepProgress(section, step);
        const tag = isStepApplicable(step) ? (isStepRequired(step) ? 'Required' : 'Optional') : 'Not applicable';
        md += `### ${p.percent === 100 ? '✅ ' : ''}${step.title}\n\n_${tag} · ${p.checked}/${p.total} done_\n\n`;
        const note = getStepNote(step);
        if (note) md += `> 🎯 **For your app:** ${stripHtml(note)}\n\n`;
        step.checklist.forEach((item, i) => {
          md += `- [${active.checkedItems[`${section.id}.${step.id}.${i}`] ? 'x' : ' '}] ${stripHtml(item)}\n`;
        });
        const userNote = (active.notes[`${section.id}.${step.id}`] || '').trim();
        if (userNote) md += `\n**My notes:**\n\n${userNote.split('\n').map(l => '> ' + l).join('\n')}\n`;
        md += `\n`;
      }
    }
    return md;
  }

  function exportMarkdown() {
    if (!isPro()) { openProModal('Markdown & PDF exports are part of Pro Launch Kit.'); return; }
    const fname = `google-play-${slugify(proj().name)}-${new Date().toISOString().slice(0, 10)}.md`;
    saveOrShareFile(fname, buildMarkdown(), 'text/markdown;charset=utf-8', `${proj().name} — Google Play Checklist`);
  }

  // ─── Backup & Restore (JSON) ───────────────────────────────────────
  function exportJson() {
    if (!isPro()) { closeModal('projectModal'); openProModal('JSON Backup & Restore is part of Pro Launch Kit.'); return; }
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), app: 'google-play-app-wizard', data: store }, null, 2);
    const fname = `play-wizard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    saveOrShareFile(fname, payload, 'application/json;charset=utf-8', 'Play Wizard Backup');
  }

  function importJsonFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const data = parsed.data || parsed;
        if (!data || !Array.isArray(data.projects) || !data.projects.length) {
          toast('Invalid backup file');
          return;
        }
        store = {
          version: 2,
          theme: data.theme || store.theme,
          activeProjectId: data.activeProjectId || data.projects[0].id,
          projects: data.projects.map(p => ({
            id: p.id || newProject().id,
            name: p.name || 'Imported App',
            checkedItems: p.checkedItems || {},
            expandedSteps: p.expandedSteps || {},
            notes: p.notes || {},
            profile: p.profile || null,
            showAll: !!p.showAll,
            tools: p.tools || {}
          }))
        };
        saveState();
        applyTheme();
        closeModal('projectModal');
        navigateToHome();
        toast(`Imported ${store.projects.length} app project${store.projects.length === 1 ? '' : 's'}`);
      } catch (e) {
        toast('Could not read JSON backup');
      }
    };
    reader.readAsText(file);
  }

  // ─── Export: PDF (print report) ────────────────────────────────────
  function buildPrintReport() {
    const active = proj();
    const overall = getOverallProgress();
    const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    let html = `<h1>Google Play Publishing Checklist — ${escapeHtml(active.name)}</h1>
      <p class="pr-meta">Exported ${date} · <strong>${overall.percent}% complete</strong> (${overall.checked}/${overall.total} items)</p>`;

    if (active.profile) {
      html += `<div class="pr-profile"><strong>App profile:</strong> ` + QUIZ.map(item => {
        const opt = item.options.find(o => o[0] === active.profile[item.id]);
        return `${item.id === 'accountType' || item.id === 'pricing' ? '' : item.q.replace(/\?$/, '') + ': '}${opt ? opt[1] : '-'}`;
      }).join(' · ') + `</div>`;
    }

    for (const section of WIZARD_DATA.sections) {
      const sp = getSectionProgress(section);
      html += `<h2>${ICONS[section.icon]} ${section.title} <span class="pr-pct">${sp.percent}%</span></h2>`;
      for (const step of visibleSteps(section)) {
        const p = getStepProgress(section, step);
        const tag = isStepApplicable(step) ? (isStepRequired(step) ? 'Required' : 'Optional') : 'N/A';
        html += `<div class="pr-step"><h3>${step.title} <span class="pr-tag">${tag} · ${p.checked}/${p.total}</span></h3>`;
        const note = getStepNote(step);
        if (note) html += `<div class="pr-note">🎯 ${note}</div>`;
        html += `<ul>` + step.checklist.map((item, i) => {
          const c = active.checkedItems[`${section.id}.${step.id}.${i}`];
          return `<li class="${c ? 'done' : ''}"><span class="pr-box">${c ? '☑' : '☐'}</span> ${item}</li>`;
        }).join('') + `</ul>`;
        const userNote = (active.notes[`${section.id}.${step.id}`] || '').trim();
        if (userNote) html += `<div class="pr-user-note"><strong>My notes:</strong><br>${escapeHtml(userNote).replace(/\n/g, '<br>')}</div>`;
        html += `</div>`;
      }
    }
    return html;
  }

  function exportPdf() {
    if (!isPro()) { openProModal('Markdown & PDF exports are part of Pro Launch Kit.'); return; }
    $('printReport').innerHTML = buildPrintReport();
    document.body.classList.add('printing-report');
    const cleanup = () => {
      document.body.classList.remove('printing-report');
      $('printReport').innerHTML = '';
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => window.print(), 50);
  }

  // ─── Theme ─────────────────────────────────────────────────────────
  function currentTheme() {
    if (store.theme) return store.theme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme() {
    const theme = currentTheme();
    document.documentElement.setAttribute('data-theme', theme);
    $('themeToggle').innerHTML = theme === 'dark' ? '☀️ <span>Light mode</span>' : '🌙 <span>Dark mode</span>';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f1011' : '#202124');
  }

  function toggleTheme() {
    store.theme = currentTheme() === 'dark' ? 'light' : 'dark';
    saveState();
    applyTheme();
  }

  // ─── Mobile Sidebar ────────────────────────────────────────────────
  function openMobileSidebar() {
    $('sidebar').classList.add('open');
    $('sidebarOverlay').style.display = 'block';
    requestAnimationFrame(() => $('sidebarOverlay').classList.add('active'));
  }

  function closeMobileSidebar() {
    $('sidebar').classList.remove('open');
    const o = $('sidebarOverlay');
    o.classList.remove('active');
    setTimeout(() => { if (!o.classList.contains('active')) o.style.display = 'none'; }, 250);
  }

  // ─── Reset (active project only) ───────────────────────────────────
  function resetCurrentProject() {
    const p = proj();
    p.checkedItems = {};
    p.expandedSteps = {};
    p.notes = {};
    p.profile = null;
    p.showAll = false;
    p.tools = {};
    saveState();
    closeModal('resetModal');
    navigateToHome();
    toast(`Reset "${p.name}"`);
  }

  // ─── Init ──────────────────────────────────────────────────────────
  function init() {
    loadState();
    applyTheme();
    renderSidebar();
    renderWelcome();

    $('menuToggle').addEventListener('click', () =>
      $('sidebar').classList.contains('open') ? closeMobileSidebar() : openMobileSidebar());
    $('sidebarOverlay').addEventListener('click', closeMobileSidebar);
    $('startBtn').addEventListener('click', () => navigateToSection(WIZARD_DATA.sections[0].id));

    // Project switcher
    $('projectSelect').addEventListener('change', e => {
      store.activeProjectId = e.target.value;
      saveState();
      rerender();
      toast(`Switched to "${proj().name}"`);
    });
    $('manageProjectsBtn').addEventListener('click', () => { closeMobileSidebar(); openProjectModal(); });
    $('createProjectBtn').addEventListener('click', createProjectFromModal);
    $('newProjectName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); createProjectFromModal(); } });
    $('projectModalClose').addEventListener('click', () => closeModal('projectModal'));

    // Backup / Restore JSON
    $('exportJsonBtn').addEventListener('click', exportJson);
    $('importJsonBtn').addEventListener('click', () => {
      if (!isPro()) { closeModal('projectModal'); openProModal('JSON Backup & Restore is part of Pro Launch Kit.'); return; }
      $('importJsonInput').click();
    });
    $('importJsonInput').addEventListener('change', e => {
      importJsonFile(e.target.files && e.target.files[0]);
      e.target.value = '';
    });

    // Pro Launch Kit & Play Billing
    $('proBtn').addEventListener('click', () => { closeMobileSidebar(); openProModal(); });
    $('proModalClose').addEventListener('click', () => closeModal('proModal'));
    $('proPurchaseBtn').addEventListener('click', async () => {
      const btn = $('proPurchaseBtn');
      btn.disabled = true;
      const res = await window.PLAY_BILLING.purchase();
      btn.disabled = false;
      if (res.ok) {
        closeModal('proModal');
        updateProUi();
        rerender();
        toast('🎉 Pro Launch Kit unlocked! Thank you!');
      } else if (res.message) {
        toast(res.message);
      }
    });
    $('proRestoreBtn').addEventListener('click', async () => {
      const res = await window.PLAY_BILLING.restore();
      updateProUi();
      rerender();
      if (res.ok) closeModal('proModal');
      if (res.message) toast(res.message);
    });
    $('proWebToggleBtn').addEventListener('click', () => {
      const next = !isPro();
      window.PLAY_BILLING.setWebPreview(next);
      closeModal('proModal');
      updateProUi();
      rerender();
      toast(next ? '✨ Pro Launch Kit preview enabled' : 'Switched back to Free tier');
    });

    if (window.PLAY_BILLING) {
      window.PLAY_BILLING.onChange(() => { updateProUi(); rerender(); });
      window.PLAY_BILLING.init();
    }
    updateProUi();

    // Global Search
    $('searchInput').addEventListener('input', e => runSearch(e.target.value));
    $('searchClear').addEventListener('click', () => { $('searchInput').value = ''; runSearch(''); $('searchInput').focus(); });

    // Sidebar tools
    $('themeToggle').addEventListener('click', toggleTheme);
    $('quizBtn').addEventListener('click', () => { closeMobileSidebar(); openQuiz(); });
    $('exportMdBtn').addEventListener('click', exportMarkdown);
    $('exportPdfBtn').addEventListener('click', () => { closeMobileSidebar(); exportPdf(); });

    // Reset
    $('resetBtn').addEventListener('click', () => {
      $('resetTargetName').textContent = proj().name;
      openModal('resetModal');
    });
    $('resetCancel').addEventListener('click', () => closeModal('resetModal'));
    $('resetConfirm').addEventListener('click', resetCurrentProject);

    // Quiz
    $('quizSave').addEventListener('click', saveQuiz);
    $('quizCancel').addEventListener('click', () => closeModal('quizModal'));
    $('quizClear').addEventListener('click', clearQuiz);

    // Modals & keys
    document.querySelectorAll('.modal-overlay').forEach(m =>
      m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeAllModals(); closeMobileSidebar(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openMobileSidebar();
        $('searchInput').focus();
      }
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!store.theme) applyTheme(); });
    }

    // PWA: register service worker when served over http(s)
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW registration failed:', err));
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
