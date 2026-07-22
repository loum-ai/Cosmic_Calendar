# Vela — kanonische Prinzipien

Grundregeln, die für JEDE Entscheidung im Produkt gelten. Wenn ein Feature
gegen eines dieser Prinzipien verstößt, ist das Feature falsch — nicht das
Prinzip.

---

## 1. Kein Lebensthema ist bevorzugt

Die App ist für **alle Menschen**, ganz gleich, welches Lebensthema sie gerade
beschäftigt — Liebe, Beruf, Geld, Sinn, Familie, Heilung, Neuanfang. Kein
einzelnes Thema wird strukturell hervorgehoben, größer gemacht oder als
wichtiger behandelt als die anderen.

Konkret heißt das:
- Wenn wir ein Thema leichter/intuitiver/direkter zugänglich machen, muss der
  **Mechanismus für alle Themen gleichermaßen** gelten — nie nur für eines.
- Beispiel-Kundenprofile oder Testfälle dienen dem Erkunden des Mechanismus.
  Dass wir ein Thema als Beispiel nehmen, heißt **nicht**, dass es wichtiger
  ist oder mehr Raum bekommt.
- Das Ganz-Chart-Portrait ist bewusst **themen-neutral**: es liest das ganze
  Leben, nicht einen Lebensbereich.

## 2. Keine Halluzinationen

Deutungen nutzen ausschließlich die echten, berechneten Chart-Fakten. Keine
erfundenen Stellungen, keine erfundenen Benchmark-Zahlen. Wo etwas nicht belegt
ist, wird es als Eindruck/ungesichert markiert, nicht als Fakt verkauft.

## 3. Deutung, nicht Beschreibung

Führen mit synthetisierter Bedeutung (das ganze Chart verwoben), nicht mit
Lexikon-Bausteinen pro Position. Das Fachliche liegt darunter als optionaler
Detail-Layer (Progressive Disclosure).

## 4. Die Kundin kauft bei Laura

Menschen kaufen ihr Horoskop bei der Astrologin (€89,90) und erhalten einen
persönlichen Link. Nutzer bedienen sich nicht selbst; die App ist die
Auslieferung einer kuratierten, persönlichen Deutung.

## 5. Bedeutung zuerst, Fachbegriff als Eyebrow

Überall, wo etwas benannt wird, liest der Mensch zuerst, was es für IHN
BEDEUTET — der Fachbegriff („Mars Sextil Lilith", „Stellium in Skorpion",
„T-Quadrat") steht klein darüber als Eyebrow, nie als Headline. Der Fachbegriff
ist Beleg und Lernangebot; die Bedeutung ist die Botschaft. Gilt kanonisch für
jede Karte, jede Headline, jedes Sheet.

## 6. Geerdet, nicht esoterisch

Tiefe ja — Weihrauch nein. Die Deutungen sprechen die Sprache eines klugen,
warmen Beraters, der Astrologie als präzises Werkzeug nutzt: Bedürfnisse,
Muster, Stärken, konkrete Situationen. Seelen-Vokabular („Seele", „Bestimmung",
„Schicksal", „spirituell", „Energien") wird vermieden — auch Erstkund:innen
ohne esoterische Vorprägung müssen sich ernst genommen fühlen.

## §7 Das Chart ist IMMER sichtbar — Home ist der aktive Navi-Punkt

Das Geburtsrad ist das identitätsstiftende Element des Produkts. Deshalb gilt
kanonisch (Laura, 2026-07-22):

1. Auf der Home ist das Geburtsrad das ERSTE Inhaltselement — noch vor der
   Begrüßung, niemals unter der Falz. Kein Redesign, kein Umbau darf das Rad
   vom ersten Screen verdrängen.
2. Auch Zwischenscreens (z. B. die Einstiegsfrage) zeigen das Rad.
3. Der Navigationspunkt der Home heißt „Home" und ist der aktive
   Standard-Tab beim Öffnen der App.

Jede Änderung an Home/Navigation wird gegen diese Regel geprüft, bevor sie
gemerged wird (Playwright-Screenshot: Rad im ersten Viewport sichtbar).
