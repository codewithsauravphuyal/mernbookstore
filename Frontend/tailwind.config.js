/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'primary':'#474E93',
        'secondary':'#0D0842',
        'BlackBG':'#F3F3F3',  
      },
      fontFamily:{
        'primary':["Montserrat", "sans-serif"],
        'secondary':["Nunito Sans","sans-serif"]

      }
    },
  },
  plugins: [],
}