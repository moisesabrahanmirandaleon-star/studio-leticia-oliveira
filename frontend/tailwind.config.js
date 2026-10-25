/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          50: '#FAF6F4',
          100: '#F5ECE8',
          200: '#EBDCD5',
          300: '#DDBFB2',
          400: '#CCA08F',
          500: '#B87F6C',
          600: '#A06654',
          700: '#7E4E40',
          800: '#5A372E',
          900: '#3D251F',
          gold: '#C5A880',
          dark: '#1C1917',
          card: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      }
    },
  },
  plugins: [],
}
