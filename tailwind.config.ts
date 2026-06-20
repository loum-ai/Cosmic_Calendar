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
        // base — deep-space near-black anthracite
        space: "#06060F",
        "space-2": "#0a0a18",
        ink: "#f6f3ff",
        "ink-soft": "#f3effe",
        // primary accent — violet/lilac glow system
        violet: "#8B5CF6",
        // secondary punctual accent — teal
        cyan: "#2DD4BF",
        mint: "#2DD4BF",
        // accent / lilac used for borders & rim-lights
        lilac: "#b9a8ff",
        "mint-soft": "#7defd6",
        // ── semantic surface / line / text tokens (single source of truth;
        //    use these instead of inline rgba literals) ──
        surface: "rgba(255,255,255,0.04)",
        "surface-2": "rgba(255,255,255,0.07)",
        card: "rgba(120,80,255,0.06)",
        line: "rgba(255,255,255,0.08)",
        "line-soft": "rgba(255,255,255,0.06)",
        "line-accent": "rgba(150,100,255,0.25)",
        txt: "rgba(255,255,255,0.96)",
        "txt-2": "rgba(255,255,255,0.74)",
        "txt-3": "rgba(255,255,255,0.52)",
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
        mono: ['"Space Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
        glyph: ['"Noto Sans Symbols"', '"Segoe UI Symbol"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "22px",
        sheet: "26px",
        pill: "999px",
      },
      boxShadow: {
        // deep drop + hairline rim — the signature glass card shadow
        glass:
          "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.07)",
        // violet glow halo for FABs / primary CTAs
        glow: "0 4px 24px rgba(139,92,246,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
        // hover lift — deep drop + soft violet bloom
        lift: "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(139,92,246,0.2)",
      },
      backgroundImage: {
        "cta-gradient":
          "linear-gradient(135deg,#8B5CF6,#6D28D9)",
        "iris-text":
          "linear-gradient(110deg,#c4b5ff 0%,#8B5CF6 48%,#2DD4BF 100%)",
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
