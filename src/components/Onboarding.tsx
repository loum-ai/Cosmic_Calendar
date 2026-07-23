import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Loader2, MapPin, Check, Sparkles } from "lucide-react";
import { useApp, type SavedBirth } from "@/store/useApp";
import { searchPlace, type Place } from "@/lib/geocode";
import { SkyRitual } from "@/components/SkyRitual";
import { cn } from "@/lib/utils";

const FIELD =
  "w-full rounded-2xl border border-line bg-[rgba(255,255,255,0.04)] px-4 py-3 font-body text-[15px] text-txt outline-none transition placeholder:text-txt-3 focus:border-violet/55 focus:bg-[rgba(255,255,255,0.06)]";
const LABEL = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-violet/65";

/**
 * "Eigenes Chart berechnen" — onboarding for any birth data. Geocodes the
 * birth place (Open-Meteo), computes the real natal chart and activates it
 * app-wide. Plain-German, gentle modal: centred glass on desktop, bottom
 * sheet on mobile.
 */
export function Onboarding() {
  const open = useApp((s) => s.onboardingOpen);
  const setOpen = useApp((s) => s.setOnboardingOpen);
  const applyComputed = useApp((s) => s.applyComputed);
  const saved = useApp((s) => s.savedBirth);

  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [timeUnknown, setTimeUnknown] = React.useState(false);
  const [placeQ, setPlaceQ] = React.useState("");
  const [results, setResults] = React.useState<Place[]>([]);
  const [picked, setPicked] = React.useState<Place | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [err, setErr] = React.useState("");
  // Das Einrasten (Journey Map III): nach erfolgreicher Berechnung spielt
  // das Ritual — der Himmel dreht zurück auf den Geburtsmoment.
  const [ritual, setRitual] = React.useState<SavedBirth | null>(null);

  // Prefill from a previously saved chart when reopening.
  React.useEffect(() => {
    if (!open) return;
    setName(saved?.name ?? "");
    setDate(saved?.date ?? "");
    setTime(saved?.timeUnknown ? "" : saved?.time ?? "");
    setTimeUnknown(!!saved?.timeUnknown);
    setPlaceQ(saved?.place ?? "");
    setPicked(saved ? { name: saved.place, lat: saved.lat, lon: saved.lon, label: saved.place } : null);
    setResults([]);
    setErr("");
  }, [open, saved]);

  // Debounced place search.
  React.useEffect(() => {
    if (picked && placeQ === picked.label) return; // already chosen
    const q = placeQ.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const r = await searchPlace(q);
      setResults(r);
      setSearching(false);
    }, 280);
    return () => clearTimeout(t);
  }, [placeQ, picked]);

  const choose = (p: Place) => {
    setPicked(p);
    setPlaceQ(p.label);
    setResults([]);
  };

  const submit = () => {
    setErr("");
    if (!date) return setErr("Bitte ein Geburtsdatum angeben.");
    if (!time && !timeUnknown) return setErr("Bitte eine Uhrzeit angeben — oder „Ich kenne meine Geburtszeit nicht“ wählen.");
    if (!picked) return setErr("Bitte einen Geburtsort aus der Liste wählen.");
    const birth: SavedBirth = {
      name: name.trim(),
      date,
      // Ohne bekannte Zeit rechnen wir mit Mittag — die Stellungen der langsamen
      // Punkte stimmen dann, Aszendent und Häuser NICHT (siehe timeUnknown).
      time: timeUnknown ? "12:00" : time,
      lat: picked.lat,
      lon: picked.lon,
      place: picked.label,
      timeUnknown,
    };
    try {
      applyComputed(birth);
      setOpen(false);
      setRitual(birth);
    } catch {
      setErr("Die Berechnung ist fehlgeschlagen. Bitte Eingaben prüfen.");
    }
  };

  if (ritual) {
    return <SkyRitual name={ritual.name} date={ritual.date} time={ritual.time} place={ritual.place} timeUnknown={ritual.timeUnknown} onDone={() => setRitual(null)} />;
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-[rgba(4,4,10,0.55)] backdrop-blur-[2px] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-[81] mx-auto overflow-y-auto border-line bg-[rgba(16,14,26,0.985)] shadow-[0_-30px_70px_-20px_rgba(0,0,0,0.85)] duration-300 ease-out",
            // mobile: bottom sheet
            "inset-x-0 bottom-0 max-h-[88vh] w-full max-w-[480px] rounded-t-[28px] border-t px-6 pb-10 pt-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            // desktop: centred panel
            "lg:inset-auto lg:left-1/2 lg:top-1/2 lg:max-h-[86vh] lg:w-[440px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[28px] lg:border lg:px-7 lg:pb-8 lg:pt-7 lg:data-[state=closed]:slide-out-to-bottom-0 lg:data-[state=open]:slide-in-from-bottom-0 lg:data-[state=open]:zoom-in-95",
          )}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20 lg:hidden" />
          <DialogPrimitive.Close className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-txt-3 transition hover:bg-white/[0.12] active:scale-90 lg:top-5">
            <X className="h-4 w-4" />
            <span className="sr-only">Schließen</span>
          </DialogPrimitive.Close>

          <div className="flex items-center gap-2.5 pr-8">
            <Sparkles className="h-5 w-5 text-lilac" />
            <DialogPrimitive.Title className="font-cinzel text-[24px] font-semibold leading-[1.1] tracking-wide text-white">
              Eigenes Chart berechnen
            </DialogPrimitive.Title>
          </div>
          <DialogPrimitive.Description className="mt-2 font-body text-[13.5px] leading-[1.6] text-txt-2">
            Gib die Geburtsdaten ein — Vela berechnet das echte Geburtsrad mit Häusern, Aspekten und Rückläufigkeit.
          </DialogPrimitive.Description>

          <div className="mt-6 flex flex-col gap-5">
            <div>
              <label className={LABEL}>Name (optional)</label>
              <input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Anna" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Geburtsdatum</label>
                <input type="date" className={cn(FIELD, "[color-scheme:dark]")} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Uhrzeit</label>
                <input
                  type="time"
                  className={cn(FIELD, "[color-scheme:dark]", timeUnknown && "opacity-40")}
                  value={time}
                  disabled={timeUnknown}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Journey Map II — der Verlustmoment: lieber ehrlich weiterlassen
                als zum Raten zwingen. Sagen, was fehlt, und was trotzdem trägt. */}
            <div className="-mt-2">
              <button
                type="button"
                onClick={() => setTimeUnknown((v) => !v)}
                aria-pressed={timeUnknown}
                className="flex w-full items-center gap-2.5 text-left"
              >
                <span
                  className={cn(
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition",
                    timeUnknown ? "border-violet bg-violet/25" : "border-line bg-white/[0.04]",
                  )}
                >
                  {timeUnknown && <Check className="h-3 w-3 text-lilac" strokeWidth={3} />}
                </span>
                <span className="font-body text-[13px] text-txt-2">Ich kenne meine Geburtszeit nicht</span>
              </button>
              {timeUnknown && (
                <p className="mt-2.5 rounded-xl border border-line-soft bg-white/[0.03] px-3.5 py-2.5 font-body text-[12px] leading-relaxed text-txt-3">
                  Kein Problem — du kommst trotzdem rein. <span className="text-txt-2">Sonne, Planeten in ihren Zeichen und die Aspekte stimmen.</span> Was ohne Zeit nicht belastbar ist: Aszendent, die Häuser und der exakte Mondgrad. Du kannst die Zeit später jederzeit im Profil nachtragen.
                </p>
              )}
            </div>

            <div className="relative">
              <label className={LABEL}>Geburtsort</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-txt-3" />
                <input
                  className={cn(FIELD, "pl-10")}
                  value={placeQ}
                  onChange={(e) => {
                    setPlaceQ(e.target.value);
                    setPicked(null);
                  }}
                  placeholder="Stadt suchen…"
                  autoComplete="off"
                />
                {searching && <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-txt-3" />}
                {picked && !searching && <Check className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mint" />}
              </div>

              {results.length > 0 && (
                <div className="mt-1.5 overflow-hidden rounded-2xl border border-line bg-[rgba(22,18,34,0.98)]">
                  {results.map((r, i) => (
                    <button
                      key={`${r.lat},${r.lon},${i}`}
                      onClick={() => choose(r)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition hover:bg-white/[0.05]",
                        i && "border-t border-line-soft",
                      )}
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-txt-3" />
                      <span className="font-body text-[13.5px] text-txt">{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {err && <p className="font-body text-[13px] text-[#ff8fb0]">{err}</p>}

            <button
              onClick={submit}
              className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-cta-gradient px-5 py-3.5 font-display text-[15px] font-semibold text-white shadow-glow transition active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              Chart berechnen
            </button>
            <p className="text-center font-body text-[11px] leading-relaxed text-txt-3">
              Berechnung & Ortssuche laufen in deinem Browser. Tropisch · Placidus-Häuser.
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
