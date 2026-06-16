"use client";

import { cn } from "@/lib/utils";
import type { OptionAxis, VariantOptionKey } from "@/lib/utils/variants";

type Props = {
  axes: OptionAxis[];
  selection: Partial<Record<VariantOptionKey, string>>;
  onSelect: (key: VariantOptionKey, value: string) => void;
  disabledValues?: Partial<Record<VariantOptionKey, Set<string>>>;
};

export function VariantPicker({ axes, selection, onSelect, disabledValues }: Props) {
  if (axes.length === 0) return null;

  return (
    <div className="space-y-4">
      {axes.map((axis) => (
        <div key={axis.key} className="space-y-2">
          <p className="text-sm font-medium">{axis.name}</p>
          <div className="flex flex-wrap gap-2">
            {axis.values.map((value) => {
              const selected = selection[axis.key] === value;
              const disabled = disabledValues?.[axis.key]?.has(value);
              return (
                <button
                  key={value}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(axis.key, value)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
