#!/bin/bash

# Create a single text file with all SaveMe files clearly separated
# This makes manual copying easier

OUTPUT_FILE="ALL_FILES_FOR_COPY_PASTE.txt"

echo "Creating copy-paste helper file: $OUTPUT_FILE"
echo ""

# Start with instructions
cat > "$OUTPUT_FILE" << 'EOF'
================================================================================
SAVEME - ALL FILES FOR MANUAL COPY-PASTE
================================================================================

This file contains all 13 SaveMe files with clear separators.

HOW TO USE:
1. Open Apps Script editor (Extensions → Apps Script)
2. For each file below:
   - Create new file (+ icon → Script or HTML)
   - Copy content between the "START" and "END" markers
   - Paste into the Apps Script editor
   - Save

IMPORTANT:
- For .gs files: Click "+ → Script"
- For .html files: Click "+ → HTML"
- For appsscript.json: Enable in Project Settings first

================================================================================

EOF

# Array of .gs files
GS_FILES=(
  "Code.gs"
  "Config.gs"
  "GmailProcessor.gs"
  "DriveManager.gs"
  "EmailConverter.gs"
  "FileNaming.gs"
  "OpenRouterService.gs"
  "EmailTracker.gs"
  "SheetsManager.gs"
  "TriggerManager.gs"
  "DebugManager.gs"
)

# Add each .gs file
for FILE in "${GS_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "" >> "$OUTPUT_FILE"
    echo "================================================================================" >> "$OUTPUT_FILE"
    echo "FILE: $FILE" >> "$OUTPUT_FILE"
    echo "TYPE: Script (.gs)" >> "$OUTPUT_FILE"
    echo "ACTION: In Apps Script, click '+ → Script', name it '$FILE', paste content below" >> "$OUTPUT_FILE"
    echo "================================================================================" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "===== START OF $FILE =====" >> "$OUTPUT_FILE"
    cat "$FILE" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "===== END OF $FILE =====" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  else
    echo "Warning: $FILE not found"
  fi
done

# Add SettingsPanel.html
if [ -f "SettingsPanel.html" ]; then
  echo "" >> "$OUTPUT_FILE"
  echo "================================================================================" >> "$OUTPUT_FILE"
  echo "FILE: SettingsPanel.html" >> "$OUTPUT_FILE"
  echo "TYPE: HTML" >> "$OUTPUT_FILE"
  echo "ACTION: In Apps Script, click '+ → HTML', name it 'SettingsPanel', paste content below" >> "$OUTPUT_FILE"
  echo "================================================================================" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo "===== START OF SettingsPanel.html =====" >> "$OUTPUT_FILE"
  cat "SettingsPanel.html" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo "===== END OF SettingsPanel.html =====" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
fi

# Add appsscript.json
if [ -f "appsscript.json" ]; then
  echo "" >> "$OUTPUT_FILE"
  echo "================================================================================" >> "$OUTPUT_FILE"
  echo "FILE: appsscript.json" >> "$OUTPUT_FILE"
  echo "TYPE: Manifest" >> "$OUTPUT_FILE"
  echo "ACTION: " >> "$OUTPUT_FILE"
  echo "  1. Go to Project Settings (⚙️ icon)" >> "$OUTPUT_FILE"
  echo "  2. Check ✅ 'Show appsscript.json manifest file in editor'" >> "$OUTPUT_FILE"
  echo "  3. Go back to Editor, click 'appsscript.json'" >> "$OUTPUT_FILE"
  echo "  4. Replace ENTIRE content with code below" >> "$OUTPUT_FILE"
  echo "================================================================================" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo "===== START OF appsscript.json =====" >> "$OUTPUT_FILE"
  cat "appsscript.json" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo "===== END OF appsscript.json =====" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
fi

# Final instructions
cat >> "$OUTPUT_FILE" << 'EOF'

================================================================================
DEPLOYMENT COMPLETE!
================================================================================

Next steps:
1. Save the Apps Script project (💾 or Cmd/S)
2. Close Apps Script editor
3. Refresh the Google Sheet (F5)
4. Wait for SaveMe menu to appear
5. Click SaveMe → Configure Settings
6. Authorize the app
7. Configure settings and test

For detailed instructions, see: TESTING_GUIDE.md

================================================================================
EOF

echo "✅ Created: $OUTPUT_FILE"
echo ""
echo "This file contains all 13 SaveMe files ready for copy-paste."
echo "Open it in a text editor and follow the instructions."
echo ""
echo "File size: $(wc -c < "$OUTPUT_FILE" | awk '{print int($1/1024) " KB"}')"
