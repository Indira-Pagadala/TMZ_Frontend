import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full glass flex items-center justify-center transition-all hover:scale-110"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-brand-accent transition-transform duration-500 rotate-0" />
      ) : (
        <Moon className="w-5 h-5 text-brand-primary transition-transform duration-500" />
      )}
    </button>
  );
}
