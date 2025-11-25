import { useTheme } from "@/lib/themeContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ColorThemeSelector() {
  const { colorTheme, setColorTheme } = useTheme();

  return (
    <Select value={colorTheme} onValueChange={(value: any) => setColorTheme(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select color theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="purple">Purple</SelectItem>
        <SelectItem value="rose-pink">Rose Pink</SelectItem>
        <SelectItem value="rose-pink-purple">Rose Pink Purple Gradient</SelectItem>
      </SelectContent>
    </Select>
  );
}
