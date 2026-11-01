import type { Locale } from "@/lib/i18n/locale";
import { publishedBlogPosts } from "./index";
import { localizePost } from "./localize";
import { blogPath } from "./paths";
import { blogLocalesFor } from "./translations";
import type { BlogCategory } from "./types";

/** Topic hub at /blog/category/{slug} (English) and /{locale}/blog/category/{slug}. */
export type BlogCategoryInfo = {
  category: BlogCategory;
  /** Same in every language so hubs share hreflang alternates. */
  slug: string;
  shopHref: string;
};

/** Per-language hub copy. */
export type BlogCategoryCopy = {
  /** Chip and breadcrumb label. Matches the posts' `categoryLabel`. */
  label: string;
  /** On-page H1. */
  title: string;
  /** `<title>`, rendered as absolute. Keep ≤ 60 chars (≤ 32 for Japanese and Chinese). */
  metaTitle: string;
  /** Meta description. Keep ≤ 155 chars (≤ 80 for Japanese and Chinese). */
  description: string;
  /** Intro paragraph under the H1. Plain text. */
  intro: string;
  shopLabel: string;
};

export const BLOG_CATEGORIES: readonly BlogCategoryInfo[] = [
  { category: "Golf", slug: "golf", shopHref: "/products?category=electric-carts" },
  { category: "AI Glasses", slug: "ai-glasses", shopHref: "/products?category=ai-glasses" },
];

type CategoryNavUi = { allGuides: string; navLabel: string };

const NAV_UI: Record<Locale, CategoryNavUi> = {
  en: { allGuides: "All guides", navLabel: "Blog categories" },
  nl: { allGuides: "Alle gidsen", navLabel: "Blogcategorieën" },
  fr: { allGuides: "Tous les guides", navLabel: "Catégories du blog" },
  de: { allGuides: "Alle Ratgeber", navLabel: "Blog-Kategorien" },
  es: { allGuides: "Todas las guías", navLabel: "Categorías del blog" },
  it: { allGuides: "Tutte le guide", navLabel: "Categorie del blog" },
  "pt-PT": { allGuides: "Todos os guias", navLabel: "Categorias do blogue" },
  ja: { allGuides: "すべてのガイド", navLabel: "ブログのカテゴリー" },
  "zh-CN": { allGuides: "全部指南", navLabel: "博客分类" },
};

