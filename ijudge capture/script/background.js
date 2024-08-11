// background.js
chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0) { // Ensure it's the main frame
        console.log("Page navigation detected" , details);
        if (details.url.startsWith("https://ijudge.it.kmitl.ac.th/problems/")) {
            // Inject the content script
            chrome.scripting.executeScript({
                target: { tabId: details.tabId },
                files: ['script/capture.js']
            }, async () => {
                // Check for injection errors
                if (chrome.runtime.lastError) {
                    console.error("Script injection error:", chrome.runtime.lastError);
                    return;
                }

                // Send a message to the content script
                chrome.tabs.sendMessage(details.tabId, { action: "startProcessing" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Message sending error:", chrome.runtime.lastError);
                    } else if (response && response.status === "completed") {
                        console.log("Processing completed, downloading file...");

                        const { combinedMarkdown, headerText } = response;

                        // Convert Markdown content to a data URL
                        const markdownDataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(combinedMarkdown)}`;

                        // Perform the download in the background script
                        chrome.downloads.download({
                            url: markdownDataUrl,
                            filename: `${headerText}.md`
                        });
                        chrome.tabs.goBack(details.tabId);
                    } else {
                        console.error("Processing failed or no response:", response);
                    }
                });
            });
        }
    }
});
