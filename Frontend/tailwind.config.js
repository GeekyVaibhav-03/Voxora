/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#baddff',
          300: '#8ec8ff',
          400: '#5aa8ff',
          500: '#2f86ff',
          600: '#1668f2',
          700: '#1454de',
          800: '#1645b4',
          900: '#173f8d',
        },
        surface: {
          950: '#070d1b',
          900: '#101a31',
          800: '#172441',
          700: '#22365e',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 16px 45px -18px rgba(20, 84, 222, 0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 500ms ease-out both',
      },
    },
  },
  plugins: [],
};
