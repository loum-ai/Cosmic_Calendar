-- Wie viele veröffentlichte Deutungen haben kein Portrait?
--
-- Anlass (2026-07-29): supabase/functions/interpret/index.ts hat eine Deutung
-- auf "published" gesetzt, sobald die Notfall-Schablone NICHT einsprang — ohne
-- zu prüfen, ob überhaupt Text herauskam. Zwei Wege führten daran vorbei:
-- ohne API-Schlüssel wurde das Portrait stumm auf "" gesetzt, und die
-- Erzeugung konnte leer zurückkommen, ohne als Fehlschlag zu gelten.
--
-- Warum das niemandem auffiel: src/screens/ThemenHub.tsx:396 rendert bei
-- leerem Portrait `null`. Der Abschnitt "Dein Portrait" verschwindet dann
-- einfach — ohne Meldung. Die Kundin sieht die Rechenwerte darunter und hält
-- sie für das Produkt. Im Cockpit steht "published".
--
-- Die Sperre ist eingebaut. Diese Abfrage beantwortet die andere Frage:
-- Wer hat bereits einen leeren Link bekommen?
--
-- Einfügen im Supabase-Studio → SQL Editor.

-- 1 · Die Zahl.
select
  count(*) filter (where status = 'published')                             as veroeffentlicht,
  count(*) filter (where status = 'published' and portrait_leer)           as davon_ohne_portrait,
  count(*) filter (where status = 'published' and portrait_kurz)           as davon_verdaechtig_kurz
from (
  select
    status,
    coalesce(btrim(draft->>'portrait'), '') = ''                           as portrait_leer,
    length(coalesce(btrim(draft->>'portrait'), '')) between 1 and 400      as portrait_kurz
  from interpretations
  where kind = 'natal'
) t;

-- 2 · Wer betroffen ist. Diese Zeilen gehören neu erzeugt.
--    (Die 400 Zeichen sind eine Annahme, kein gemessener Wert — ein echtes
--     Portrait sind 5 bis 7 Absätze. Sieh dir die kurzen Treffer selbst an,
--     bevor du sie als kaputt einstufst.)
select
  i.client_id,
  i.model,
  i.published_at,
  length(coalesce(btrim(i.draft->>'portrait'), '')) as portrait_zeichen,
  left(coalesce(i.draft->>'portrait', '(leer)'), 120) as anfang
from interpretations i
where i.kind = 'natal'
  and i.status = 'published'
  and length(coalesce(btrim(i.draft->>'portrait'), '')) < 400
order by i.published_at desc nulls last;

-- 3 · Sofortmassnahme, falls Treffer da sind: zurück auf Entwurf, damit der
--     Klienten-Link nichts Leeres mehr ausliefert. ERST Abfrage 2 ansehen.
--
-- update interpretations
--    set status = 'draft', published_at = null
--  where kind = 'natal'
--    and status = 'published'
--    and coalesce(btrim(draft->>'portrait'), '') = '';
