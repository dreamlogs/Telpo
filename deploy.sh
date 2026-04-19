#!/bin/zsh
# telpo deploy.sh — Copy latest downloads to telpo/src and push
# Usage: deploy   (from anywhere)
# Alias: alias deploy="zsh ~/telpo/deploy.sh"

TELPO="$HOME/telpo/src"
DL="$HOME/Downloads"

echo "Scanning Downloads for Telpo files..."

# ─── FILE MAP ───────────────────────────────────────────
# Pattern prefix => destination filename
# Matches: App.jsx, App (1).jsx, App_v14.jsx, etc.
typeset -A FILES
FILES=(
  App           App.jsx
  calc_lab      calc_lab.jsx
  chem_placement chem_placement.jsx
  periodic_table_3d periodic_table_3d.jsx
  molecule_viewer molecule_viewer.jsx
  shared_ui     shared_ui.jsx
  physics       physics.jsx
  coding        coding.jsx
  index         index.css
)

copied=0

for pattern dest in ${(kv)FILES}; do
  ext="${dest##*.}"
  
  # Find most recent file matching pattern (handles spaces, (1), _v14, etc.)
  latest=$(ls -t "$DL"/${pattern}*.${ext} 2>/dev/null | head -1)
  
  if [[ -n "$latest" ]]; then
    cp "$latest" "$TELPO/$dest"
    echo "  ✓ $(basename "$latest") → src/$dest"
    ((copied++))
  fi
done

if [[ $copied -eq 0 ]]; then
  echo "  No new files found in Downloads."
  exit 0
fi

echo ""
echo "Pushing $copied file(s)..."
cd "$HOME/telpo"
git add -A
git commit -m "update: $copied file(s) deployed"
git push

echo ""
echo "Done. $copied file(s) deployed to Telpo."
