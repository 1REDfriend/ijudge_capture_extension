async function processProblemLinks(problemLinks) {
    for (const link of problemLinks) {
        await new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0) {
                    console.error("No active tab found");
                    reject(new Error("No active tab found"));
                    return;
                }

                const currentTabId = tabs[0].id;
                console.log(`Navigating to: ${link} in tab ID: ${currentTabId}`);

                // Update the current tab with the new URL
                chrome.tabs.update(currentTabId, { url: link }, () => {
                    console.log(`Tab updated with URL: ${link}`);
                    chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
                        if (tabId === currentTabId && info.status === 'complete') {
                            console.log(`Tab ID ${tabId} completed loading.`);

                            // Add a slight delay to ensure content script is loaded
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            setTimeout(() => {
                                chrome.tabs.sendMessage(tabId, { action: 'cheat' }, (response) => {
                                    if (chrome.runtime.lastError) {
                                        console.error("Error sending message to content script:", chrome.runtime.lastError.message);
                                        reject(new Error(chrome.runtime.lastError.message));
                                    } else {
                                        console.log("Response received from content script:", response);
                                        resolve(response); // Resolve when content script sends a response
                                    }
                                });
                            }, 1000); // 1 second delay to ensure content script is ready

                            chrome.tabs.onUpdated.removeListener(listener);
                        }
                    });
                });
            });
        });

        // Optional delay between each link
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'local' && changes.problemLinkStack != null) {
        const newLinks = changes.problemLinkStack.newValue;
        console.log("New problem links detected:", newLinks);
        if (Array.isArray(newLinks) && newLinks.length > 0) {
            try {
                await processProblemLinks(newLinks);
                console.log("Finished processing all problem links.");
            } catch (error) {
                console.error("Error processing problem links:", error.message);
            }
            // Optional delay after processing all links
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
});
