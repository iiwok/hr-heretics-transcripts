// Get current tab info and pre-fill fields
async function getCurrentTabInfo() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return {
        url: tab.url,
        title: tab.title,
        domain: new URL(tab.url).hostname
    };
}

// Auto-detect source from URL
function detectSource(url) {
    if (url.includes('linkedin.com')) return 'LinkedIn Post';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube Video';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
    return 'Article';
}

// Format insight as markdown
function formatInsightMarkdown(data) {
    const date = new Date().toISOString().split('T')[0];

    return `
## ${data.title}

**Source:** ${data.source}
**Author:** ${data.author}
**Date:** ${date}
**URL:** ${data.url}
**Tags:** ${data.tags}
**Topics:** ${data.topics}

**Insight:** ${data.insight}

**Tactics:**
- [Add specific tactics here]

**Why:** [Explain the reasoning here]

**Attribution:** ${data.author}

**Related:** [Add related topics]

---

`;
}

// Initialize popup
async function init() {
    const tabInfo = await getCurrentTabInfo();

    // Pre-fill fields
    document.getElementById('source').value = detectSource(tabInfo.url);

    // Try to extract content from page
    const titleInput = document.getElementById('title');
    if (!titleInput.value) {
        titleInput.value = tabInfo.title.split('|')[0].trim();
    }
}

// Auto-capture from current page
async function autoCapture() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    try {
        // Send message to content script to extract content
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });

        if (response && response.content) {
            document.getElementById('title').value = response.title || document.getElementById('title').value;
            document.getElementById('author').value = response.author || '';
            document.getElementById('insight').value = response.content || '';

            showStatus('Auto-captured content!', 'success');
        }
    } catch (error) {
        console.error('Auto-capture failed:', error);
        showStatus('Auto-capture not available for this page. Please fill manually.', 'error');
    }
}

// Save to clipboard
async function saveToClipboard() {
    const tabInfo = await getCurrentTabInfo();

    const data = {
        title: document.getElementById('title').value,
        source: document.getElementById('source').value,
        author: document.getElementById('author').value,
        tags: document.getElementById('tags').value,
        topics: document.getElementById('topics').value,
        insight: document.getElementById('insight').value,
        url: tabInfo.url
    };

    // Validate
    if (!data.title || !data.insight) {
        showStatus('Please fill in at least Title and Insight fields', 'error');
        return;
    }

    const markdown = formatInsightMarkdown(data);

    // Copy to clipboard
    try {
        await navigator.clipboard.writeText(markdown);
        showStatus('✓ Copied to clipboard! Paste into additional-insights.md', 'success');

        // Store in local history
        chrome.storage.local.get(['capturedInsights'], (result) => {
            const insights = result.capturedInsights || [];
            insights.push({ ...data, capturedAt: new Date().toISOString() });
            chrome.storage.local.set({ capturedInsights: insights.slice(-50) }); // Keep last 50
        });
    } catch (error) {
        showStatus('Failed to copy to clipboard', 'error');
    }
}

// Show status message
function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;

    if (type === 'success') {
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }
}

// Event listeners
document.getElementById('auto-capture').addEventListener('click', autoCapture);
document.getElementById('save').addEventListener('click', saveToClipboard);

// Initialize on load
init();
