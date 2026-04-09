#!/bin/zsh
TELPO="$HOME/telpo/src"
DL="$HOME/Downloads"
echo "Scanning Downloads for Telpo files..."
copied=0
copy_newest() {
  local dest=$1
  shift
  local newest=""
  local newest_time=0
  for pattern in "$@"; do
    local f=$(ls -t "$DL"/${pattern}*.jsx 2>/dev/null | head -1)
    if [ -n "$f" ]; then
      local t=$(stat -f %m "$f")
      if [ "$t" -gt "$newest_time" ]; then
        newest="$f"
        newest_time="$t"
      fi
    fi
  done
  if [ -n "$newest" ]; then
    cp "$newest" "$TELPO/$dest"
    echo "  OK: $(basename $newest) -> src/$dest"
    ((copied++))
  fi
}
copy_newest "chem_placement.jsx" "chem_placement" "chemmod"
copy_newest "periodic_table_3d.jsx" "periodic_table" "pt3d"
copy_newest "molecule_viewer.jsx" "molecule_viewer"
copy_newest "shared_ui.jsx" "shared_ui"
copy_newest "App.jsx" "App" "AppDark"
copy_newest "calc_lab.jsx" "calc_lab"
copy_newest "physics.jsx" "physics"
copy_newest "coding.jsx" "coding"
if [ $copied -eq 0 ]; then
  echo "  No new .jsx files found."
  exit 0
fi
echo "Pushing $copied file(s)..."
cd "$HOME/telpo"
git add -A
git commit -m "update: $copied file(s) deployed"
git pull --rebase
git push
echo "Done."
