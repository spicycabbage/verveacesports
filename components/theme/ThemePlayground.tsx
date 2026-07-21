import { Badge } from "@/components/ui/badge";
import { ThemeEditorPanel } from "@/components/theme/ThemeEditorPanel";

export function ThemePlayground() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 max-w-2xl">
        <Badge variant="secondary" className="mb-3">
          Design tool
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Theme</h1>
        <p className="mt-2 text-muted-foreground">
          Set up your <strong className="text-foreground">Light</strong> and{" "}
          <strong className="text-foreground">Dark</strong> themes. Pick a brand color and
          background from the swatches — everything else is derived for you. Customers switch
          between the two with the toggle in the header.
        </p>
      </div>

      <ThemeEditorPanel variant="page" />
    </div>
  );
}
