import { useTheme } from './useTheme';
import { Button } from '../../components/html/Button';
import { MoonIcon, SunIcon } from '../../components/icons/icons';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant='custom'
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-6 h-6 sm:w-5 sm:h-5 text-gray-800" />
      ) : (
        <SunIcon className="w-6 h-6 sm:w-5 sm:h-5 text-yellow-400" />
      )}
    </Button>
  );
}
