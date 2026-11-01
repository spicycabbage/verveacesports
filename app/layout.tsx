import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BleeqFooter } from "@/components/bleeq/BleeqFooter";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { NewsletterPopupLazy } from "@/components/newsletter/NewsletterPopupLazy";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SiteProvider } from "@/lib/site/SiteProvider";
import { getSessionProfile } from "@/lib/auth/session";
import { getSite } from "@/lib/site/get-site";
import type { SiteId } from "@/lib/site/config";
import { isAdminPath } from "@/lib/request/pathname";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { AdminOrderAlerts } from "@/components/admin/AdminOrderAlerts";
import { AdminLiveChatAlerts } from "@/components/admin/AdminLiveChatAlerts";
import { PageViewBeacon } from "@/components/analytics/PageViewBeacon";
import { sitePwaChrome } from "@/lib/site/pwa";
import {
  merchantReturnPolicyJsonLd,
  siteBaseUrl,
  siteLogoPath,
  siteOgImage,
  siteOgLocale,
} from "@/lib/site/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { themeCssVars, siteDefaultThemes } from "@/lib/theme/tokens";
import { siteDescription, siteTagline } from "@/lib/i18n/helpers";
import type { CSSProperties } from "react";
import { LOCALE_COOKIE, localeHtmlLang } from "@/lib/i18n/locale";
import { resolveRequestLocale } from "@/lib/i18n/request-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import "./globals.css";

