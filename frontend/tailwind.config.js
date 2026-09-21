/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--border) / <alpha-value>)",
        ring: "rgb(var(--brand-primary) / <alpha-value>)",
        background: "rgb(var(--bg-base) / <alpha-value>)",
        foreground: "rgb(var(--text-primary) / <alpha-value>)",
        base: "rgb(var(--bg-base) / <alpha-value>)",
        surface: "rgb(var(--bg-surface) / <alpha-value>)",
        sunken: "rgb(var(--bg-sunken) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--text-primary) / <alpha-value>)",
          foreground: "rgb(var(--bg-surface) / <alpha-value>)",
        },
        brand: {
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          accent: "rgb(var(--brand-accent) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--text-secondary) / <alpha-value>)",
          foreground: "rgb(var(--bg-surface) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          foreground: "rgb(255 255 255)",
        },
        muted: {
          DEFAULT: "rgb(var(--bg-sunken) / <alpha-value>)",
          foreground: "rgb(var(--text-secondary) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--brand-accent) / <alpha-value>)",
          foreground: "rgb(255 255 255)",
        },
        popover: {
          DEFAULT: "rgb(var(--bg-surface) / <alpha-value>)",
          foreground: "rgb(var(--text-primary) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--bg-surface) / <alpha-value>)",
          foreground: "rgb(var(--text-primary) / <alpha-value>)",
        },
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
