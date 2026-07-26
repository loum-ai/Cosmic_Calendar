/**
 * kontingent.ts — sagen, wenn das Modell-Kontingent aufgebraucht ist.
 *
 * Anlass (26.07.): Marcos Deutung scheiterte an einem 429 — 250 Anfragen pro
 * Tag für gemini-3.1-pro, aufgebraucht. Die App hat davon nichts gezeigt,
 * sondern still die Notfall-Schablone eingeblendet. Damit sah es aus, als
 * hätte VELA etwas über diesen Menschen zu sagen; in Wahrheit war nur das
 * Tageslimit erreicht.
 *
 * Lauras Vorgabe: keine Schablone, sondern eine klare Ansage — „Kontingent
 * aufgebraucht, schau in XX Stunden wieder vorbei". Die Wartezeit liefert
 * Google im Fehler selbst mit (`retryDelay: "13757s"`); sie wurde bisher nur
 * nie ausgelesen.
 */

export interface Kontingent {
  /** Tageskontingent des Modells erschöpft (HTTP 429 / RESOURCE_EXHAUSTED). */
  erschoepft: boolean;
  /** Aufgerundete Stunden bis zur Rücksetzung, wenn Google sie nennt. */
  stunden: number | null;
}

/** Liest den Gemini-Fehler, wie ihn die Edge Functions durchreichen. */
export function kontingentAus(detail: unknown): Kontingent {
  const fehler = (detail as any)?.error ?? detail;
  const code = fehler?.code ?? (detail as any)?.status;
  const status = String(fehler?.status ?? "");
  const erschoepft = code === 429 || status === "RESOURCE_EXHAUSTED";
  if (!erschoepft) return { erschoepft: false, stunden: null };

  // details[] enthält u. a. { "@type": "…RetryInfo", "retryDelay": "13757s" }
  const details: any[] = Array.isArray(fehler?.details) ? fehler.details : [];
  const roh = details.map((d) => d?.retryDelay).find((v) => typeof v === "string");
  const sekunden = roh ? parseFloat(String(roh).replace(/[^\d.]/g, "")) : NaN;
  return {
    erschoepft: true,
    stunden: Number.isFinite(sekunden) && sekunden > 0 ? Math.max(1, Math.ceil(sekunden / 3600)) : null,
  };
}

/**
 * Der Satz, den ein Mensch statt einer Deutung liest. Bewusst ohne Ausrede
 * und ohne Ersatztext: lieber ehrlich leer als plausibel falsch.
 */
export function kontingentText(k: Kontingent): string {
  if (!k.erschoepft) return "";
  return k.stunden
    ? `VELA-Kontingent für heute aufgebraucht. In etwa ${k.stunden} ${k.stunden === 1 ? "Stunde" : "Stunden"} ist es zurück — schau dann wieder vorbei.`
    : "VELA-Kontingent für heute aufgebraucht. Schau in ein paar Stunden wieder vorbei.";
}

/** Holt den Fehlerkörper aus einem fehlgeschlagenen `functions.invoke`. */
export async function fehlerKoerper(error: unknown): Promise<unknown> {
  const ctx = (error as any)?.context;
  if (ctx && typeof ctx.json === "function") {
    try { return (await ctx.json())?.detail ?? null; } catch { return null; }
  }
  return null;
}
