export type BleeqUpMp4Video = {
  id: string;
  tag?: string;
  title: string;
  description?: string;
  mp4: string;
  poster?: string;
};

export type BleeqUpYouTubeVideo = {
  youtubeId: string;
  name: string;
  quote: string;
  poster: string;
};

const CDN = "https://www.bleequp.com/cdn/shop/videos/c/vp";
const POSTER = "/catalog/ranger";

function rangerPoster(id: string): string {
  return `${POSTER}/${id}.webp`;
}

// Hand-curated URLs from bleequp.com (home + product pages)
export const BLEEQUUP_HERO = {
  title: "BleeqUp Ranger AI Sports Camera Glasses",
  subtitle:
    "4-in-1 smart eyewear — camera, open-ear audio, UV protection, and prescription-ready lenses. Capture POV footage hands-free while you move.",
  // 720p ~6.3MB vs 1080p ~10MB. Homepage defers this until after LCP.
  mp4: `${CDN}/9e8a190539d5437c9c118137f12a5c34/9e8a190539d5437c9c118137f12a5c34.HD-720p-4.5Mbps-87727345.mp4?v=0`,
  poster: rangerPoster("hero"),
} as const;

export const BLEEQUUP_PROMOS = [
  { label: "4-in-1 design", detail: "Camera · Audio · UV · Rx lenses" },
  { label: "120° eye-level FOV", detail: "True POV perspective" },
  { label: "AI editing", detail: "Auto highlights from your clips" },
  { label: "Authorized retailer", detail: "Official BleeqUp partner" },
] as const;

