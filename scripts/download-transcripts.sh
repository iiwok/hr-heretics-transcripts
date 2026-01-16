#!/bin/bash

# Script to download all HR Heretics transcripts from YouTube
# Organized similar to Lenny's Podcast transcripts

set -e

EPISODES_DIR="$(cd "$(dirname "$0")/.." && pwd)/episodes"
VIDEO_LIST_FILE="/tmp/hr-heretics-videos.txt"

# If video list doesn't exist, create it
if [ ! -f "$VIDEO_LIST_FILE" ]; then
    echo "Fetching video list from HR Heretics YouTube channel..."
    yt-dlp --flat-playlist --print "%(title)s | %(id)s | %(duration_string)s" "https://www.youtube.com/@HRheretics/videos" 2>/dev/null > "$VIDEO_LIST_FILE"
fi

total_count=$(wc -l < "$VIDEO_LIST_FILE" | tr -d ' ')
current=0

echo "Found $total_count videos. Starting transcript downloads..."
echo ""

while IFS='|' read -r title video_id duration; do
    # Trim whitespace using parameter expansion
    title="${title#"${title%%[![:space:]]*}"}"
    title="${title%"${title##*[![:space:]]}"}"
    video_id="${video_id#"${video_id%%[![:space:]]*}"}"
    video_id="${video_id%"${video_id##*[![:space:]]}"}"
    duration="${duration#"${duration%%[![:space:]]*}"}"
    duration="${duration%"${duration##*[![:space:]]}"}"
    current=$((current + 1))

    # Create URL-safe folder name (lowercase, replace spaces and special chars with hyphens)
    folder_name=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-80)

    episode_dir="$EPISODES_DIR/$folder_name"
    transcript_file="$episode_dir/transcript.md"

    # Skip if transcript already exists
    if [ -f "$transcript_file" ]; then
        echo "[$current/$total_count] Skipping (already exists): $title"
        continue
    fi

    echo "[$current/$total_count] Processing: $title"

    # Create episode directory
    mkdir -p "$episode_dir"

    # Download transcript using yt-dlp
    video_url="https://www.youtube.com/watch?v=$video_id"

    # Try to get manual subtitles first, fall back to auto-generated
    transcript_text=""
    if yt-dlp --write-sub --skip-download --sub-lang en --output "$episode_dir/temp" "$video_url" 2>/dev/null; then
        # Convert VTT to plain text
        if [ -f "$episode_dir/temp.en.vtt" ]; then
            transcript_text=$(sed '1,/^$/d' "$episode_dir/temp.en.vtt" | grep -v '^[0-9]' | grep -v '^$' | grep -v ' --> ' | sed 's/<[^>]*>//g')
            rm "$episode_dir/temp.en.vtt"
        fi
    fi

    # Fall back to auto-generated subtitles if manual not available
    if [ -z "$transcript_text" ]; then
        if yt-dlp --write-auto-sub --skip-download --sub-lang en --output "$episode_dir/temp" "$video_url" 2>/dev/null; then
            if [ -f "$episode_dir/temp.en.vtt" ]; then
                transcript_text=$(sed '1,/^$/d' "$episode_dir/temp.en.vtt" | grep -v '^[0-9]' | grep -v '^$' | grep -v ' --> ' | sed 's/<[^>]*>//g')
                rm "$episode_dir/temp.en.vtt"
            fi
        fi
    fi

    if [ -z "$transcript_text" ]; then
        echo "  ⚠️  No transcript available for this video"
        rm -rf "$episode_dir"
        continue
    fi

    # Get video metadata
    metadata=$(yt-dlp --dump-json "$video_url" 2>/dev/null)
    view_count=$(echo "$metadata" | grep -o '"view_count":[0-9]*' | head -1 | cut -d: -f2)
    description=$(echo "$metadata" | grep -o '"description":"[^"]*"' | head -1 | cut -d'"' -f4 | head -c 200)

    # Create transcript.md with YAML frontmatter
    cat > "$transcript_file" << EOF
---
title: "$title"
youtube_url: https://www.youtube.com/watch?v=$video_id
video_id: $video_id
duration: $duration
view_count: ${view_count:-0}
channel: HR Heretics
description: "$description"
---

# $title

## Transcript

$transcript_text
EOF

    echo "  ✓ Transcript saved to $folder_name/"

    # Small delay to avoid rate limiting
    sleep 1

done < "$VIDEO_LIST_FILE"

echo ""
echo "Done! Downloaded $current transcripts to $EPISODES_DIR"
