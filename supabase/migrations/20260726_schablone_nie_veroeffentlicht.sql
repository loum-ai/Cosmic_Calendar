-- Eine Deutung aus der Notfall-Schablone darf nie veröffentlicht sein.
--
-- ANLASS: Marco, 25.07.2026. Seine Erzeugung scheiterte an den Token-Budgets,
-- der Baukasten sprang ein (model = 'basis-komposition'), und weil er noch
-- keine ältere Deutung hatte, ging der Ersatztext als 'published' durch und
-- stand über seinen Klienten-Link live. Er hat ihn gelesen.
--
-- WARUM IN DER DATENBANK und nicht in der Edge Function:
-- Die Funktion ist eine von mehreren Stellen, die schreiben, und sie kann in
-- einer alten Version deployt sein — genau das war hier der Fall. Als Trigger
-- gilt die Regel für jeden Schreibweg und überlebt jeden Deploy.
--
-- WARUM ZURÜCKSTUFEN statt ablehnen:
-- Bei einer Ablehnung ginge auch der Entwurf verloren, und im Cockpit wäre
-- nicht mehr zu sehen, was schiefgelaufen ist. Der Text bleibt also liegen,
-- er wird nur nie ausgeliefert.
--
-- Zweite, unabhängige Sperre: resolve-link (v3) behandelt eine Deutung mit
-- diesem Modell als gar keine Deutung — auch dann, wenn eine Zeile aus der
-- Zeit vor diesem Trigger noch auf 'published' stünde.

create or replace function public.schablone_bleibt_entwurf()
returns trigger
language plpgsql
as $$
begin
  if new.model = 'basis-komposition' and new.status = 'published' then
    new.status := 'draft';
    new.published_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_schablone_bleibt_entwurf on public.interpretations;

create trigger trg_schablone_bleibt_entwurf
before insert or update on public.interpretations
for each row
execute function public.schablone_bleibt_entwurf();
