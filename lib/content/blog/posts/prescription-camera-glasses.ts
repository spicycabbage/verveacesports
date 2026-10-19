import { KIM_CHEN } from "../author";
import type { BlogPost } from "../types";

export const prescriptionCameraGlasses: BlogPost = {
  slug: "prescription-camera-glasses",
  title: "Prescription Camera Glasses: How to Get Rx Lenses for BleeqUp Rover and Ranger",
  metaTitle: "Prescription Camera Glasses: Rx Options for BleeqUp",
  description:
    "Wear glasses? Here's how prescription works on BleeqUp Rover and Ranger camera glasses: included Rx frame, lens options, and what to bring your optician.",
  excerpt:
    "You don't need contacts to wear AI camera glasses. Both BleeqUp models include a prescription frame. Here's how to get it fitted, step by step.",
  publishedAt: "2026-09-29",
  category: "AI Glasses",
  author: KIM_CHEN,
  keywords: [
    "prescription camera glasses",
    "prescription smart glasses",
    "rx sports glasses",
    "bleequp prescription",
    "camera glasses for glasses wearers",
  ],
  image: {
    src: "/rover/art/box-desktop.webp",
    alt: "BleeqUp Rover box contents including the prescription frame insert",
  },
  productSlugs: [
    "bleequp-prescription-service",
    "bleequp-rover-ai-sports-glasses",
    "bleequp-ranger-zeiss-lens",
    "bleequp-rover-photochromic-lens",
  ],
  body: [
    {
      type: "p",
      text: "If you wear glasses, most smart glasses are a non-starter: you either squint through the ride or wear contacts. BleeqUp built prescription support into both of its AI sports glasses, so you can see clearly **and** record what you see.",
    },
    { type: "h2", text: "How prescription works on BleeqUp glasses" },
    {
      type: "p",
      text: "Both models use a **prescription frame insert**: a small inner frame that holds your Rx lenses and clips in behind the sport lens. You keep the UV400 sport lens in front and your corrective lenses behind it.",
    },
    {
      type: "ul",
      items: [
        "**[BleeqUp Rover](/products/bleequp-rover-ai-sports-glasses):** a prescription frame comes in the box, along with the magnetic charging cable and storage kit.",
        "**[BleeqUp Ranger](/products/bleequp-ranger-zeiss-lens):** a prescription frame insert is included with every Ranger purchase.",
      ],
    },
    {
      type: "callout",
      text: "Rover and Ranger use different inserts. The Ranger RX insert does **not** fit Rover, and Ranger lenses don't fit Rover either. Make sure your optician knows which model you have.",
    },
    { type: "h2", text: "Two ways to get your Rx lenses" },
    { type: "h3", text: "Option 1: BleeqUp prescription customization" },
    {
      type: "p",
      text: "Order [BleeqUp Prescription Customization](/products/bleequp-prescription-service) and have lenses made for the insert. This is the simplest route if you don't have an optician you trust or want everything handled in one place.",
    },
    { type: "h3", text: "Option 2: Your local optician" },
    {
      type: "p",
      text: "Take the insert to your optician and have lenses cut to fit, the same as any frame. Many golfers and cyclists prefer this because they can use insurance or vision benefits and get an in-person fitting.",
    },
    { type: "h2", text: "What to bring to your optician" },
    {
      type: "ol",
      items: [
        "**Your current prescription**, ideally from an eye exam in the last one to two years.",
        "**Your pupillary distance (PD).** It's critical for sport glasses, because a wrong PD causes eye strain on long rides.",
        "**The prescription frame insert** for your exact model.",
        "**Your use case.** Tell them it's for sport and distance vision. Progressive and high-index lenses may have limits in small inserts, so ask the optician what's possible for your Rx.",
      ],
    },
    { type: "h2", text: "Choosing a sport lens to pair with your Rx" },
    {
      type: "p",
      text: "Your prescription insert handles clarity. The outer lens handles light. On Rover you can swap between:",
    },
    {
      type: "ul",
      items: [
        "[ZEISS lens](/products/bleequp-rover-zeiss-lens) for crisp contrast in bright conditions.",
        "[Photochromic lens](/products/bleequp-rover-photochromic-lens), the best all-rounder for Rx wearers because you never need to swap for dawn, dusk, or forest trails.",
        "[Polarized lens](/products/bleequp-rover-polarized-lens) to cut glare off water and wet roads.",
      ],
    },
    {
      type: "p",
      text: "Ranger has its own swappable lens range, including the [ZEISS blue lens](/products/zeiss-blue-lens) upgrade for sharper contrast and less glare.",
    },
    { type: "h2", text: "Does a prescription affect the camera?" },
    {
      type: "p",
      text: "No. The camera sits in the frame, not behind your lenses, so your footage is the same whether or not you wear the Rx insert. You'll still get Rover's 3K60 HDR video and 3-level tilt camera, or Ranger's 3K60 with EIS.",
    },
    { type: "h2", text: "Prescription camera glasses vs. contacts" },
    {
      type: "table",
      caption: "Rx insert vs. contact lenses with camera glasses",
      head: ["", "Rx insert", "Contacts + camera glasses"],
      rows: [
        ["Comfort on long days", "Good: nothing in your eyes", "Can dry out in wind"],
        ["Setup cost", "Lenses for the insert", "Ongoing supply"],
        ["Dust and wind", "Double-lens protection", "Debris can irritate"],
        ["Swap with friends", "Remove insert", "Easy"],
      ],
    },
    {
      type: "p",
      text: "Still choosing a model? Our [cycling smart glasses guide](/blog/best-smart-glasses-for-cycling) and the [Rover vs. Ranger comparison](/compare) will help.",
    },
  ],
  faq: [
    {
      q: "Can you get BleeqUp camera glasses with a prescription?",
      a: "Yes. Rover and Ranger both include a prescription frame insert. Get Rx lenses through BleeqUp's prescription customization service or from your local optician.",
    },
    {
      q: "Does the Ranger prescription insert fit Rover?",
      a: "No. Rover uses its own prescription frame and lenses. Ranger lenses and the Ranger RX insert are not compatible with Rover.",
    },
    {
      q: "Can my optician make lenses for camera glasses?",
      a: "Yes. Bring the prescription insert, your current prescription, and your pupillary distance. Ask whether your Rx (especially progressives or strong prescriptions) suits a small sport insert.",
    },
  ],
};
