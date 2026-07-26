# Sternbilder — Referenz-Renderings

Die zwölf vorgerenderten Strichfiguren aus der Recherche vom 23.07.2026
(1000×1000, eingebrannter Hintergrund `#2e2c50`).

**Das ist Referenzmaterial, keine App-Assets.** Die App rendert die Sternbilder
zur Laufzeit aus `src/lib/constellations.ts` über `ConstellationFigure` — nur so
erben sie die Palette (`--rgb-iris`), skalieren verlustfrei und bleiben an eine
einzige Datenquelle gebunden. Diese SVGs liegen hier, um das Ergebnis
gegenprüfen zu können.

Datenquellen (in `constellations.ts` vollständig belegt): Sternpositionen und
Helligkeiten aus der HYG-Datenbank v3.8, Strichfiguren aus den offiziellen
IAU-Figuren über Stellarium (`modern_iau`), gegengeprüft gegen SIMBAD —
143 Sterne, Abweichung im Median 0,15", maximal 0,96".