// The root layout is request-bound by design: the storefront is picked from the
// Host header (multi-tenant) and <html lang> from the locale cookie, so no route
// can ship a static shell. Cache Components still gives us cross-request
// "use cache" data reads (lib/catalog/queries.ts); this just opts the tree out
// of the blocking-prerender validation.
export const instant = false;

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(await resolveRequestLocale(cookieStore.get(LOCALE_COOKIE)?.value));
  const tagline = siteTagline(dict, site.id);
  const description = siteDescription(dict, site.id);
  const base = siteBaseUrl(site);
  const title = `${site.name} — ${tagline}`;
  return {
    metadataBase: new URL(base),
    title: {
      default: title,
      template: `%s | ${site.name}`,
    },
    description,
    applicationName: site.name,
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: site.shortName,
      statusBarStyle: "black",
    },
    formatDetection: { telephone: false },
    icons: {
      icon: [
        { url: "/pwa-icon/192", type: "image/png", sizes: "192x192" },
        { url: "/pwa-icon/512", type: "image/png", sizes: "512x512" },
        { url: "/pwa-icon/180", type: "image/png", sizes: "180x180" },
        { url: "/icon", type: "image/png", sizes: "32x32" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
      google: "notranslate",
    },
    openGraph: {
      type: "website",
      locale: siteOgLocale(site),
      siteName: site.name,
      title,
      description: site.description,
      url: base,
      images: [{ url: siteOgImage(site), alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: site.description,
      images: [siteOgImage(site)],
    },
    verification: searchConsoleVerification(site.id),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// Tokens are per property, and only VerveaceSports' search consoles are ours.
function searchConsoleVerification(siteId: SiteId): Metadata["verification"] {
  if (siteId !== "verveace") return undefined;
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  if (!google && !bing) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

// Theme color is per storefront, so it cannot live here: generateViewport
// runs outside the request and headers() is a blocking-route error. The
// <meta name="theme-color"> in the layout head is the host-specific value.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

function themeInitScript(storageKey: string, light: boolean): string {
  if (light) {
    return `(function(){try{var d=document.documentElement;d.classList.remove('dark');d.style.colorScheme='light';}catch(e){}})();`;
  }
  return `(function(){try{
var d=document.documentElement;
var keys=['verveacesports_theme_v1','verveacesports_theme_v2','verveacesports_theme_v3','verveacesports_theme_v4','verveacesports_theme_v5','verveacesports_theme_v6','verveacesports_theme_v7'];
for(var i=0;i<keys.length;i++){try{localStorage.removeItem(keys[i])}catch(e){}}
d.classList.add('dark');d.style.colorScheme='dark';
var raw=localStorage.getItem('${storageKey}');
if(!raw){return;}
var t=JSON.parse(raw);var c=t.dark||{};
var bg=String(c.background||'').toLowerCase();
var dead=['#000','#000000','#05080b','#0d0d0f','#0e1216','#0a1a2f','#1a4068'];
if(dead.indexOf(bg)>=0||bg.indexOf('oklch(0.13')===0||bg.indexOf('oklch(0 ')===0){
  try{localStorage.removeItem('${storageKey}')}catch(e){}
  return;
}
var toks=['background','foreground','primary','primary-foreground','card','card-foreground','muted','muted-foreground','secondary','accent','border'];
toks.forEach(function(k){if(c[k]){d.style.setProperty('--'+k,c[k]);d.style.setProperty('--color-'+k,c[k]);}});
if(c.card){d.style.setProperty('--popover',c.card);d.style.setProperty('--color-popover',c.card);}
if(c.primary){d.style.setProperty('--ring',c.primary);d.style.setProperty('--color-ring',c.primary);}
}catch(e){d.classList.add('dark');}})();`;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [site, cookieStore, adminRoute, headerStore] = await Promise.all([
    getSite(),
    cookies(),
    isAdminPath(),
    headers(),
  ]);
  const adminViewer = adminRoute
    ? true
    : Boolean((await getSessionProfile())?.is_admin);
  const nonce = headerStore.get("x-nonce") ?? undefined;
  const locale = await resolveRequestLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dictionary = getDictionary(locale);
  const isBleeq = site.id === "bleeq-ca";
  const isVolt = site.id === "volt-ca";
  const base = siteBaseUrl(site);
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${base}/#organization`,
    name: site.name,
    url: base,
    logo: `${base}${siteLogoPath(site)}`,
    description: site.description,
    email: site.supportEmail,
    hasMerchantReturnPolicy: merchantReturnPolicyJsonLd(site),
    ...(isBleeq
      ? {
          alternateName: ["BleeqUp", "BleeqUp Ranger Canada"],
          areaServed: { "@type": "Country", name: "Canada" },
        }
      : isVolt
        ? { areaServed: { "@type": "Country", name: "Canada" } }
        : {
            areaServed: [
              { "@type": "Country", name: "Canada" },
              { "@type": "Country", name: "United States" },
            ],
          }),
  };
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang={localeHtmlLang(locale)}
      translate="no"
      data-site={site.id}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} notranslate ${isVolt ? "" : "dark"} min-h-dvh antialiased`}
      style={
        isVolt
          ? (themeCssVars(siteDefaultThemes("volt-ca").light) as CSSProperties)
          : undefined
      }
    >
      <head>
        <meta name="theme-color" content={sitePwaChrome(site.id).themeColor} />
        <link rel="alternate" type="text/plain" href={`${base}/llms.txt`} title="LLM site guide" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        ) : null}
      </head>
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        <script
          id="theme-init"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: themeInitScript(site.themeStorageKey, isVolt),
          }}
        />
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={webSiteJsonLd} />
        <SiteProvider siteId={site.id}>
          <I18nProvider locale={locale} dictionary={dictionary}>
            <ThemeProvider siteId={site.id}>
              {adminRoute ? null : (
                <div className="sticky top-0 z-50 print:hidden">
                  <Suspense
                    fallback={
                      <div
                        className={
                          isVolt
                            ? "h-14 border-b border-border bg-background sm:h-16"
                            : "h-[5.75rem] border-b border-border bg-background sm:h-[7.45rem]"
                        }
                      />
                    }
                  >
                    <Header />
                  </Suspense>
                </div>
              )}
              <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
              {adminRoute ? null : (
                <div className="print:hidden">
                  {isBleeq ? <BleeqFooter /> : <Footer />}
                  <CartDrawer />
                  {adminViewer ? null : <ChatWidget />}
                  <NewsletterPopupLazy />
                  {adminViewer ? null : (
                    <Suspense fallback={null}>
                      <PageViewBeacon />
                    </Suspense>
                  )}
                </div>
              )}
            </ThemeProvider>
          </I18nProvider>
        </SiteProvider>
        <PwaRegister />
        <AdminOrderAlerts />
        <AdminLiveChatAlerts />
        <Toaster
          richColors
          position="top-center"
          offset={{ top: "max(4.5rem, calc(env(safe-area-inset-top) + 3.5rem))" }}
        />
      </body>
    </html>
  );
}
