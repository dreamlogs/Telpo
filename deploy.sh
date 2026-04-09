#!/bin/zsh
TELPO="$HOME/telpo/src"
DL="$HOME/Downloads"
echo "Scanning Downloads for Telpo files..."
copied=0
copy_latest() {
  local pattern=$1 dest=$2
  local latest=$(ls -t "$DL"/${pattern}*.jsx 2>/dev/null | head -1)
  if [ -n "$latest" ]; then
    cp "$latest" "$TELPO/$dest"
    echo "  OK: $(basename $latest) -> src/$dest"
    ((copied++))
  fi
}
copy_latest "chem_placement" "chem_placement.jsx"
copy_latest "chemmod" "chem_placement.jsx"
copy_latest "periodic_table" "periodic_table_3d.jsx"
copy_latest "pt3d" "periodic_table_3d.jsx"
copy_latest "molecule_viewer" "molecule_viewer.jsx"
copy_latest "shared_ui" "shared_ui.jsx"
copy_latest "App" "App.jsx"
copy_latest "calc_lab" "calc_lab.jsx"
copy_latest "physics" "physics.jsx"
copy_latest "coding" "coding.jsx"
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
