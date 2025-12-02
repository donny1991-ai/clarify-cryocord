/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cryo: {
          red: '#B01E2D',
          dark: '#111827',
          light: '#F3F4F6',
          white: '#FFFFFF'
        },
        microscope: {
          light: '#f8fafc',
        },
        deep: {
          charcoal: '#1f2937',
        },
        muted: {
          grey: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
