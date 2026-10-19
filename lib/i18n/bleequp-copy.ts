import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import {
  BLEEQUUP_CREATOR_REVIEWS,
  BLEEQUUP_FEATURE_VIDEOS,
  BLEEQUUP_HERO,
  BLEEQUUP_PROMOS,
  BLEEQUUP_SETUP_VIDEO,
  BLEEQUUP_TESTIMONIALS,
} from "@/lib/content/bleequp-ai-glasses";

export type LocalizedPromo = { label: string; detail: string };
export type LocalizedVideoText = { tag?: string; title: string; description?: string };

type HeroCopy = { title: string; subtitle: string };
type SetupCopy = { title: string; description: string };
type PressQuote = { outlet: string; quote: string };

const PRESS_EN: PressQuote[] = [
  {
    outlet: "WIRED",
    quote:
      "The arms of the glasses have speakers so you can play music, and they sounded pretty good in brief demo in a very loud space.",
  },
  {
    outlet: "Lifehacker",
    quote:
      "BleeqUp Ranger sport glasses pack a 1080p/3K camera, open-ear audio, and turn-by-turn navigation into a stylish pair of cycling shades.",
  },
  {
    outlet: "Notebookcheck",
    quote:
      "At under 50g, the Ranger is light enough that you stop noticing it after a few minutes. The camera shoots up to 3K at 60fps.",
  },
];

const SOURCE_VIDEOS = [...BLEEQUUP_FEATURE_VIDEOS, ...BLEEQUUP_TESTIMONIALS];

const HERO: Partial<Record<Locale, HeroCopy>> = {
  fr: {
    title: "Lunettes-caméra de sport IA BleeqUp Ranger",
    subtitle:
      "Lunettes intelligentes 4-in-1 — caméra, audio à oreilles libres, protection UV et verres prêts pour la correction. Filmez en POV mains libres, en mouvement.",
  },
  de: {
    title: "BleeqUp Ranger KI-Sportkamerabrille",
    subtitle:
      "4-in-1 Smart-Brille — Kamera, Open-Ear-Audio, UV-Schutz und brillengerechte Gläser. Nimm POV-Aufnahmen freihändig auf, während du dich bewegst.",
  },
  nl: {
    title: "BleeqUp Ranger AI-sportcamerabril",
    subtitle:
      "4-in-1 slimme bril — camera, open-ear-audio, UV-bescherming en brillenglazen klaar voor sterkte. Film POV handsfree terwijl je beweegt.",
  },
  es: {
    title: "Gafas cámara deportiva IA BleeqUp Ranger",
    subtitle:
      "Gafas inteligentes 4-in-1 — cámara, audio de oído abierto, protección UV y lentes listas para graduación. Graba en POV manos libres mientras te mueves.",
  },
  it: {
    title: "Occhiali sportivi con fotocamera IA BleeqUp Ranger",
    subtitle:
      "Occhiali smart 4-in-1 — fotocamera, audio open-ear, protezione UV e lenti pronte per la correzione. Riprendi in POV a mani libere mentre ti muovi.",
  },
  "pt-PT": {
    title: "Óculos-câmara desportivos IA BleeqUp Ranger",
    subtitle:
      "Óculos inteligentes 4-in-1 — câmara, áudio open-ear, proteção UV e lentes prontas para graduação. Filme em POV sem usar as mãos enquanto se move.",
  },
  ja: {
    title: "BleeqUp Ranger AIスポーツカメラグラス",
    subtitle:
      "4-in-1スマートアイウェア — カメラ、オープンイヤーオーディオ、UVカット、度付き対応レンズ。動きながらハンズフリーでPOV映像を撮影。",
  },
  "zh-CN": {
    title: "BleeqUp Ranger AI 运动摄像眼镜",
    subtitle:
      "4-in-1 智能眼镜 — 相机、开放式音频、UV 防护，以及可配度数镜片。运动中免持拍摄 POV 画面。",
  },
};

const PROMOS: Partial<Record<Locale, LocalizedPromo[]>> = {
  fr: [
    { label: "Design 4-in-1", detail: "Caméra · Audio · UV · Verres RX" },
    { label: "Champ de vision 120° à hauteur des yeux", detail: "Véritable perspective POV" },
    { label: "Montage IA", detail: "Temps forts automatiques à partir de vos clips" },
    { label: "Revendeur agréé", detail: "Partenaire officiel BleeqUp" },
  ],
  de: [
    { label: "4-in-1-Design", detail: "Kamera · Audio · UV · RX-Gläser" },
    { label: "120° Blickfeld auf Augenhöhe", detail: "Echte POV-Perspektive" },
    { label: "KI-Schnitt", detail: "Automatische Highlights aus deinen Clips" },
    { label: "Autorisierter Händler", detail: "Offizieller BleeqUp-Partner" },
  ],
  nl: [
    { label: "4-in-1-ontwerp", detail: "Camera · Audio · UV · RX-glazen" },
    { label: "120° gezichtsveld op ooghoogte", detail: "Echt POV-perspectief" },
    { label: "AI-montage", detail: "Automatische highlights uit je clips" },
    { label: "Erkende verkoper", detail: "Officiële BleeqUp-partner" },
  ],
  es: [
    { label: "Diseño 4-in-1", detail: "Cámara · Audio · UV · Lentes RX" },
    { label: "FOV 120° a la altura de los ojos", detail: "Verdadera perspectiva POV" },
    { label: "Edición IA", detail: "Destacados automáticos de tus clips" },
    { label: "Distribuidor autorizado", detail: "Partner oficial BleeqUp" },
  ],
  it: [
    { label: "Design 4-in-1", detail: "Fotocamera · Audio · UV · Lenti RX" },
    { label: "FOV 120° all'altezza degli occhi", detail: "Vera prospettiva POV" },
    { label: "Montaggio IA", detail: "Highlight automatici dai tuoi clip" },
    { label: "Rivenditore autorizzato", detail: "Partner ufficiale BleeqUp" },
  ],
  "pt-PT": [
    { label: "Design 4-in-1", detail: "Câmara · Áudio · UV · Lentes RX" },
    { label: "FOV 120° à altura dos olhos", detail: "Verdadeira perspetiva POV" },
    { label: "Edição IA", detail: "Destaques automáticos a partir dos seus clips" },
    { label: "Revendedor autorizado", detail: "Parceiro oficial BleeqUp" },
  ],
  ja: [
    { label: "4-in-1デザイン", detail: "カメラ · オーディオ · UV · RXレンズ" },
    { label: "視線の高さで120° FOV", detail: "本物のPOV視点" },
    { label: "AI編集", detail: "クリップからハイライトを自動抽出" },
    { label: "正規販売店", detail: "公式BleeqUpパートナー" },
  ],
  "zh-CN": [
    { label: "4-in-1 设计", detail: "相机 · 音频 · UV · RX 镜片" },
    { label: "视线高度 120° FOV", detail: "真实 POV 视角" },
    { label: "AI 剪辑", detail: "从片段自动提取精彩镜头" },
    { label: "授权零售商", detail: "官方 BleeqUp 合作伙伴" },
  ],
};

