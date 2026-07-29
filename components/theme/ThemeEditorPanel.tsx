"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Copy, Moon, RotateCcw, Sliders, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BRAND_SWATCHES,
  SURFACE_SWATCHES,
  type ThemeColors,
  type ThemeMode,
} from "@/lib/theme/tokens";
import { useTheme } from "./ThemeProvider";
import { ColorPicker } from "./ColorPicker";

// A custom color control: a preview chip that expands an inline visual color picker.
function CustomColor({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (hex: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
        aria-expanded={open}
      >
        <span
          className="size-9 shrink-0 rounded-md border border-border ring-1 ring-foreground/10"
          style={{ backgroundColor: value }}
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-medium leading-tight">
            <Sliders className="size-3.5" />
            Custom {label.toLowerCase()}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {open ? "Drag to pick any color" : "Tap to open the color picker"}
          </p>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-border p-3">
          <ColorPicker value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

function ThemePreview({ colors }: { colors: ThemeColors }) {
  return (
    <div
      className="overflow-hidden rounded-xl border shadow-sm"
      style={{ borderColor: colors.border }}
    >
      <div
        className="flex items-center gap-3 border-b px-3 py-2.5"
        style={{ backgroundColor: colors.background, borderColor: colors.border }}
      >
        <Image
          src="/verveace_logo.webp"
          alt="VerveaceSports"
          width={130}
          height={30}
          className="h-6 w-auto"
        />
        <span className="ml-auto text-[11px]" style={{ color: colors["muted-foreground"] }}>
          Live preview
        </span>
      </div>
      <div className="space-y-2.5 p-3" style={{ backgroundColor: colors.background }}>
        <p className="text-sm font-medium" style={{ color: colors.foreground }}>
          Premium sporting goods
        </p>
        <p className="text-xs" style={{ color: colors["muted-foreground"] }}>
          Secondary copy reads here.
        </p>
        <div
          className="flex items-center gap-2 rounded-lg p-2.5"
          style={{ backgroundColor: colors.card, color: colors["card-foreground"] }}
        >
          <span
            className="size-8 rounded-md"
            style={{ backgroundColor: colors.primary }}
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">Product card</p>
            <p className="text-[11px]" style={{ color: colors["muted-foreground"] }}>
              $129.00
            </p>
          </div>
          <span
            className="ml-auto rounded-md px-2 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: colors.primary, color: colors["primary-foreground"] }}
          >
            Add
          </span>
        </div>
      </div>
    </div>
  );
}

function Swatch({
  color,
  name,
  selected,
  onClick,
  ring,
}: {
  color: string;
  name: string;
  selected: boolean;
  onClick: () => void;
  ring: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      aria-label={name}
      aria-pressed={selected}
      className="group relative flex aspect-square items-center justify-center rounded-lg border transition-transform hover:scale-105"
      style={{
        backgroundColor: color,
        borderColor: selected ? ring : "rgba(127,127,127,0.3)",
        boxShadow: selected ? `0 0 0 2px ${ring}` : undefined,
      }}
    >
      {selected && (
        <Check
          className="size-4 drop-shadow"
          style={{ color: ring === color ? "#ffffff" : ring }}
        />
      )}
    </button>
  );
}

type ThemeEditorPanelProps = {
  variant?: "page" | "modal";
};

export function ThemeEditorPanel({ variant = "page" }: ThemeEditorPanelProps) {
  const { mode, colors, setMode, setBrand, setBackground, resetMode, copyCss } = useTheme();
  const isModal = variant === "modal";

  const surfaces = SURFACE_SWATCHES[mode];

  const body = (
    <div className="space-y-6">
      <ModeToggle mode={mode} onChange={setMode} />

      <ThemePreview colors={colors} />

      <section className="space-y-2.5">
        <div>
          <p className="text-sm font-semibold">Brand color</p>
          <p className="text-xs text-muted-foreground">
            Buttons, links & highlights. Pick a swatch or set your own.
          </p>
        </div>
        <div className="grid grid-cols-8 gap-2">
          {BRAND_SWATCHES.map((swatch) => (
            <Swatch
              key={swatch.value}
              color={swatch.value}
              name={swatch.name}
              ring={swatch.value}
              selected={colors.primary.toLowerCase() === swatch.value.toLowerCase()}
              onClick={() => setBrand(swatch.value)}
            />
          ))}
        </div>
        <CustomColor value={colors.primary} onChange={setBrand} label="Brand color" />
      </section>

      <section className="space-y-2.5">
        <div>
          <p className="text-sm font-semibold">
            {mode === "dark" ? "Dark background" : "Light background"}
          </p>
          <p className="text-xs text-muted-foreground">
            The page backdrop. Cards &amp; surfaces are shaded from this automatically.
          </p>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {surfaces.map((swatch) => (
            <div key={swatch.value} className="space-y-1">
              <Swatch
                color={swatch.value}
                name={swatch.name}
                ring={colors.primary}
                selected={colors.background.toLowerCase() === swatch.value.toLowerCase()}
                onClick={() => setBackground(swatch.value)}
              />
              <p className="text-center text-[10px] text-muted-foreground">{swatch.name}</p>
            </div>
          ))}
        </div>
        <CustomColor value={colors.background} onChange={setBackground} label="Background" />
      </section>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={resetMode} className="flex-1">
          <RotateCcw className="size-4" data-icon="inline-start" />
          Reset {mode}
        </Button>
        <Button variant="secondary" size="sm" onClick={copyCss} className="flex-1">
          <Copy className="size-4" data-icon="inline-start" />
          Copy CSS
        </Button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-4 pb-8">{body}</div>
      </div>
    );
  }

  return <div className="mx-auto max-w-lg">{body}</div>;
}

function ModeToggle({ mode, onChange }: { mode: ThemeMode; onChange: (mode: ThemeMode) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">Editing theme</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {(["light", "dark"] as const).map((value) => {
          const active = mode === value;
          const Icon = value === "light" ? Sun : Moon;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              aria-pressed={active}
              className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {value}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Customers switch between these two with the toggle in the header.
      </p>
    </div>
  );
}
