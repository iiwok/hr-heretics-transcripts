# HR Insights Capture & Sync System

A continuous learning system that captures HR/leadership insights from LinkedIn, YouTube, and articles, stores them in GitHub, and syncs them to a queryable Notion database.

## Architecture

```
Content Sources → Browser Extension → GitHub Repo → Worker Sync → Notion Database
(LinkedIn/YouTube)    (Capture)      (Storage)     (Hourly)      (Queryable by AI)
```

## Components

### 1. Browser Extension (`/browser-extension/`)
Chrome extension that captures insights with a single click or keyboard shortcut.

**Features:**
- Auto-detects source type (LinkedIn, YouTube, Article)
- Extracts content from LinkedIn posts and YouTube videos
- Formats insights in standard markdown
- Copies formatted markdown to clipboard
- Keyboard shortcut: `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows)

### 2. GitHub Repository (`/hr-heretics-transcripts/`)
Central storage for all captured insights.

**Key File:** `additional-insights.md`
- Version-controlled insight collection
- Standard markdown format for easy editing
- Each insight is a `## Section` with metadata

### 3. Notion Worker (`/Users/saya/Worker/`)
Automated sync that reads from GitHub and updates Notion.

**Sync Name:** `githubInsightsSync`
- **Schedule:** Runs hourly (configurable)
- **Mode:** Incremental (only syncs new/changed insights)
- **Smart tracking:** Remembers what's already synced via commit SHA

### 4. Notion Database
Queryable database with rich properties for filtering and AI queries.

**Properties:**
- Title, Author, Date, URL
- Source (LinkedIn Post, YouTube Video, etc.)
- Tags (Hiring, Compensation, Performance, etc.)
- Topics (Recruiting, Leadership, Equity, etc.)
- Word Count, Content, Synced At

---

## Setup Guide

### Step 1: Install Browser Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `/browser-extension/` folder
5. Pin the extension to your toolbar
6. Test the keyboard shortcut: `Cmd+Shift+I`

### Step 2: Setup GitHub Repo

1. Commit the `additional-insights.md` file to your repo:
   ```bash
   cd ~/hr-heretics-transcripts
   git add additional-insights.md
   git commit -m "Add insights capture file"
   git push origin main
   ```

2. **Note:** The Worker is configured to read from:
   - Repo: `sayakpaul/hr-heretics-transcripts`
   - File: `additional-insights.md`
   - Branch: `main`

   To change these, edit `/Users/saya/Worker/src/index.ts` line 1408-1411

### Step 3: Setup Notion Worker Sync

**Option A: Manual Workaround (Recommended for now)**

GitHub OAuth through Notion Workers is currently having issues. Here's the workaround:

1. Capture insights using the browser extension
2. Manually commit to GitHub as shown in Step 2
3. Use the `deployMultiPageMentor` tool to manually sync:
   - In Notion AI (once OAuth is fixed), ask: "Deploy my insights from GitHub using deployMultiPageMentor"
   - The tool will read from GitHub and create the database

**Option B: OAuth Setup (When fixed)**

```bash
cd ~/Worker
npx workers oauth start githubAuth
# Follow the OAuth flow in your browser
# Once complete, the sync will run automatically every hour
```

### Step 4: Enable Sync in Notion

1. Go to your Worker Dashboard:
   https://dev.notion.so/__workers__/019bbff8-a994-74dd-b61c-e9aa2c3c4d32

2. Enable the `githubInsightsSync` capability

3. Run it manually for the first time:
   ```bash
   npx workers exec githubInsightsSync
   ```

4. The sync will now run hourly automatically

---

## Usage Workflows

### Workflow 1: Capture LinkedIn Post

1. Navigate to a LinkedIn post with valuable HR insight
2. Press `Cmd+Shift+I` or click the extension icon
3. Click "Auto-Capture" to extract post content
4. Fill in Tags and Topics
5. Click "Save to Clipboard"
6. Open `additional-insights.md` in your editor
7. Paste at the bottom of the file
8. Commit and push to GitHub
9. Wait for hourly sync (or run manually: `npx workers exec githubInsightsSync`)

### Workflow 2: Capture YouTube Video

1. Watch a HR/leadership video on YouTube
2. Press `Cmd+Shift+I`
3. Click "Auto-Capture" to extract video metadata
4. For the full transcript, use:
   ```bash
   yt-dlp --write-auto-sub --skip-download [VIDEO_URL]
   # Or use youtube-transcript-api
   ```
5. Paste transcript summary into "Insight" field
6. Add Tags and Topics
7. Save and commit to GitHub

### Workflow 3: Capture Article

1. Read an article with valuable insight
2. Press `Cmd+Shift+I`
3. Manually fill in all fields
4. Save to clipboard
5. Paste into `additional-insights.md`
6. Commit to GitHub

### Workflow 4: Query in Notion

