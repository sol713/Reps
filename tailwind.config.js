export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#F2F2F7",
          card: "#FFFFFF",
          primary: "#007AFF",
          "primary-dark": "#0056CC",
          success: "#34C759",
          "success-dark": "#2AA048",
          text: "#1C1C1E",
          muted: "#8E8E93",
          divider: "#E5E5EA",
          danger: "#FF3B30",
          warning: "#FF9500"
        },
        gradient: {
          start: "#667eea",
          middle: "#764ba2",
          end: "#f093fb"
        }
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        input: "10px"
      },
      boxShadow: {
        "card": "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06)",
        "button": "0 4px 12px rgba(0, 122, 255, 0.25)",
        "button-active": "0 2px 6px rgba(0, 122, 255, 0.2)",
        "floating": "0 12px 28px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.08)"
      },
      animation: {
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-sm": "bounce-sm 0.5s ease-in-out"
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".7" }
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "bounce-sm": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" }
        }
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};
