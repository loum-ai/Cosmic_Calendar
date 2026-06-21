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
};
