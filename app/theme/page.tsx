import type { Metadata } from "next";
import { ThemePlayground } from "@/components/theme/ThemePlayground";

export const metadata: Metadata = {
  title: "Theme playground",
  description: "Live color scheme picker for VerveaceSports.",
  robots: { index: false, follow: false },
};

export default function ThemePage() {
  return <ThemePlayground />;
}
