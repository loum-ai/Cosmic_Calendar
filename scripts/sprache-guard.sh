#!/usr/bin/env bash
# sprache-guard — deutscher Text braucht echte Umlaute. Blockt transliterierte
# Schreibweisen (fuer, ueber, groesse, zurueck …) in Quellcode-Kommentaren,
# Strings und Doku.
#
#   bin/sprache-guard.sh --staged        (git-staged; pre-commit)
#   bin/sprache-guard.sh <pfade…>        (einzelne Dateien; PostToolUse)
#
# Warum es diesen Guard gibt: die Regel „echte Umlaute" stand nur als Notiz und
# ist trotzdem immer wieder gebrochen worden — zuletzt so, dass beim Umschreiben
# einer Datei VORHANDENE korrekte Umlaute aktiv zu ue/oe/ae verschlechtert
# wurden. Notiz-Regeln kommen zurück, Guards nicht. (Gleiche Lehre wie beim
# no-emoji-guard in loum.ai.) Regelwerk: loum.ai mem/arbeitsweise/sprache.md
#
# Bewusst NICHT geprüft:
#   · ss statt ß — die Schweizer Rechtschreibung kennt kein ß, das wäre falsch.
#   · Buchstabenpaare ae/oe/ue allgemein — „true", „value", „aktuell", „neue"
#     und „Steuer" enthalten sie völlig zu Recht. Geprüft wird deshalb eine
#     kuratierte Liste von Wortstämmen, die im Deutschen wie im Englischen
#     ausschliesslich als Transliteration vorkommen.
#
# Exit 1 = Fund (blockiert). Notausgang für einen bewussten Einzelfall
# (z.B. ein Zitat, ein Dateiname, eine ASCII-only-Umgebung):
#   LOUM_ALLOW_TRANSLIT=1 git commit …
set -uo pipefail
ROOT="${LOUM_APP_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

[ "${LOUM_ALLOW_TRANSLIT:-0}" = "1" ] && exit 0

