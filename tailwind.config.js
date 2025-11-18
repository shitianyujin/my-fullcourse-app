// tailwind.config.js (ESM 形式)

/** @type {import('tailwindcss').Config} */
export default { // 💡 export default に戻す
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|text|border|hover:bg)-(pink|green)-(50|100|200|600|700)/,
    },
  ],
};