const COPY: Record<Locale, Record<string, BlogCategoryCopy>> = {
  en: {
    golf: {
      label: "Golf",
      title: "Electric Golf Cart & Trolley Guides",
      metaTitle: "Electric Golf Cart & Trolley Guides | VerveaceSports",
      description:
        "Buyer's guides, how-tos, and care tips for electric golf push carts, remote caddies, and lithium trolley batteries, written for Canadian golfers.",
      intro:
        "Everything we've written about walking the course with an electric golf cart: how to choose between remote, follow-me, and push-button trolleys, how to look after a lithium battery through a Canadian winter, and how to get the most out of a remote caddy once it's yours.",
      shopLabel: "Shop electric golf carts",
    },
    "ai-glasses": {
      label: "AI Glasses",
      title: "AI Sports Glasses & Camera Glasses Guides",
      metaTitle: "AI Sports & Camera Glasses Guides | VerveaceSports",
      description:
        "Guides to AI sports camera glasses: filming POV video, choosing lenses, prescription options, and BleeqUp Rover vs. Ranger for cycling and golf.",
      intro:
        "Practical guides to camera glasses and AI sports glasses: how they compare with action cameras, which lens to ride with, how prescription inserts work, and how to film your sport hands-free with BleeqUp Rover and Ranger.",
      shopLabel: "Shop AI sports glasses",
    },
  },
  nl: {
    golf: {
      label: "Golf",
      title: "Gidsen voor elektrische golftrolleys",
      metaTitle: "Gidsen voor elektrische golftrolleys | VerveaceSports",
      description:
        "Koopgidsen, handleidingen en onderhoudstips voor elektrische golftrolleys, caddies met afstandsbediening en lithiumaccu's, geschreven voor golfers in Canada.",
      intro:
        "Alles wat we hebben geschreven over lopend golfen met een elektrische trolley: kiezen tussen afstandsbediening, volg-mij en een gewone elektrische trolley, je lithiumaccu de Canadese winter door helpen en het meeste halen uit een caddy met afstandsbediening.",
      shopLabel: "Bekijk elektrische golftrolleys",
    },
    "ai-glasses": {
      label: "AI-brillen",
      title: "Gidsen voor AI-sportbrillen en camerabrillen",
      metaTitle: "Gidsen voor AI-sport- en camerabrillen | VerveaceSports",
      description:
        "Gidsen over AI-sportbrillen met camera: POV-video filmen, lenzen kiezen, opties op sterkte en BleeqUp Rover of Ranger voor fietsen en golf.",
      intro:
        "Praktische gidsen over camerabrillen en AI-sportbrillen: hoe ze zich verhouden tot actiecamera's, met welke lens je rijdt, hoe inzetstukken op sterkte werken en hoe je je sport handsfree filmt met de BleeqUp Rover en Ranger.",
      shopLabel: "Bekijk AI-sportbrillen",
    },
  },
  fr: {
    golf: {
      label: "Golf",
      title: "Guides des chariots de golf électriques",
      metaTitle: "Guides des chariots de golf électriques | VerveaceSports",
      description:
        "Guides d'achat, conseils pratiques et entretien des chariots de golf électriques, chariots télécommandés et batteries au lithium, pour les golfeurs canadiens.",
      intro:
        "Tout ce que nous avons écrit sur le golf à pied avec un chariot électrique : choisir entre un chariot télécommandé, suiveur ou à bouton, entretenir une batterie au lithium pendant l'hiver canadien et tirer le meilleur parti d'un chariot télécommandé.",
      shopLabel: "Voir les chariots de golf électriques",
    },
    "ai-glasses": {
      label: "Lunettes IA",
      title: "Guides des lunettes sport IA et lunettes caméra",
      metaTitle: "Guides des lunettes sport IA et caméra | VerveaceSports",
      description:
        "Lunettes sport IA avec caméra : filmer en vue subjective, choisir ses verres, options de correction et BleeqUp Rover ou Ranger pour le vélo et le golf.",
      intro:
        "Des guides pratiques sur les lunettes caméra et les lunettes sport IA : la comparaison avec les caméras d'action, le choix des verres, le fonctionnement des inserts de correction et la façon de filmer votre sport mains libres avec les BleeqUp Rover et Ranger.",
      shopLabel: "Voir les lunettes sport IA",
    },
  },
  de: {
    golf: {
      label: "Golf",
      title: "Ratgeber zu elektrischen Golftrolleys",
      metaTitle: "Ratgeber zu Elektro-Golftrolleys | VerveaceSports",
      description:
        "Kaufberatung, Anleitungen und Pflegetipps für elektrische Golftrolleys, ferngesteuerte Caddys und Lithium-Akkus, geschrieben für Golfer in Kanada.",
      intro:
        "Alles, was wir über das Golfen zu Fuß mit einem Elektro-Trolley geschrieben haben: die Wahl zwischen Fernbedienung, Follow-me und klassischem Elektro-Trolley, die Pflege des Lithium-Akkus im kanadischen Winter und wie Sie das Beste aus einem ferngesteuerten Caddy herausholen.",
      shopLabel: "Elektro-Golftrolleys ansehen",
    },
    "ai-glasses": {
      label: "KI-Brillen",
      title: "Ratgeber zu KI-Sportbrillen und Kamerabrillen",
      metaTitle: "Ratgeber zu KI-Sport- und Kamerabrillen | VerveaceSports",
      description:
        "Ratgeber zu KI-Sportbrillen mit Kamera: POV-Videos filmen, Gläser wählen, Optionen mit Sehstärke und BleeqUp Rover oder Ranger fürs Radfahren und Golfen.",
      intro:
        "Praxisnahe Ratgeber zu Kamerabrillen und KI-Sportbrillen: der Vergleich mit Actioncams, die Wahl der richtigen Gläser, wie Einsätze mit Sehstärke funktionieren und wie Sie Ihren Sport mit BleeqUp Rover und Ranger freihändig filmen.",
      shopLabel: "KI-Sportbrillen ansehen",
    },
  },
  es: {
    golf: {
      label: "Golf",
      title: "Guías de carros de golf eléctricos",
      metaTitle: "Guías de carros de golf eléctricos | VerveaceSports",
      description:
        "Guías de compra, consejos y cuidados para carros de golf eléctricos, carros con mando a distancia y baterías de litio, pensadas para golfistas en Canadá.",
      intro:
        "Todo lo que hemos escrito sobre jugar andando con un carro de golf eléctrico: cómo elegir entre mando a distancia, seguimiento automático o carro eléctrico clásico, cómo cuidar la batería de litio durante el invierno canadiense y cómo sacar el máximo partido a un carro con mando.",
      shopLabel: "Ver carros de golf eléctricos",
    },
    "ai-glasses": {
      label: "Gafas IA",
      title: "Guías de gafas deportivas con IA y gafas con cámara",
      metaTitle: "Guías de gafas deportivas IA y con cámara | VerveaceSports",
      description:
        "Guías sobre gafas deportivas con IA y cámara: grabar vídeo en primera persona, elegir lentes, opciones graduadas y BleeqUp Rover o Ranger para ciclismo y golf.",
      intro:
        "Guías prácticas sobre gafas con cámara y gafas deportivas con IA: cómo se comparan con las cámaras de acción, qué lente elegir, cómo funcionan los insertos graduados y cómo grabar tu deporte sin manos con las BleeqUp Rover y Ranger.",
      shopLabel: "Ver gafas deportivas con IA",
    },
  },
  it: {
    golf: {
      label: "Golf",
      title: "Guide ai carrelli da golf elettrici",
      metaTitle: "Guide ai carrelli da golf elettrici | VerveaceSports",
      description:
        "Guide all'acquisto, consigli e manutenzione per carrelli da golf elettrici, carrelli radiocomandati e batterie al litio, scritte per i golfisti in Canada.",
      intro:
        "Tutto quello che abbiamo scritto sul golf a piedi con un carrello elettrico: come scegliere tra radiocomando, follow-me e carrello elettrico classico, come curare la batteria al litio durante l'inverno canadese e come sfruttare al meglio un carrello radiocomandato.",
      shopLabel: "Scopri i carrelli da golf elettrici",
    },
    "ai-glasses": {
      label: "Occhiali IA",
      title: "Guide agli occhiali sportivi IA e con fotocamera",
      metaTitle: "Guide agli occhiali sportivi IA e camera | VerveaceSports",
      description:
        "Guide agli occhiali sportivi IA con fotocamera: girare video in POV, scegliere le lenti, opzioni graduate e BleeqUp Rover o Ranger per ciclismo e golf.",
      intro:
        "Guide pratiche su occhiali con fotocamera e occhiali sportivi IA: il confronto con le action cam, quale lente scegliere, come funzionano gli inserti graduati e come filmare il tuo sport a mani libere con BleeqUp Rover e Ranger.",
      shopLabel: "Scopri gli occhiali sportivi IA",
    },
  },
  "pt-PT": {
    golf: {
      label: "Golfe",
      title: "Guias de carrinhos de golfe elétricos",
      metaTitle: "Guias de carrinhos de golfe elétricos | VerveaceSports",
      description:
        "Guias de compra, dicas práticas e manutenção de carrinhos de golfe elétricos, carrinhos com comando e baterias de lítio, escritos para golfistas no Canadá.",
      intro:
        "Tudo o que escrevemos sobre jogar golfe a pé com um carrinho elétrico: como escolher entre comando, follow-me e carrinho elétrico clássico, como cuidar da bateria de lítio durante o inverno canadiano e como tirar o máximo partido de um carrinho com comando.",
      shopLabel: "Ver carrinhos de golfe elétricos",
    },
    "ai-glasses": {
      label: "Óculos IA",
      title: "Guias de óculos desportivos IA e óculos com câmara",
      metaTitle: "Guias de óculos desportivos IA e câmara | VerveaceSports",
      description:
        "Guias sobre óculos desportivos IA com câmara: filmar vídeo em POV, escolher lentes, opções graduadas e BleeqUp Rover ou Ranger para ciclismo e golfe.",
      intro:
        "Guias práticos sobre óculos com câmara e óculos desportivos IA: como se comparam com as câmaras de ação, que lente escolher, como funcionam os suportes para lentes graduadas e como filmar o seu desporto sem mãos com os BleeqUp Rover e Ranger.",
      shopLabel: "Ver óculos desportivos IA",
    },
  },
  ja: {
    golf: {
      label: "ゴルフ",
      title: "電動ゴルフトロリーのガイド",
      metaTitle: "電動ゴルフトロリーのガイド | VerveaceSports",
      description:
        "電動ゴルフトロリー、リモコンキャディ、リチウムバッテリーの購入ガイド、使い方、お手入れのコツをカナダのゴルファー向けにまとめました。",
      intro:
        "電動トロリーで歩いてラウンドするための記事をまとめました。リモコン式、フォローミー式、標準的な電動トロリーの選び方、カナダの冬を越すリチウムバッテリーの手入れ、リモコンキャディを使いこなすコツを紹介します。",
      shopLabel: "電動ゴルフトロリーを見る",
    },
    "ai-glasses": {
      label: "AIグラス",
      title: "AIスポーツグラスとカメラグラスのガイド",
      metaTitle: "AIスポーツグラスのガイド | VerveaceSports",
      description:
        "AIスポーツカメラグラスのガイド。POV動画の撮り方、レンズ選び、度付きの選択肢、サイクリングやゴルフ向けのBleeqUp RoverとRangerの比較。",
      intro:
        "カメラグラスとAIスポーツグラスの実用ガイドです。アクションカメラとの比較、ライドに合うレンズ、度付きインサートの仕組み、BleeqUp RoverとRangerでスポーツをハンズフリー撮影する方法を紹介します。",
      shopLabel: "AIスポーツグラスを見る",
    },
  },
  "zh-CN": {
    golf: {
      label: "高尔夫",
      title: "电动高尔夫球车指南",
      metaTitle: "电动高尔夫球车指南 | VerveaceSports",
      description: "为加拿大球友撰写的电动高尔夫球车、遥控球童和锂电池选购指南、使用方法与保养技巧。",
      intro:
        "这里汇集了我们关于推着电动球车步行打球的全部文章：如何在遥控式、跟随式和普通电动球车之间做选择，如何让锂电池安全度过加拿大的冬天，以及如何用好遥控球童。",
      shopLabel: "选购电动高尔夫球车",
    },
    "ai-glasses": {
      label: "AI眼镜",
      title: "AI运动眼镜与摄像眼镜指南",
      metaTitle: "AI运动眼镜与摄像眼镜指南 | VerveaceSports",
      description: "AI运动摄像眼镜指南：第一人称视频拍摄、镜片选择、近视方案，以及骑行和高尔夫场景下BleeqUp Rover与Ranger的对比。",
      intro:
        "关于摄像眼镜和AI运动眼镜的实用指南：与运动相机相比如何、骑行该选哪种镜片、近视镜片支架如何使用，以及如何用BleeqUp Rover和Ranger解放双手拍摄运动。",
      shopLabel: "选购AI运动眼镜",
    },
  },
};

export function blogCategoryInfo(category: BlogCategory): BlogCategoryInfo {
  const info = BLOG_CATEGORIES.find((c) => c.category === category);
  if (!info) throw new Error(`Unknown blog category: ${category}`);
  return info;
}

export function blogCategoryBySlug(slug: string): BlogCategoryInfo | null {
  return BLOG_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function blogCategoryCopy(slug: string, locale: Locale): BlogCategoryCopy {
  const copy = COPY[locale][slug];
  if (!copy) throw new Error(`Missing blog category copy: ${locale} / ${slug}`);
  return copy;
}

export function blogCategoryNavUi(locale: Locale): CategoryNavUi {
  return NAV_UI[locale];
}

/** `/blog/category/{slug}` or `/{locale}/blog/category/{slug}`. */
export function blogCategoryPath(slug: string, locale: Locale = "en"): string {
  return blogPath(locale, `/category/${slug}`);
}

/** Locales where this hub has at least one live post (English first). */
export function blogCategoryLocales(slug: string): Locale[] {
  const info = blogCategoryBySlug(slug);
  if (!info) return [];
  const live = publishedBlogPosts().filter((post) => post.category === info.category);
  return blogLocalesFor().filter((locale) => live.some((post) => localizePost(post, locale) !== null));
}
