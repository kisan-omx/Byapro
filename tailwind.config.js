/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['NotoSansDevanagari_400Regular', 'sans-serif'],
        medium: ['NotoSansDevanagari_500Medium', 'sans-serif'],
        semibold: ['NotoSansDevanagari_600SemiBold', 'sans-serif'],
        bold: ['NotoSansDevanagari_700Bold', 'sans-serif'],
        extrabold: ['NotoSansDevanagari_800ExtraBold', 'sans-serif'],
        black: ['NotoSansDevanagari_900Black', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.35rem' }], // 12px, 21.6px
        sm: ['0.875rem', { lineHeight: '1.6rem' }], // 14px, 25.6px
        base: ['1rem', { lineHeight: '1.75rem' }], // 16px, 28px
        lg: ['1.125rem', { lineHeight: '1.875rem' }], // 18px, 30px
        xl: ['1.25rem', { lineHeight: '2rem' }], // 20px, 32px
        '2xl': ['1.5rem', { lineHeight: '2.25rem' }], // 24px, 36px
        '3xl': ['1.875rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.25rem', { lineHeight: '3rem' }],
      },
      colors: {
        // Brand Colors
        primary: "#0EA5E9",       // Vibrant Sky Blue
        "primary-dark": "#3B82F6",
        "primary-light": "#E0F2FE",

        secondary: "#16A34A",     // Success Green
        "secondary-dark": "#15803D",
        "secondary-light": "#DCFCE7",

        // UI Colors
        background: "#F9FAFB", // Very light gray
        surface: "#FFFFFF",

        text: "#0F172A",
        "text-secondary": "#475569",

        border: "#E2E8F0",

        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
        "error-light": "#FEE2E2",
        info: "#0EA5E9",
      },
    },
  },
  plugins: [],
};