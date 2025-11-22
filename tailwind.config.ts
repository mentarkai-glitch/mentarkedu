import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy HSL Colors (for compatibility)
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        
        // Mentark Brand Colors
        gold: {
          DEFAULT: "#FFD700",
          bright: "#FFED4E",
          soft: "#FED766",
          dark: "#FFA500",
          10: "rgba(255, 215, 0, 0.1)",
          20: "rgba(255, 215, 0, 0.2)",
          30: "rgba(255, 215, 0, 0.3)",
          40: "rgba(255, 215, 0, 0.4)",
          50: "rgba(255, 215, 0, 0.5)",
        },
        blue: {
          DEFAULT: "#4A90E2",
          light: "#7BB3F0",
          dark: "#2E5C8A",
          10: "rgba(74, 144, 226, 0.1)",
          20: "rgba(74, 144, 226, 0.2)",
          30: "rgba(74, 144, 226, 0.3)",
        },
        green: {
          DEFAULT: "#00C896",
          light: "#4FD9B7",
          dark: "#008B6D",
          10: "rgba(0, 200, 150, 0.1)",
          20: "rgba(0, 200, 150, 0.2)",
          30: "rgba(0, 200, 150, 0.3)",
        },
        purple: {
          DEFAULT: "#7B68EE",
          light: "#9B8AFF",
          dark: "#5A4FCF",
          10: "rgba(123, 104, 238, 0.1)",
          20: "rgba(123, 104, 238, 0.2)",
          30: "rgba(123, 104, 238, 0.3)",
        },
        
        // Semantic Colors
        success: {
          DEFAULT: "#00C896",
          light: "#4FD9B7",
          dark: "#008B6D",
          10: "rgba(0, 200, 150, 0.1)",
          20: "rgba(0, 200, 150, 0.2)",
        },
        warning: {
          DEFAULT: "#FF8C42",
          light: "#FFB080",
          dark: "#E66F2A",
          10: "rgba(255, 140, 66, 0.1)",
          20: "rgba(255, 140, 66, 0.2)",
        },
        error: {
          DEFAULT: "#FF6B6B",
          light: "#FF9999",
          dark: "#E63946",
          10: "rgba(255, 107, 107, 0.1)",
          20: "rgba(255, 107, 107, 0.2)",
        },
        info: {
          DEFAULT: "#4A90E2",
          light: "#7BB3F0",
          dark: "#2E5C8A",
          10: "rgba(74, 144, 226, 0.1)",
          20: "rgba(74, 144, 226, 0.2)",
        },
        
        // Neutral Colors (Slate Scale)
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
        
        // Legacy yellow (for backward compatibility)
        yellow: {
          neon: "#FFD700",
          bright: "#FFED4E",
          soft: "#FED766",
          dark: "#FFA500",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
        // Legacy support
        DEFAULT: "var(--radius)",
      },
      spacing: {
        // 4px base unit
        0: "0px",
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px rgba(0, 0, 0, 0.2)",
        inner: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
        "gold-sm": "0 0 10px rgba(255, 215, 0, 0.2)",
        "gold-md": "0 0 20px rgba(255, 215, 0, 0.3)",
        "gold-lg": "0 0 30px rgba(255, 215, 0, 0.4)",
        "purple-sm": "0 0 10px rgba(123, 104, 238, 0.2)",
        "purple-md": "0 0 20px rgba(123, 104, 238, 0.3)",
        "purple-lg": "0 0 30px rgba(123, 104, 238, 0.4)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        // Standard transitions
        "fast": "150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "normal": "200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slow": "300ms cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
        slower: "500ms",
      },
      zIndex: {
        base: "0",
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        "modal-backdrop": "1040",
        modal: "1050",
        popover: "1060",
        tooltip: "1070",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-cyan-blue": "linear-gradient(135deg, #FFD700 0%, #FFED4E 100%)",
        "gradient-yellow-gold": "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
        "gradient-yellow-pink": "linear-gradient(135deg, #FFD700 0%, #FF006E 100%)",
        "gradient-yellow-green": "linear-gradient(135deg, #FFD700 0%, #00FF41 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

