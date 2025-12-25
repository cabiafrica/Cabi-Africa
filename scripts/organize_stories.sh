#!/bin/bash

# A script to find all misplaced story files (*.story-*.yml),
# handle duplicates, and move them into a structured `stories/{epic}` directory.

set -e # Exit immediately if a command exits with a non-zero status.

PROJECT_ROOT=$(pwd)
APPS_DIR="$PROJECT_ROOT/apps"
STORIES_DIR="$PROJECT_ROOT/stories"

# Use a temporary file to track base filenames of stories that have been moved.
# This helps in identifying and deleting duplicates.
MOVED_FILES_LOG=$(mktemp)

# Ensure the temp file is cleaned up on script exit
trap 'rm -f "$MOVED_FILES_LOG"' EXIT

echo "Creating main stories directory: $STORIES_DIR"
mkdir -p "$STORIES_DIR"

# Find all files that look like story definitions within the apps directory.
find "$APPS_DIR" -type f -name "*.story-*.yml" | while read -r story_file; do
  base_filename=$(basename "$story_file")

  # Check if a story with the same filename has already been processed.
  if grep -q "^${base_filename}$" "$MOVED_FILES_LOG"; then
    echo "  - Deleting duplicate story file: $story_file"
    rm "$story_file"
    continue
  fi

  # Extract the 'epic' from the YAML file.
  # This uses grep to find the line with 'epic:', then sed to clean it up.
  epic=$(grep '^epic:' "$story_file" | sed -e 's/epic: *//' -e 's/"//g' -e "s/'//g" | tr -d '[:space:]')

  if [ -z "$epic" ]; then
    echo "  ! Warning: Could not determine epic for $story_file. Skipping."
    continue
  fi

  # Create the epic subdirectory if it doesn't exist.
  epic_dir="$STORIES_DIR/$epic"
  mkdir -p "$epic_dir"

  # Move the file and log that it has been moved.
  echo "  -> Moving $story_file to $epic_dir/"
  mv "$story_file" "$epic_dir/"
  echo "$base_filename" >> "$MOVED_FILES_LOG"
done

echo "✅ Story file organization complete."