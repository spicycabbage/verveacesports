import type { Locale } from "@/lib/i18n/locale";

export type BlogUi = {
  home: string;
  blog: string;
  inThisArticle: string;
  shopThis: string;
  /** `{amount}` is the free-shipping threshold. */
  shippingNote: string;
  keepReading: string;
  readGuide: string;
  faqTitle: string;
  aboutAuthor: string;
  writtenBy: string;
  by: string;
  updated: string;
  /** `{n}` is the minute count. */
  minRead: string;
  indexTitle: string;
  indexDescription: string;
  /** `{name}` is the author. */
  articlesBy: string;
  authorTagline: string;
  authorShortBio: string;
  authorBio: readonly [string, string];
  /** `{name}` is the author. */
  authorMetaTitle: string;
  knowsAbout: string[];
};

const EN: BlogUi = {
  home: "Home",
  blog: "Blog",
  inThisArticle: "In this article",
  shopThis: "Shop this article",
  shippingNote: "Prices in CAD. Free standard shipping over ${amount} CAD.",
  keepReading: "Keep reading",
  readGuide: "Read the guide",
  faqTitle: "Frequently asked questions",
  aboutAuthor: "About the author",
  writtenBy: "Written by",
  by: "By",
  updated: "Updated",
  minRead: "{n} min read",
  indexTitle: "Golf Cart & AI Sports Glasses Guides",
  indexDescription:
    "Buyer's guides and how-tos for electric golf push carts, remote caddies, and AI camera glasses — from Volt Caddy, MGI, Motocaddy, and BleeqUp experts.",
  articlesBy: "Articles by {name}",
  authorTagline: "Tech enthusiast · Golfer · Cyclist",
  authorShortBio:
    "Kim Chen is an avid tech enthusiast, golfer, and cyclist who tests the gear we sell on real courses and real rides.",
  authorBio: [
    "Kim Chen is an avid tech enthusiast, golfer, and cyclist, and writes the VerveaceSports guides.",
    "Most of Kim's weekends are split between walking 18 holes and logging kilometres on the bike, which is exactly where electric golf carts and AI sports glasses earn their keep. Kim's guides focus on what actually matters once the gear is in use: battery life, how a cart handles a steep back nine, and whether camera glasses capture the ride the way you saw it.",
  ],
  authorMetaTitle: "{name}: Golf & Cycling Tech Writer",
  knowsAbout: [
    "Electric golf push carts",
    "Golf",
    "Cycling",
    "AI sports glasses",
    "Camera glasses",
    "Consumer technology",
  ],
};