const VIDEO_TEXT: Partial<Record<Locale, Record<string, LocalizedVideoText>>> = {
  fr: {
    "9e8a190539d5437c9c118137f12a5c34": {
      title: "Explorer et partir à l'aventure avec Ranger",
      description: "Découvrez le Ranger en action dans les sports et les aventures en plein air.",
    },
    "12fd2385af704bd9a8a921f7e93a5873": {
      title: "Clair. Fluide. Dans vos lunettes",
      description: "Des images stabilisées qui restent naturelles — directement depuis vos lunettes.",
    },
    "47c2ea808ab04240bb2c26d57c09ed6b": {
      tag: "Champ de vision 120° à hauteur des yeux",
      title: "Tout ce que vous voyez, rien n'est laissé de côté",
      description:
        "Un champ de 120° à hauteur des yeux — ce que vous filmez reste fidèle à ce que vous avez vraiment vu.",
    },
    "1a6ade7df07f47be91da148abc691dd5": {
      tag: "Stabilisation EIS",
      title: "Quand vous bougez, ça tient",
      description: "La stabilisation électronique d'image garde vos séquences fluides à chaque mouvement.",
    },
    "5087f01ced1447b9876c7b07373fafce": {
      tag: "Changement de format",
      title: "Prêt à être publié",
      description: "Passez du paysage au portrait en cours de route — chaque plan est prêt à partager.",
    },
    "8fd49ec29d6a4255a51b2fe7ea19ee42": {
      title: "Gardez l'essentiel",
      description: "L'enregistrement en boucle conserve les moments qui comptent sans remplir le stockage.",
    },
    a660a6ef1bcc44e6bfdd1453a21a3662: {
      tag: "Superposition de données",
      title: "Maintenant, ça raconte toute l'histoire",
      description: "Vitesse, distance et stats intégrées automatiquement à vos images.",
    },
    cde4f9d8d188415fb8dd7401ded38942: {
      tag: "AI Master Motion (BETA)",
      title: "Une équipe à vous seul",
      description: "Des effets de mouvement générés par l'IA transforment un seul clip en images cinématographiques.",
    },
    "0b58f6ff56b5436bb69f9e16d7b15d99": {
      tag: "AI Master Remix (BETA)",
      title: "La même photo. Une autre histoire",
      description: "Remixez vos photos en nouvelles histoires visuelles avec l'IA.",
    },
    a69904470cc64080bbb86ec72a85d7cc: {
      title: "Ça capte les moments — puis les monte.",
      description: "L'IA choisit les temps forts et assemble des clips prêts à partager à partir de votre journée.",
    },
    eee10c38eeb74cec9a65a5b3796f5af1: {
      title: "Conscient et à l'écoute",
      description: "L'audio à oreilles libres vous garde connecté à votre environnement.",
    },
    "10b848bc446740a7874e92f06e1ba090": {
      title: "Connecté sans limites",
      description: "Appariez l'appli BleeqUp pour la vue en direct, les réglages et le partage.",
    },
    "12fe6e3576304c69b61fbbc66d227d1e": {
      title: "Pshepfpv",
      description:
        "Même en carving et en descente, les lunettes sont restées légères et stables — chaque moment est sorti fluide.",
    },
    "3d1158472e4d467ab9dbe510dea6d88d": {
      title: "Aprilanddaveyfamily",
      description:
        "La vue à la première personne me permet de revoir chaque échange exactement comme je l'ai vu sur le terrain.",
    },
    add0713170824bc8b0aeede7af7cb318: {
      title: "Hey.vanessa.renee",
      description:
        "Les lunettes ont capté chaque pas et chaque ciel à couper le souffle, avec une clarté stable et vive.",
    },
    abb6633d6bcc42df98f56c30162cc38b: {
      title: "Journalofluke",
      description:
        "Même en sautant, les lunettes sont restées stables et confortables — les images sont sorties fluides à chaque fois.",
    },
    "4908d9062d984d5db5f2510089181454": {
      title: "Toni.florentina",
      description:
        "En entraînement avec mon cheval, les lunettes sont restées confortables et stables — captant chaque progrès en chemin.",
    },
    e55483a47cbe4d7eb1439090f77242ac: {
      title: "Lukemizel",
      description:
        "Même sur le trampoline, les lunettes tenaient bien et les images restaient fluides — je n'avais rien à craindre.",
    },
  },
  de: {
    "9e8a190539d5437c9c118137f12a5c34": {
      title: "Entdecken und Abenteuer mit Ranger",
      description: "Sieh den Ranger in Aktion bei Sport und Outdoor-Abenteuern.",
    },
    "12fd2385af704bd9a8a921f7e93a5873": {
      title: "Klar. Flüssig. In der Brille",
      description: "Stabilisiertes Bildmaterial, das natürlich wirkt — direkt aus deiner Brille.",
    },
    "47c2ea808ab04240bb2c26d57c09ed6b": {
      tag: "120° Blickfeld auf Augenhöhe",
      title: "Alles, was du siehst, nichts ausgelassen",
      description:
        "Ein 120°-Blick auf Augenhöhe — was du aufnimmst, bleibt nah an dem, wie du es wirklich gesehen hast.",
    },
    "1a6ade7df07f47be91da148abc691dd5": {
      tag: "EIS-Stabilisierung",
      title: "Wenn du dich bewegst, hält sie",
      description: "Elektronische Bildstabilisierung hält das Bild bei jeder Bewegung flüssig.",
    },
    "5087f01ced1447b9876c7b07373fafce": {
      tag: "Seitenverhältnis wechseln",
      title: "Gemacht zum Posten",
      description: "Wechsle unterwegs zwischen Quer- und Hochformat — jeder Shot ist teilbereit.",
    },
    "8fd49ec29d6a4255a51b2fe7ea19ee42": {
      title: "Behalte, was zählt",
      description: "Loop-Aufnahme speichert die wichtigen Momente, ohne den Speicher zu füllen.",
    },
    a660a6ef1bcc44e6bfdd1453a21a3662: {
      tag: "Daten-Overlay",
      title: "Jetzt erzählt es die ganze Geschichte",
      description: "Tempo, Distanz und Stats werden automatisch ins Bildmaterial geschrieben.",
    },
    cde4f9d8d188415fb8dd7401ded38942: {
      tag: "AI Master Motion (BETA)",
      title: "Ein Team aus einem",
      description: "KI-generierte Motion-Effekte machen aus einem Clip cineastisches Material.",
    },
    "0b58f6ff56b5436bb69f9e16d7b15d99": {
      tag: "AI Master Remix (BETA)",
      title: "Dasselbe Foto. Eine andere Geschichte",
      description: "Remixe Standbilder mit KI zu neuen visuellen Stories.",
    },
    a69904470cc64080bbb86ec72a85d7cc: {
      title: "Es fängt Momente — und schneidet sie dann.",
      description: "Die KI wählt Highlights und baut teilbereite Clips aus deinem Tag.",
    },
    eee10c38eeb74cec9a65a5b3796f5af1: {
      title: "Aufmerksam und im Einklang",
      description: "Open-Ear-Audio hält dich mit deiner Umgebung verbunden.",
    },
    "10b848bc446740a7874e92f06e1ba090": {
      title: "Verbunden ohne Grenzen",
      description: "Kopple die BleeqUp-App für Live-Ansicht, Einstellungen und Teilen.",
    },
    "12fe6e3576304c69b61fbbc66d227d1e": {
      title: "Pshepfpv",
      description:
        "Selbst beim Carven und Cruisen blieb die Brille leicht und ruhig — jeder Moment kam flüssig raus.",
    },
    "3d1158472e4d467ab9dbe510dea6d88d": {
      title: "Aprilanddaveyfamily",
      description:
        "Die First-Person-Ansicht lässt mich jeden Schlag genau so nachspielen, wie ich ihn auf dem Court gesehen habe.",
    },
    add0713170824bc8b0aeede7af7cb318: {
      title: "Hey.vanessa.renee",
      description:
        "Die Brille hat jeden Schritt und jeden atemberaubenden Himmel mit ruhiger, lebendiger Klarheit festgehalten.",
    },
    abb6633d6bcc42df98f56c30162cc38b: {
      title: "Journalofluke",
      description:
        "Selbst beim Springen blieb die Brille ruhig und bequem — das Bildmaterial kam jedes Mal flüssig raus.",
    },
    "4908d9062d984d5db5f2510089181454": {
      title: "Toni.florentina",
      description:
        "Beim Training mit meinem Pferd blieb die Brille bequem und ruhig — und hat jeden Fortschritt festgehalten.",
    },
    e55483a47cbe4d7eb1439090f77242ac: {
      title: "Lukemizel",
      description:
        "Selbst auf dem Trampolin saß die Brille fest und das Bild blieb flüssig — ich musste mir um nichts Sorgen machen.",
    },
  },
  nl: {
    "9e8a190539d5437c9c118137f12a5c34": {
      title: "Ontdekken en avontuur met Ranger",
      description: "Zie de Ranger in actie bij sport en outdooravonturen.",
    },
    "12fd2385af704bd9a8a921f7e93a5873": {
      title: "Helder. Vloeiend. In een bril",
      description: "Gestabiliseerde beelden die natuurlijk ogen — rechtstreeks vanuit je bril.",
    },
    "47c2ea808ab04240bb2c26d57c09ed6b": {
      tag: "120° gezichtsveld op ooghoogte",
      title: "Alles wat je ziet, niets weggelaten",
      description:
        "Een 120°-beeld op ooghoogte — wat je vastlegt blijft dicht bij hoe je het écht zag.",
    },
    "1a6ade7df07f47be91da148abc691dd5": {
      tag: "EIS-stabilisatie",
      title: "Als jij beweegt, blijft hij stabiel",
      description: "Elektronische beeldstabilisatie houdt beelden vloeiend bij elke beweging.",
    },
    "5087f01ced1447b9876c7b07373fafce": {
      tag: "Beeldverhouding wisselen",
      title: "Gemaakt om te posten",
      description: "Wissel onderweg tussen landscape en portrait — elke shot klaar om te delen.",
    },
    "8fd49ec29d6a4255a51b2fe7ea19ee42": {
      title: "Bewaar wat ertoe doet",
      description: "Loop-opname bewaart de momenten die tellen zonder de opslag vol te zetten.",
    },
    a660a6ef1bcc44e6bfdd1453a21a3662: {
      tag: "Data-overlay",
      title: "Nu vertelt het het hele verhaal",
      description: "Snelheid, afstand en stats automatisch in je beelden.",
    },
    cde4f9d8d188415fb8dd7401ded38942: {
      tag: "AI Master Motion (BETA)",
      title: "Een crew van één",
      description: "AI-gegenereerde motion-effecten maken van één clip cinematische beelden.",
    },
    "0b58f6ff56b5436bb69f9e16d7b15d99": {
      tag: "AI Master Remix (BETA)",
      title: "Dezelfde foto. Een ander verhaal",
      description: "Remix stills tot nieuwe visuele verhalen met AI.",
    },
    a69904470cc64080bbb86ec72a85d7cc: {
      title: "Het vangt momenten — en monteert ze daarna.",
      description: "AI kiest highlights en zet deelklare clips in elkaar van je dag.",
    },
    eee10c38eeb74cec9a65a5b3796f5af1: {
      title: "Alert en in tune",
      description: "Open-ear-audio houdt je verbonden met je omgeving.",
    },
    "10b848bc446740a7874e92f06e1ba090": {
      title: "Verbonden zonder grenzen",
      description: "Koppel de BleeqUp-app voor live view, instellingen en delen.",
    },
    "12fe6e3576304c69b61fbbc66d227d1e": {
      title: "Pshepfpv",
      description:
        "Zelfs tijdens carving en cruisen bleef de bril licht en stabiel — elk moment kwam vloeiend uit.",
    },
    "3d1158472e4d467ab9dbe510dea6d88d": {
      title: "Aprilanddaveyfamily",
      description:
        "Het first-personbeeld laat me elke slag terugkijken precies zoals ik die op de baan zag.",
    },
    add0713170824bc8b0aeede7af7cb318: {
      title: "Hey.vanessa.renee",
      description:
        "De bril ving elke stap en elk adembenemend luchtzicht met stabiele, levendige helderheid.",
    },
    abb6633d6bcc42df98f56c30162cc38b: {
      title: "Journalofluke",
      description:
        "Zelfs terwijl ik sprong, bleef de bril stabiel en comfortabel — de beelden kwamen elke keer vloeiend uit.",
    },
    "4908d9062d984d5db5f2510089181454": {
      title: "Toni.florentina",
      description:
        "Tijdens de training met mijn paard bleef de bril comfortabel en stabiel — en legde elke vooruitgang vast.",
    },
    e55483a47cbe4d7eb1439090f77242ac: {
      title: "Lukemizel",
      description:
        "Zelfs op de trampoline zat de bril vast en bleven de beelden vloeiend — ik hoefde nergens aan te denken.",
    },
  },
  es: {
    "9e8a190539d5437c9c118137f12a5c34": {
      title: "Explora y aventúrate con Ranger",
      description: "Mira el Ranger en acción en deportes y aventuras al aire libre.",
    },
    "12fd2385af704bd9a8a921f7e93a5873": {
      title: "Nítido. Fluido. En unas gafas",
      description: "Imagen estabilizada que se ve natural — justo desde tus gafas.",
    },
    "47c2ea808ab04240bb2c26d57c09ed6b": {
      tag: "FOV 120° a la altura de los ojos",
      title: "Todo lo que ves, nada se queda fuera",
      description:
        "Una vista de 120° a la altura de los ojos — lo que grabas se mantiene cerca de cómo lo viste de verdad.",
    },
    "1a6ade7df07f47be91da148abc691dd5": {
      tag: "Estabilización EIS",
      title: "Cuando te mueves, se mantiene",
      description: "La estabilización electrónica de imagen mantiene el metraje fluido en cada movimiento.",
    },
    "5087f01ced1447b9876c7b07373fafce": {
      tag: "Cambio de relación de aspecto",
      title: "Hecho para publicarse",
      description: "Cambia entre horizontal y vertical sobre la marcha — cada toma lista para compartir.",
    },
    "8fd49ec29d6a4255a51b2fe7ea19ee42": {
      title: "Quédate con lo que importa",
      description: "La grabación en bucle guarda los momentos que importan sin llenar el almacenamiento.",
    },
    a660a6ef1bcc44e6bfdd1453a21a3662: {
      tag: "Superposición de datos",
      title: "Ahora cuenta la historia completa",
      description: "Velocidad, distancia y estadísticas integradas en tu metraje automáticamente.",
    },
    cde4f9d8d188415fb8dd7401ded38942: {
      tag: "AI Master Motion (BETA)",
      title: "Un equipo de uno",
      description: "Efectos de movimiento generados por IA convierten un solo clip en metraje cinematográfico.",
    },
    "0b58f6ff56b5436bb69f9e16d7b15d99": {
      tag: "AI Master Remix (BETA)",
      title: "La misma foto. Otra historia",
      description: "Remezcla fotos fijas en nuevas historias visuales con IA.",
    },
    a69904470cc64080bbb86ec72a85d7cc: {
      title: "Captura los momentos — y luego los edita.",
      description: "La IA elige los destacados y monta clips listos para compartir de tu día.",
    },
    eee10c38eeb74cec9a65a5b3796f5af1: {
      title: "Atento y en sintonía",
      description: "El audio de oído abierto te mantiene conectado con tu entorno.",
    },
    "10b848bc446740a7874e92f06e1ba090": {
      title: "Conectado sin límites",
      description: "Empareja la app BleeqUp para vista en vivo, ajustes y compartir.",
    },
    "12fe6e3576304c69b61fbbc66d227d1e": {
      title: "Pshepfpv",
      description:
        "Incluso tallando y recorriendo, las gafas se mantuvieron ligeras y estables — cada momento salió fluido.",
    },
    "3d1158472e4d467ab9dbe510dea6d88d": {
      title: "Aprilanddaveyfamily",
      description:
        "La vista en primera persona me deja repetir cada golpe tal como lo vi en la pista.",
    },
    add0713170824bc8b0aeede7af7cb318: {
      title: "Hey.vanessa.renee",
      description:
        "Las gafas captaron cada paso y cada cielo impresionante con una claridad estable y vivida.",
    },
    abb6633d6bcc42df98f56c30162cc38b: {
      title: "Journalofluke",
      description:
        "Incluso al saltar, las gafas se mantuvieron estables y cómodas — el metraje salió fluido cada vez.",
    },
    "4908d9062d984d5db5f2510089181454": {
      title: "Toni.florentina",
      description:
        "Entrenando con mi caballo, las gafas se mantuvieron cómodas y estables — captando cada avance por el camino.",
    },
    e55483a47cbe4d7eb1439090f77242ac: {
      title: "Lukemizel",
      description:
        "Incluso en el trampolín, las gafas iban seguras y el metraje salió fluido — no tuve que preocuparme de nada.",
    },
  },
  it: {
    "9e8a190539d5437c9c118137f12a5c34": {
      title: "Esplora e vivi l'avventura con Ranger",
      description: "Guarda il Ranger in azione tra sport e avventure all'aperto.",
    },
    "12fd2385af704bd9a8a921f7e93a5873": {
      title: "Nitido. Fluido. Negli occhiali",
      description: "Riprese stabilizzate che restano naturali — direttamente dai tuoi occhiali.",
    },
    "47c2ea808ab04240bb2c26d57c09ed6b": {
      tag: "FOV 120° all'altezza degli occhi",
      title: "Tutto quello che vedi, niente escluso",
      description:
        "Una vista a 120° all'altezza degli occhi — ciò che riprendi resta vicino a come lo hai visto davvero.",
    },
    "1a6ade7df07f47be91da148abc691dd5": {
      tag: "Stabilizzazione EIS",
      title: "Quando ti muovi, tiene",
      description: "La stabilizzazione elettronica dell'immagine mantiene le riprese fluide a ogni movimento.",
    },
    "5087f01ced1447b9876c7b07373fafce": {
      tag: "Cambio formato",
      title: "Fatto per essere pubblicato",
      description: "Passa da orizzontale a verticale in movimento — ogni inquadratura pronta da condividere.",
    },
    "8fd49ec29d6a4255a51b2fe7ea19ee42": {
      title: "Tieni ciò che conta",
      description: "La registrazione in loop salva i momenti che contano senza riempire lo storage.",
    },
    a660a6ef1bcc44e6bfdd1453a21a3662: {
      tag: "Overlay dati",
      title: "Ora racconta tutta la storia",
      description: "Velocità, distanza e statistiche integrate automaticamente nelle riprese.",
    },
    cde4f9d8d188415fb8dd7401ded38942: {
      tag: "AI Master Motion (BETA)",
      title: "Una crew di uno",
      description: "Effetti di movimento generati dall'IA trasformano un singolo clip in riprese cinematografiche.",
    },
    "0b58f6ff56b5436bb69f9e16d7b15d99": {
      tag: "AI Master Remix (BETA)",
      title: "La stessa foto. Una storia diversa",
      description: "Remix still in nuove storie visive con l'IA.",
    },
    a69904470cc64080bbb86ec72a85d7cc: {
      title: "Cattura i momenti — poi li monta.",
      description: "L'IA sceglie gli highlight e assembla clip pronti da condividere dalla tua giornata.",
    },
    eee10c38eeb74cec9a65a5b3796f5af1: {
      title: "Consapevole e in sintonia",
      description: "L'audio open-ear ti tiene connesso all'ambiente intorno a te.",
    },
    "10b848bc446740a7874e92f06e1ba090": {
      title: "Connesso senza limiti",
      description: "Associa l'app BleeqUp per live view, impostazioni e condivisione.",
    },
    "12fe6e3576304c69b61fbbc66d227d1e": {
      title: "Pshepfpv",
      description:
        "Anche in carving e cruising, gli occhiali sono rimasti leggeri e stabili — ogni momento è uscito fluido.",
    },
    "3d1158472e4d467ab9dbe510dea6d88d": {
      title: "Aprilanddaveyfamily",
      description:
        "La vista in prima persona mi fa rivedere ogni tiro proprio come l'ho visto in campo.",
    },
    add0713170824bc8b0aeede7af7cb318: {
      title: "Hey.vanessa.renee",
      description:
        "Gli occhiali hanno catturato ogni passo e ogni cielo mozzafiato con una nitidezza stabile e vivida.",
    },
    abb6633d6bcc42df98f56c30162cc38b: {
      title: "Journalofluke",
      description:
        "Anche saltando, gli occhiali sono rimasti stabili e comodi — le riprese sono uscite fluide ogni volta.",
    },
    "4908d9062d984d5db5f2510089181454": {
      title: "Toni.florentina",
      description:
        "In allenamento con il mio cavallo, gli occhiali sono rimasti comodi e stabili — catturando ogni progresso lungo il percorso.",
    },
    e55483a47cbe4d7eb1439090f77242ac: {
      title: "Lukemizel",
      description:
        "Anche sul trampolino, gli occhiali erano sicuri e le riprese fluide — non ho dovuto preoccuparmi di nulla.",
    },
  },
  "pt-PT": {
    "9e8a190539d5437c9c118137f12a5c34": {
      title: "Explorar e aventurar-se com o Ranger",
      description: "Veja o Ranger em ação no desporto e em aventuras ao ar livre.",
    },
    "12fd2385af704bd9a8a921f7e93a5873": {
      title: "Nítido. Fluido. Nos óculos",
      description: "Imagens estabilizadas que parecem naturais — diretamente dos seus óculos.",
    },
    "47c2ea808ab04240bb2c26d57c09ed6b": {
      tag: "FOV 120° à altura dos olhos",
      title: "Tudo o que vê, nada fica de fora",
      description:
        "Uma vista de 120° à altura dos olhos — o que filma fica próximo de como realmente viu.",
    },
    "1a6ade7df07f47be91da148abc691dd5": {
      tag: "Estabilização EIS",
      title: "Quando se move, segura",
      description: "A estabilização eletrónica de imagem mantém as imagens fluidas em cada movimento.",
    },
    "5087f01ced1447b9876c7b07373fafce": {
      tag: "Mudança de formato",
      title: "Feito para publicar",
      description: "Alterne entre horizontal e vertical em movimento — cada plano pronto a partilhar.",
    },
    "8fd49ec29d6a4255a51b2fe7ea19ee42": {
      title: "Guarde o que importa",
      description: "A gravação em loop guarda os momentos que importam sem encher o armazenamento.",
    },
    a660a6ef1bcc44e6bfdd1453a21a3662: {
      tag: "Sobreposição de dados",
      title: "Agora conta a história toda",
      description: "Velocidade, distância e estatísticas integradas automaticamente nas suas imagens.",
    },
    cde4f9d8d188415fb8dd7401ded38942: {
      tag: "AI Master Motion (BETA)",
      title: "Uma equipa de um",
      description: "Efeitos de movimento gerados por IA transformam um único clip em imagens cinematográficas.",
    },
    "0b58f6ff56b5436bb69f9e16d7b15d99": {
      tag: "AI Master Remix (BETA)",
      title: "A mesma foto. Outra história",
      description: "Faça remix de fotografias em novas histórias visuais com IA.",
    },
    a69904470cc64080bbb86ec72a85d7cc: {
      title: "Captura os momentos — e depois edita-os.",
      description: "A IA escolhe os destaques e monta clips prontos a partilhar a partir do seu dia.",
    },
    eee10c38eeb74cec9a65a5b3796f5af1: {
      title: "Atento e em sintonia",
      description: "O áudio open-ear mantém-no ligado ao que o rodeia.",
    },
    "10b848bc446740a7874e92f06e1ba090": {
      title: "Ligado sem limites",
      description: "Emparelhe a app BleeqUp para vista ao vivo, definições e partilha.",
    },
    "12fe6e3576304c69b61fbbc66d227d1e": {
      title: "Pshepfpv",
      description:
        "Mesmo em carving e a deslizar, os óculos mantiveram-se leves e estáveis — cada momento saiu fluido.",
    },
    "3d1158472e4d467ab9dbe510dea6d88d": {
      title: "Aprilanddaveyfamily",
      description:
        "A vista em primeira pessoa deixa-me reviver cada jogada tal como a vi no campo.",
    },
    add0713170824bc8b0aeede7af7cb318: {
      title: "Hey.vanessa.renee",
      description:
        "Os óculos captaram cada passo e cada céu de cortar a respiração, com clareza estável e viva.",
    },
    abb6633d6bcc42df98f56c30162cc38b: {
      title: "Journalofluke",
      description:
        "Mesmo a saltar, os óculos mantiveram-se estáveis e confortáveis — as imagens saíram fluidas de cada vez.",
    },
    "4908d9062d984d5db5f2510089181454": {
      title: "Toni.florentina",
      description:
        "A treinar com o meu cavalo, os óculos mantiveram-se confortáveis e estáveis — a captar cada progresso no caminho.",
    },
    e55483a47cbe4d7eb1439090f77242ac: {
      title: "Lukemizel",
      description:
        "Mesmo no trampolim, os óculos ficaram seguros e as imagens fluidas — não tive de me preocupar com nada.",
    },
  },
  ja: {
    "9e8a190539d5437c9c118137f12a5c34": {
      title: "Rangerで探検とアドベンチャーを",
      description: "スポーツやアウトドアの冒険でRangerの活躍を見てください。",
    },
    "12fd2385af704bd9a8a921f7e93a5873": {
      title: "クリア。スムーズ。グラスの中で",
      description: "自然に見える手ブレ補正映像 — アイウェアからそのまま。",
    },
    "47c2ea808ab04240bb2c26d57c09ed6b": {
      tag: "視線の高さで120° FOV",
      title: "見たものすべて、取り残さない",
      description: "視線の高さで120° — 撮った映像は、実際に見た景色に近いまま。",
    },
    "1a6ade7df07f47be91da148abc691dd5": {
      tag: "EIS手ブレ補正",
      title: "動いても、しっかりキープ",
      description: "電子式手ブレ補正が、動きのたびに映像をスムーズに保ちます。",
    },
    "5087f01ced1447b9876c7b07373fafce": {
      tag: "アスペクト比切替",
      title: "投稿するために作られた",
      description: "移動中に横と縦を切り替え — どのショットもシェア準備完了。",
    },
    "8fd49ec29d6a4255a51b2fe7ea19ee42": {
      title: "大切なものを残す",
      description: "ループ録画が、ストレージを埋めずに大事な瞬間を保存します。",
    },
    a660a6ef1bcc44e6bfdd1453a21a3662: {
      tag: "データオーバーレイ",
      title: "これで物語が完成する",
      description: "速度、距離、スタッツが映像に自動で焼き込まれます。",
    },
    cde4f9d8d188415fb8dd7401ded38942: {
      tag: "AI Master Motion (BETA)",
      title: "ひとり分のクルー",
      description: "AI生成のモーション効果で、1本のクリップがシネマティックな映像に。",
    },
    "0b58f6ff56b5436bb69f9e16d7b15d99": {
      tag: "AI Master Remix (BETA)",
      title: "同じ写真。違うストーリー",
      description: "AIで静止画を新しいビジュアルストーリーにリミックス。",
    },
    a69904470cc64080bbb86ec72a85d7cc: {
      title: "瞬間を捉えて — それから編集する。",
      description: "AIがハイライトを選び、その日の映像からシェア可能なクリップを組み立てます。",
    },
    eee10c38eeb74cec9a65a5b3796f5af1: {
      title: "周囲を感じ、調和する",
      description: "オープンイヤーオーディオで、周囲とのつながりを保てます。",
    },
    "10b848bc446740a7874e92f06e1ba090": {
      title: "制限なくつながる",
      description: "BleeqUpアプリとペアリングして、ライブビュー、設定、共有。",
    },
    "12fe6e3576304c69b61fbbc66d227d1e": {
      title: "Pshepfpv",
      description:
        "カービングもクルージングも、グラスは軽く安定したまま — どの瞬間もスムーズに撮れた。",
    },
    "3d1158472e4d467ab9dbe510dea6d88d": {
      title: "Aprilanddaveyfamily",
      description: "一人称視点で、コートで見たままのショットを何度でも再生できる。",
    },
    add0713170824bc8b0aeede7af7cb318: {
      title: "Hey.vanessa.renee",
      description: "一歩一歩も息をのむ空の景色も、安定した鮮やかな鮮明さで捉えてくれた。",
    },
    abb6633d6bcc42df98f56c30162cc38b: {
      title: "Journalofluke",
      description: "跳んでもグラスは安定して快適 — 映像は毎回スムーズだった。",
    },
    "4908d9062d984d5db5f2510089181454": {
      title: "Toni.florentina",
      description: "馬とのトレーニング中も快適で安定 — 進み具合をすべて残してくれた。",
    },
    e55483a47cbe4d7eb1439090f77242ac: {
      title: "Lukemizel",
      description: "トランポリンの上でもしっかり固定され、映像はスムーズ — 心配することは何もなかった。",
    },
  },
  "zh-CN": {
    "9e8a190539d5437c9c118137f12a5c34": {
      title: "和 Ranger 一起探索与冒险",
      description: "看看 Ranger 在运动和户外冒险中的表现。",
    },
    "12fd2385af704bd9a8a921f7e93a5873": {
      title: "清晰。流畅。就在眼镜里",
      description: "防抖画面看起来很自然 — 直接来自你的眼镜。",
    },
    "47c2ea808ab04240bb2c26d57c09ed6b": {
      tag: "视线高度 120° FOV",
      title: "你看见的一切，都不会漏掉",
      description: "视线高度 120° 视野 — 拍到的画面接近你当时真正看到的样子。",
    },
    "1a6ade7df07f47be91da148abc691dd5": {
      tag: "EIS 防抖",
      title: "你在动，它稳住",
      description: "电子防抖让每一次动作中的画面都保持流畅。",
    },
    "5087f01ced1447b9876c7b07373fafce": {
      tag: "画幅切换",
      title: "为发布而生",
      description: "随时在横屏和竖屏之间切换 — 每一镜都准备好分享。",
    },
    "8fd49ec29d6a4255a51b2fe7ea19ee42": {
      title: "留下真正重要的",
      description: "循环录制保存重要瞬间，又不会把存储占满。",
    },
    a660a6ef1bcc44e6bfdd1453a21a3662: {
      tag: "数据叠加",
      title: "现在，它能讲完整的故事",
      description: "速度、距离和数据统计自动写入画面。",
    },
    cde4f9d8d188415fb8dd7401ded38942: {
      tag: "AI Master Motion (BETA)",
      title: "一个人的摄制组",
      description: "AI 生成的动态效果，把一条片段变成电影感画面。",
    },
    "0b58f6ff56b5436bb69f9e16d7b15d99": {
      tag: "AI Master Remix (BETA)",
      title: "同一张照片。不同的故事",
      description: "用 AI 把静帧重混成全新的视觉故事。",
    },
    a69904470cc64080bbb86ec72a85d7cc: {
      title: "抓住瞬间 — 然后再剪辑。",
      description: "AI 挑选精彩镜头，把你一天的素材组装成可分享的短片。",
    },
    eee10c38eeb74cec9a65a5b3796f5af1: {
      title: "保持觉察，保持同步",
      description: "开放式音频让你始终感知周围环境。",
    },
    "10b848bc446740a7874e92f06e1ba090": {
      title: "连接不受限",
      description: "配对 BleeqUp 应用，实时预览、设置和分享。",
    },
    "12fe6e3576304c69b61fbbc66d227d1e": {
      title: "Pshepfpv",
      description: "就算在 carving 和 cruising，眼镜依然轻、稳 — 每一刻都拍得很顺。",
    },
    "3d1158472e4d467ab9dbe510dea6d88d": {
      title: "Aprilanddaveyfamily",
      description: "第一人称视角让我能按球场上看到的样子，重看每一个球。",
    },
    add0713170824bc8b0aeede7af7cb318: {
      title: "Hey.vanessa.renee",
      description: "眼镜记下了每一步，还有每一片令人屏息的天空，稳定又鲜明。",
    },
    abb6633d6bcc42df98f56c30162cc38b: {
      title: "Journalofluke",
      description: "就算我在跳，眼镜依然稳、戴着舒服 — 画面每次都很流畅。",
    },
    "4908d9062d984d5db5f2510089181454": {
      title: "Toni.florentina",
      description: "和马一起训练时，眼镜一直舒适稳定 — 沿途的每一点进步都被记下。",
    },
    e55483a47cbe4d7eb1439090f77242ac: {
      title: "Lukemizel",
      description: "就算在蹦床上，眼镜也戴得稳，画面也流畅 — 我完全不用担心。",
    },
  },
};

