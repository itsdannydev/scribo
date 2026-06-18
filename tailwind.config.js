/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Dark mode surfaces (pure black base)
        'bg-dark': '#000000',
        'surface-dark': '#0c0c0c',
        'card-dark': '#111111',
        'border-dark': '#222222',
        'border-dark-muted': '#1a1a1a',
        // Emerald accent extras
        'accent-dim-dark': '#064e3b',
        'accent-dim-light': '#ecfdf5',
        // Danger
        'danger-dim-dark': '#450a0a',
        'danger-dim-light': '#fef2f2',
      },
      fontFamily: {
        handwriting: ['Caveat_400Regular'],
        'handwriting-bold': ['Caveat_700Bold'],
      },
    },
  },
  plugins: [],
};
