/**
 * BleeqUp Rover marketing content.
 *
 * Media is first-party under `/public/rover` (refresh via
 * `scripts/download-rover-media.mjs`). Copy below is the English source of
 * truth; locale overlays live in `lib/i18n/rover/*.ts` and are resolved via
 * `roverCopy(locale)` in `lib/i18n/rover-copy.ts`.
 */

const ROVER_PUBLIC = "/rover";
/** Bump when stills are recompressed so immutable `/rover/*` caches miss. */
const ROVER_STILL_V = "2";

function still(path: string): string {
  return `${ROVER_PUBLIC}/${path}?v=${ROVER_STILL_V}`;
}

/** Product slugs that get the full Rover showcase on their detail page. */
export const ROVER_GLASSES_SLUGS = [
  "bleequp-rover-ai-sports-glasses",
  "bleequp-rover-ai-sports-glasses-bundle",
] as const;

export const ROVER_PRIMARY_SLUG = ROVER_GLASSES_SLUGS[0];

export function isRoverGlassesSlug(slug: string): boolean {
  return (ROVER_GLASSES_SLUGS as readonly string[]).includes(slug);
}

export type RoverVideo = { mp4: string; poster: string };
export type RoverArtDirectedImage = { desktop: string; mobile: string };

function video(name: string): RoverVideo {
  return {
    mp4: `${ROVER_PUBLIC}/videos/${name}.mp4`,
    poster: still(`posters/${name}.jpg`),
  };
}

function art(name: string): RoverArtDirectedImage {
  return {
    desktop: still(`art/${name}-desktop.webp`),
    mobile: still(`art/${name}-mobile.webp`),
  };
}

export const ROVER_MEDIA = {
  hero: art("hero"),
  /** Launch TVC — ~38 MB, only ever loaded behind a click. */
  film: video("film"),
  /** "See it as you see it" statement loop. */
  statement: video("statement"),
  pillars: {
    tilt: art("feature-tilt"),
    hdr: art("feature-3k"),
    assistant: art("feature-assistant"),
    roadbook: art("feature-roadbook"),
    audio: art("audio-surround"),
    accessories: art("feature-accessories"),
  },
  capture: {
    tilt: video("capture-tilt"),
    hdr: video("capture-hdr"),
    night: video("capture-night"),
    fov: video("capture-fov"),
    eis: video("capture-eis"),
    ratio: video("capture-ratio"),
    loop: video("capture-loop"),
  },
  editing: {
    highlight: video("editing-highlight"),
    search: video("editing-search"),
    edit: video("editing-edit"),
  },
  share: {
    roadbook: art("ai-roadbook"),
    motion: video("share-motion"),
    remix: video("share-remix"),
  },
  companion: {
    assistant: art("split-assistant"),
    breathing: video("companion-breathing"),
    recap: art("split-recap"),
    emergency: video("companion-emergency"),
    alerts: art("split-alerts"),
  },
  audio: {
    wind: art("audio-wind"),
    mics: art("audio-surround"),
    talk: art("audio-talk"),
  },
  power: {
    powerPlus: art("accessory-power"),
    controller: art("accessory-controller"),
  },
  box: art("box"),
  cta: art("cta"),
  compare: {
    rover: still("art/compare-rover.png"),
    ranger: still("art/compare-ranger.png"),
  },
} as const;

export type RoverPillarKey = keyof typeof ROVER_MEDIA.pillars;
export type RoverCaptureKey = keyof typeof ROVER_MEDIA.capture;
export type RoverEditingKey = keyof typeof ROVER_MEDIA.editing;
export type RoverShareKey = keyof typeof ROVER_MEDIA.share;
export type RoverAudioKey = keyof typeof ROVER_MEDIA.audio;
export type RoverPowerKey = keyof typeof ROVER_MEDIA.power;
export type RoverAssistantKey = "assistant" | "breathing" | "recap";
export type RoverSafetyKey = "emergency" | "alerts";