const SETUP: Partial<Record<Locale, SetupCopy>> = {
  fr: {
    title: "Installation et premiers pas",
    description: "Tutoriel officiel pour apparier, enregistrer et utiliser vos lunettes Ranger.",
  },
  de: {
    title: "Einrichtung und Einstieg",
    description: "Offizieller Rundgang zum Koppeln, Aufnehmen und Nutzen deiner Ranger-Brille.",
  },
  nl: {
    title: "Installatie en aan de slag",
    description: "Officiële walkthrough voor koppelen, opnemen en je Ranger-bril gebruiken.",
  },
  es: {
    title: "Configuración y primeros pasos",
    description: "Guía oficial para emparejar, grabar y usar tus gafas Ranger.",
  },
  it: {
    title: "Configurazione e primi passi",
    description: "Guida ufficiale per associare, registrare e usare i tuoi occhiali Ranger.",
  },
  "pt-PT": {
    title: "Configuração e primeiros passos",
    description: "Guia oficial para emparelhar, gravar e usar os seus óculos Ranger.",
  },
  ja: {
    title: "セットアップと使い始め",
    description: "Rangerグラスのペアリング、録画、使い方の公式ウォークスルー。",
  },
  "zh-CN": {
    title: "设置与入门",
    description: "配对、录制和使用 Ranger 眼镜的官方演示。",
  },
};

