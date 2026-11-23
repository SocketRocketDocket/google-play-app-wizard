// Google Play App Wizard — Pro Launch Kit Billing Bridge
// Uses native Google Play Billing v7 plugin (PlayBilling) on Android,
// and an optional web preview toggle when running in a desktop/mobile browser.

(function (global) {
  'use strict';

  const PRODUCT_ID = 'pro_launch_kit';
  const CACHE_KEY = 'gplay-wizard-pro';

  const billingState = {
    unlocked: false,
    price: '$4.99',
    title: 'Pro Launch Kit',
    isNative: false,
    ready: false,
    listeners: []
  };

  function getNativePlugin() {
    const cap = global.Capacitor;
    if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
      return (cap.Plugins && cap.Plugins.PlayBilling) || null;
    }
    return null;
  }

  function notify() {
    billingState.listeners.forEach(fn => { try { fn(billingState); } catch (e) {} });
  }

  function loadCached() {
    try {
      const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      billingState.unlocked = !!saved.unlocked;
    } catch (e) {}
  }

  function saveCached(val) {
    billingState.unlocked = !!val;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ unlocked: billingState.unlocked })); } catch (e) {}
    notify();
  }

  async function init() {
    loadCached();
    const plugin = getNativePlugin();
    billingState.isNative = !!plugin;

    if (plugin) {
      try {
        const info = await plugin.getProduct({ productId: PRODUCT_ID });
        if (info && info.price) billingState.price = info.price;
        if (info && info.title) billingState.title = info.title;
      } catch (e) {
        console.warn('PlayBilling getProduct failed:', e);
      }
      try {
        const restored = await plugin.restore({ productId: PRODUCT_ID });
        saveCached(!!(restored && restored.unlocked));
      } catch (e) {
        console.warn('PlayBilling startup restore failed:', e);
      }
    }

    billingState.ready = true;
    notify();
  }

  async function purchase() {
    const plugin = getNativePlugin();
    if (!plugin) {
      return { ok: false, reason: 'web', message: 'Google Play Billing is available inside the Android app.' };
    }
    try {
      const res = await plugin.purchase({ productId: PRODUCT_ID });
      if (res && res.unlocked) {
        saveCached(true);
        return { ok: true };
      }
      return { ok: false, reason: (res && res.status) || 'cancelled', message: (res && res.message) || 'Purchase not completed.' };
    } catch (e) {
      return { ok: false, reason: 'error', message: (e && e.message) || 'Billing error. Make sure Play Store is available.' };
    }
  }

  async function restore() {
    const plugin = getNativePlugin();
    if (!plugin) {
      return { ok: billingState.unlocked, message: billingState.unlocked ? 'Pro preview is active.' : 'Restore Purchases works inside the Android app.' };
    }
    try {
      const res = await plugin.restore({ productId: PRODUCT_ID });
      const unlocked = !!(res && res.unlocked);
      saveCached(unlocked);
      return { ok: unlocked, message: unlocked ? 'Pro Launch Kit restored!' : 'No previous purchase found on this Google account.' };
    } catch (e) {
      return { ok: false, message: (e && e.message) || 'Could not contact Google Play.' };
    }
  }

  function setWebPreview(enabled) {
    if (billingState.isNative) return;
    saveCached(!!enabled);
  }

  global.PLAY_BILLING = {
    PRODUCT_ID,
    init,
    purchase,
    restore,
    setWebPreview,
    isPro: () => billingState.unlocked,
    isNative: () => billingState.isNative,
    getPrice: () => billingState.price,
    onChange: fn => { billingState.listeners.push(fn); }
  };
})(window);
