/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#E6F2FC',
          100: '#CCE5F9',
          200: '#99CBEF',
          300: '#66B0E6',
          400: '#3396DC',
          500: '#0A6EBD',
          600: '#085897',
          700: '#064271',
          800: '#042C4B',
          900: '#021625',
        },
        success: {
          50: '#E8F8F2',
          100: '#D1F0E5',
          200: '#A3E0CB',
          300: '#75D1B1',
          400: '#47C197',
          500: '#12B886',
          600: '#0E936B',
          700: '#0A6E50',
          800: '#064A35',
          900: '#03251B',
        },
        danger: {
          50: '#FEF0F0',
          100: '#FDE0E0',
          200: '#FBC1C1',
          300: '#F9A2A2',
          400: '#F78383',
          500: '#FA5252',
          600: '#D63636',
          700: '#B21A1A',
          800: '#8D0E0E',
          900: '#690505',
        },
        dark: {
          DEFAULT: '#1A1A2E',
          50: '#F0F0F5',
          100: '#D1D1DE',
          200: '#A3A3BD',
          300: '#75759C',
          400: '#47477B',
          500: '#1A1A2E',
          600: '#151528',
          700: '#101022',
          800: '#0B0B1C',
          900: '#060616',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
