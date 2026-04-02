/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pastel: {
          blue: '#B5D8F7',
          purple: '#D4B5F7',
          pink: '#F7B5D8',
          green: '#B5F7D8',
          yellow: '#F7F0B5',
          orange: '#F7D4B5',
          lavender: '#E8D5F5',
          mint: '#D5F5E8',
          peach: '#F5E8D5',
          sky: '#D5E8F5',
        },
        primary: {
          50: '#F0F4FF',
          100: '#DBE4FF',
          200: '#BAC8FF',
          300: '#91A7FF',
          400: '#748FFC',
          500: '#5C7CFA',
          600: '#4C6EF5',
          700: '#4263EB',
          800: '#3B5BDB',
          900: '#364FC7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease',
        'fade-in': 'fadeIn 0.2s ease',
        'slide-in-up': 'slideInUp 0.3s ease',
        'scale-in': 'scaleIn 0.2s ease',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
