/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primaryFrom: '#3DC4E0',
        primaryTo: '#4985EE',
        textPrimary: '#000000',
        textSecondary: '#868686',
        textWhite: '#FFFFFF',
      }
    },
  },
  plugins: [],
}