import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2, Copy, ExternalLink, Sparkles, LogOut, Check, Eye, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { searchPlace, type Place } from "@/lib/geocode";

interface ClientRow { id: string; name: string; birth_date: string; access_token: string; created_at: string; status?: string }

function linkFor(token: string) {
  return `${location.origin}${location.pathname}#/k/${token}`;
}

export function AdminScreen() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.from("app_admins").select("user_id").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (checking) return <Centered><Loader2 className="h-6 w-6 animate-spin text-lilac" /></Centered>;
  if (!session) return <LoginCard />;
  if (isAdmin === null) return <Centered><Loader2 className="h-6 w-6 animate-spin text-lilac" /></Centered>;
  if (!isAdmin) return (
    <Centered>
      <div className="max-w-[40ch] text-center">
        <h1 className="font-display text-xl font-bold text-txt">Konto noch nicht freigeschaltet</h1>
        <p className="mt-2 font-body text-sm text-txt-2">Dieses Konto ({session.user.email}) ist kein Admin. Melde dich mit deiner hinterlegten Astrologinnen-E-Mail an.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 rounded-pill border border-line px-4 py-2 font-body text-sm text-txt-2">Abmelden</button>
      </div>
    </Centered>
  );
  return <Cockpit email={session.user.email} />;
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh items-center justify-center bg-[#050509] px-6 text-ink">{children}</div>;
}

function LoginCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setBusy(true); setMsg(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password: pw });
        if (error) throw error;
        if (!data.session) setMsg("Konto angelegt. Falls eine Bestätigungs-E-Mail kommt, bestätige sie und melde dich dann an.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
      }
    } catch (e: any) {
      setMsg(e?.message || "Fehler bei der Anmeldung.");
    } finally { setBusy(false); }
  }

  return (
    <Centered>
      <div className="w-full max-w-[360px]">
        <div className="vela-label mb-1">Vela · Astrologin</div>
        <h1 className="font-display text-2xl font-bold text-txt">{mode === "signin" ? "Anmelden" : "Konto anlegen"}</h1>
        <div className="mt-5 space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="E-Mail"
            className="w-full rounded-2xl border border-line bg-surface px-4 py-3 font-body text-sm text-txt outline-none focus:border-lilac" />
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="Passwort"
            className="w-full rounded-2xl border border-line bg-surface px-4 py-3 font-body text-sm text-txt outline-none focus:border-lilac" />
          <button disabled={busy || !email || !pw} onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cta-gradient px-5 py-3 font-display text-sm font-semibold text-space-2 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "signin" ? "Anmelden" : "Konto anlegen"}
          </button>
          {msg && <p className="font-body text-[12px] leading-relaxed text-txt-2">{msg}</p>}
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMsg(null); }}
            className="w-full text-center font-body text-[12px] text-lilac">
            {mode === "signin" ? "Noch kein Konto? Anlegen" : "Schon ein Konto? Anmelden"}
          </button>
        </div>
      </div>
    </Centered>
  );
}

