/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
    './store/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand Colors (from BazaarSathi logo) ──────────────
        primary: {
          DEFAULT: '#2BBDA4',   // main teal — cart color
          50:  '#E8FAF7',
          100: '#C5F2EB',
          200: '#8FE5D7',
          300: '#59D8C3',
          400: '#2BBDA4',
          500: '#22A08A',
          600: '#1A7A6E',       // dark teal — BAZAAR text
          700: '#135C53',
          800: '#0C3D37',
          900: '#061F1C',
        },
        accent: {
          DEFAULT: '#F5A623',   // orange — wheels + leaf
          50:  '#FEF6E7',
          100: '#FDEAC3',
          200: '#FBD487',
          300: '#F9BE4B',
          400: '#F5A623',
          500: '#E08E0B',
          600: '#B87209',
          700: '#8A5507',
          800: '#5C3904',
          900: '#2E1C02',
        },
        dark: {
          DEFAULT: '#1E3A3A',   // dark text — SAATHI text
          50:  '#E8EDED',
          100: '#C5D4D4',
          200: '#8FAAAA',
          300: '#598080',
          400: '#2E5757',
          500: '#1E3A3A',
          600: '#172C2C',
          700: '#101F1F',
          800: '#0A1414',
          900: '#050A0A',
        },
        // ── Semantic Colors ───────────────────────────────────
        success: '#22C55E',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#3B82F6',
      },

      fontFamily: {
        sans:    ['Nunito', 'sans-serif'],       // body text — friendly + readable
        heading: ['Poppins', 'sans-serif'],      // headings — modern + bold
      },

      borderRadius: {
        xl:  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },

      boxShadow: {
        card:  '0 2px 12px rgba(0, 0, 0, 0.08)',
        hover: '0 8px 24px rgba(43, 189, 164, 0.2)',
        btn:   '0 4px 12px rgba(43, 189, 164, 0.3)',
      },

      screens: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}