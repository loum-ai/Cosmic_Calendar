#!/usr/bin/env bash
# PostToolUse-Hook: prüft nach jedem Edit/Write die eine Datei auf
# transliterierte Umlaute. Deutscher Text braucht echte Umlaute — auch in
# Code-Kommentaren und Doku.
#
# Die Regel und ihre Begründung stehen im loum.ai-Repo unter
# mem/arbeitsweise/sprache.md. Hier liegt nur die Durchsetzung für vela.
#
# Exit 2 (Meldung auf stderr) = Fund, Claude korrigiert sofort.
# Bewusste Ausnahme: LOUM_ALLOW_TRANSLIT=1

file_path=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty' 2>/dev/null)
[ -z "$file_path" ] && exit 0

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
[ -x "$REPO/scripts/sprache-guard.sh" ] || exit 0

# Nur Dateien innerhalb dieses Repos
case "$file_path" in
  "$REPO"/*) ;;
  *) exit 0 ;;
esac
case "$file_path" in
  *.ts|*.tsx|*.css|*.md|*.sh) ;;
  *) exit 0 ;;
esac
case "$file_path" in
  */node_modules/*|*/dist/*) exit 0 ;;
esac

out="$(bash "$REPO/scripts/sprache-guard.sh" "$file_path" 2>&1)" || {
  {
    echo "⛔ Sprache: transliterierte Umlaute — bitte echte Umlaute schreiben:"
    echo "$out"
  } >&2
  exit 2
}
exit 0