Once synced to Notion, you can:
- Filter by Tags (e.g., "Show me all Compensation insights")
- Filter by Source (e.g., "Only LinkedIn posts")
- Filter by Author (e.g., "What has Brandon Sammut said?")
- **Use Notion AI:** "Summarize all insights about Bar Raiser hiring"
- **Use Notion AI:** "What are the top 3 tactics for executive hiring?"

---

## Insight Format Reference

Each insight follows this markdown structure:

```markdown
## [Title of Insight]

**Source:** [LinkedIn Post | YouTube Video | Article | Podcast | Twitter/X | Other]
**Author:** [Name (Title, Company)]
**Date:** YYYY-MM-DD
**URL:** https://...
**Tags:** [Comma, Separated, Tags]
**Topics:** [Comma, Separated, Topics]

**Insight:** [The main insight or framework. Include specific numbers, quotes, and frameworks.]

**Tactics:**
- [Specific actionable tactic]
- [Another tactic]

**Why:** [Explain the reasoning or context behind the insight]

**Attribution:** [Source/Episode/Author]

**Related:** [Related topics or concepts]

---
```

---

## Maintenance & Troubleshooting

### Worker Commands

```bash
# Check deployed capabilities
npx workers capabilities list

# Run sync manually
npx workers exec githubInsightsSync

# View recent runs
npx workers runs list

# Check logs for a specific run
npx workers runs logs <runId>

# Redeploy after code changes
npx workers deploy
```

### Common Issues

**Issue: OAuth fails with 500 error**
- **Solution:** Use manual workaround (capture → commit → run sync manually)

**Issue: Sync not finding new insights**
- **Check:** Ensure insights follow the `## Title` format
- **Check:** Verify GitHub repo/file/branch configuration in Worker code
- **Check:** Run `npx workers runs list` to see if sync is running

**Issue: Extension "Auto-Capture" doesn't work**
- **Solution:** Only works on LinkedIn and YouTube. For other sites, manually fill fields
- **Check:** Ensure extension has permission for the current site

**Issue: Notion database not created**
- **Check:** OAuth is configured (`npx workers oauth start githubAuth`)
- **Try:** Run sync manually: `npx workers exec githubInsightsSync`

### Updating the System

**To add new Tags or Topics:**
1. Edit `/Users/saya/Worker/src/index.ts` lines 1376-1390
2. Add new options to the `multiSelect` arrays
3. Redeploy: `npx workers deploy`

**To change sync frequency:**
1. Edit `/Users/saya/Worker/src/index.ts` line 1357
2. Change `schedule: "1h"` to desired interval (e.g., `"30m"`, `"6h"`, `"1d"`)
3. Redeploy: `npx workers deploy`

**To change GitHub repo/file:**
1. Edit `/Users/saya/Worker/src/index.ts` lines 1408-1411
2. Update `owner`, `repo`, `filePath`, `branch`
3. Redeploy: `npx workers deploy`

---

## Files Reference

### Browser Extension Files
```
browser-extension/
├── manifest.json           # Extension configuration
├── popup.html              # Extension UI
├── popup.js                # Capture and formatting logic
├── content-linkedin.js     # LinkedIn content extraction
├── content-youtube.js      # YouTube content extraction
└── background.js           # Keyboard shortcut handler
```

### Key Repository Files
```
hr-heretics-transcripts/
├── additional-insights.md        # Main insights collection
├── hr-heretics-topic-guide.md    # Original comprehensive guide
└── browser-extension/            # Chrome extension source
```

### Worker Files
```
Worker/
└── src/
    └── index.ts                  # Worker with githubInsightsSync
```

---

## Future Enhancements

### Potential Additions
- [ ] Auto-commit to GitHub from extension (eliminate manual commit step)
- [ ] AI summarization in extension before capture
- [ ] Bulk import from Twitter/X bookmarks
- [ ] Integration with Pocket/Instapaper reading lists
- [ ] Weekly email digest of captured insights
- [ ] Notion AI assistant that proactively surfaces relevant insights

### Alternative Storage Options
- **Current:** GitHub (version control, globally accessible)
- **Alternative 1:** Dropbox/Google Drive (easier auth, less technical)
- **Alternative 2:** Direct to Notion "inbox" page (simplest, less portable)

---

## Support & Feedback

**Worker Dashboard:**
https://dev.notion.so/__workers__/019bbff8-a994-74dd-b61c-e9aa2c3c4d32

**GitHub Repo:**
https://github.com/sayakpaul/hr-heretics-transcripts

---

## Quick Reference Card

| Action | Command/Shortcut |
|--------|-----------------|
| Capture insight | `Cmd/Ctrl + Shift + I` |
| Deploy Worker | `npx workers deploy` |
| Run sync manually | `npx workers exec githubInsightsSync` |
| View sync logs | `npx workers runs list` |
| Setup OAuth | `npx workers oauth start githubAuth` |
| Check capabilities | `npx workers capabilities list` |

---

**Version:** 1.0.0
**Last Updated:** 2026-01-17
**Status:** ✅ Core system complete, OAuth troubleshooting in progress