const PRESS: Partial<Record<Locale, PressQuote[]>> = {
  fr: [
    {
      outlet: "WIRED",
      quote:
        "Les branches des lunettes ont des haut-parleurs pour écouter de la musique, et ça sonnait plutôt bien lors d'une courte démo dans un espace très bruyant.",
    },
    {
      outlet: "Lifehacker",
      quote:
        "Les lunettes de sport BleeqUp Ranger intègrent une caméra 1080p/3K, de l'audio à oreilles libres et la navigation virage par virage dans une paire de lunettes de vélo élégante.",
    },
    {
      outlet: "Notebookcheck",
      quote:
        "À moins de 50 g, le Ranger est assez léger pour qu'on l'oublie après quelques minutes. La caméra filme jusqu'en 3K à 60fps.",
    },
  ],
  de: [
    {
      outlet: "WIRED",
      quote:
        "Die Bügel der Brille haben Lautsprecher, damit du Musik hören kannst, und sie klangen in einer kurzen Demo in einem sehr lauten Raum ziemlich gut.",
    },
    {
      outlet: "Lifehacker",
      quote:
        "Die BleeqUp Ranger Sportbrille packt eine 1080p/3K-Kamera, Open-Ear-Audio und Turn-by-Turn-Navigation in eine stilvolle Radbrille.",
    },
    {
      outlet: "Notebookcheck",
      quote:
        "Mit unter 50g ist der Ranger so leicht, dass du ihn nach ein paar Minuten nicht mehr merkst. Die Kamera filmt bis 3K bei 60fps.",
    },
  ],
  nl: [
    {
      outlet: "WIRED",
      quote:
        "De armen van de bril hebben speakers zodat je muziek kunt afspelen, en ze klonken best goed in een korte demo in een heel luide ruimte.",
    },
    {
      outlet: "Lifehacker",
      quote:
        "De BleeqUp Ranger-sportbril stopt een 1080p/3K-camera, open-ear-audio en turn-by-turn-navigatie in een stijlvolle fietsbril.",
    },
    {
      outlet: "Notebookcheck",
      quote:
        "Met minder dan 50g is de Ranger licht genoeg dat je hem na een paar minuten niet meer merkt. De camera filmt tot 3K bij 60fps.",
    },
  ],
  es: [
    {
      outlet: "WIRED",
      quote:
        "Las patillas de las gafas tienen altavoces para poner música, y sonaban bastante bien en una demo breve en un espacio muy ruidoso.",
    },
    {
      outlet: "Lifehacker",
      quote:
        "Las gafas deportivas BleeqUp Ranger meten una cámara 1080p/3K, audio de oído abierto y navegación giro a giro en unas gafas de ciclismo con estilo.",
    },
    {
      outlet: "Notebookcheck",
      quote:
        "Con menos de 50g, el Ranger es tan ligero que dejas de notarlo a los pocos minutos. La cámara graba hasta 3K a 60fps.",
    },
  ],
  it: [
    {
      outlet: "WIRED",
      quote:
        "Le aste degli occhiali hanno altoparlanti per ascoltare musica, e suonavano piuttosto bene in una breve demo in uno spazio molto rumoroso.",
    },
    {
      outlet: "Lifehacker",
      quote:
        "Gli occhiali sportivi BleeqUp Ranger mettono una fotocamera 1080p/3K, audio open-ear e navigazione svolta per svolta in un paio di occhiali da bici di stile.",
    },
    {
      outlet: "Notebookcheck",
      quote:
        "Sotto i 50g, il Ranger è abbastanza leggero da dimenticarlo dopo pochi minuti. La fotocamera gira fino a 3K a 60fps.",
    },
  ],
  "pt-PT": [
    {
      outlet: "WIRED",
      quote:
        "As hastes dos óculos têm altifalantes para ouvir música, e soaram bastante bem numa demonstração breve num espaço muito barulhento.",
    },
    {
      outlet: "Lifehacker",
      quote:
        "Os óculos desportivos BleeqUp Ranger juntam uma câmara 1080p/3K, áudio open-ear e navegação curva a curva num par de óculos de ciclismo com estilo.",
    },
    {
      outlet: "Notebookcheck",
      quote:
        "Com menos de 50g, o Ranger é suficientemente leve para se deixar de notar ao fim de poucos minutos. A câmara filma até 3K a 60fps.",
    },
  ],
  ja: [
    {
      outlet: "WIRED",
      quote:
        "グラスのアームにスピーカーが付いていて音楽を流せる。とても騒がしい場所での短いデモでも、なかなか良い音だった。",
    },
    {
      outlet: "Lifehacker",
      quote:
        "BleeqUp Rangerスポーツグラスは、1080p/3Kカメラ、オープンイヤーオーディオ、ターンバイターンナビをスタイリッシュなサイクリングシェードに詰め込んでいる。",
    },
    {
      outlet: "Notebookcheck",
      quote:
        "50g未満のRangerは数分で存在を忘れるほど軽い。カメラは最大3K、60fpsで撮影する。",
    },
  ],
  "zh-CN": [
    {
      outlet: "WIRED",
      quote:
        "镜腿上有扬声器，可以播放音乐；在非常吵的空间里做了个简短演示，听起来还不错。",
    },
    {
      outlet: "Lifehacker",
      quote:
        "BleeqUp Ranger 运动眼镜把 1080p/3K 相机、开放式音频和逐向导航，装进一副有型的骑行墨镜里。",
    },
    {
      outlet: "Notebookcheck",
      quote: "不到 50g，Ranger 轻到几分钟后你就会忘记它还戴着。相机最高可拍 3K、60fps。",
    },
  ],
};

