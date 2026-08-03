import { useTheme } from './useTheme';
import { Button } from '../../components/html/Button';
import { MoonIcon, SunIcon } from '../../components/icons/icons';
import { bg, bgHover, text } from '../../theme/tokens';
import { motion } from '../../theme/motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant='custom'
      onClick={toggleTheme}
      className={`p-2 rounded-lg ${bg.surfaceMuted} ${bgHover.surface} ${motion.colors}`}
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'light' ? (
        <MoonIcon className={`w-6 h-6 sm:w-5 sm:h-5 ${text.muted}`} />
      ) : (
        <SunIcon className={`w-6 h-6 sm:w-5 sm:h-5 ${text.warning}`} />
      )}
    </Button>
  );
}
