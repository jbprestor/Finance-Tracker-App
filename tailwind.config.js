/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        neutral: {
          900: "#171717",
          50: "#fafafa",
        },
        primary: "#a3e635",
        text: "#fff",
      }
    },
  },
  plugins: [],
}
