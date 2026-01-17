// LinkedIn content extraction
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
        try {
            // Try to extract LinkedIn post content
            let content = '';
            let title = '';
            let author = '';

            // Extract post content
            const postContent = document.querySelector('.feed-shared-update-v2__description, .feed-shared-text');
            if (postContent) {
                content = postContent.innerText.trim();
            }

            // Extract author name
            const authorElement = document.querySelector('.update-components-actor__name, .feed-shared-actor__name');
            if (authorElement) {
                author = authorElement.innerText.trim();
            }

            // Extract author title/company
            const titleElement = document.querySelector('.update-components-actor__description, .feed-shared-actor__description');
            if (titleElement) {
                const titleText = titleElement.innerText.trim();
                author += titleText ? ` (${titleText})` : '';
            }

            // Use first sentence of content as title if available
            if (content) {
                const firstSentence = content.split(/[.!?]/)[0];
                title = firstSentence.length > 80
                    ? firstSentence.substring(0, 77) + '...'
                    : firstSentence;
            }

            sendResponse({
                content,
                title,
                author,
                source: 'LinkedIn Post'
            });
        } catch (error) {
            console.error('LinkedIn extraction error:', error);
            sendResponse({ error: error.message });
        }
    }
    return true; // Keep message channel open for async response
});
