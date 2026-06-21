import { useEffect, useState } from "react";
import { Loader2, Moon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { applyChart, signName } from "@/lib/data";
import { applyResolvedInterpretation } from "@/lib/interpret";
import { useApp } from "@/store/useApp";
import { MainApp } from "@/MainApp";

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

type Status = "loading" | "ready" | "notfound" | "error";

/** Public per-customer reading, reached via #/k/<access_token>. No login. */
export function ClientView({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const setViewerMode = useApp((s) => s.setViewerMode);
  const bumpChart = useApp((s) => s.bumpChart);

  useEffect(() => {
    let cancelled = false;
    setViewerMode(true);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("resolve-link", { body: { token } });
        if (cancelled) return;
        if (error || !data?.ok || !data?.chart) {
          setStatus(data?.error === "not_found" ? "notfound" : "error");
          return;
        }
        const ch = data.chart;
        const [y, mo, d] = String(data.client.birth_date).split("-").map(Number);
        const time = (data.client.birth_time || "").slice(0, 5);
        applyChart({
          planets: ch.planets ?? [],
          nodes: ch.nodes ?? [],
          asc: ch.asc ?? 0,
          mc: ch.mc ?? 0,
          cusps: ch.cusps ?? [],
          profile: {
            name: data.client.name,
            birth: `${d}. ${MONTHS[(mo || 1) - 1]} ${y}${time ? ` · ${time}` : ""} · ${String(data.client.birth_place).split(",")[0]}`,
            memberSince: `${signName(ch.asc ?? 0)}-Aszendent`,
          },
        });
        applyResolvedInterpretation(data.interpretation, data.verification ?? null);
        bumpChart();
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      setViewerMode(false);
    };
  }, [token, setViewerMode, bumpChart]);

  if (status === "ready") return <MainApp />;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#050509] px-8 text-center text-ink">
      {status === "loading" && (
        <>
          <Loader2 className="h-7 w-7 animate-spin text-lilac" />
          <p className="font-body text-sm text-txt-2">Dein persönliches Horoskop wird geladen …</p>
        </>
      )}
      {status === "notfound" && (
        <>
          <Moon className="h-7 w-7 text-lilac" />
          <h1 className="font-display text-xl font-bold text-txt">Link nicht gefunden</h1>
          <p className="max-w-[42ch] font-body text-sm text-txt-2">Dieser Horoskop-Link ist ungültig oder wurde zurückgezogen. Bitte wende dich an deine Astrologin.</p>
        </>
      )}
      {status === "error" && (
        <>
          <Moon className="h-7 w-7 text-lilac" />
          <h1 className="font-display text-xl font-bold text-txt">Etwas ist schiefgelaufen</h1>
          <p className="max-w-[42ch] font-body text-sm text-txt-2">Dein Horoskop konnte gerade nicht geladen werden. Versuch es bitte in einem Moment noch einmal.</p>
        </>
      )}
    </div>
  );
}
