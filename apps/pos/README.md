# Verveace POS (Android Tap to Pay)

Native wrapper around admin (starts on `/admin/pos`). Same admin nav as the site — Orders, Chat, POS, etc. Collects Visa / Mastercard contactless (and wallets) on the phone. Interac chip+PIN stays on the hardware reader.

Expo Go will not work. iPhone is skipped until there is an Apple Developer account.

## Phone

- Android 13+
- NFC + Google Play services
- Not rooted, stock OS
- Hardware-backed keystore (normal retail phones)

**Live cards:** Developer options must be **off**. USB debugging makes Stripe return `TAP_TO_PAY_INSECURE_ENVIRONMENT`.

**Stripe test mode:** the app uses a simulated Tap to Pay reader, so USB debugging is fine.

## Local install (debug / test mode)

USB a phone, enable debugging, then:

```bash
cd apps/pos
# Stripe's postinstall uses Unix `rm` — skip scripts on Windows
npm install --ignore-scripts
npx expo prebuild --platform android
npx expo run:android
```

Sign in as admin. Allow notifications when asked — new paid orders then show a system notification + launcher badge. Badge: **Tap to Pay ready**. Charge a test cart, then hold a test card (or wait for the simulated tap).

Android push needs an EAS/FCM credential (`eas credentials` → Android → FCM V1, or `google-services.json`). Apply `supabase/migrations/0043_admin_expo_push_tokens.sql` on production.

Optional: `EXPO_PUBLIC_POS_URL=https://ca.bleequp.com/admin/pos` (default) or your LAN Next URL.

## Live cards (sideload APK)

1. Deploy the Next app so `/api/admin/terminal/*` is on production.
2. Admin → POS: Stripe Terminal location (`tml_…`) saved.
3. Live Stripe keys (not test).
4. Build a **release** APK (no USB debugging on the phone):

```bash
cd apps/pos
npx eas build -p android --profile preview
```

Sideload the APK, **turn Developer options off**, open the app, charge, hold Visa/MC to the NFC area (usually the back/camera).

## CAD

Charges hit the CAD Stripe account. Same inventory / invoice path as the counter reader.