function Cockpit({ email }: { email: string }) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [placeQ, setPlaceQ] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; link: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [review, setReview] = useState<{ id: string; name: string } | null>(null);
  const [reviewData, setReviewData] = useState<{ draft: any; status: string } | null>(null);
  const [publishing, setPublishing] = useState(false);

  async function loadClients() {
    const { data } = await supabase.from("clients").select("id, name, birth_date, access_token, created_at").order("created_at", { ascending: false });
    const list = (data as ClientRow[]) ?? [];
    const { data: interps } = await supabase.from("interpretations").select("client_id, status");
    const sm: Record<string, string> = {};
    (interps ?? []).forEach((r: any) => (sm[r.client_id] = r.status));
    setClients(list.map((c) => ({ ...c, status: sm[c.id] })));
  }

  async function openReview(c: ClientRow) {
    setReview({ id: c.id, name: c.name });
    setReviewData(null);
    const { data } = await supabase.from("interpretations").select("draft, status").eq("client_id", c.id).eq("kind", "natal").maybeSingle();
    setReviewData((data as any) ?? null);
  }

  async function publishReview() {
    if (!review) return;
    setPublishing(true);
    await supabase.from("interpretations").update({ status: "published", published_at: new Date().toISOString() }).eq("client_id", review.id).eq("kind", "natal");
    setPublishing(false);
    setReview(null);
    await loadClients();
  }
  useEffect(() => { loadClients(); }, []);

  useEffect(() => {
    if (!placeQ.trim() || place?.label === placeQ) { setPlaces([]); return; }
    const t = setTimeout(async () => setPlaces(await searchPlace(placeQ)), 300);
    return () => clearTimeout(t);
  }, [placeQ, place]);

  const canSubmit = useMemo(() => name && date && time && place && !step, [name, date, time, place, step]);

  async function createClient() {
    if (!place) return;
    setErr(null); setCreated(null);
    try {
      setStep("Kundin anlegen …");
      const { data: client, error } = await supabase.from("clients")
        .insert({ name, birth_date: date, birth_time: time, birth_place: place.label, lat: place.lat, lon: place.lon })
        .select("id, access_token").single();
      if (error) throw error;

      setStep("Geburtsbild berechnen & prüfen …");
      const comp = await supabase.functions.invoke("compute-chart", { body: { client_id: client.id } });
      if (comp.error || !comp.data?.ok) throw new Error(comp.error?.message || "Berechnung fehlgeschlagen");

      setStep("Deutung als Entwurf schreiben (Gemini) …");
      const intp = await supabase.functions.invoke("interpret", { body: { client_id: client.id, publish: false } });
      if (intp.error || !intp.data?.ok) throw new Error(intp.error?.message || "Deutung fehlgeschlagen");

      setCreated({ name, link: linkFor(client.access_token) });
      setName(""); setDate(""); setTime(""); setPlaceQ(""); setPlace(null);
      await loadClients();
    } catch (e: any) {
      setErr(e?.message || "Etwas ist schiefgelaufen.");
    } finally { setStep(null); }
  }

  async function copy(link: string) {
    try { await navigator.clipboard.writeText(link); setCopied(link); setTimeout(() => setCopied(null), 1500); } catch { /* ignore */ }
  }

  return (
    <div className="min-h-dvh bg-[#050509] text-ink">
      <div className="mx-auto w-full max-w-[680px] px-5 pb-24 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="vela-label">Vela · Cockpit</div>
            <h1 className="font-display text-2xl font-bold text-txt">Kundinnen</h1>
            <p className="mt-0.5 font-body text-[12px] text-txt-3">Für jede Kundin entsteht ihre eigene, persönliche Astro-Website.</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1.5 rounded-pill border border-line px-3 py-1.5 font-body text-[12px] text-txt-2">
            <LogOut className="h-3.5 w-3.5" /> {email}
          </button>
        </div>

        {/* create form */}
        <section className="mt-6 rounded-2xl border border-line bg-surface p-4">
          <h2 className="font-display text-sm font-semibold text-txt">Neue Kundin anlegen</h2>
          <div className="mt-3 space-y-2.5">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"
              className="w-full rounded-xl border border-line bg-[#0c0c14] px-3.5 py-2.5 font-body text-sm text-txt outline-none focus:border-lilac" />
            <div className="flex gap-2.5">
              <input value={date} onChange={(e) => setDate(e.target.value)} type="date"
                className="flex-1 rounded-xl border border-line bg-[#0c0c14] px-3.5 py-2.5 font-body text-sm text-txt outline-none focus:border-lilac" />
              <input value={time} onChange={(e) => setTime(e.target.value)} type="time"
                className="w-[120px] rounded-xl border border-line bg-[#0c0c14] px-3.5 py-2.5 font-body text-sm text-txt outline-none focus:border-lilac" />
            </div>
            <div className="relative">
              <input value={placeQ} onChange={(e) => { setPlaceQ(e.target.value); setPlace(null); }} placeholder="Geburtsort"
                className="w-full rounded-xl border border-line bg-[#0c0c14] px-3.5 py-2.5 font-body text-sm text-txt outline-none focus:border-lilac" />
              {places.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-[#12121c] shadow-xl">
                  {places.map((p, i) => (
                    <button key={i} onClick={() => { setPlace(p); setPlaceQ(p.label); setPlaces([]); }}
                      className="block w-full px-3.5 py-2.5 text-left font-body text-[13px] text-txt-2 hover:bg-white/5">
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {place && <div className="font-mono text-[10px] text-txt-3">{place.lat.toFixed(3)}°, {place.lon.toFixed(3)}°</div>}
            <button disabled={!canSubmit} onClick={createClient}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cta-gradient px-5 py-3 font-display text-sm font-semibold text-space-2 disabled:opacity-40">
              {step ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {step || "Persönliche Website erstellen"}
            </button>
            {err && <p className="font-body text-[12px] text-rose-300">{err}</p>}
          </div>

          {created && (
            <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-400/5 p-3">
              <div className="font-body text-[13px] text-txt">📝 Website von <b>{created.name}</b> erstellt — Deutung als <b>Entwurf</b>. Unten <b>prüfen & freigeben</b>, dann ist ihre persönliche Website live. Ihre Website:</div>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg bg-black/40 px-2.5 py-2 font-mono text-[11px] text-lilac">{created.link}</code>
                <button onClick={() => copy(created.link)} className="rounded-lg border border-line p-2 text-txt-2">{copied === created.link ? <Check className="h-4 w-4 text-mint" /> : <Copy className="h-4 w-4" />}</button>
                <a href={created.link} target="_blank" className="rounded-lg border border-line p-2 text-txt-2"><ExternalLink className="h-4 w-4" /></a>
              </div>
            </div>
          )}
        </section>

        {/* list */}
        <section className="mt-7">
          <h2 className="mb-2 font-display text-sm font-semibold text-txt">Alle Kundinnen ({clients.length})</h2>
          <div className="space-y-2">
            {clients.map((c) => {
              const link = linkFor(c.access_token);
              return (
                <div key={c.id} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-semibold text-txt">{c.name}</span>
                      {c.status && (
                        <span className={`rounded-pill px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide ${c.status === "published" ? "bg-mint/15 text-mint" : "bg-amber-400/15 text-amber-300"}`}>
                          {c.status === "published" ? "Live" : "Entwurf"}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[10px] text-txt-3">{c.birth_date}</div>
                  </div>
                  {c.status && (
                    <button onClick={() => openReview(c)} title="Prüfen & freigeben" className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-2 font-body text-[11px] text-txt-2 hover:bg-surface-2">
                      <Eye className="h-3.5 w-3.5" /> Prüfen
                    </button>
                  )}
                  <button onClick={() => copy(link)} className="rounded-lg border border-line p-2 text-txt-2">{copied === link ? <Check className="h-4 w-4 text-mint" /> : <Copy className="h-4 w-4" />}</button>
                  <a href={link} target="_blank" className="rounded-lg border border-line p-2 text-txt-2"><ExternalLink className="h-4 w-4" /></a>
                </div>
              );
            })}
            {clients.length === 0 && <p className="font-body text-[13px] text-txt-2">Noch keine Kundinnen — lege oben die erste an.</p>}
          </div>
        </section>

        {/* review & publish modal */}
        {review && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(4,4,10,0.74)] p-4 backdrop-blur-md" onClick={() => setReview(null)}>
            <div onClick={(e) => e.stopPropagation()} className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-card border border-[rgba(150,120,255,0.25)] bg-[#0e0c1a] p-6 shadow-glass">
              <div className="flex items-start justify-between">
                <div>
                  <div className="vela-label">Deutung prüfen</div>
                  <h2 className="mt-1 font-cinzel text-[22px] font-semibold text-white">{review.name}</h2>
                </div>
                <button onClick={() => setReview(null)} className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-txt-3 hover:text-txt"><X className="h-4 w-4" /></button>
              </div>
              {!reviewData ? (
                <div className="mt-6 flex items-center gap-2 font-body text-[13px] text-txt-2"><Loader2 className="h-4 w-4 animate-spin" /> Entwurf laden …</div>
              ) : (
                <>
                  {reviewData.status === "published" && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-mint/10 px-2.5 py-1.5 font-body text-[12px] text-mint"><ShieldCheck className="h-3.5 w-3.5" /> Bereits freigegeben — der Kundenlink ist live.</div>
                  )}
                  {reviewData.draft?.summary && <p className="mt-4 font-body text-[14px] leading-relaxed text-txt">{reviewData.draft.summary}</p>}
                  <div className="mt-4 space-y-2.5 border-t border-line pt-4">
                    {(reviewData.draft?.placements ?? []).map((pl: any, i: number) => (
                      <div key={i}>
                        <div className="font-mono text-[10px] uppercase tracking-wide text-lilac">{pl.key}</div>
                        {pl.sign_text && <p className="font-body text-[12.5px] leading-relaxed text-txt-2">{pl.sign_text}</p>}
                        {pl.house_text && <p className="mt-0.5 font-body text-[12.5px] leading-relaxed text-txt-2">{pl.house_text}</p>}
                      </div>
                    ))}
                  </div>
                  <button onClick={publishReview} disabled={publishing || reviewData.status === "published"} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cta-gradient px-5 py-3 font-display text-sm font-semibold text-white shadow-glow disabled:opacity-40">
                    {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {reviewData.status === "published" ? "Freigegeben" : "Freigeben — Link aktivieren"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