const UI: Record<Locale, BlogUi> = {
  en: EN,
  nl: {
    home: "Home",
    blog: "Blog",
    inThisArticle: "In dit artikel",
    shopThis: "Shop dit artikel",
    shippingNote: "Prijzen in CAD. Gratis standaardverzending vanaf ${amount} CAD.",
    keepReading: "Lees verder",
    readGuide: "Lees de gids",
    faqTitle: "Veelgestelde vragen",
    aboutAuthor: "Over de auteur",
    writtenBy: "Geschreven door",
    by: "Door",
    updated: "Bijgewerkt",
    minRead: "{n} min lezen",
    indexTitle: "Gidsen voor golfkarren en AI-sportbrillen",
    indexDescription:
      "Koopgidsen voor elektrische golftrolleys, afstandsbediening-caddies en AI-camerabrillen van Volt Caddy, MGI, Motocaddy en BleeqUp.",
    articlesBy: "Artikelen van {name}",
    authorTagline: "Techliefhebber · Golfer · Wielrenner",
    authorShortBio:
      "Kim Chen is een enthousiaste techliefhebber, golfer en wielrenner die de uitrusting test op echte banen en echte ritten.",
    authorBio: [
      "Kim Chen is een enthousiaste techliefhebber, golfer en wielrenner, en schrijft de gidsen van VerveaceSports.",
      "Kim's weekenden zijn verdeeld tussen 18 holes lopen en kilometers op de fiets. Precies daar bewijzen elektrische golftrolleys en AI-sportbrillen hun waarde. De gidsen gaan over wat telt in gebruik: accuduur, hoe een kar een steile back nine pakt, en of een camerabril de rit vastlegt zoals jij hem zag.",
    ],
    authorMetaTitle: "{name}: schrijver over golf- en fietstech",
    knowsAbout: [
      "Elektrische golfkarren",
      "Golf",
      "Wielrennen",
      "AI-sportbrillen",
      "Camerabrillen",
      "Consumententechnologie",
    ],
  },
  fr: {
    home: "Accueil",
    blog: "Blogue",
    inThisArticle: "Dans cet article",
    shopThis: "Magasiner cet article",
    shippingNote: "Prix en CAD. Livraison standard gratuite dès {amount} $ CAD.",
    keepReading: "Continuer la lecture",
    readGuide: "Lire le guide",
    faqTitle: "Questions fréquentes",
    aboutAuthor: "À propos de l'auteur",
    writtenBy: "Écrit par",
    by: "Par",
    updated: "Mis à jour",
    minRead: "{n} min de lecture",
    indexTitle: "Guides chariots de golf et lunettes sport IA",
    indexDescription:
      "Guides d'achat pour chariots de golf électriques, caddies à télécommande et lunettes-caméra IA — Volt Caddy, MGI, Motocaddy et BleeqUp.",
    articlesBy: "Articles de {name}",
    authorTagline: "Passionné de techno · Golfeur · Cycliste",
    authorShortBio:
      "Kim Chen est un passionné de techno, golfeur et cycliste qui teste le matériel sur de vrais parcours et de vraies sorties.",
    authorBio: [
      "Kim Chen est un passionné de techno, golfeur et cycliste, et rédige les guides de VerveaceSports.",
      "Les fins de semaine de Kim se partagent entre 18 trous à pied et des kilomètres à vélo, là où les chariots électriques et les lunettes sport IA prouvent leur utilité. Ses guides portent sur ce qui compte vraiment : l'autonomie, le comportement d'un chariot dans un retour difficile, et si les lunettes-caméra filment la sortie comme vous l'avez vue.",
    ],
    authorMetaTitle: "{name} : rédacteur golf et vélo",
    knowsAbout: [
      "Chariots de golf électriques",
      "Golf",
      "Cyclisme",
      "Lunettes sport IA",
      "Lunettes-caméra",
      "Technologie grand public",
    ],
  },
  de: {
    home: "Start",
    blog: "Blog",
    inThisArticle: "In diesem Artikel",
    shopThis: "Produkte aus diesem Artikel",
    shippingNote: "Preise in CAD. Kostenloser Standardversand ab {amount} CAD.",
    keepReading: "Weiterlesen",
    readGuide: "Ratgeber lesen",
    faqTitle: "Häufige Fragen",
    aboutAuthor: "Über den Autor",
    writtenBy: "Geschrieben von",
    by: "Von",
    updated: "Aktualisiert",
    minRead: "{n} Min. Lesezeit",
    indexTitle: "Ratgeber zu Golftrolleys und KI-Sportbrillen",
    indexDescription:
      "Kaufratgeber zu elektrischen Golftrolleys, Funk-Caddys und KI-Kamerabrillen von Volt Caddy, MGI, Motocaddy und BleeqUp.",
    articlesBy: "Artikel von {name}",
    authorTagline: "Technikfan · Golfer · Radfahrer",
    authorShortBio:
      "Kim Chen ist Technikfan, Golfer und Radfahrer und testet die Ausrüstung auf echten Plätzen und echten Touren.",
    authorBio: [
      "Kim Chen ist Technikfan, Golfer und Radfahrer und schreibt die Ratgeber von VerveaceSports.",
      "Kims Wochenenden teilen sich zwischen 18 Löchern zu Fuß und Kilometern auf dem Rad. Genau dort zeigen elektrische Golftrolleys und KI-Sportbrillen, was sie können. Die Ratgeber behandeln, was im Einsatz zählt: Akkulaufzeit, Steigungen und ob die Kamerabrille die Fahrt so festhält, wie du sie gesehen hast.",
    ],
    authorMetaTitle: "{name}: Autor für Golf- und Radtechnik",
    knowsAbout: [
      "Elektrische Golftrolleys",
      "Golf",
      "Radsport",
      "KI-Sportbrillen",
      "Kamerabrillen",
      "Konsumententechnik",
    ],
  },
  es: {
    home: "Inicio",
    blog: "Blog",
    inThisArticle: "En este artículo",
    shopThis: "Comprar lo de este artículo",
    shippingNote: "Precios en CAD. Envío estándar gratis a partir de {amount} CAD.",
    keepReading: "Sigue leyendo",
    readGuide: "Leer la guía",
    faqTitle: "Preguntas frecuentes",
    aboutAuthor: "Sobre el autor",
    writtenBy: "Escrito por",
    by: "Por",
    updated: "Actualizado",
    minRead: "{n} min de lectura",
    indexTitle: "Guías de carros de golf y gafas deportivas con IA",
    indexDescription:
      "Guías de compra de carros de golf eléctricos, caddies con mando y gafas cámara con IA de Volt Caddy, MGI, Motocaddy y BleeqUp.",
    articlesBy: "Artículos de {name}",
    authorTagline: "Entusiasta de la tecnología · Golfista · Ciclista",
    authorShortBio:
      "Kim Chen es un entusiasta de la tecnología, golfista y ciclista que prueba el equipo en campos y rutas reales.",
    authorBio: [
      "Kim Chen es un entusiasta de la tecnología, golfista y ciclista, y escribe las guías de VerveaceSports.",
      "Los fines de semana de Kim se reparten entre caminar 18 hoyos y sumar kilómetros en bici, justo donde un carro eléctrico y unas gafas deportivas con IA demuestran para qué sirven. Sus guías se centran en lo que importa al usarlos: autonomía, cómo sube un carro una vuelta exigente y si las gafas cámara graban la ruta como tú la viste.",
    ],
    authorMetaTitle: "{name}: autor de tecnología para golf y ciclismo",
    knowsAbout: [
      "Carros de golf eléctricos",
      "Golf",
      "Ciclismo",
      "Gafas deportivas con IA",
      "Gafas cámara",
      "Tecnología de consumo",
    ],
  },
  it: {
    home: "Home",
    blog: "Blog",
    inThisArticle: "In questo articolo",
    shopThis: "Acquista da questo articolo",
    shippingNote: "Prezzi in CAD. Spedizione standard gratuita oltre {amount} CAD.",
    keepReading: "Continua a leggere",
    readGuide: "Leggi la guida",
    faqTitle: "Domande frequenti",
    aboutAuthor: "Sull'autore",
    writtenBy: "Scritto da",
    by: "Di",
    updated: "Aggiornato",
    minRead: "{n} min di lettura",
    indexTitle: "Guide a carrelli da golf e occhiali sportivi con IA",
    indexDescription:
      "Guide all'acquisto di carrelli da golf elettrici, caddy telecomandati e occhiali camera con IA di Volt Caddy, MGI, Motocaddy e BleeqUp.",
    articlesBy: "Articoli di {name}",
    authorTagline: "Appassionato di tecnologia · Golfista · Ciclista",
    authorShortBio:
      "Kim Chen è un appassionato di tecnologia, golfista e ciclista che prova l'attrezzatura su campi e uscite vere.",
    authorBio: [
      "Kim Chen è un appassionato di tecnologia, golfista e ciclista, e scrive le guide di VerveaceSports.",
      "I fine settimana di Kim si dividono tra 18 buche a piedi e chilometri in bici, proprio dove carrelli elettrici e occhiali sportivi con IA si fanno valere. Le guide parlano di ciò che conta nell'uso: autonomia, come un carrello affronta un rientro ripido e se gli occhiali camera riprendono l'uscita come l'hai vista tu.",
    ],
    authorMetaTitle: "{name}: autore di tech per golf e ciclismo",
    knowsAbout: [
      "Carrelli da golf elettrici",
      "Golf",
      "Ciclismo",
      "Occhiali sportivi con IA",
      "Occhiali camera",
      "Tecnologia di consumo",
    ],
  },
  "pt-PT": {
    home: "Início",
    blog: "Blogue",
    inThisArticle: "Neste artigo",
    shopThis: "Comprar deste artigo",
    shippingNote: "Preços em CAD. Portes standard grátis acima de {amount} CAD.",
    keepReading: "Continuar a ler",
    readGuide: "Ler o guia",
    faqTitle: "Perguntas frequentes",
    aboutAuthor: "Sobre o autor",
    writtenBy: "Escrito por",
    by: "Por",
    updated: "Atualizado",
    minRead: "{n} min de leitura",
    indexTitle: "Guias de trolleys de golfe e óculos desportivos com IA",
    indexDescription:
      "Guias de compra de trolleys de golfe elétricos, caddies com comando e óculos-câmara com IA da Volt Caddy, MGI, Motocaddy e BleeqUp.",
    articlesBy: "Artigos de {name}",
    authorTagline: "Entusiasta de tecnologia · Golfista · Ciclista",
    authorShortBio:
      "Kim Chen é um entusiasta de tecnologia, golfista e ciclista que testa o equipamento em campos e voltas reais.",
    authorBio: [
      "Kim Chen é um entusiasta de tecnologia, golfista e ciclista, e escreve os guias da VerveaceSports.",
      "Os fins de semana do Kim dividem-se entre caminhar 18 buracos e somar quilómetros de bicicleta, exatamente onde um trolley elétrico e uns óculos desportivos com IA mostram o seu valor. Os guias focam o que importa no uso: autonomia, como um trolley sobe um regresso íngreme e se os óculos-câmara filmam a volta como a viu.",
    ],
    authorMetaTitle: "{name}: autor de tecnologia para golfe e ciclismo",
    knowsAbout: [
      "Trolleys de golfe elétricos",
      "Golfe",
      "Ciclismo",
      "Óculos desportivos com IA",
      "Óculos-câmara",
      "Tecnologia de consumo",
    ],
  },
  ja: {
    home: "ホーム",
    blog: "ブログ",
    inThisArticle: "この記事の内容",
    shopThis: "この記事の商品",
    shippingNote: "価格はカナダドルです。{amount} CAD以上で通常配送が無料です。",
    keepReading: "あわせて読む",
    readGuide: "ガイドを読む",
    faqTitle: "よくある質問",
    aboutAuthor: "著者について",
    writtenBy: "執筆",
    by: "著者",
    updated: "更新",
    minRead: "読了目安 {n} 分",
    indexTitle: "電動ゴルフカートとAIスポーツグラスのガイド",
    indexDescription:
      "電動ゴルフカート、リモコンキャディ、AIカメラグラスの買い方。Volt Caddy、MGI、Motocaddy、BleeqUpを実際に使う視点で解説します。",
    articlesBy: "{name}の記事",
    authorTagline: "テック好き · ゴルファー · サイクリスト",
    authorShortBio:
      "Kim Chenはテック好きのゴルファー兼サイクリストで、売っているギアを実際のコースとライドで試しています。",
    authorBio: [
      "Kim Chenはテック好きのゴルファー兼サイクリストで、VerveaceSportsのガイドを書いています。",
      "週末は18ホールを歩くか、バイクで距離を踏むかのどちらかです。電動ゴルフカートとAIスポーツグラスの価値が出るのはまさにそこです。ガイドで扱うのは使ってわかる点です。バッテリーの持ち、急な戻りホールでの挙動、そしてカメラグラスが自分の見た通りに撮れるかどうか。",
    ],
    authorMetaTitle: "{name}：ゴルフとサイクリングのテックライター",
    knowsAbout: [
      "電動ゴルフカート",
      "ゴルフ",
      "サイクリング",
      "AIスポーツグラス",
      "カメラグラス",
      "コンシューマーテクノロジー",
    ],
  },
  "zh-CN": {
    home: "首页",
    blog: "博客",
    inThisArticle: "本文目录",
    shopThis: "文中提到的商品",
    shippingNote: "价格为加元。满 {amount} 加元免标准运费。",
    keepReading: "继续阅读",
    readGuide: "阅读指南",
    faqTitle: "常见问题",
    aboutAuthor: "关于作者",
    writtenBy: "作者",
    by: "作者",
    updated: "更新于",
    minRead: "阅读约 {n} 分钟",
    indexTitle: "电动高尔夫球车与 AI 运动眼镜指南",
    indexDescription:
      "电动高尔夫球车、遥控球童和 AI 摄像眼镜选购指南，涵盖 Volt Caddy、MGI、Motocaddy 与 BleeqUp。",
    articlesBy: "{name}的文章",
    authorTagline: "科技爱好者 · 高尔夫球手 · 骑行者",
    authorShortBio: "Kim Chen 是热爱科技的高尔夫球手和骑行者，会在真实球场和真实路段上试用我们销售的装备。",
    authorBio: [
      "Kim Chen 是热爱科技的高尔夫球手和骑行者，负责撰写 VerveaceSports 的指南。",
      "Kim 的周末不是步行打完 18 洞，就是在车上累计公里数。电动高尔夫球车和 AI 运动眼镜的价值，正是在这些时候体现出来。指南关注真正用起来才重要的事：续航、球车上坡和下坡的表现，以及摄像眼镜拍出来的是不是你亲眼看到的那一段。",
    ],
    authorMetaTitle: "{name}：高尔夫与骑行科技作者",
    knowsAbout: ["电动高尔夫球车", "高尔夫", "骑行", "AI 运动眼镜", "摄像眼镜", "消费电子"],
  },
};

export function blogUi(locale: Locale): BlogUi {
  return UI[locale];
}