export const ROVER_PILLAR_ORDER: readonly RoverPillarKey[] = [
  "tilt",
  "hdr",
  "assistant",
  "roadbook",
  "audio",
  "accessories",
];
export const ROVER_CAPTURE_ORDER: readonly RoverCaptureKey[] = [
  "tilt",
  "hdr",
  "night",
  "fov",
  "eis",
  "ratio",
  "loop",
];
export const ROVER_EDITING_ORDER: readonly RoverEditingKey[] = ["highlight", "search", "edit"];
export const ROVER_SHARE_ORDER: readonly RoverShareKey[] = ["roadbook", "motion", "remix"];
export const ROVER_ASSISTANT_ORDER: readonly RoverAssistantKey[] = [
  "assistant",
  "breathing",
  "recap",
];
export const ROVER_SAFETY_ORDER: readonly RoverSafetyKey[] = ["emergency", "alerts"];
export const ROVER_AUDIO_ORDER: readonly RoverAudioKey[] = ["wind", "mics", "talk"];
export const ROVER_POWER_ORDER: readonly RoverPowerKey[] = ["powerPlus", "controller"];

/**
 * Compare-table cell values. `"✓"` renders a check, `"—"` renders "not
 * available"; anything else is printed verbatim. Translators keep the symbols.
 */
export const ROVER_COMPARE_ROW_KEYS = [
  "weight",
  "water",
  "nosePad",
  "storage",
  "tilt",
  "eis",
  "photo",
  "video",
  "ratio",
  "loop",
  "night",
  "hdr",
  "hazard",
  "roadbook",
  "clipsSearch",
  "breathing",
  "voice",
  "assistant",
  "creator",
  "speakers",
  "walkie",
  "walkieGroups",
] as const;
export type RoverCompareRowKey = (typeof ROVER_COMPARE_ROW_KEYS)[number];

export type RoverFeatureCopy = { title: string; body: string };
export type RoverTabCopy = { tab: string; title: string; body: string };
export type RoverCompareRow = { label: string; rover: string; ranger: string };
export type RoverSpecItem = { label: string; value: string };
export type RoverFaqItem = { q: string; a: string };

export type RoverCopy = {
  hero: {
    kicker: string;
    headline: string;
    tagline: string;
    sub: string;
    shop: string;
    watchFilm: string;
    filmTitle: string;
  };
  pillars: {
    title: string;
    sub: string;
    items: Record<RoverPillarKey, { title: string; tagline: string }>;
  };
  statement: { title: string; sub: string };
  capture: {
    title: string;
    sub: string;
    items: Record<RoverCaptureKey, RoverTabCopy>;
  };
  editing: { title: string; sub: string; items: Record<RoverEditingKey, RoverTabCopy> };
  share: { title: string; sub: string; items: Record<RoverShareKey, RoverTabCopy> };
  companion: {
    title: string;
    assistantTitle: string;
    assistant: Record<RoverAssistantKey, RoverFeatureCopy>;
    safetyTitle: string;
    safety: Record<RoverSafetyKey, RoverFeatureCopy>;
    alertsNote: string;
  };
  audio: { title: string; sub: string; items: Record<RoverAudioKey, RoverFeatureCopy> };
  power: { title: string; sub: string; items: Record<RoverPowerKey, RoverFeatureCopy> };
  box: { title: string; sub: string; items: string[] };
  specs: { title: string; items: RoverSpecItem[] };
  compare: {
    title: string;
    sub: string;
    featureColumn: string;
    rover: string;
    ranger: string;
    available: string;
    notAvailable: string;
    shopRover: string;
    shopRanger: string;
    rows: Record<RoverCompareRowKey, RoverCompareRow>;
  };
  faq: { title: string; items: RoverFaqItem[] };
  cta: { title: string; sub: string; button: string };
  home: { kicker: string; title: string; sub: string; cta: string; learnMore: string };
};

