// YouTube content extraction
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
        try {
            // Extract video title
            const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer, h1.title');
            const title = titleElement ? titleElement.innerText.trim() : document.title.replace(' - YouTube', '');

            // Extract channel name
            const channelElement = document.querySelector('#channel-name a, ytd-channel-name a');
            const author = channelElement ? channelElement.innerText.trim() : '';

            // Extract description
            const descriptionElement = document.querySelector('#description, #description-text');
            let content = descriptionElement ? descriptionElement.innerText.trim() : '';

            // Limit content to first 500 characters from description
            if (content.length > 500) {
                content = content.substring(0, 497) + '...';
            }

            // Add note about transcript
            content += '\n\n[Note: Extract full transcript using yt-dlp or youtube-transcript-api]';

            sendResponse({
                content,
                title,
                author,
                source: 'YouTube Video'
            });
        } catch (error) {
            console.error('YouTube extraction error:', error);
            sendResponse({ error: error.message });
        }
    }
    return true;
});
