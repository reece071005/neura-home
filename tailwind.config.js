/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
      "./app/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primaryFrom: '#3DC4E0',
        primaryTo: '#4985EE',
        textPrimary: '#000000',
        textSecondary: '#868686',
        textWhite: '#FFFFFF',
        greyButton: '#C4C4C4'
      },
      fontFamily: {
        regular: ["Poppins"],
        medium: ["Poppins-Medium"],
        semibold: ["Poppins-SemiBold"],
        bold: ["Poppins-Bold"],
      },
      fontSize: {
        h1: ["32px", { lineHeight: "38px" }],
        h2: ["26px", { lineHeight: "32px" }],
        h3: ["22px", { lineHeight: "28px" }],

        body: ["16px", { lineHeight: "24px" }],
        subtext: ["14px", { lineHeight: "20px" }],
        hint: ["12px", { lineHeight: "16px" }],

        button: ["18px", { lineHeight: "20px" }],
        buttonSmall: ["16px", { lineHeight: "18px" }],
      }
    },
  },
  plugins: [],
}