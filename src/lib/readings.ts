/**
 * Bespoke, longer interpretations for the chart's important placements
 * (paraphrased from the real birth-chart report). Used where available;
 * the generic SIGNWHAT/HOUSEWHAT one-liners remain the fallback for the rest.
 */
export const READINGS: Record<string, { sign?: string; house?: string }> = {
  sun: {
    sign:
      "Mit der Sonne in der Jungfrau zeigt sich dein Wesenskern über Genauigkeit, Nützlichkeit und ein feines Gespür für das, was wirklich funktioniert. Du denkst praktisch, arbeitest gründlich und willst die Dinge verstehen, bevor du sie für gut befindest. Diese Sorgfalt ist deine Stärke — solange sie nicht in Selbstkritik oder Pedanterie kippt. Du leuchtest dort, wo du ordnen, verfeinern und im besten Sinne dienen kannst.",
    house:
      "Im 7. Haus richtet sich dein Kern auf das Gegenüber: Partnerschaft, enge Beziehungen und der direkte Austausch geben dir Energie und Orientierung. Du entwickelst dich an und durch andere und hast ein echtes Talent für Zusammenarbeit, Vermittlung und Ausgleich. Die Aufgabe dahinter: dein eigenes Profil im Spiegel des Du zu finden, ohne dich darin zu verlieren.",
  },
  moon: {
    sign:
      "Dein Mond in den Fischen macht dein Gefühlsleben weit, durchlässig und mitfühlend. Du nimmst Stimmungen auf, bevor sie ausgesprochen werden, und brauchst Rückzug, Stille, Wasser oder etwas Kreatives, um dich wieder zu sortieren. Diese Sensibilität ist eine Gabe — gesunde Grenzen zu setzen, damit du nicht jede fremde Welle mitfühlst, ist die andere Seite davon.",
    house:
      "Im 1. Haus liegt dein Gefühl direkt an der Oberfläche: Du wirkst empfänglich, wandelbar und unmittelbar, und Menschen spüren sofort, wie es dir geht. Das macht dich nahbar — und manchmal leicht beeinflussbar. Ein eigener, innerer Halt ist dein bester Schutz.",
  },
  asc: {
    sign:
      "Dein Aszendent im Wassermann lässt dich offen, eigenständig und ein wenig unkonventionell wirken. Du betrachtest dich und die Welt gern aus etwas Distanz, denkst in Möglichkeiten und Zukunft und fühlst dich Ideen und Gruppen oft mehr verbunden als engen Rollen. Nach außen wirkst du kühl-souverän — innen willst du trotzdem wirklich gesehen werden.",
  },
  mercury: {
    sign:
      "Merkur in der Waage denkt in Abwägung, Fairness und Beziehung. Du formulierst diplomatisch, suchst das Gleichgewicht zwischen den Argumenten und entwickelst deine Gedanken am liebsten im Dialog. Die Kehrseite: Entscheidungen fallen schwer, weil du beide Seiten oft zu gut siehst.",
    house:
      "Im 7. Haus denkst und sprichst du über das Gegenüber. Du fühlst dich zu klugen, ausdrucksstarken Menschen hingezogen und hast Talent, zu vermitteln, zu beraten und Brücken zu bauen.",
  },
  venus: {
    sign:
      "Venus in der Jungfrau liebt genau, aufmerksam und im Detail. Zuneigung zeigst du eher durch Sorgfalt und kleine, nützliche Gesten als durch große Worte. Hüte dich nur davor, die Liebe zu zer-analysieren — manches darf einfach schön sein und muss nicht verbessert werden.",
    house:
      "Im 7. Haus ist Partnerschaft ein Lebensthema: Beziehungen sind dir wichtig, meist harmonisch gesucht, und tragen spürbar zu deinem Glück und Erfolg bei.",
  },
  mars: {
    sign:
      "Mars in der Jungfrau handelt präzise, ausdauernd und mit hohem Anspruch — an dich selbst zuerst. Deine Energie ist die des sorgfältigen Machens; sie verpufft, wenn Perfektionismus dich lähmt. Im richtigen Maß bist du unschlagbar gründlich und verlässlich.",
    house:
      "Im 7. Haus zeigt sich deine Kraft in und durch Beziehungen — Zusammenarbeit beflügelt dich, Reibung mit anderen fordert dich heraus. Deine Lektion: Durchsetzung mit Takt zu verbinden.",
  },
  saturn: {
    sign:
      "Saturn im Schützen will aus Überzeugung Struktur bauen: ein tragfähiges System aus Sinn, Werten und Orientierung, das deinem Leben Halt gibt. Wo du früh Enge oder Dogmen erlebt hast, reift mit der Zeit eine eigene, wirklich gelebte Haltung.",
    house:
      "Im 10. Haus liegt deine Aufgabe im Sichtbaren: Beruf, Verantwortung und Anerkennung. Du baust langsam, aber tragfähig — echte Autorität kommt bei dir mit Reife, oft erst nach dem ersten Saturn-Zyklus um die 29.",
  },
  jupiter: {
    sign:
      "Jupiter im Widder schenkt dir Enthusiasmus und ein Urvertrauen, mutig anzufangen — Wachstum kommt bei dir über Initiative, Mut und das spontane Ja zum Leben. Achte nur darauf, dass aus Eifer keine Übereile und aus Großzügigkeit keine Maßlosigkeit wird.",
    house:
      "Im 2. Haus wächst du über Werte, Geld und Selbstwert: Vertrauen ins eigene Können öffnet dir Chancen und Fülle. Die Kehrseite ist eine Neigung zu Extravaganz — Maßhalten zahlt sich für dich besonders aus.",
  },
  uranus: {
    sign:
      "Uranus im Schützen ist eine Signatur deiner Generation: der Drang nach geistigem Fortschritt, Freiheit und unkonventionellen Überzeugungen — Weite, Reisen und neue Ideen ziehen dich an. Ganz persönlich wird das vor allem über das Haus, in dem er steht.",
    house:
      "Im 10. Haus willst du im Beruf unabhängig sein: eigene Wege, eigene Ideen, ungern jemand über dir. Du gehst Karriere originell und manchmal sprunghaft an — am wohlsten ist dir, wenn du selbstbestimmt arbeiten kannst.",
  },
  neptune: {
    sign:
      "Neptun im Steinbock (eine Generationssignatur) verbindet Sehnsucht mit Struktur — Ideale wollen hier konkret und tragfähig werden. Das Persönliche zeigt sich vor allem im Haus, in dem er liegt.",
    house:
      "Im 11. Haus färbt Neptun deine Träume, Freundschaften und Zukunftsbilder: Du schließt leicht Verbindungen, deine Ideale sind groß — und brauchen klare Pläne, damit sie nicht zerfließen.",
  },
  pluto: {
    sign:
      "Pluto im Skorpion (eine Generationssignatur) steht für Tiefe, Wandlung und das Verlangen, hinter die Oberfläche zu sehen. Ganz persönlich wirkt er über das Haus, in dem er steht.",
    house:
      "Im 8. Haus geht es um Tiefe, Bindung, geteilte Werte und Transformation: Du hast ein Gespür für das Verborgene, eine starke Konzentrationskraft und die Fähigkeit, Krisen in echte Erneuerung zu verwandeln.",
  },
  chiron: {
    sign:
      "Chiron in den Zwillingen berührt die wunde Stelle des Verstanden-Werdens — das Gefühl, dass Worte nicht ankommen oder man missverstanden wird. Genau hier liegt deine Gabe: anderen Sprache, Klarheit und Verständnis zu schenken.",
    house:
      "Im 4. Haus liegt die Verletzung in Herkunft und Familie — das Gefühl, nicht genug Geborgenheit bekommen zu haben. Heilung entsteht, wenn du dir selbst das sichere Zuhause baust, das du einst gesucht hast.",
  },
  lilith: {
    sign:
      "Lilith im Löwen ist dein ungezähmter Stolz: der Wunsch, ganz du selbst zu sein, gesehen und nicht kleingemacht zu werden. Im Schatten wirkt das eigenwillig — im Licht wird es schöpferische Kraft, Humor und Ausstrahlung.",
    house:
      "Im 6. Haus zeigt sich dein Wildes im Alltag und in der Arbeit: die Versuchung, sich Pflichten zu entziehen — und die Chance, den Alltag auf deine eigene, unangepasste Art zu gestalten.",
  },
  node_n: {
    sign:
      "Dein aufsteigender Mondknoten im Widder zeigt deine Wachstumsrichtung: mehr Mut zur eigenen Unabhängigkeit, eigene Entscheidungen treffen, das Eigene wollen dürfen — auch wenn es Reibung bedeutet. Der vertraute Gegenpol (Waage) ist das Anpassen und das Streben nach Harmonie um jeden Preis, das du nach und nach loslassen darfst.",
    house:
      "Auf der Achse 1. ↔ 7. Haus: weg vom Sich-immer-am-Anderen-Orientieren, hin zu einem stabilen Verhältnis zu dir selbst. Entwickle Selbstvertrauen und den Mut, deinen eigenen Weg zu gehen, statt dich zu sehr anzupassen.",
  },
  node_s: {
    sign:
      "Der absteigende Mondknoten in der Waage ist dein Vertrautes: Harmonie, Ausgleich, Beziehung, Anpassung — das, was dir leichtfällt und worin du dich gut auskennst. Genau das darfst du nach und nach loslassen, um in die Richtung deines aufsteigenden Knotens (Widder, mehr Eigenständigkeit) zu wachsen.",
  },
};
