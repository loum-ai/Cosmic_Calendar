import type { Config } from "tailwindcss";

/**
 * Vela design tokens, ported verbatim from the Claude Design prototype
 * (vela.dc.html). The whole app's look-and-feel ("Anmutung") lives here:
 * jewel-tone iridescence, deep glossy black, violet <-> emerald.
 * No flat / Material — depth, glow and glass everywhere.
 */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // base
        space: "#01000b",
        "space-2": "#0a0712",
        ink: "#f6f2fe",
        "ink-soft": "#f3eefe",
        // primary CTA gradient stops
        violet: "#9a4fff",
        cyan: "#4fd6ef",
        mint: "#1fd07e",
        // accent / lilac used for borders & rim-lights
        lilac: "#c4a6ff",
        "mint-soft": "#7df0bf",
        // planet semantic colors
        planet: {
          sun: "#ffd9a0",
          moon: "#cfe0ff",
          mercury: "#7ab0cc",
          venus: "#00e8c0",
          mars: "#ff5535",
          jupiter: "#f8c050",
          saturn: "#c898f8",
          chiron: "#80c8ff",
          asc: "#c4a6ff",
          node: "#9bc0ff",
        },
        // aspect semantic colors
        aspect: {
          conj: "#e7dcff",
          sextile: "#4fd6ef",
          square: "#aa5cff",
          trine: "#2fde8c",
          opp: "#ff8fb0",
        },
      },
      fontFamily: {
        // elegant high-contrast serif for the cinematic hero headlines
        serif: ['"Cormorant Garamond"', "serif"],
        display: ['"Plus Jakarta Sans"', "sans-serif"],
        body: ['"Manrope"', "sans-serif"],
        glyph: ['"Noto Sans Symbols"', '"Segoe UI Symbol"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "22px",
        sheet: "26px",
        pill: "999px",
      },
      boxShadow: {
        // rim-light + soft long drop, the signature glass card shadow
        glass:
          "inset 0 1px 0 rgba(255,255,255,0.14), 0 20px 48px -16px rgba(0,0,0,0.7)",
        glow: "0 14px 32px -8px rgba(120,90,200,0.7), 0 0 0 6px rgba(120,90,200,0.12)",
        lift: "0 22px 48px -14px rgba(110,38,220,0.72), 0 0 0 1px rgba(196,166,255,0.42)",
      },
      backgroundImage: {
        "cta-gradient":
          "linear-gradient(135deg,#9a4fff,#4fd6ef 55%,#1fd07e)",
        "iris-text":
          "linear-gradient(110deg,#d9c6ff 0%,#bca6f6 28%,#9ff0cf 64%,#86e6bf 100%)",
      },
      keyframes: {
        velaSpin: { to: { transform: "rotate(360deg)" } },
        velaSpinR: { to: { transform: "rotate(-360deg)" } },
        velaFloat: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        velaDrift: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(22px,-18px) scale(1.07)" },
          "100%": { transform: "translate(0,0) scale(1)" },
        },
        velaBreath: {
          "0%,100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        velaTwinkle: {
          "0%,100%": { opacity: "0.25", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        velaTw2: {
          "0%,100%": { opacity: "0.12", transform: "scale(0.7)" },
          "50%": { opacity: "0.9", transform: "scale(1.25)" },
        },
        velaComet: {
          "0%": { opacity: "0" },
          "8%": { opacity: "0.65" },
          "90%": { opacity: "0.25" },
          "100%": { opacity: "0", transform: "translate(260px,260px)" },
        },
        velaRipple: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        velaPulse: {
          "0%,100%": { transform: "scale(1)", opacity: "0.45" },
          "50%": { transform: "scale(1.12)", opacity: "0.82" },
        },
        velaPulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.65" },
          "65%": { transform: "scale(1.8)", opacity: "0" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        velaIridescentShift: {
          "0%,100%": { filter: "hue-rotate(0deg) brightness(1)" },
          "50%": { filter: "hue-rotate(18deg) brightness(1.12)" },
        },
        velaSlideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        spin18: "velaSpin 18s linear infinite",
        float: "velaFloat 6s ease-in-out infinite",
        floatSlow: "velaFloat 8s ease-in-out infinite",
        drift: "velaDrift 22s ease-in-out infinite",
        breath: "velaBreath 11s ease-in-out infinite",
        twinkle: "velaTwinkle 4s ease-in-out infinite",
        ripple: "velaRipple 3.2s ease-out infinite",
        pulseSoft: "velaPulse 2.4s ease-in-out infinite",
        pulseRing: "velaPulseRing 2.2s ease-out infinite",
        iris: "velaIridescentShift 9s ease-in-out infinite",
        slideUp: "velaSlideUp .3s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
