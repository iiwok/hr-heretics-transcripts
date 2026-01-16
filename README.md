# HR Heretics Podcast - Transcript Archive

A comprehensive archive of transcripts from the **HR Heretics** podcast, organized for easy use with AI coding assistants and language models.

## About HR Heretics

**HR Heretics** is a podcast hosted by [Nolan Church](https://www.linkedin.com/in/nolankchurch/) and [Kelli Dragovich](https://www.linkedin.com/in/kellidragovich/) that features unfiltered conversations with top CPOs, CHROs, founders, and board members about building high-performing companies.

- **YouTube Channel**: [@HRheretics](https://www.youtube.com/@HRheretics)
- **Substack**: [hrheretics.substack.com](https://hrheretics.substack.com)
- **Network**: Part of [Turpentine](https://www.turpentine.co/) podcast network

## Repository Structure

```
hr-heretics-transcripts/
├── episodes/           # Individual episode transcripts
│   ├── episode-name-1/
│   │   └── transcript.md
│   ├── episode-name-2/
│   │   └── transcript.md
│   └── ...
├── scripts/            # Automation scripts
│   └── download-transcripts.sh
└── README.md
```

## Transcript Format

Each transcript is stored in a separate folder under `episodes/` and includes:

### YAML Frontmatter
Every `transcript.md` file begins with structured metadata:

```yaml
---
title: "Episode Title"
youtube_url: https://www.youtube.com/watch?v=VIDEO_ID
video_id: VIDEO_ID
duration: HH:MM:SS
view_count: 12345
channel: HR Heretics
description: "Episode description..."
---
```

### Full Text Transcript
Following the frontmatter is the complete episode transcript, extracted from YouTube subtitles (manual or auto-generated).

## Quick Start

### Browse Episodes
Navigate to the [`episodes/`](episodes/) directory to see all available transcripts.

### Search Transcripts
Use `grep` to search across all transcripts:

```bash
# Find all mentions of "compensation"
grep -r "compensation" episodes/

# Find episodes discussing "AI" or "artificial intelligence"
grep -ri "AI\|artificial intelligence" episodes/
```

### Programmatic Access
Parse the YAML frontmatter with your preferred language:

**Python example:**
```python
import yaml

with open('episodes/some-episode/transcript.md', 'r') as f:
    content = f.read()

# Split frontmatter and content
parts = content.split('---', 2)
frontmatter = yaml.safe_load(parts[1])
transcript_text = parts[2]

print(f"Title: {frontmatter['title']}")
print(f"Duration: {frontmatter['duration']}")
```

## Updating Transcripts

To download new transcripts or update existing ones:

```bash
cd scripts
./download-transcripts.sh
```

The script will:
- Fetch the latest video list from the HR Heretics YouTube channel
- Download transcripts for any new videos
- Skip videos that already have transcripts
- Organize everything into the proper folder structure

## Use Cases

- **Research**: Search across hundreds of hours of HR and talent leadership insights
- **AI Training**: Use structured data for fine-tuning or RAG applications
- **Content Analysis**: Analyze themes, topics, and trends in people operations
- **Reference**: Quick access to specific episodes and quotes

## Topics Covered

HR Heretics covers a wide range of topics including:
- Talent acquisition and recruiting
- Executive hiring and firing
- Compensation and equity
- Company culture and values
- Performance management
- DEI (Diversity, Equity, Inclusion)
- AI in HR and people operations
- Leadership development
- Organizational design
- And much more...

## Credits

- **Podcast Hosts**: Nolan Church & Kelli Dragovich
- **Original Content**: [HR Heretics YouTube Channel](https://www.youtube.com/@HRheretics)
- **Transcripts**: Auto-generated via YouTube, extracted using yt-dlp

## Disclaimer

This archive is for educational and research purposes. All content belongs to the original creators. If you use these transcripts, please:
- Provide proper attribution to HR Heretics and the podcast hosts
- Link back to the original YouTube videos
- Support the creators by subscribing and engaging with their content

## License

Transcripts are provided as-is for educational purposes. All rights to the original content belong to HR Heretics and their respective guests.

---

Built with inspiration from [Lenny's Podcast Transcripts](https://github.com/ChatPRD/lennys-podcast-transcripts)