export const BLEEQUUP_FEATURE_VIDEOS: BleeqUpMp4Video[] = [
  {
    id: "9e8a190539d5437c9c118137f12a5c34",
    title: "Explore & Adventure with Ranger",
    description: "See the Ranger in action across sports and outdoor adventures.",
    mp4: `${CDN}/9e8a190539d5437c9c118137f12a5c34/9e8a190539d5437c9c118137f12a5c34.HD-1080p-7.2Mbps-87727345.mp4?v=0`,
    poster: rangerPoster("9e8a190539d5437c9c118137f12a5c34"),
  },
  {
    id: "12fd2385af704bd9a8a921f7e93a5873",
    title: "Clear. Smooth. In glasses",
    description: "Stabilized footage that looks natural — right from your eyewear.",
    mp4: `${CDN}/12fd2385af704bd9a8a921f7e93a5873/12fd2385af704bd9a8a921f7e93a5873.HD-1080p-7.2Mbps-86046238.mp4?v=0`,
    poster: rangerPoster("12fd2385af704bd9a8a921f7e93a5873"),
  },
  {
    id: "47c2ea808ab04240bb2c26d57c09ed6b",
    tag: "120° Eye-Level FOV",
    title: "Everything You See, Nothing Left Out",
    description:
      "A 120° view at eye level — what you capture stays close to how you actually saw it.",
    mp4: `${CDN}/47c2ea808ab04240bb2c26d57c09ed6b/47c2ea808ab04240bb2c26d57c09ed6b.HD-1080p-7.2Mbps-86046235.mp4?v=0`,
  },
  {
    id: "1a6ade7df07f47be91da148abc691dd5",
    tag: "EIS Stabilization",
    title: "When You Move, It Holds",
    description: "Electronic image stabilization keeps footage smooth through every move.",
    mp4: `${CDN}/1a6ade7df07f47be91da148abc691dd5/1a6ade7df07f47be91da148abc691dd5.HD-1080p-7.2Mbps-79440119.mp4?v=0`,
  },
  {
    id: "5087f01ced1447b9876c7b07373fafce",
    tag: "Aspect Ratio Switch",
    title: "Made to be posted",
    description: "Flip between landscape and portrait as you go — every shot ready to share.",
    mp4: `${CDN}/5087f01ced1447b9876c7b07373fafce/5087f01ced1447b9876c7b07373fafce.HD-1080p-7.2Mbps-86046236.mp4?v=0`,
  },
  {
    id: "8fd49ec29d6a4255a51b2fe7ea19ee42",
    title: "Keep What Matters",
    description: "Loop recording saves the moments that matter without filling storage.",
    mp4: `${CDN}/8fd49ec29d6a4255a51b2fe7ea19ee42/8fd49ec29d6a4255a51b2fe7ea19ee42.HD-1080p-7.2Mbps-81532499.mp4?v=0`,
    poster: rangerPoster("8fd49ec29d6a4255a51b2fe7ea19ee42"),
  },
  {
    id: "a660a6ef1bcc44e6bfdd1453a21a3662",
    tag: "Data Overlay",
    title: "Now it tells the whole story",
    description: "Speed, distance, and stats baked into your footage automatically.",
    mp4: `${CDN}/a660a6ef1bcc44e6bfdd1453a21a3662/a660a6ef1bcc44e6bfdd1453a21a3662.HD-1080p-3.3Mbps-82032279.mp4?v=0`,
    poster: rangerPoster("a660a6ef1bcc44e6bfdd1453a21a3662"),
  },
  {
    id: "cde4f9d8d188415fb8dd7401ded38942",
    tag: "AI Master Motion (BETA)",
    title: "A crew of one",
    description: "AI-generated motion effects turn a single clip into cinematic footage.",
    mp4: `${CDN}/cde4f9d8d188415fb8dd7401ded38942/cde4f9d8d188415fb8dd7401ded38942.HD-1080p-7.2Mbps-81537695.mp4?v=0`,
  },
  {
    id: "0b58f6ff56b5436bb69f9e16d7b15d99",
    tag: "AI Master Remix (BETA)",
    title: "Same photo. Different story",
    description: "Remix stills into fresh visual stories with AI.",
    mp4: `${CDN}/0b58f6ff56b5436bb69f9e16d7b15d99/0b58f6ff56b5436bb69f9e16d7b15d99.HD-1080p-7.2Mbps-86050005.mp4?v=0`,
  },
  {
    id: "a69904470cc64080bbb86ec72a85d7cc",
    title: "It catches moments — then edits them.",
    description: "AI picks highlights and assembles share-ready clips from your day.",
    mp4: `${CDN}/a69904470cc64080bbb86ec72a85d7cc/a69904470cc64080bbb86ec72a85d7cc.HD-1080p-7.2Mbps-86046239.mp4?v=0`,
    poster: rangerPoster("a69904470cc64080bbb86ec72a85d7cc"),
  },
  {
    id: "eee10c38eeb74cec9a65a5b3796f5af1",
    title: "Aware & In Tune",
    description: "Open-ear audio keeps you connected to your surroundings.",
    mp4: `${CDN}/eee10c38eeb74cec9a65a5b3796f5af1/eee10c38eeb74cec9a65a5b3796f5af1.HD-1080p-7.2Mbps-81567261.mp4?v=0`,
    poster: rangerPoster("eee10c38eeb74cec9a65a5b3796f5af1"),
  },
  {
    id: "10b848bc446740a7874e92f06e1ba090",
    title: "Connected Without Limits",
    description: "Pair with the BleeqUp app for live view, settings, and sharing.",
    mp4: `${CDN}/10b848bc446740a7874e92f06e1ba090/10b848bc446740a7874e92f06e1ba090.HD-1080p-7.2Mbps-79440122.mp4?v=0`,
    poster: rangerPoster("10b848bc446740a7874e92f06e1ba090"),
  },
];

