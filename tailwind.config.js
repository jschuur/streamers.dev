module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  // These are needed for dynamic class references in the Badge component
  safelist: [
    'bg-yellow-100',
    'text-yellow-800',
    'visited:text-yellow-800',
    'bg-red-100',
    'text-red-800',
    'visited:text-red-800',
    'bg-purple-100',
    'text-purple-800',
    'visited:text-purple-800',
    'bg-green-100',
    'text-green-800',
    'visited:text-green-800',
    'bg-gray-100',
    'text-gray-800',
    'visited:text-gray-800',
    'bg-blue-100',
    'text-blue-800',
    'visited:text-blue-800',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        header: ['Fira Sans Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-debug-screens')],
};
