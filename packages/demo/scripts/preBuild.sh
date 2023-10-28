#!/bin/bash

CURRENT_DIR=$(pwd)

# Source directory containing codeExamples (assuming it's in the parent directory)
SOURCE_DIR="$CURRENT_DIR/src/components"

# Destination directory to copy codeExamples
DEST_DIR="$CURRENT_DIR/public/docs"

mkdir -p "$DEST_DIR"

# Find all files in codeExamples directories and copy them to DEST_DIR
find "$SOURCE_DIR" -type f \( -name "*.ts" -o -name "*.md" \) -path "*/docs/*" -exec cp {} "$DEST_DIR" \;

echo "Code examples copied to $DEST_DIR."
