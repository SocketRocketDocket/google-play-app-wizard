// Google Play App Wizard — Comprehensive Publishing Data
// All sections, steps, checklists, tips, and links for publishing to Google Play

const WIZARD_DATA = {
  sections: [
    // ─── SECTION 1: GETTING STARTED ───────────────────────────────────
    {
      id: "getting-started",
      title: "Getting Started",
      icon: "rocket",
      description: "Set up your Google Play Developer account and understand the basics before you begin.",
      steps: [
        {
          id: "create-dev-account",
          title: "Create a Google Play Developer Account",
          description: "Register for a Google Play Console developer account. This is your gateway to publishing apps.",
          checklist: [
            "Go to play.google.com/console and sign in with a Google account",
            "Accept the Google Play Developer Distribution Agreement",
            "Pay the one-time $25 registration fee",
            "Complete your developer profile (name, email, website, phone)"
          ],
          tips: [
            "Use a dedicated Google account for your developer profile — don't use your personal account.",
            "The $25 fee is non-refundable, even if your account is later suspended.",
            "Organization accounts require additional verification and may take longer to set up.",
            "You can publish apps under a personal name or a business/organization name."
          ],
          links: [
            { text: "Google Play Console", url: "https://play.google.com/console" },
            { text: "Create a Developer Account", url: "https://support.google.com/googleplay/android-developer/answer/6112435" }
          ],
          required: true
        },
        {
          id: "identity-verification",
          title: "Complete Identity Verification",
          description: "Google requires identity verification before you can publish apps. The process differs for personal and organization accounts.",
          checklist: [
            "Choose account type: Personal or Organization",
            "Provide a valid government-issued ID (personal) or business documents (organization)",
            "Verify your contact information (email and phone number)",
            "Wait for verification approval (can take several days to weeks)",
            "For organizations: Provide D-U-N-S number if required"
          ],
          tips: [
            "Identity verification has become stricter — start this process early as it can take 1–2 weeks.",
            "Organization accounts need a D-U-N-S number, which itself can take 30+ days to obtain if you don't have one.",
            "Make sure your legal name matches your government ID exactly.",
            "You'll need to verify a phone number associated with your name or business."
          ],
          links: [
            { text: "Identity Verification Guide", url: "https://support.google.com/googleplay/android-developer/answer/11021749" },
            { text: "D-U-N-S Number Lookup", url: "https://www.dnb.com/duns-number/lookup.html" }
          ],
          required: true
        },
        {
          id: "payment-profile",
          title: "Set Up a Payments Profile",
          description: "If you plan to sell paid apps or offer in-app purchases, you need a payments profile to receive payouts.",
          checklist: [
            "Go to Play Console → Settings → Payments profile",
            "Provide your legal name and business address",
            "Enter tax information (W-9 for US, W-8BEN for international)",
            "Add a bank account for receiving payouts",
            "Verify your bank account (may require a small test deposit)"
          ],
          tips: [
            "Even if your app is free, set this up early — you may add paid features later.",
            "Google takes a 15% commission on the first $1M in revenue (30% after that).",
            "Payments are typically made monthly, with a minimum threshold.",
            "You can skip this step if your app will be completely free with no in-app purchases."
          ],
          links: [
            { text: "Set Up Payments", url: "https://support.google.com/googleplay/android-developer/answer/3092739" },
            { text: "Service Fees", url: "https://support.google.com/googleplay/android-developer/answer/112622" }
          ],
          required: false
        },
        {
          id: "understand-policies",
          title: "Understand Google Play Policies",
          description: "Familiarize yourself with Google Play's developer policies to avoid rejection or suspension.",
          checklist: [
            "Read the Google Play Developer Program Policies",
            "Review the Developer Distribution Agreement",
            "Understand the app review process and timelines",
            "Review restricted content policies",
            "Understand the policy enforcement process and appeals"
          ],
          tips: [
            "Policy violations are the #1 reason apps get rejected or removed. Read these carefully!",
            "Common violations: misleading metadata, deceptive behavior, inappropriate content, privacy issues.",
            "Apps are reviewed before every release — not just the first one.",
            "Serious or repeated violations can result in account termination."
          ],
          links: [
            { text: "Developer Program Policies", url: "https://play.google.com/about/developer-content-policy/" },
            { text: "Developer Distribution Agreement", url: "https://play.google.com/about/developer-distribution-agreement.html" },
            { text: "Common Rejection Reasons", url: "https://support.google.com/googleplay/android-developer/answer/9859152" }
          ],
          required: true
        }
      ]
    },

    // ─── SECTION 2: CREATE YOUR APP ───────────────────────────────────
    {
      id: "create-app",
      title: "Create Your App",
      icon: "phone",
      description: "Create a new app entry in the Google Play Console and configure its basic details.",
      steps: [
        {
          id: "create-app-entry",
          title: "Create the App in Play Console",
          description: "Start by creating a new app entry in the Google Play Console with basic information.",
          checklist: [
            "Click 'Create app' in the Play Console dashboard",
            "Enter your app name (can be changed later)",
            "Select the default language for your store listing",
            "Choose: App or Game",
            "Choose: Free or Paid (cannot change from free to paid later!)",
            "Accept the declarations (Play policies, US export laws)"
          ],
          tips: [
            "⚠️ IMPORTANT: Once an app is set to Free, it cannot be changed to Paid. Choose carefully!",
            "You can change Paid to Free, but not the other way around.",
            "The app name you enter here is for the Console only — the Store Listing name is set separately.",
            "You can create the app entry long before you're ready to publish."
          ],
          links: [
            { text: "Create and Set Up Your App", url: "https://support.google.com/googleplay/android-developer/answer/9859152" }
          ],
          required: true
        },
        {
          id: "app-access",
          title: "Configure App Access",
          description: "Tell Google whether your app requires special access like login credentials, so reviewers can test it.",
          checklist: [
            "Go to Policy → App content → App access",
            "Indicate if all functionality is available without special access",
            "If login is required: provide test account credentials",
            "If special hardware/setup is needed: provide instructions",
            "Provide any access codes, tokens, or passes needed"
          ],
          tips: [
            "If reviewers can't access your app's features, your app will be rejected.",
            "Provide credentials for a fully functional test account — not a limited trial account.",
            "If your app requires specific setup (Bluetooth device, location, etc.), describe how to simulate it.",
            "Keep test credentials active and working throughout the review process."
          ],
          links: [
            { text: "App Access Requirements", url: "https://support.google.com/googleplay/android-developer/answer/9859455" }
          ],
          required: true
        }
      ]
    },

    // ─── SECTION 3: STORE LISTING ─────────────────────────────────────
    {
      id: "store-listing",
      title: "Store Listing",
      icon: "storefront",
      description: "Create a compelling store listing with descriptions, graphics, and screenshots that showcase your app.",
      steps: [
        {
          id: "app-details",
          title: "App Name & Descriptions",
          description: "Write your app's title, short description, and full description for the Play Store.",
          checklist: [
            "App name: up to 30 characters (make it memorable and searchable)",
            "Short description: up to 80 characters (appears in search results)",
            "Full description: up to 4,000 characters (detailed features and benefits)",
            "Avoid keyword stuffing — Google penalizes this",
            "Include relevant keywords naturally in your descriptions"
          ],
          tips: [
            "Your app name is crucial for discoverability — include a key feature or category word.",
            "The short description is what users see first in search — make every character count.",
            "Use the full description to explain features, benefits, and what makes your app unique.",
            "Format the full description with line breaks and bullet points for readability.",
            "Don't include excessive keywords, promotional text, or misleading information.",
            "Localize your listing for key markets to increase downloads."
          ],
          links: [
            { text: "Store Listing Best Practices", url: "https://support.google.com/googleplay/android-developer/answer/9898842" }
          ],
          required: true
        },
        {
          id: "app-icon",
          title: "App Icon",
          description: "Design and upload your app's icon — the first thing users see.",
          checklist: [
            "Create a 512 × 512 pixel icon",
            "Format: 32-bit PNG (with alpha channel)",
            "Maximum file size: 1 MB",
            "Ensure the icon looks good at small sizes (down to 48px)",
            "Avoid text in the icon (illegible at small sizes)",
            "Upload the icon in the Store Listing section"
          ],
          tips: [
            "Your icon is the single most important visual asset — invest time in getting it right.",
            "Use simple shapes and bold colors that stand out against white and dark backgrounds.",
            "Avoid photos, excessive detail, or text — these don't scale down well.",
            "Test your icon at various sizes (16px, 48px, 96px) to ensure clarity.",
            "Look at top apps in your category for icon style inspiration.",
            "Google Play now applies a circular mask — design within a safe zone circle."
          ],
          links: [
            { text: "Icon Design Specifications", url: "https://developer.android.com/distribute/google-play/resources/icon-design-specifications" }
          ],
          required: true
        },
        {
          id: "feature-graphic",
          title: "Feature Graphic",
          description: "Create a feature graphic that appears at the top of your store listing.",
          checklist: [
            "Create a 1024 × 500 pixel graphic",
            "Format: JPG or 24-bit PNG (no alpha/transparency)",
            "Maximum file size: 1 MB",
            "Design for the center — edges may be cropped on some devices",
            "Upload in the Store Listing section"
          ],
          tips: [
            "The feature graphic is displayed prominently if your app is featured by Google.",
            "Keep key content in the center safe zone (the outer 15% may be cropped).",
            "If you have a promo video, a play button will be overlaid on the feature graphic.",
            "Don't include device frames or excessive text in the graphic.",
            "Use high-quality artwork that represents your app's brand and purpose."
          ],
          links: [
            { text: "Feature Graphic Guidelines", url: "https://support.google.com/googleplay/android-developer/answer/9866151" }
          ],
          required: true
        },
        {
          id: "screenshots",
          title: "Screenshots",
          description: "Upload screenshots that showcase your app's key features and user interface.",
          checklist: [
            "Upload 2–8 screenshots for Phone (required)",
            "Upload screenshots for 7-inch Tablet (recommended)",
            "Upload screenshots for 10-inch Tablet (recommended)",
            "Screenshots must be minimum 320px and maximum 3840px on any side",
            "Aspect ratio must be no wider than 2:1 or taller than 2:1",
            "Format: JPG or 24-bit PNG (no alpha)",
            "Consider uploading Chromebook screenshots if applicable"
          ],
          tips: [
            "The first 2–3 screenshots are the most important — they appear in search results.",
            "Show your app's key features and best screens — not splash screens or loading pages.",
            "Consider adding captions/text overlays to explain what each screenshot shows.",
            "Use actual app screenshots, not mockups or stock photos.",
            "Order screenshots by importance — the most compelling ones first.",
            "Tablets have different aspect ratios — don't just resize phone screenshots."
          ],
          links: [
            { text: "Screenshot Requirements", url: "https://support.google.com/googleplay/android-developer/answer/9866151" }
          ],
          required: true
        },
        {
          id: "promo-video",
          title: "Promotional Video (Optional)",
          description: "Add a YouTube video showcasing your app in action.",
          checklist: [
            "Create a short promotional video (30 seconds to 2 minutes)",
            "Upload it to YouTube as Public or Unlisted",
            "Paste the YouTube URL in the Store Listing",
            "Ensure the video accurately represents the app experience",
            "Video should not be age-restricted"
          ],
          tips: [
            "Apps with videos typically get more downloads than those without.",
            "Show real app usage — don't just use animations or stock footage.",
            "Keep it short and engaging — users typically watch the first 30 seconds.",
            "Don't include pricing or time-sensitive promotions in the video.",
            "The video thumbnail comes from your Feature Graphic."
          ],
          links: [
            { text: "Video Best Practices", url: "https://support.google.com/googleplay/android-developer/answer/9866151" }
          ],
          required: false
        },
        {
          id: "store-settings",
          title: "Store Settings (Category & Contact)",
          description: "Configure your app's category, tags, and developer contact information.",
          checklist: [
            "Select an app or game category (e.g., Productivity, Education, Puzzle)",
            "Add relevant tags (up to 5) for better discoverability",
            "Enter a contact email address (displayed publicly on the listing)",
            "Enter a website URL (optional but recommended)",
            "Enter a contact phone number (optional)",
            "Set the content description language"
          ],
          tips: [
            "Choose the most specific category that fits your app — this affects discoverability.",
            "Tags help Google understand your app better for search and recommendations.",
            "Your contact email is public — consider using a support-specific address, not personal.",
            "Having a website adds credibility and gives users another way to learn about your app."
          ],
          links: [
            { text: "App Categories", url: "https://support.google.com/googleplay/android-developer/answer/9859673" }
          ],
          required: true
        }
      ]
    },

    // ─── SECTION 4: APP CONTENT & COMPLIANCE ──────────────────────────
    {
      id: "app-content",
      title: "App Content & Compliance",
      icon: "shield",
      description: "Complete all required content declarations — privacy, ads, ratings, audience targeting, and data safety.",
      steps: [
        {
          id: "privacy-policy",
          title: "Privacy Policy",
          description: "Provide a privacy policy URL. Required for all apps.",
          checklist: [
            "Create a privacy policy that covers your app's data practices",
            "Host the privacy policy at a publicly accessible URL",
            "Include: what data you collect, how it's used, and how it's shared",
            "Include: data retention and deletion policies",
            "Include: contact information for privacy inquiries",
            "Enter the URL in Play Console → App content → Privacy policy",
            "Also add the privacy policy link within your app itself"
          ],
          tips: [
            "A privacy policy is required for ALL apps, even if you don't collect any data.",
            "Free privacy policy generators exist, but make sure the output is accurate for your app.",
            "Your privacy policy must be consistent with your Data Safety declarations.",
            "Some regions (EU/GDPR, California/CCPA) have specific requirements — make sure you comply.",
            "The policy must be accessible (not behind a login wall or paywall)."
          ],
          links: [
            { text: "Privacy Policy Requirements", url: "https://support.google.com/googleplay/android-developer/answer/9859455" }
          ],
          required: true
        },
        {
          id: "data-safety",
          title: "Data Safety Section",
          description: "Declare what user data your app collects, shares, and how it's secured. This is prominently displayed on your listing.",
          checklist: [
            "Go to App content → Data safety",
            "Declare whether your app collects or shares user data",
            "For each data type: specify if collected, shared, or both",
            "Indicate if data collection is required or optional",
            "Declare your data security practices (encryption in transit, deletion requests)",
            "Indicate if data is processed ephemerally",
            "Declare if your app follows the Families Policy (if targeting children)",
            "Review and submit the Data Safety form"
          ],
          tips: [
            "This section is VERY prominent on your listing — users check this before downloading.",
            "Be thorough and honest — Google may verify your declarations and penalize inaccuracies.",
            "Include data collected by all SDKs and third-party libraries in your app.",
            "Common data types: Device ID, crash logs, analytics, location, contacts, photos.",
            "If you use Firebase, Google Analytics, or ad SDKs, they collect data — declare it!",
            "Data safety must be consistent with your privacy policy."
          ],
          links: [
            { text: "Data Safety Form Guide", url: "https://support.google.com/googleplay/android-developer/answer/10787469" },
            { text: "Data Types Reference", url: "https://support.google.com/googleplay/android-developer/answer/10787469#types" }
          ],
          required: true
        },
        {
          id: "ads-declaration",
          title: "Ads Declaration",
          description: "Declare whether your app contains advertising.",
          checklist: [
            "Go to App content → Ads",
            "Select whether your app contains ads (yes or no)",
            "If yes: ensure ads comply with Google Play ad policies",
            "If targeting children: ensure ad networks are family-friendly certified",
            "Ensure your ad SDKs are listed in Data Safety"
          ],
          tips: [
            "This includes ads from any ad SDK, not just AdMob.",
            "If you show any promotional content (even your own other apps), declare 'contains ads'.",
            "Apps targeting children have strict ad requirements — only certified ad networks allowed.",
            "Interstitial ads must have a clear close button and cannot appear during loading.",
            "Deceptive ads (mimicking system UI, notifications, etc.) are policy violations."
          ],
          links: [
            { text: "Ads Policy", url: "https://support.google.com/googleplay/android-developer/answer/9857753" }
          ],
          required: true
        },
        {
          id: "content-rating",
          title: "Content Rating",
          description: "Complete the IARC content rating questionnaire to get age ratings for your app across all regions.",
          checklist: [
            "Go to App content → Content rating → Start questionnaire",
            "Select your app category (Utility, Game, Social, Communication, etc.)",
            "Answer all questions about your app's content honestly",
            "Review the generated ratings for each region (ESRB, PEGI, etc.)",
            "Apply the content rating to your app",
            "Update the rating if your app content changes"
          ],
          tips: [
            "If you don't complete this, your app may be removed from Google Play.",
            "Be honest — misrepresenting content can lead to app removal or account suspension.",
            "The questionnaire covers: violence, sexual content, language, substances, gambling, user-generated content.",
            "If your app allows user-generated content, it typically gets a higher rating.",
            "Re-do the questionnaire whenever you add new features that change the content."
          ],
          links: [
            { text: "Content Ratings", url: "https://support.google.com/googleplay/android-developer/answer/9859655" },
            { text: "IARC", url: "https://www.globalratings.com/" }
          ],
          required: true
        },
        {
          id: "target-audience",
          title: "Target Audience & Content",
          description: "Declare the target age group for your app. Apps targeting children have additional requirements.",
          checklist: [
            "Go to App content → Target audience and content",
            "Select all applicable target age groups",
            "If targeting children (under 13): review Families Policy requirements",
            "If targeting children: ensure compliance with COPPA and other child protection laws",
            "Confirm your app's appeal is appropriate for the declared audience",
            "If targeting children AND adults: implement age-gating"
          ],
          tips: [
            "⚠️ Selecting 'children' triggers strict additional requirements (Families Policy).",
            "If your app could appeal to children but isn't designed for them, be careful with age selection.",
            "Apps in the Family program must use specific approved ad SDKs.",
            "Misrepresenting your target audience is a serious policy violation."
          ],
          links: [
            { text: "Families Policy", url: "https://support.google.com/googleplay/android-developer/answer/9893335" },
            { text: "Designed for Families", url: "https://support.google.com/googleplay/android-developer/answer/7018303" }
          ],
          required: true
        },
        {
          id: "government-apps",
          title: "Government & Financial Apps (If Applicable)",
          description: "Additional declarations required if your app offers government services, financial services, health features, or is a news app.",
          checklist: [
            "Complete the Government apps declaration (if applicable)",
            "Complete the Financial features declaration (if offering loans, crypto, etc.)",
            "Complete the Health apps declaration (if applicable)",
            "Complete the News apps declaration (if applicable)",
            "Provide required documentation or credentials for regulated features"
          ],
          tips: [
            "Financial apps (personal loans, cryptocurrency, etc.) face extra scrutiny and requirements.",
            "Health apps making medical claims need special approval.",
            "News apps must demonstrate editorial standards and transparency.",
            "If none of these apply to your app, simply mark them as not applicable.",
            "VPN apps also have specific policy requirements."
          ],
          links: [
            { text: "Financial Services Policy", url: "https://support.google.com/googleplay/android-developer/answer/9876821" }
          ],
          required: false
        }
      ]
    },

    // ─── SECTION 5: PRICING & DISTRIBUTION ────────────────────────────
    {
      id: "pricing",
      title: "Pricing & Distribution",
      icon: "dollar",
      description: "Set your app's pricing model and choose which countries and devices to target.",
      steps: [
        {
          id: "set-pricing",
          title: "Set App Pricing",
          description: "Decide whether your app is free or paid, and set the price if applicable.",
          checklist: [
            "Confirm free or paid status (set when app was created)",
            "If paid: set a default price in your local currency",
            "If paid: review auto-converted prices for other countries",
            "If paid: customize individual country prices if needed",
            "Consider your monetization strategy (free + IAP, paid, subscription, freemium)"
          ],
          tips: [
            "⚠️ Remember: Free apps CANNOT be changed to Paid later.",
            "Free apps with in-app purchases is the most common and usually most profitable model.",
            "Paid apps get significantly fewer downloads than free ones.",
            "Google takes 15% commission on the first $1M revenue, 30% after that.",
            "Research competitor pricing before setting your price.",
            "You can run sales by temporarily reducing the price."
          ],
          links: [
            { text: "Set Pricing", url: "https://support.google.com/googleplay/android-developer/answer/6334373" }
          ],
          required: true
        },
        {
          id: "countries-distribution",
          title: "Select Countries & Regions",
          description: "Choose which countries and regions your app will be available in.",
          checklist: [
            "Go to Release → Production → Countries / regions",
            "Select countries where your app should be available",
            "Consider starting with a few key countries and expanding later",
            "Review any country-specific requirements (e.g., China requires a local publisher)",
            "Ensure your app complies with local laws in selected countries"
          ],
          tips: [
            "You can select all countries or choose specific ones.",
            "Some countries have specific content restrictions — research before publishing.",
            "Consider localizing your store listing for top markets.",
            "Starting with fewer countries lets you manage reviews and issues more easily.",
            "China's Google Play is not available — consider alternative stores for China."
          ],
          links: [
            { text: "Distribute to Countries", url: "https://support.google.com/googleplay/android-developer/answer/7550024" }
          ],
          required: true
        },
        {
          id: "device-targeting",
          title: "Device Compatibility",
          description: "Manage which devices your app supports — phones, tablets, TV, Wear OS, ChromeOS, and Auto.",
          checklist: [
            "Review supported device types in your app's manifest",
            "Ensure your app works on target screen sizes and densities",
            "Test on tablets if supporting 7\" and 10\" tablets",
            "Configure any device exclusions if needed",
            "Consider supporting ChromeOS (Chromebooks) for wider reach"
          ],
          tips: [
            "Device compatibility is largely determined by your app's manifest (permissions, features).",
            "Supporting tablets can significantly increase your addressable market.",
            "Wear OS and Android TV apps have additional design requirements.",
            "Use Play Console's device catalog to see which devices are compatible.",
            "Exclude specific devices only if there are known hardware incompatibilities."
          ],
          links: [
            { text: "Device Catalog", url: "https://support.google.com/googleplay/android-developer/answer/7353455" }
          ],
          required: false
        }
      ]
    },

    // ─── SECTION 6: BUILD & UPLOAD ────────────────────────────────────
    {
      id: "build-upload",
      title: "Build & Upload",
      icon: "upload",
      description: "Build your Android App Bundle, configure app signing, and upload your app to the Play Console.",
      steps: [
        {
          id: "app-signing",
          title: "Set Up App Signing",
          description: "Configure Play App Signing — Google manages your app signing key for added security.",
          checklist: [
            "Understand the difference between upload key and app signing key",
            "Opt in to Play App Signing (strongly recommended and required for new apps)",
            "Generate an upload key for signing your app bundles",
            "If migrating: export and upload your existing app signing key",
            "Back up your upload key securely — you'll need it for every upload"
          ],
          tips: [
            "Play App Signing is required for new apps — Google holds the actual signing key.",
            "You sign with your upload key → Google re-signs with the app signing key → users get the app.",
            "If you lose your upload key, you can contact Google to reset it (with identity verification).",
            "NEVER share your app signing key or upload key publicly.",
            "Back up your keystore file, alias, and passwords in a secure location."
          ],
          links: [
            { text: "Play App Signing", url: "https://support.google.com/googleplay/android-developer/answer/9842756" },
            { text: "App Signing Key", url: "https://developer.android.com/studio/publish/app-signing" }
          ],
          required: true
        },
        {
          id: "build-aab",
          title: "Build Your Android App Bundle (AAB)",
          description: "Build your app in the AAB format — the required format for Google Play.",
          checklist: [
            "Ensure your app targets the required API level (Android 16 / API 36 for new apps and updates since Aug 2026; the minimum rises every August)",
            "Build an Android App Bundle (.aab) — not APK",
            "Sign the AAB with your upload key",
            "Verify the AAB passes lint checks with no critical errors",
            "Test the AAB locally using the bundletool utility",
            "Ensure your app size meets Google Play limits (200 MB for AAB)"
          ],
          tips: [
            "AAB is the required format since August 2021 — APKs are no longer accepted for new apps.",
            "In Android Studio: Build → Generate Signed Bundle → Android App Bundle.",
            "AABs can be up to 200 MB; for larger apps, use Play Asset Delivery or Play Feature Delivery.",
            "Use bundletool to generate device-specific APKs from your AAB for local testing.",
            "Make sure your version code is higher than any previously uploaded version.",
            "Check the minimum API level — Google regularly increases the target API requirement."
          ],
          links: [
            { text: "Android App Bundle", url: "https://developer.android.com/guide/app-bundle" },
            { text: "Target API Level", url: "https://developer.android.com/google/play/requirements/target-sdk" },
            { text: "Bundletool", url: "https://developer.android.com/studio/command-line/bundletool" }
          ],
          required: true
        },
        {
          id: "upload-release",
          title: "Upload Your App & Create a Release",
          description: "Upload your AAB to a release track and prepare your release notes.",
          checklist: [
            "Go to Release → Testing or Production → Create new release",
            "Upload your signed .aab file",
            "Wait for the upload to process and check for warnings",
            "Add release notes (what's new) for every supported language",
            "Name the release (optional — auto-populated from version code)",
            "Review the release summary before proceeding"
          ],
          tips: [
            "Start with Internal Testing — it's the fastest way to get your app on a device.",
            "Release notes are important — users read them, and they affect your SEO.",
            "Watch for upload errors — common issues: wrong signing key, duplicate version code, missing permissions.",
            "You can upload multiple AABs for different device configurations if needed.",
            "Draft releases can be saved and completed later."
          ],
          links: [
            { text: "Prepare & Roll Out Releases", url: "https://support.google.com/googleplay/android-developer/answer/9859348" }
          ],
          required: true
        }
      ]
    },

    // ─── SECTION 7: TESTING ───────────────────────────────────────────
    {
      id: "testing",
      title: "Testing",
      icon: "flask",
      description: "Use Google Play's testing tracks to validate your app with real users before the full launch.",
      steps: [
        {
          id: "internal-testing",
          title: "Internal Testing Track",
          description: "The fastest way to distribute your app to internal testers — available within minutes.",
          checklist: [
            "Go to Release → Testing → Internal testing",
            "Create an email list of internal testers (up to 100)",
            "Create a release and upload your AAB",
            "Roll out to internal testers",
            "Share the opt-in link with testers",
            "Gather feedback and iterate"
          ],
          tips: [
            "Internal testing releases are available almost immediately — no review wait time!",
            "Great for quick testing cycles with your team during development.",
            "Internal testers must opt in via a link before they can download.",
            "Testers must have a Google account that matches the email list.",
            "Internal testing doesn't require the full store listing to be complete."
          ],
          links: [
            { text: "Internal Testing", url: "https://support.google.com/googleplay/android-developer/answer/9845334" }
          ],
          required: false
        },
        {
          id: "closed-testing",
          title: "Closed Testing Track",
          description: "Distribute to a larger group of trusted testers via email lists or Google Groups. ⚠️ Required for new personal developer accounts before production access is granted.",
          checklist: [
            "NEW PERSONAL ACCOUNTS: Recruit at least 12 testers who stay opted in for 14 consecutive days",
            "NEW PERSONAL ACCOUNTS: After 14 days, apply for production access in the Dashboard",
            "Go to Release → Testing → Closed testing",
            "Create a tester group with email lists or Google Groups",
            "Create a release and upload your AAB",
            "Submit for review (required for closed testing)",
            "Once approved, share opt-in link with testers",
            "Monitor feedback, crashes, and performance"
          ],
          tips: [
            "⚠️ Personal accounts created after Nov 2023 can't publish to Production until they complete this 12-tester / 14-day closed test. Plan for it early!",
            "Testers must actually be opted in the whole time — recruit a few extra in case some drop out.",
            "Closed testing requires app review — allow a few hours to a few days.",
            "You can create multiple closed testing tracks (alpha, beta, etc.).",
            "Useful for beta testing with a controlled group before open testing.",
            "You can use Google Groups for easier tester management.",
            "Testers can leave reviews — these are visible only to you, not publicly."
          ],
          links: [
            { text: "Closed Testing", url: "https://support.google.com/googleplay/android-developer/answer/9845334" }
          ],
          required: true
        },
        {
          id: "open-testing",
          title: "Open Testing Track",
          description: "Make your app available to anyone who wants to join the testing program.",
          checklist: [
            "Go to Release → Testing → Open testing",
            "Create a release and upload your AAB",
            "Submit for review",
            "Set maximum number of testers (optional)",
            "Your app becomes searchable on the Play Store with a 'Join beta' button",
            "Monitor feedback and ratings from open testers"
          ],
          tips: [
            "Open testing makes your app discoverable on the Play Store — great for gathering wider feedback.",
            "Open test reviews don't affect your production rating (they're separate).",
            "Use this as a final validation step before production launch.",
            "You can limit the number of open testers if you want to control the rollout.",
            "Open testing requires a full store listing to be complete."
          ],
          links: [
            { text: "Open Testing", url: "https://support.google.com/googleplay/android-developer/answer/9845334" }
          ],
          required: false
        },
        {
          id: "pre-launch-reports",
          title: "Pre-Launch Reports",
          description: "Google automatically tests your app on real devices via Firebase Test Lab and provides crash/performance reports.",
          checklist: [
            "Review pre-launch reports in Release → Pre-launch report",
            "Check for crashes and ANRs on different devices",
            "Review accessibility findings",
            "Check security vulnerabilities flagged by the scan",
            "Review screenshots captured during automated testing",
            "Fix any critical issues before production launch"
          ],
          tips: [
            "Pre-launch reports run automatically when you upload to any track (unless disabled).",
            "Reports cover: stability, performance, accessibility, and security.",
            "It tests on a range of real devices, not just emulators.",
            "If you need login for your app, provide test credentials in App Access.",
            "These reports can catch issues you might miss in manual testing.",
            "Issues found here won't block your release, but they're worth fixing."
          ],
          links: [
            { text: "Pre-launch Reports", url: "https://support.google.com/googleplay/android-developer/answer/9842757" }
          ],
          required: false
        }
      ]
    },

    // ─── SECTION 8: LAUNCH ────────────────────────────────────────────
    {
      id: "launch",
      title: "Launch",
      icon: "flag",
      description: "Submit your app for production release and navigate the review process.",
      steps: [
        {
          id: "pre-launch-checklist",
          title: "Pre-Launch Checklist",
          description: "Verify everything is complete before submitting for production release.",
          checklist: [
            "✅ All App Content sections are complete (privacy, ads, rating, audience, data safety)",
            "✅ Store listing is polished (name, descriptions, icon, screenshots, feature graphic)",
            "✅ Store settings configured (category, contact info)",
            "✅ Pricing and distribution countries are set",
            "✅ App access instructions provided (if login required)",
            "✅ App has been tested internally or in closed/open testing",
            "✅ Pre-launch reports reviewed — no critical issues",
            "✅ Privacy policy is live and accessible",
            "✅ Your app complies with all Google Play policies",
            "✅ Release notes are written and localized"
          ],
          tips: [
            "Play Console shows a checklist of required items — all must have green checkmarks.",
            "Don't rush to production — thorough testing prevents bad reviews and policy rejections.",
            "Consider having someone else review your store listing for typos and clarity.",
            "Test your privacy policy link to make sure it's accessible from different regions."
          ],
          links: [
            { text: "Launch Checklist", url: "https://developer.android.com/distribute/best-practices/launch/launch-checklist" }
          ],
          required: true
        },
        {
          id: "create-production-release",
          title: "Create Production Release",
          description: "Create your production release and choose your rollout strategy.",
          checklist: [
            "Go to Release → Production → Create new release",
            "Select or upload your AAB (can promote from testing track)",
            "Add release notes",
            "Choose rollout percentage (staged rollout recommended)",
            "Review the release summary carefully",
            "Click 'Start rollout to Production'"
          ],
          tips: [
            "You can promote a tested release directly from a testing track — you don't have to re-upload.",
            "Start with a 20% staged rollout to catch issues before full launch.",
            "If using staged rollout, monitor crash rates before increasing the percentage.",
            "You can halt a staged rollout at any time if issues arise.",
            "100% rollout doesn't mean instant availability — it can take hours to propagate."
          ],
          links: [
            { text: "Staged Rollouts", url: "https://support.google.com/googleplay/android-developer/answer/6346149" }
          ],
          required: true
        },
        {
          id: "app-review",
          title: "App Review Process",
          description: "Understand what happens after you submit and how to handle review outcomes.",
          checklist: [
            "Submit your release for review",
            "Wait for review (typically a few hours to 7 days for new apps)",
            "Monitor the Play Console for review status updates",
            "If rejected: read the rejection reason carefully",
            "If rejected: fix the issues and resubmit",
            "If rejected unfairly: submit an appeal through Play Console"
          ],
          tips: [
            "New developer accounts and new apps typically have longer review times.",
            "First-time apps can take up to 7 days or more for review.",
            "Updates to existing apps are usually reviewed faster (hours to 1–3 days).",
            "Common rejection reasons: metadata violations, policy violations, broken functionality.",
            "If rejected, the rejection notice tells you exactly which policy was violated.",
            "You can appeal rejections through the Play Console — provide detailed explanations.",
            "During peak times (holidays, etc.), reviews may take longer."
          ],
          links: [
            { text: "App Review Process", url: "https://support.google.com/googleplay/android-developer/answer/9859455" },
            { text: "Appeal a Decision", url: "https://support.google.com/googleplay/android-developer/answer/9888379" }
          ],
          required: true
        }
      ]
    },

    // ─── SECTION 9: POST-LAUNCH ───────────────────────────────────────
    {
      id: "post-launch",
      title: "Post-Launch",
      icon: "chart",
      description: "Monitor your app's performance, respond to users, and plan updates after your launch.",
      steps: [
        {
          id: "monitor-vitals",
          title: "Monitor App Vitals & Crashes",
          description: "Keep an eye on crashes, ANRs, and performance metrics to maintain app quality.",
          checklist: [
            "Check Android Vitals dashboard regularly",
            "Monitor crash rate — should stay below 1.09% (bad behavior threshold)",
            "Monitor ANR rate — should stay below 0.47%",
            "Review crash stack traces and prioritize fixes",
            "Set up alerts for crash rate spikes",
            "Monitor battery, wake lock, and stuck background services"
          ],
          tips: [
            "Apps exceeding bad behavior thresholds may lose visibility in search results.",
            "Use Firebase Crashlytics for more detailed crash reporting.",
            "Prioritize crashes affecting the most users first.",
            "ANRs (Application Not Responding) are often caused by work on the main thread.",
            "Review crashes by device, OS version, and app version to identify patterns."
          ],
          links: [
            { text: "Android Vitals", url: "https://support.google.com/googleplay/android-developer/answer/9844486" },
            { text: "Firebase Crashlytics", url: "https://firebase.google.com/docs/crashlytics" }
          ],
          required: false
        },
        {
          id: "reviews-ratings",
          title: "Manage Reviews & Ratings",
          description: "Monitor and respond to user reviews — this significantly impacts your app's success.",
          checklist: [
            "Check reviews regularly in Play Console → Ratings and reviews",
            "Respond to negative reviews with helpful, professional replies",
            "Thank positive reviewers and ask for feature suggestions",
            "Report fake or abusive reviews through Play Console",
            "Track your overall rating trend over time",
            "Use review insights to prioritize feature development"
          ],
          tips: [
            "Responding to reviews, especially negative ones, can lead users to update their rating.",
            "Never argue with reviewers — be empathetic and offer solutions.",
            "If a user reports a bug, ask for details and follow up when it's fixed.",
            "Use Google Play's review analysis tools to identify common themes.",
            "Consider using the In-App Review API to prompt satisfied users to rate your app.",
            "Reply in the user's language when possible."
          ],
          links: [
            { text: "Reply to Reviews", url: "https://support.google.com/googleplay/android-developer/answer/138230" },
            { text: "In-App Review API", url: "https://developer.android.com/guide/playcore/in-app-review" }
          ],
          required: false
        },
        {
          id: "updates-maintenance",
          title: "Plan Updates & Maintenance",
          description: "Keep your app fresh with regular updates, new features, and compatibility improvements.",
          checklist: [
            "Plan a regular update cadence (monthly or quarterly)",
            "Update target API level before the annual Google Play deadline",
            "Fix bugs and crashes reported by users and vitals",
            "Add new features based on user feedback",
            "Update your store listing seasonally or for major updates",
            "Monitor new Google Play policies and ensure ongoing compliance",
            "Test updates thoroughly before releasing to production"
          ],
          tips: [
            "Apps that are regularly updated tend to rank higher in search results.",
            "Google requires you to update your target API level annually — plan for this.",
            "Use staged rollouts for updates to catch regressions before full deployment.",
            "Keep your release notes informative — users read them!",
            "Consider A/B testing your store listing (Experiments in Play Console).",
            "Archive old versions and keep a changelog for your records."
          ],
          links: [
            { text: "Target API Requirements", url: "https://developer.android.com/google/play/requirements/target-sdk" },
            { text: "Store Listing Experiments", url: "https://support.google.com/googleplay/android-developer/answer/6227309" }
          ],
          required: false
        },
        {
          id: "growth-optimization",
          title: "Growth & Store Listing Optimization",
          description: "Use Play Console tools to grow your audience and optimize your store listing.",
          checklist: [
            "Review acquisition reports to understand where users come from",
            "Run store listing experiments (A/B tests) for icon, screenshots, descriptions",
            "Set up custom store listings for different audiences or campaigns",
            "Monitor conversion rates (store listing visitors → installs)",
            "Use deep links and UTM parameters for marketing campaigns",
            "Consider Google Ads for app promotion"
          ],
          tips: [
            "Store listing optimization (ASO) is as important as SEO for websites.",
            "A/B test your icon and screenshots — small changes can significantly impact downloads.",
            "Custom store listings let you tailor your message to different audiences.",
            "Track your organic vs. paid installs to measure marketing effectiveness.",
            "Localize your store listing — it's one of the highest-impact things you can do."
          ],
          links: [
            { text: "Store Listing Experiments", url: "https://support.google.com/googleplay/android-developer/answer/6227309" },
            { text: "Acquisition Reports", url: "https://support.google.com/googleplay/android-developer/answer/6263332" }
          ],
          required: false
        }
      ]
    }
  ]
};
