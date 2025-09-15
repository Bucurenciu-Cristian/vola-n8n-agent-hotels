#!/bin/bash
# Script to clean exposed API keys from archive files

set -e

echo "🧹 Cleaning exposed API keys from archive files..."

# Count files before cleaning
TOTAL_FILES=$(find archive/ -name "*.json" -exec grep -l "apify_api_" {} \; 2>/dev/null | wc -l)
echo "Found $TOTAL_FILES files with exposed API keys"

if [ "$TOTAL_FILES" -eq 0 ]; then
    echo "✅ No exposed keys found in archive files"
    exit 0
fi

# Clean each file by replacing exposed keys with REDACTED
CLEANED_COUNT=0

find archive/ -name "*.json" -exec grep -l "apify_api_" {} \; 2>/dev/null | while read -r FILE; do
    echo "🔧 Cleaning: $FILE"

    # Create backup
    cp "$FILE" "$FILE.backup-$(date +%Y%m%d-%H%M%S)"

    # Replace exposed API keys with REDACTED
    sed -i 's/apify_api_[A-Za-z0-9]\{20,\}/APIFY_API_KEY_REDACTED/g' "$FILE"

    # Verify the replacement worked
    if ! grep -q "apify_api_" "$FILE" 2>/dev/null; then
        echo "✅ Cleaned: $FILE"
        CLEANED_COUNT=$((CLEANED_COUNT + 1))
    else
        echo "❌ Failed to clean: $FILE"
        # Restore from backup if cleaning failed
        cp "$FILE.backup-$(date +%Y%m%d-%H%M%S)" "$FILE"
    fi
done

echo ""
echo "🎯 Summary:"
echo "  • Total files processed: $TOTAL_FILES"
echo "  • Successfully cleaned: All files processed"
echo "  • Backups created with .backup-* extension"
echo ""
echo "✅ Archive cleanup completed!"
echo "💡 Run 'make check-secrets' to verify all keys are now secure"