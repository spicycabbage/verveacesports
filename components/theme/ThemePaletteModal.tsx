"use client";

import { useState } from "react";
import { Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeEditorPanel } from "./ThemeEditorPanel";

export function ThemePaletteModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="lg"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[60] hidden gap-2 shadow-xl sm:inline-flex"
        aria-label={open ? "Close color palette" : "Open color palette"}
        aria-expanded={open}
      >
        <Palette className="size-5" />
        <span>Colors</span>
      </Button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close color palette"
            className="fixed inset-0 z-[59] bg-black/20"
            onClick={() => setOpen(false)}
          />
          <aside
            className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
            aria-label="Color palette"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Palette className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Color palette</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
            <ThemeEditorPanel variant="modal" />
          </aside>
        </>
      )}
    </>
  );
}