export const ROVER_COPY_EN: RoverCopy = {
  hero: {
    kicker: "BleeqUp Rover",
    headline: "See One Step Ahead",
    tagline: "Rover AI Sports Glasses",
    sub: "Rover is your intelligent sports companion — it captures your best perspective and proactively supports you through every ride.",
    shop: "Shop Rover",
    watchFilm: "Watch the film",
    filmTitle: "BleeqUp Rover launch film",
  },
  pillars: {
    title: "Your Intelligent Sports Companion",
    sub: "Rover captures your optimal perspective and proactively supports you throughout every ride.",
    items: {
      tilt: { title: "3-Level Tilt Camera", tagline: "Find your best view." },
      hdr: { title: "3K60 HDR Video", tagline: "Capture every move." },
      assistant: { title: "AI Sports Assistant", tagline: "Ask. Understand. Keep moving." },
      roadbook: { title: "AI Video Roadbook", tagline: "Turn your ride into a story." },
      audio: { title: "Open-Ear Audio", tagline: "Hear the ride around you." },
      accessories: { title: "Accessories", tagline: "Go further. Stay in control." },
    },
  },
  statement: {
    title: "See it as you see it",
    sub: "Eye-level capture that stays true to what you actually saw.",
  },
  capture: {
    title: "See it as you see it",
    sub: "Seven ways Rover keeps your footage honest, steady, and ready to share.",
    items: {
      tilt: {
        tab: "3-Level Tilt",
        title: "3-Level Tilt Camera Lens",
        body: "Choose the angle that fits your activity. −10° keeps a hat brim or helmet edge out of frame. 0° is the natural eye-level view for everyday hands-free recording. 15° is built for cycling and any activity where you look down for long stretches.",
      },
      hdr: {
        tab: "3K60 HDR",
        title: "3K60 HDR Video",
        body: "Capture every moment in sharp 3K at 60fps. HDR pulls detail out of bright skies and dark trails, while smooth motion keeps up with every move.",
      },
      night: {
        tab: "Night Mode",
        title: "Super Night Mode",
        body: "Smart glasses that finally see after dark. Super Night Mode delivers clearer, brighter footage in low light, so the adventure doesn't stop when the sun goes down.",
      },
      fov: {
        tab: "120° FOV",
        title: "120° Eye-Level FOV",
        body: "120° isn't just about fitting more in the frame. It's about capturing the moments around you that you passed by but never had the chance to truly see.",
      },
      eis: {
        tab: "EIS",
        title: "EIS Stabilization",
        body: "Ride it rough. Run it fast. Rover keeps your footage smooth and steady, so the moment feels just as good when you watch it back.",
      },
      ratio: {
        tab: "Aspect Ratio",
        title: "Aspect Ratio Switch",
        body: "Switch between horizontal 16:9 and vertical 9:16 recording to match the way you want to share.",
      },
      loop: {
        tab: "Loop Recording",
        title: "Loop Recording",
        body: "Continuously records and automatically overwrites older footage when storage is full. Keep recording without worrying about running out of space.",
      },
    },
  },
  editing: {
    title: "Capture Without the Editing Burden",
    sub: "Rover's on-device AI finds, sorts, and cuts your best moments for you.",
    items: {
      highlight: {
        tab: "AI Highlight",
        title: "Don't Miss the Best Part",
        body: "Some moments are too good to find later. AI automatically detects and saves your highlights, so the best parts of your adventure are always easy to find.",
      },
      search: {
        tab: "AI Search",
        title: "Find the Moment. Just Talk",
        body: "No more scrolling through a long video to find one moment. Say what you want to see and AI finds the clip you're looking for.",
      },
      edit: {
        tab: "AI Editing",
        title: "It Catches Moments. Then Edits Them",
        body: "AI automatically brings your highlights together into one video. No editing skills. No time spent sorting through footage.",
      },
    },
  },
  share: {
    title: "Made to Be Shared",
    sub: "Turn a ride into a story, a photo into a film, and a still into something new.",
    items: {
      roadbook: {
        tab: "Roadbook",
        title: "Every Journey Has a Story",
        body: "Bring your route and footage together into a visual story of your journey, then share the adventure with the people who matter.",
      },
      motion: {
        tab: "Motion",
        title: "One Photo. A Whole New Perspective",
        body: "Start with a photo of you and your bike. AI transforms your ride highlights into a dynamic video with follow shots, low angles, rear tracking, and wheel-level perspectives that usually take another rider to capture.",
      },
      remix: {
        tab: "Remix",
        title: "Same Ride. Something New",
        body: "Turn your photos into something entirely new with AI. Explore different styles and give every image a fresh look.",
      },
    },
  },
  companion: {
    title: "More Than a Camera. Support Before You Need It.",
    assistantTitle: "AI Sports Companion",
    assistant: {
      assistant: {
        title: "AI Sports Assistant",
        body: "Have a question about your sport? Just ask. Rover answers sports-related questions whenever you need support.",
      },
      breathing: {
        title: "Breathing Monitoring",
        body: "Rover monitors your breathing during exercise and proactively alerts you by voice when unusual breathing patterns are detected.",
      },
      recap: {
        title: "AI Sport Recap",
        body: "When your workout ends, Rover brings your activity data together into a clear summary so you can better understand your performance.",
      },
    },
    safetyTitle: "AI Sports Safety",
    safety: {
      emergency: {
        title: "AI Emergency Recording",
        body: "Rover detects sudden braking and automatically starts recording — even when the camera is off. A 10-second pre-recording captures what happened before the event, while AI analyzes the footage to flag close passes or crashes.",
      },
      alerts: {
        title: "Proactive Safety Alerts",
        body: "Rover uses map and real-time weather data to alert you to upcoming climbs, descents, sharp turns, and changing conditions, helping you stay aware as you move.",
      },
    },
    alertsNote: "Proactive Safety Alerts are currently available in English only.",
  },
  audio: {
    title: "Hear What Matters. Stay Aware.",
    sub: "Open-ear audio that keeps you connected to your music, your group, and the road.",
    items: {
      wind: {
        title: "Wind Noise Reduction",
        body: "Ride at speeds up to 35 km/h and still hear your music, calls, and voice guidance clearly.",
      },
      mics: {
        title: "5-Mic Array",
        body: "Five microphones capture your voice from every angle, so you hear clearly and others hear you just as well.",
      },
      talk: {
        title: "Real-Time Walkie-Talkie",
        body: "Talk with your group in real time, hands-free. Create a group and invite friends through the BleeqUp app.",
      },
    },
  },
  power: {
    title: "More Power. Stay in Control.",
    sub: "Two accessories that stretch a ride and keep your hands on the bars.",
    items: {
      powerPlus: {
        title: "Power Plus",
        body: "A compact power module. Extend total recording time to up to 5 hours, or enjoy up to 48 hours of audio playback.",
      },
      controller: {
        title: "Bluetooth Controller",
        body: "Control key Rover functions remotely without reaching for your glasses. Stay focused on what's ahead.",
      },
    },
  },
  box: {
    title: "Everything You Need to Get Moving",
    sub: "What's in the box.",
    items: ["Rover", "Magnetic charging cable", "Prescription frame", "Storage kit", "Reference guides"],
  },
  specs: {
    title: "Key specs",
    items: [
      { label: "Weight", value: "53 g (frame) · 12 g (lens)" },
      { label: "Frame", value: "TR90, one-size, three-axis adjustable nose pad" },
      { label: "Water resistance", value: "IP65" },
      { label: "Camera", value: "16 MP · 4656 × 3496 photos" },
      { label: "Video", value: "1080p30/60 · 3K30/60 · 16:9 or 9:16" },
      { label: "Field of view", value: "120° eye-level · −10° / 0° / 15° tilt" },
      { label: "Battery", value: "260 mAh glasses · 1600 mAh Power Plus" },
      { label: "Runtime", value: "Video 1 h (+4 h with Power Plus) · Audio 8 h (+40 h)" },
      { label: "Charging", value: "1-hour quick charge" },
      { label: "Audio", value: "2 full-range speakers · 5-mic array" },
      { label: "Processor & storage", value: "Qualcomm · 64 GB" },
      { label: "Lens", value: "UV400, swappable" },
    ],
  },
  compare: {
    title: "Rover vs. Ranger",
    sub: "Same vision. A smarter way to ride.",
    featureColumn: "Feature",
    rover: "Rover",
    ranger: "Ranger",
    available: "Available",
    notAvailable: "Not available",
    shopRover: "Shop Rover",
    shopRanger: "Shop Ranger",
    rows: {
      weight: { label: "Weight", rover: "53 g", ranger: "49 g" },
      water: { label: "Water resistance", rover: "IP65", ranger: "IP54" },
      nosePad: {
        label: "Nose pad",
        rover: "Three-axis adjustable",
        ranger: "Three-axis adjustable",
      },
      storage: { label: "Storage", rover: "64 GB", ranger: "32 GB" },
      tilt: { label: "3-level tilt camera lens", rover: "−10° / 0° / 15°", ranger: "—" },
      eis: { label: "EIS", rover: "✓", ranger: "✓" },
      photo: { label: "Photo resolution", rover: "4656 × 3496", ranger: "4656 × 3496" },
      video: {
        label: "Video formats",
        rover: "1080p30 / 1080p60 / 3K30 / 3K60",
        ranger: "1080p30 / 1080p60 / 3K30 / 3K60",
      },
      ratio: {
        label: "Aspect ratios",
        rover: "16:9 · 9:16",
        ranger: "16:9 · 9:16",
      },
      loop: { label: "Loop recording", rover: "✓", ranger: "✓" },
      night: { label: "Night mode video", rover: "✓", ranger: "—" },
      hdr: { label: "Real-time HDR video", rover: "✓", ranger: "—" },
      hazard: { label: "AI hazard detection", rover: "✓", ranger: "—" },
      roadbook: { label: "AI video roadbook", rover: "✓", ranger: "—" },
      clipsSearch: { label: "AI clips search", rover: "✓", ranger: "—" },
      breathing: { label: "Breathing monitoring & analysis", rover: "✓", ranger: "—" },
      voice: { label: "Voice command", rover: "✓", ranger: "—" },
      assistant: {
        label: "AI sports voice assistant",
        rover: "AI Sports Q&A · AI Activity Recap",
        ranger: "—",
      },
      creator: {
        label: "AI Master Creator",
        rover: "AI Master Motion · AI Master Remix",
        ranger: "AI Master Motion · AI Master Remix",
      },
      speakers: { label: "Speakers", rover: "Full-range × 2", ranger: "× 4" },
      walkie: { label: "Walkie-talkie channel", rover: "✓", ranger: "✓" },
      walkieGroups: { label: "Walkie-talkie groups", rover: "✓", ranger: "—" },
    },
  },
  faq: {
    title: "Rover FAQ",
    items: [
      {
        q: "Why choose Rover?",
        a: "Rover combines eye-level 3K60 capture, AI support, open-ear audio, and modular accessories in one sports glasses experience built for riding.",
      },
      {
        q: "What does the 3-level tilt camera do?",
        a: "The camera can be set to −10°, 0°, or 15° so you keep a natural eye-level view across helmets, hats, cycling posture, and everyday recording.",
      },
      {
        q: "What AI video features does Rover include?",
        a: "Rover supports AI Highlight Detection, AI Video Search, One-Tap AI Editing, AI Video Roadbook, AI Master Motion, and AI Master Remix for easier capture, editing, and sharing.",
      },
      {
        q: "How does Rover support sports safety?",
        a: "Rover can detect sudden braking, start emergency recording with a 10-second pre-recording, and provide proactive alerts for climbs, descents, sharp turns, and changing weather conditions.",
      },
      {
        q: "What audio features are built in?",
        a: "Rover includes open-ear audio, wind noise reduction up to 35 km/h, a 5-mic array, and real-time walkie-talkie through the BleeqUp app.",
      },
      {
        q: "Which accessories are available?",
        a: "Power Plus extends total recording time to up to 5 hours or audio playback to up to 48 hours. The Bluetooth Controller lets you control key Rover functions without reaching for your glasses. Rover ZEISS, photochromic, and polarized lenses are swappable.",
      },
      {
        q: "Are Ranger accessories compatible with Rover?",
        a: "Rover uses its own lenses and prescription frame. Ranger lenses and the Ranger RX insert are not compatible with Rover. Use Rover Power Plus with Rover; Ranger Power Plus fits Ranger only. The Bluetooth Controller works with both.",
      },
    ],
  },
  cta: {
    title: "See One Step Ahead.",
    sub: "You keep riding. Rover keeps watch.",
    button: "Shop Rover",
  },
  home: {
    kicker: "New",
    title: "Meet BleeqUp Rover",
    sub: "3-level tilt camera, 3K60 HDR, AI sports assistant, and open-ear audio — Rover sees one step ahead so you can keep riding.",
    cta: "Shop Rover",
    learnMore: "Explore Rover",
  },
};
