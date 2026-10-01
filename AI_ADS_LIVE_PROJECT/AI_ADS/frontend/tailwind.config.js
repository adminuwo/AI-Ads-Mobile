/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50, #F8F9FD)',
          100: 'var(--brand-100, #E8E3FF)',
          300: withOpacity('--brand-300-rgb'),
          400: withOpacity('--brand-400-rgb'),
          500: withOpacity('--brand-500-rgb'),
          600: withOpacity('--brand-600-rgb'),
          700: withOpacity('--brand-600-rgb'),
          accent: withOpacity('--brand-500-rgb'),
          cyan: withOpacity('--brand-400-rgb'),
        },
        lightBg: '#F8F9FD',
        lightCard: '#FFFFFF',
        darkBg: '#090d16',
        darkCard: '#111726',
        darkBorder: 'rgba(255, 255, 255, 0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px var(--brand-glow, rgba(123, 97, 255, 0.35))',
        'cyan-glow': '0 0 25px -5px var(--brand-glow, rgba(168, 130, 255, 0.35))',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