FILES=()
if [ "${1:-}" = "--staged" ]; then
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    case "$f" in
      *.ts|*.tsx|*.css|*.md|*.sh|*.json)
        case "$f" in
          # Fremd-/Generat-Dateien: nicht unsere Prosa.
          node_modules/*|*/node_modules/*|*.lock|bun.lock|*/dist/*|*/build/*) ;;
          *) [ -f "$ROOT/$f" ] && FILES+=("$ROOT/$f") ;;
        esac ;;
    esac
  done < <(git -C "$ROOT" diff --cached --name-only --diff-filter=ACMR)
else
  FILES=("$@")
fi
[ ${#FILES[@]} -eq 0 ] && exit 0

python3 - "${FILES[@]}" <<'PY'
import os, re, sys

# Selbst-Ausnahme: dieser Guard und seine Testsuite enthalten die falschen
# Schreibweisen als DATEN (Wortliste, Fixtures). Ohne die Ausnahme blockiert
# der Guard sich selbst.
SELF_EXEMPT = {"sprache-guard.sh"}

# Wortstämme, die als Zeichenfolge eindeutig eine Transliteration sind.
# Jeder Eintrag wurde gegen echte deutsche UND englische Wörter geprüft:
# keiner davon kommt dort als Teilzeichenkette legitim vor.
STEMS = {
    "fuer": "für",            "ueber": "über",          "koenn": "könn",
    "moegl": "mögl",          "muess": "müss",          "groess": "größ",
    "waehl": "wähl",          "zurueck": "zurück",      "voellig": "völlig",
    "noetig": "nötig",        "hoeh": "höh",            "loesch": "lösch",
    "aender": "änder",        "schuetz": "schütz",      "fuehr": "führ",
    "gehoer": "gehör",        "naechst": "nächst",      "spaeter": "später",
    "waere": "wäre",          "haette": "hätte",        "duerf": "dürf",
    "pruef": "prüf",          "erklaer": "erklär",      "ergaenz": "ergänz",
    "staendig": "ständig",    "flaech": "fläch",        "laeuft": "läuft",
    "aehnlich": "ähnlich",    "ueblich": "üblich",      "stuetz": "stütz",
    "zusaetz": "zusätz",      "taeglich": "täglich",    "kuerz": "kürz",
    "laeng": "läng",          "oeffn": "öffn",          "koerper": "körper",
    "gueltig": "gültig",      "schoen": "schön",        "wuerd": "würd",
    "gedaempf": "gedämpf",    "haeuf": "häuf",          "urspruengl": "ursprüngl",
    "beruecksicht": "berücksicht", "unterstuetz": "unterstütz",
    "beruehr": "berühr",      "erwaehn": "erwähn",      "auswaehl": "auswähl",
    "vergroess": "vergröß",   "verkuerz": "verkürz",    "einfuehr": "einführ",
    "vollstaendig": "vollständig", "moechte": "möchte",  "duenn": "dünn",
}

PAT = re.compile("|".join(sorted(map(re.escape, STEMS), key=len, reverse=True)), re.I)

# Zitate in Backticks sind ausgenommen. Eine Doku ÜBER diese Regel muss die
# falsche Form benennen dürfen („schreib nicht `fuer`, sondern für"), ebenso
# ein Kommentar, der einen Bezeichner oder Dateinamen zitiert. Alles zwischen
# Backticks wird vor der Prüfung entfernt, Codeblöcke komplett übersprungen.
CODESPAN = re.compile(r"`[^`]*`")

# Geprüft wird PROSA, nicht Code. Bezeichner dürfen ASCII sein — das ist gängige
# Praxis und oft sogar nötig: `schuetze` ist in vela der Datenschlüssel für das
# Sternzeichen Schütze, `fehlerKoerper` ein Funktionsname, `flaeche` eine
# Variable. Wer die "korrigiert", zerlegt die App.
#
# Prosa ist deshalb: der Text von Kommentaren, und Zeichenketten mit mindestens
# einem Leerzeichen. Ein einzelnes Wort in Anführungszeichen ist fast immer ein
# Schlüssel oder Slug ('schuetze'), ein Satz dagegen echte Copy.
COMMENT = re.compile(r"//(.*)$|/\*(.*?)(?:\*/|$)|^\s*\*(?!/)(.*)$|#(.*)$")
STRING = re.compile(r"'([^'\n]*)'|\"([^\"\n]*)\"")

def prosa(line, is_markdown):
    """Der Teil der Zeile, auf den die Rechtschreibregel überhaupt zutrifft."""
    if is_markdown:
        return line
    teile = []
    for m in COMMENT.finditer(line):
        teile.extend(g for g in m.groups() if g)
    for m in STRING.finditer(line):
        for g in m.groups():
            if g and " " in g.strip():
                teile.append(g)
    return " ".join(teile)

hits = []
for path in sys.argv[1:]:
    if os.path.basename(path) in SELF_EXEMPT:
        continue
    is_md = path.endswith(".md")
    try:
        with open(path, encoding="utf-8") as fh:
            in_fence = False
            for i, line in enumerate(fh, 1):
                # Fence auch in Block-Kommentaren erkennen, wo die Zeile mit
                # " * " beginnt (JSDoc). Ohne das bleibt ein Codeblock in einem
                # Kommentar unerkannt.
                if line.lstrip().lstrip("*").lstrip().startswith("```"):
                    in_fence = not in_fence
                    continue
                if in_fence:
                    continue
                for m in PAT.finditer(prosa(CODESPAN.sub("", line), is_md)):
                    found = m.group(0)
                    right = STEMS[found.lower()]
                    hits.append(
                        f"{path}:{i}: „{found}“ — schreib „{right}“ mit echtem Umlaut"
                    )
    except (FileNotFoundError, IsADirectoryError, UnicodeDecodeError):
        pass

if hits:
    print("\n".join(hits))
    print("\n  Deutscher Text braucht echte Umlaute (ä ö ü) — auch in Kommentaren,")
    print("  Commit-Messages und Doku.")
    print("  Bewusste Ausnahme: LOUM_ALLOW_TRANSLIT=1 <befehl>")
    sys.exit(1)
PY
