# Google Play Console Copy & Submission Sheet

Ready-to-paste fields for **Play Publish: App Wizard** (`io.github.socketrocketdocket.playwizard`).

---

## 1. Create App (Play Console → Create app)
- **App name:** `Play Publish: App Wizard` *(24 / 30 chars)*
- **Default language:** English (United States)
- **App or game:** App
- **Free or paid:** **Free** *(you can add in-app purchases or ads in a future update)*

---

## 2. Main Store Listing
- **App name (max 30):**
  ```
  Play Publish: App Wizard
  ```
- **Short description (max 80 — 78 chars):**
  ```
  Step-by-step checklist, asset validator & 14-day test tracker for Google Play.
  ```
- **Full description (max 4,000):**
  ```
  Publishing an Android app to Google Play involves dozens of requirements across store assets, privacy policies, Data Safety declarations, age ratings, app signing, and closed testing. Play Publish: App Wizard walks you through the entire journey from developer account setup to post-launch — all in one offline-ready workbench.

  GUIDED 9-STAGE CHECKLIST
  • Getting Started & Identity Verification
  • Creating Your App & Reviewer Access
  • Store Listing, Graphics & Categories
  • App Content, Privacy Policy, Data Safety, Ads & Age Ratings
  • Pricing, Countries & Device Compatibility
  • Play App Signing, AAB Builds & Uploads
  • Internal, Closed & Open Testing Tracks
  • Production Rollout & App Review
  • Post-Launch Vitals, Reviews & Growth

  PERSONALIZED TO YOUR APP
  Answer 7 quick questions (personal vs. organization account, free vs. paid, in-app purchases, ads, target age, login, regulated features) to hide irrelevant steps and get tailored tips right where you need them.

  BUILT-IN LAUNCH WORKBENCH TOOLS
  • Store Listing & Release Notes Drafter — live character counters (30 / 80 / 4,000 / 500) and a Play Store card preview
  • Offline Asset Validator — check your 512×512 app icon, 1024×500 feature graphic, and screenshots for dimensions, file size, aspect ratio, and transparency without uploading anything
  • SDK → Data Safety Cheat Sheet — select common SDKs (Firebase, AdMob, Play Billing, Stripe, etc.) to preview likely Data Safety declarations
  • 14-Day Closed Test Tracker — track your 12+ opted-in testers and countdown to production eligibility for personal developer accounts

  PRO LAUNCH KIT (OPTIONAL ONE-TIME UNLOCK)
  • Play Store Screenshot Studio — frame raw captures with headlines, themes & Android bezel and export exact 1080×1920 PNGs
  • Feature Graphic Generator — design opaque 1024×500 Play Store banners with safe-zone guides
  • Privacy Policy & Account-Deletion HTML Generator — auto-built from your quiz answers & SDKs, ready for GitHub Pages
  • Unlimited App Projects, JSON Backup/Restore, and Markdown/PDF report exports

  PRIVACY-FIRST & OFFLINE-READY
  • Works completely offline with Light & Dark mode — all notes & drafts stay on your device
  ```
- **Graphics (in `play-store/`):**
  - App icon (`512×512` PNG): `play-store/app-icon-512x512.png`
  - Feature graphic (`1024×500` 24-bit PNG): `play-store/feature-graphic-1024x500.png`
  - Phone screenshots (`2–8` required): `play-store/screenshots/`
- **Store settings:**
  - Category: **Productivity** (or **Tools**)
  - Tags: Developer tools, Productivity, Checklist
  - Website: `https://socketrocketdocket.github.io/google-play-app-wizard/`
  - Contact email: *(enter your support email)*

---

## 3. App Content & Compliance (v1.0 with Pro Launch Kit IAP)
- **Privacy Policy URL:**
  `https://socketrocketdocket.github.io/google-play-app-wizard/privacy.html`
- **App Access:** All free functionality is available without login; Pro Launch Kit uses standard Google Play Billing.
- **Ads:** **No, my app does not contain ads**.
- **Content Rating (IARC):** Utility / Productivity → answer "No" to violence, sexual content, language, controlled substances, gambling, UGC → answer **Yes** to **Digital purchases** (one-time Pro Launch Kit unlock) → yields **Everyone / PEGI 3**.
- **Target Audience:** **13–15, 16–17, 18 and over** *(do NOT select under-13)*.
- **News / Government / Financial / Health apps:** Not applicable (No).
- **Data Safety:**
  - Does your app collect or share any of the required user data types? **Yes** → under **Financial info**, select **Purchase history** (Collected · App functionality · Optional, handled via Google Play Billing; data encrypted in transit). No other user data is collected or shared.
- **Advertising ID (`AD_ID`):** No.

---

## 3b. In-App Product Setup (Play Console → Monetize → Products → One-time products)
Create **1 one-time product** BEFORE submitting or testing purchases:
- **Product ID (exact!):** `pro_launch_kit`
- **Name:** `Pro Launch Kit`
- **Description:** `One-time unlock: Play Store Screenshot Studio, 1024×500 Feature Graphic Generator, Privacy Policy HTML Generator, unlimited app projects, JSON backup & Markdown/PDF export.`
- **Default price:** `$4.99` (or your preferred price)
- Click **Activate**!
- *(Tip: Add your Google email + tester emails under Play Console → Settings → License testing so you can test the purchase flow for free without real charges.)*

---

## 4. Release Notes (v1.0.0 — Closed Testing)
```
Initial release of Play Publish: App Wizard!
• 9 guided publishing stages with ~200 checklist items
• Personalization quiz tailored to your account & app
• Store Listing Drafter, Offline Asset Validator, SDK Data Safety Cheat Sheet & 14-Day Closed Test Tracker
• Multi-app support, search, filters, Dark mode & Markdown/JSON export
```

---

## 5. Personal Account Closed Test Gate (12 Testers × 14 Days)
1. Upload `android/app/build/outputs/bundle/release/app-release.aab` to **Testing → Closed testing** (NOT Production yet — Play Console unlocks Production after closed testing).
2. Create a tester list (email list or Google Group) with **15+ testers** (12 required + buffer in case anyone opts out).
3. Submit the closed test release for review (usually hours to a few days).
4. Once approved, send testers the Play Store opt-in link and have at least **12 testers opt in and stay opted in for 14 consecutive days**.
5. After day 14, click **Apply for production access** on the Play Console Dashboard.
