import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/solid';

export default function ThemeChanger() {
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className='absolute top-0 right-0 mt-2 mr-2'>
      {currentTheme === 'dark' ? (
        <SunIcon className='w-7 h-7' role='button' onClick={() => setTheme('light')} />
      ) : (
        <MoonIcon className='w-7 h-7' role='button' onClick={() => setTheme('dark')} />
      )}
    </div>
  );
}
