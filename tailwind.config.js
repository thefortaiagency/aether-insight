/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: {
          DEFAULT: "#D4AF38",
          50: "#FDF8E7",
          100: "#FBF0CE",
          200: "#F7E19D",
          300: "#F3D26C",
          400: "#EFC33B",
          500: "#D4AF38",
          600: "#B8922D",
          700: "#9C7522",
          800: "#805817",
          900: "#643B0C",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0) scale(1)" },
          "25%": { transform: "translateY(-20px) translateX(10px) scale(1.05)" },
          "50%": { transform: "translateY(10px) translateX(-10px) scale(0.95)" },
          "75%": { transform: "translateY(-10px) translateX(5px) scale(1.02)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "33%": { transform: "translateY(-30px) translateX(20px)" },
          "66%": { transform: "translateY(20px) translateX(-20px)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0) translateX(0) scale(1)" },
          "25%": { transform: "translateY(20px) translateX(-15px) scale(0.98)" },
          "50%": { transform: "translateY(-15px) translateX(10px) scale(1.05)" },
          "75%": { transform: "translateY(10px) translateX(-5px) scale(0.97)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        glow: {
          "0%, 100%": {
            filter: "brightness(1) drop-shadow(0 0 10px rgba(212, 175, 56, 0.3))",
          },
          "50%": {
            filter: "brightness(1.2) drop-shadow(0 0 20px rgba(212, 175, 56, 0.5))",
          },
        },
        sparkle: {
          "0%, 100%": {
            opacity: "0.3",
            transform: "scale(0.8)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 20s ease-in-out infinite",
        "float-slow": "float-slow 30s ease-in-out infinite",
        "float-delayed": "float-delayed 25s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        scan: "scan 8s linear infinite",
        shimmer: "shimmer 3s linear infinite",
        glow: "glow 3s ease-in-out infinite",
        sparkle: "sparkle 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}