export const BLEEQUUP_TESTIMONIALS: BleeqUpMp4Video[] = [
  {
    id: "12fe6e3576304c69b61fbbc66d227d1e",
    title: "Pshepfpv",
    description:
      "Even carving and cruising, the glasses stayed light and steady—every moment came out smooth.",
    mp4: `${CDN}/12fe6e3576304c69b61fbbc66d227d1e/12fe6e3576304c69b61fbbc66d227d1e.SD-480p-1.5Mbps-64689922.mp4?v=0`,
    poster: rangerPoster("12fe6e3576304c69b61fbbc66d227d1e"),
  },
  {
    id: "3d1158472e4d467ab9dbe510dea6d88d",
    title: "Aprilanddaveyfamily",
    description: "The first-person view lets me replay every shot just as I saw it on the court.",
    mp4: `${CDN}/3d1158472e4d467ab9dbe510dea6d88d/3d1158472e4d467ab9dbe510dea6d88d.HD-1080p-7.2Mbps-64689985.mp4?v=0`,
    poster: rangerPoster("3d1158472e4d467ab9dbe510dea6d88d"),
  },
  {
    id: "add0713170824bc8b0aeede7af7cb318",
    title: "Hey.vanessa.renee",
    description:
      "The glasses captured each step and every breathtaking sky view with steady, vivid clarity.",
    mp4: `${CDN}/add0713170824bc8b0aeede7af7cb318/add0713170824bc8b0aeede7af7cb318.HD-1080p-7.2Mbps-64690100.mp4?v=0`,
    poster: rangerPoster("add0713170824bc8b0aeede7af7cb318"),
  },
  {
    id: "abb6633d6bcc42df98f56c30162cc38b",
    title: "Journalofluke",
    description:
      "Even while I jumped, the glasses stayed steady and comfortable—the footage came out smooth every time.",
    mp4: `${CDN}/abb6633d6bcc42df98f56c30162cc38b/abb6633d6bcc42df98f56c30162cc38b.SD-480p-1.5Mbps-64690513.mp4?v=0`,
    poster: rangerPoster("abb6633d6bcc42df98f56c30162cc38b"),
  },
  {
    id: "4908d9062d984d5db5f2510089181454",
    title: "Toni.florentina",
    description:
      "Training with my horse, the glasses stayed comfortable and steady—capturing every bit of progress along the way.",
    mp4: `${CDN}/4908d9062d984d5db5f2510089181454/4908d9062d984d5db5f2510089181454.SD-480p-1.5Mbps-64690206.mp4?v=0`,
    poster: rangerPoster("4908d9062d984d5db5f2510089181454"),
  },
  {
    id: "e55483a47cbe4d7eb1439090f77242ac",
    title: "Lukemizel",
    description:
      "Even on the trampoline, the glasses stayed secure and the footage stayed smooth—I never had to worry about a thing.",
    mp4: `${CDN}/e55483a47cbe4d7eb1439090f77242ac/e55483a47cbe4d7eb1439090f77242ac.SD-480p-1.5Mbps-64690290.mp4?v=0`,
    poster: rangerPoster("e55483a47cbe4d7eb1439090f77242ac"),
  },
];

export const BLEEQUUP_CREATOR_REVIEWS: BleeqUpYouTubeVideo[] = [
  {
    youtubeId: "plSMxHzA6UQ",
    name: "TechDaily",
    quote: "An impressive 4-in-1 sports glass that replaces your gear by delivering true landscape POV",
    poster: rangerPoster("creator-techdaily"),
  },
  {
    youtubeId: "zVg4yx60Dlg",
    name: "Grim Granite",
    quote: "The Future of Hiking? Bleequp 4-in-1 AI Sports Camera Glasses",
    poster: rangerPoster("creator-grim"),
  },
  {
    youtubeId: "eibzEkZILgA",
    name: "ONEWAY COREY",
    quote: "I Tested 4-in-1 AI Camera Glasses… This Was INSANE",
    poster: rangerPoster("creator-corey"),
  },
  {
    youtubeId: "JQ_j9dCypK4",
    name: "Android Tech",
    quote:
      "BleeqUp Ranger 4-in-1 AI Sports Camera Glasses Review — Is This the Future of Smart Sports Eyewear?",
    poster: rangerPoster("creator-android"),
  },
  {
    youtubeId: "8kyC2ekiu_M",
    name: "Adam Marr",
    quote: "Parkour vs BleeqUp 4-in-1 AI Sports Camera Glasses",
    poster: rangerPoster("creator-adam"),
  },
  {
    youtubeId: "-Ub90tHaqYA",
    name: "Monkey Wrench Mike",
    quote: "Record Your Life! The BleeqUp Ranger 4-In-1 Sports Camera Glasses!",
    poster: rangerPoster("creator-monkey"),
  },
  {
    youtubeId: "tUfH23i8Y5g",
    name: "MOPBOYZ",
    quote: "Can BleeqUp AI Camera Glasses help rebuild a $300 Mini SuperMoto?",
    poster: rangerPoster("creator-mopboyz"),
  },
  {
    youtubeId: "OuFb4G8zecQ",
    name: "Joel Bruner",
    quote:
      "I'm Blown Away by The BleeqUp AI Sports Camera Glasses (Next Level Creativity Unlocked!!)",
    poster: rangerPoster("creator-joel"),
  },
];

export const BLEEQUUP_SETUP_VIDEO = {
  youtubeId: "DoP-uVjYlHQ",
  title: "Setup & getting started",
  description: "Official walkthrough for pairing, recording, and using your Ranger glasses.",
} as const;