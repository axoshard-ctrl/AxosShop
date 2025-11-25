import { useTheme } from "@/lib/themeContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Palette } from "lucide-react";

const colorSchemes = [
  { name: "Purple", value: "#8b5cf6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Green", value: "#10b981" },
  { name: "Orange", value: "#f59e0b" },
];

export function ThemeCustomizer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Current Theme */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Current Theme</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </Card>

      {/* Color Schemes */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Color Scheme</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.value}
                className="p-4 rounded-lg border-2 border-border hover:border-primary transition-colors"
                style={{
                  backgroundColor: scheme.value,
                  opacity: 0.1,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto border-2 border-foreground"
                  style={{ backgroundColor: scheme.value }}
                />
                <p className="text-xs font-medium mt-2">{scheme.name}</p>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Dark Mode Contrast Tips */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold text-foreground mb-3">Dark Mode Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Use high contrast colors for better readability</li>
          <li>✓ Avoid pure white text on dark backgrounds</li>
          <li>✓ Use slightly less saturated colors in dark mode</li>
          <li>✓ Test with blue light filter enabled</li>
          <li>✓ Ensure focus states are clearly visible</li>
        </ul>
      </Card>

      {/* Accessibility Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Accessibility Features</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" defaultChecked />
            <span className="text-sm text-foreground">Reduce motion (prefers-reduced-motion)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" defaultChecked />
            <span className="text-sm text-foreground">High contrast mode</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" defaultChecked />
            <span className="text-sm text-foreground">Focus indicators (visible outlines)</span>
          </label>
        </div>
      </Card>
    </div>
  );
}
