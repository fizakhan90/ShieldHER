// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */ // Keep this line if using JS
// import type { Config } from 'tailwindcss'; // Use this line if using TS

// const config: Config = { // Use this line if using TS
const config = { // Use this line if using JS
  content: [
    // ** Ensure these paths are correct for your project structure **
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Scan files in the 'app' directory
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Scan files in a 'components' directory (if you have one)
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Keep this if you still have a 'pages' directory
    // Add any other directories where you write code using Tailwind classes
  ],
  theme: {
    extend: {
      // Add your custom theme extensions here if needed
    },
  },
  plugins: [
    // Add your Tailwind plugins here if needed
  ],
};

// export default config; // Use this line if using TS
module.exports = config; // Use this line if using JS