const CREATOR_QUOTES: Partial<Record<Locale, Record<string, string>>> = {
  fr: {
    plSMxHzA6UQ:
      "Des lunettes de sport 4-in-1 impressionnantes qui remplacent votre équipement en offrant un vrai POV paysage",
    zVg4yx60Dlg: "L'avenir de la randonnée ? Les lunettes-caméra de sport IA Bleequp 4-in-1",
    eibzEkZILgA: "J'ai testé des lunettes-caméra IA 4-in-1… C'était INSANE",
    JQ_j9dCypK4:
      "Test des lunettes-caméra de sport IA BleeqUp Ranger 4-in-1 — L'avenir des lunettes de sport intelligentes ?",
    "8kyC2ekiu_M": "Parkour vs lunettes-caméra de sport IA BleeqUp 4-in-1",
    "-Ub90tHaqYA": "Enregistrez votre vie ! Les lunettes-caméra de sport BleeqUp Ranger 4-In-1 !",
    tUfH23i8Y5g: "Les lunettes-caméra IA BleeqUp peuvent-elles aider à reconstruire une Mini SuperMoto à 300 $ ?",
    OuFb4G8zecQ:
      "Les lunettes-caméra de sport IA BleeqUp m'ont scotché (créativité next level débloquée !!)",
  },
  de: {
    plSMxHzA6UQ:
      "Eine beeindruckende 4-in-1-Sportbrille, die deine Ausrüstung ersetzt und echtes Landscape-POV liefert",
    zVg4yx60Dlg: "Die Zukunft des Wanderns? Bleequp 4-in-1 KI-Sportkamerabrille",
    eibzEkZILgA: "Ich habe 4-in-1 KI-Kamerabrillen getestet… Das war INSANE",
    JQ_j9dCypK4:
      "BleeqUp Ranger 4-in-1 KI-Sportkamerabrille im Test — Ist das die Zukunft smarter Sportbrillen?",
    "8kyC2ekiu_M": "Parkour vs BleeqUp 4-in-1 KI-Sportkamerabrille",
    "-Ub90tHaqYA": "Nimm dein Leben auf! Die BleeqUp Ranger 4-In-1 Sportkamerabrille!",
    tUfH23i8Y5g: "Können BleeqUp KI-Kamerabrillen beim Wiederaufbau einer 300-$ Mini SuperMoto helfen?",
    OuFb4G8zecQ:
      "Die BleeqUp KI-Sportkamerabrille hat mich umgehauen (Next-Level-Kreativität freigeschaltet!!)",
  },
  nl: {
    plSMxHzA6UQ:
      "Een indrukwekkende 4-in-1-sportbril die je uitrusting vervangt met échte landscape-POV",
    zVg4yx60Dlg: "De toekomst van hiken? Bleequp 4-in-1 AI-sportcamerabril",
    eibzEkZILgA: "Ik testte 4-in-1 AI-camerabrillen… Dit was INSANE",
    JQ_j9dCypK4:
      "Review BleeqUp Ranger 4-in-1 AI-sportcamerabril — Is dit de toekomst van slimme sportbrillen?",
    "8kyC2ekiu_M": "Parkour vs BleeqUp 4-in-1 AI-sportcamerabril",
    "-Ub90tHaqYA": "Neem je leven op! De BleeqUp Ranger 4-In-1 sportcamerabril!",
    tUfH23i8Y5g: "Kunnen BleeqUp AI-camerabrillen helpen een Mini SuperMoto van $300 opnieuw op te bouwen?",
    OuFb4G8zecQ:
      "Ik ben omvergeblazen door de BleeqUp AI-sportcamerabril (next-level creativiteit ontgrendeld!!)",
  },
  es: {
    plSMxHzA6UQ:
      "Unas gafas deportivas 4-in-1 impresionantes que sustituyen tu equipo al ofrecer un verdadero POV apaisado",
    zVg4yx60Dlg: "¿El futuro del senderismo? Gafas cámara deportiva IA Bleequp 4-in-1",
    eibzEkZILgA: "Probé unas gafas cámara IA 4-in-1… Esto fue INSANE",
    JQ_j9dCypK4:
      "Análisis de las gafas cámara deportiva IA BleeqUp Ranger 4-in-1 — ¿El futuro de las gafas deportivas inteligentes?",
    "8kyC2ekiu_M": "Parkour vs gafas cámara deportiva IA BleeqUp 4-in-1",
    "-Ub90tHaqYA": "¡Graba tu vida! ¡Las gafas cámara deportiva BleeqUp Ranger 4-In-1!",
    tUfH23i8Y5g: "¿Pueden las gafas cámara IA BleeqUp ayudar a reconstruir una Mini SuperMoto de 300 $?",
    OuFb4G8zecQ:
      "Las gafas cámara deportiva IA BleeqUp me han dejado flipando (¡creatividad next level desbloqueada!!)",
  },
  it: {
    plSMxHzA6UQ:
      "Occhiali sportivi 4-in-1 impressionanti che sostituiscono il tuo kit consegnando un vero POV landscape",
    zVg4yx60Dlg: "Il futuro dell'escursionismo? Occhiali sportivi con fotocamera IA Bleequp 4-in-1",
    eibzEkZILgA: "Ho testato occhiali con fotocamera IA 4-in-1… È stato INSANE",
    JQ_j9dCypK4:
      "Recensione occhiali sportivi con fotocamera IA BleeqUp Ranger 4-in-1 — È questo il futuro degli occhiali sportivi smart?",
    "8kyC2ekiu_M": "Parkour vs occhiali sportivi con fotocamera IA BleeqUp 4-in-1",
    "-Ub90tHaqYA": "Registra la tua vita! Gli occhiali sportivi con fotocamera BleeqUp Ranger 4-In-1!",
    tUfH23i8Y5g: "Gli occhiali con fotocamera IA BleeqUp possono aiutare a ricostruire una Mini SuperMoto da 300 $?",
    OuFb4G8zecQ:
      "Gli occhiali sportivi con fotocamera IA BleeqUp mi hanno sbalordito (creatività next level sbloccata!!)",
  },
  "pt-PT": {
    plSMxHzA6UQ:
      "Uns óculos desportivos 4-in-1 impressionantes que substituem o seu equipamento ao oferecer um verdadeiro POV landscape",
    zVg4yx60Dlg: "O futuro do pedestrianismo? Óculos-câmara desportivos IA Bleequp 4-in-1",
    eibzEkZILgA: "Testei óculos-câmara IA 4-in-1… Isto foi INSANE",
    JQ_j9dCypK4:
      "Análise dos óculos-câmara desportivos IA BleeqUp Ranger 4-in-1 — É este o futuro dos óculos desportivos inteligentes?",
    "8kyC2ekiu_M": "Parkour vs óculos-câmara desportivos IA BleeqUp 4-in-1",
    "-Ub90tHaqYA": "Grave a sua vida! Os óculos-câmara desportivos BleeqUp Ranger 4-In-1!",
    tUfH23i8Y5g: "Os óculos-câmara IA BleeqUp conseguem ajudar a reconstruir uma Mini SuperMoto de 300 $?",
    OuFb4G8zecQ:
      "Fiquei rendido aos óculos-câmara desportivos IA BleeqUp (criatividade next level desbloqueada!!)",
  },
  ja: {
    plSMxHzA6UQ: "本格的な横向きPOVを届ける、ギアを置き換えられる印象的な4-in-1スポーツグラス",
    zVg4yx60Dlg: "ハイキングの未来？ Bleequp 4-in-1 AIスポーツカメラグラス",
    eibzEkZILgA: "4-in-1 AIカメラグラスを試した… これはINSANEだった",
    JQ_j9dCypK4:
      "BleeqUp Ranger 4-in-1 AIスポーツカメラグラスレビュー — スマートスポーツアイウェアの未来か？",
    "8kyC2ekiu_M": "パルクール vs BleeqUp 4-in-1 AIスポーツカメラグラス",
    "-Ub90tHaqYA": "人生を録画しろ！ BleeqUp Ranger 4-In-1スポーツカメラグラス！",
    tUfH23i8Y5g: "BleeqUp AIカメラグラスは300ドルのMini SuperMoto再建を助けられるか？",
    OuFb4G8zecQ:
      "BleeqUp AIスポーツカメラグラスに圧倒された（次のレベルの創造性が解放された！！）",
  },
  "zh-CN": {
    plSMxHzA6UQ: "一副令人印象深刻的 4-in-1 运动眼镜，用真正的横向 POV 取代你的装备",
    zVg4yx60Dlg: "徒步的未来？Bleequp 4-in-1 AI 运动摄像眼镜",
    eibzEkZILgA: "我测了 4-in-1 AI 摄像眼镜……这太 INSANE 了",
    JQ_j9dCypK4: "BleeqUp Ranger 4-in-1 AI 运动摄像眼镜评测 — 这是智能运动眼镜的未来吗？",
    "8kyC2ekiu_M": "跑酷 vs BleeqUp 4-in-1 AI 运动摄像眼镜",
    "-Ub90tHaqYA": "记录你的生活！BleeqUp Ranger 4-In-1 运动摄像眼镜！",
    tUfH23i8Y5g: "BleeqUp AI 摄像眼镜能帮忙重建一辆 300 美元的 Mini SuperMoto 吗？",
    OuFb4G8zecQ: "BleeqUp AI 运动摄像眼镜把我惊到了（下一档创造力解锁！！）",
  },
};

