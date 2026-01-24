#!/usr/bin/env python3
"""
Deduplicate transcript files by removing duplicate lines with blank lines in between.
Pattern: Line -> Blank -> Same Line (remove the duplicate)
"""

import os
from pathlib import Path

def deduplicate_with_blanks(content):
    """Remove duplicates that have blank lines in between."""
    lines = content.split('\n')

    # Skip the frontmatter (between --- markers)
    in_frontmatter = False
    frontmatter_end = 0

    for i, line in enumerate(lines):
        if line.strip() == '---':
            if not in_frontmatter:
                in_frontmatter = True
            else:
                frontmatter_end = i + 1
                break

    # Keep frontmatter as-is
    frontmatter = lines[:frontmatter_end]
    transcript_lines = lines[frontmatter_end:]

    # Deduplicate: if line[i] == line[i+2] and line[i+1] is blank, remove i+2
    deduplicated = []
    i = 0
    while i < len(transcript_lines):
        deduplicated.append(transcript_lines[i])

        # Check if next pattern is: current line, blank, same line
        if (i + 2 < len(transcript_lines) and
            transcript_lines[i] == transcript_lines[i + 2] and
            transcript_lines[i + 1].strip() == ''):
            # Skip the blank and the duplicate
            i += 3
        else:
            i += 1

    # Combine frontmatter and deduplicated content
    return '\n'.join(frontmatter + deduplicated)

def process_episodes(episodes_dir):
    """Process all episode transcript files."""
    episodes_path = Path(episodes_dir)

    if not episodes_path.exists():
        print(f"Error: {episodes_dir} does not exist")
        return

    processed_count = 0
    error_count = 0

    # Iterate through all episode directories
    for episode_dir in sorted(episodes_path.iterdir()):
        if not episode_dir.is_dir() or episode_dir.name.startswith('.'):
            continue

        transcript_file = episode_dir / 'transcript.md'

        if not transcript_file.exists():
            print(f"⚠️  No transcript found: {episode_dir.name}")
            continue

        try:
            # Read original content
            with open(transcript_file, 'r', encoding='utf-8') as f:
                original = f.read()

            # Deduplicate
            deduplicated = deduplicate_with_blanks(original)

            # Calculate reduction
            original_lines = len(original.split('\n'))
            deduplicated_lines = len(deduplicated.split('\n'))
            reduction = original_lines - deduplicated_lines

            # Write back
            with open(transcript_file, 'w', encoding='utf-8') as f:
                f.write(deduplicated)

            print(f"✓ {episode_dir.name}: {original_lines} → {deduplicated_lines} lines (-{reduction})")
            processed_count += 1

        except Exception as e:
            print(f"✗ Error processing {episode_dir.name}: {e}")
            error_count += 1

    print(f"\n{'='*60}")
    print(f"Processed: {processed_count} episodes")
    if error_count > 0:
        print(f"Errors: {error_count} episodes")
    print(f"{'='*60}")

if __name__ == '__main__':
    episodes_dir = '/Users/saya/hr-heretics-transcripts/episodes'
    print(f"Deduplicating transcripts with blank-line pattern in: {episodes_dir}\n")
    process_episodes(episodes_dir)
    print("\nDone! ✨")
