/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f4f8', 100: '#dde5ee', 200: '#bbc9db', 300: '#8aa3bc',
          400: '#5c7a9a', 500: '#3d5c7e', 600: '#2d4a6a', 700: '#1e3a5f',
          800: '#142d4c', 900: '#0d1b2e',
        },
        teal: {
          50:  '#f0fdf9', 100: '#ccfbef', 200: '#99f6df', 300: '#5eead4',
          400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
          800: '#115e59', 900: '#134e4a',
        },
        coral: {
          50:  '#fff5f0', 100: '#ffe8df', 200: '#ffc9b0', 300: '#ffa07a',
          400: '#ff7c5c', 500: '#e05a2b', 600: '#c44b20', 700: '#a33b18',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['"Courier New"', 'monospace'],
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'teal-gradient': 'linear-gradient(135deg, #0d9488, #0a7c5c)',
      },
    },
  },
  plugins: [],
}