function sourceVideoText(id: string): LocalizedVideoText | undefined {
  const source = SOURCE_VIDEOS.find((video) => video.id === id);
  if (!source) return undefined;
  return {
    tag: source.tag,
    title: source.title,
    description: source.description,
  };
}

export function bleequpHero(locale: Locale): { title: string; subtitle: string } {
  const overlay = HERO[locale];
  return {
    title: overlay?.title ?? BLEEQUUP_HERO.title,
    subtitle: overlay?.subtitle ?? BLEEQUUP_HERO.subtitle,
  };
}

export function bleequpPromos(locale: Locale): LocalizedPromo[] {
  const overlay = PROMOS[locale];
  return BLEEQUUP_PROMOS.map((promo, index) => overlay?.[index] ?? { label: promo.label, detail: promo.detail });
}

export function bleequpVideoText(locale: Locale, id: string): LocalizedVideoText | undefined {
  const fallback = sourceVideoText(id);
  if (!fallback) return undefined;
  if (locale === DEFAULT_LOCALE) return fallback;
  const overlay = VIDEO_TEXT[locale]?.[id];
  if (!overlay) return fallback;
  return {
    tag: overlay.tag ?? fallback.tag,
    title: overlay.title || fallback.title,
    description: overlay.description ?? fallback.description,
  };
}

export function bleequpSetup(locale: Locale): { title: string; description: string } {
  const overlay = SETUP[locale];
  return {
    title: overlay?.title ?? BLEEQUUP_SETUP_VIDEO.title,
    description: overlay?.description ?? BLEEQUUP_SETUP_VIDEO.description,
  };
}

export function bleequpPressQuotes(locale: Locale): { outlet: string; quote: string }[] {
  const overlay = PRESS[locale];
  return PRESS_EN.map((item, index) => ({
    outlet: item.outlet,
    quote: overlay?.[index]?.quote ?? item.quote,
  }));
}

export function bleequpCreatorQuote(locale: Locale, youtubeId: string, fallback: string): string {
  if (locale === DEFAULT_LOCALE) {
    return (
      BLEEQUUP_CREATOR_REVIEWS.find((review) => review.youtubeId === youtubeId)?.quote ?? fallback
    );
  }
  return CREATOR_QUOTES[locale]?.[youtubeId] ?? fallback;
}
