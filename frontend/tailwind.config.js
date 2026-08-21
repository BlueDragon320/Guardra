/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#09090b',
          surface: '#121215',
          elevated: '#18181b',
          border: '#27272a',
          hover: '#202024'
        }
      }
    },
  },
  plugins: [],
}
