import type { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BleeqHeaderShell } from "@/components/bleeq/BleeqHeaderShell";
import { BleeqFooter } from "@/components/bleeq/BleeqFooter";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { NewsletterPopup } from "@/components/newsletter/NewsletterPopup";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SiteProvider } from "@/lib/site/SiteProvider";
import { getSite } from "@/lib/site/get-site";
import { siteBaseUrl, siteOgImage } from "@/lib/site/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { THEME_STORAGE_KEY } from "@/lib/theme/tokens";
import {
  LOCALE_COOKIE,
  localeHtmlLang,
  parseLocaleCookie,
} from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import "./globals.css";

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
  const base = siteBaseUrl(site);
  const title = `${site.name} — ${site.tagline}`;
  return {
    metadataBase: new URL(base),
    title: {
      default: title,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    openGraph: {
      type: "website",
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

const THEME_INIT_SCRIPT = `(function(){try{
var d=document.documentElement;
var keys=['verveacesports_theme_v1','verveacesports_theme_v2','verveacesports_theme_v3','verveacesports_theme_v4','verveacesports_theme_v5','verveacesports_theme_v6','verveacesports_theme_v7'];
for(var i=0;i<keys.length;i++){try{localStorage.removeItem(keys[i])}catch(e){}}
var raw=localStorage.getItem('${THEME_STORAGE_KEY}');
if(!raw){d.classList.add('dark');d.style.colorScheme='dark';return;}
var t=JSON.parse(raw);var m=t.mode==='light'?'light':'dark';var c=t[m]||{};
var bg=String(c.background||'').toLowerCase();
var dead=['#000','#000000','#05080b','#0d0d0f','#0e1216','#0a1a2f','#1a4068'];
if(m==='dark'&&(dead.indexOf(bg)>=0||bg.indexOf('oklch(0.13')===0||bg.indexOf('oklch(0 ')===0)){
  try{localStorage.removeItem('${THEME_STORAGE_KEY}')}catch(e){}
  d.classList.add('dark');d.style.colorScheme='dark';return;
}
d.classList.toggle('dark',m==='dark');d.style.colorScheme=m;
var toks=['background','foreground','primary','primary-foreground','card','card-foreground','muted','muted-foreground','secondary','accent','border'];
toks.forEach(function(k){if(c[k]){d.style.setProperty('--'+k,c[k]);d.style.setProperty('--color-'+k,c[k]);}});
if(c.card){d.style.setProperty('--popover',c.card);d.style.setProperty('--color-popover',c.card);}
if(c.primary){d.style.setProperty('--ring',c.primary);d.style.setProperty('--color-ring',c.primary);}
}catch(e){d.classList.add('dark');}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const site = await getSite();
  const cookieStore = await cookies();
  const locale = parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value);
  const dictionary = getDictionary(locale);
  const isBleeq = site.id === "bleeq-ca";
  const base = siteBaseUrl(site);
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: site.name,
    url: base,
    ...(isBleeq ? {} : { logo: `${base}/verveace_logo.webp` }),
    description: site.description,
    email: site.supportEmail,
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={webSiteJsonLd} />
        <SiteProvider siteId={site.id}>
          <I18nProvider locale={locale} dictionary={dictionary}>
            <ThemeProvider>
              {isBleeq ? <BleeqHeaderShell /> : <Header />}
              <main className="min-w-0 flex-1">{children}</main>
              {isBleeq ? <BleeqFooter /> : <Footer />}
              <CartDrawer />
              <ChatWidget />
              <NewsletterPopup />
            </ThemeProvider>
          </I18nProvider>
        </SiteProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
