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
        // base — loum QUINTESSENCE v6 void (SSOT: loum Design System tokens/colors.css)
        space: "#111019",
        "space-2": "#1A1829",
        ink: "#F8F7F2",
        "ink-soft": "#FBFAFF",
        // primary accent — Moodboard Explorations (mainColor): iris-Blau statt
        // aura-Violett. Token-Name bleibt `violet`, damit Klassennamen halten.
        violet: "#7896FF",
        // secondary punctual accent — mystic (the pulse)
        cyan: "#20F0D0",
        mint: "#20F0D0",
        // rim-lights / soft accent — heller Tint des Akzents (iris-300)
        lilac: "#97B5FF",
        "mint-soft": "#68F8EE",
        // dialog/KI accent — azure (v6)
        azure: "#5599FF",
        // ── semantic surface / line / text tokens (single source of truth;
        //    use these instead of inline rgba literals) ──
        surface: "rgba(248,247,242,0.04)",
        "surface-2": "rgba(248,247,242,0.07)",
        card: "rgba(120,150,255,0.06)",
        line: "rgba(248,247,242,0.10)",
        "line-soft": "rgba(248,247,242,0.06)",
        "line-accent": "rgba(120,150,255,0.25)",
        txt: "#F8F7F2",
        "txt-2": "rgba(248,247,242,0.85)",
        "txt-3": "rgba(238,245,248,0.55)",
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
        // aspect semantic colors (QUINTESSENCE-abgestimmt: Sextil=azure, Trigon=mystic)
        aspect: {
          conj: "#e7dcff",
          sextile: "#5599FF",
          square: "#aa5cff",
          trine: "#20F0D0",
          opp: "#ff8fb0",
        },
      },
      fontFamily: {
        // Two Faces (loum v6): Cinzel = Display, Cinzel Decorative = lit word,
        // Bricolage Grotesque = alles andere
        cinzel: ['"Cinzel"', "ui-serif", "Georgia", "serif"],
        deco: ['"Cinzel Decorative"', '"Cinzel"', "ui-serif", "serif"],
        serif: ['"Cinzel"', "ui-serif", "Georgia", "serif"],
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        glyph: ['"Noto Sans Symbols"', '"Segoe UI Symbol"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        sheet: "24px",
        pill: "999px",
      },
      boxShadow: {
        // loum card chemistry: die EINZIGE Kante ist die 1px-Inset-Hairline —
        // kein äußerer Drop-Shadow (Figma reading-rest)
        glass: "inset 0 0 0 1px rgba(255,255,255,0.07)",
        // moon-CTA-Schatten — weicher iris-Schatten (Figma event-card CTA)
        glow: "0 8px 20px rgba(120,150,255,0.25)",
        // hover lift — hellere Hairline statt Drop-Shadow
        lift: "inset 0 0 0 1px rgba(255,255,255,0.12)",
      },
      backgroundImage: {
        // --grad-halo (v6): KI/Dialog-Flächen — Chat-Send, KI-CTA
        "cta-gradient":
          "linear-gradient(135deg,#5599FF 0%,#7241FF 100%)",
        // Text trägt NIE einen Verlauf (loum-Norm) — Klasse rendert solid bone
        "iris-text": "none",
        // chart-stage — SOLIDE dunkle Karte, Tiefe von INNEN (radiale Glows)
        "stage":
          "radial-gradient(120% 90% at 80% 0%, rgba(120,150,255,0.10) 0%, transparent 55%), radial-gradient(80% 60% at 8% 105%, rgba(32,240,208,0.05) 0%, transparent 60%), linear-gradient(180deg, #16161F 0%, #12121D 100%)",
        // solide Karten-Füllung (--surface-card)
        "glasswash":
          "linear-gradient(180deg, #16161F 0%, #12121D 100%)",
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
