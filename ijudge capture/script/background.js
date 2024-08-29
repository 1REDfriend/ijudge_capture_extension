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

                chrome.tabs.update(currentTabId, { url: link }, () => {
                    chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
                        if (tabId === currentTabId && info.status === 'complete') {
                            chrome.tabs.executeScript({
                                target: tabId,
                                func: ["script/cheat.js"]
                            })
                            await new Promise(resolve => setTimeout(resolve, 3000))
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
    if (areaName === 'local' && changes.theme != null) {
        const themeValue = changes.theme.newValue;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0 && tabs[0].url.startsWith("https://ijudge.it.kmitl.ac.th/")) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['script/applyColorChange.js'] 
                },() => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'applyColorChange', value: themeValue });
                });
            }
        });
    }
});

// loop update theme
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0 && tabs[0].url.startsWith("https://ijudge.it.kmitl.ac.th/")) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["script/applyColorChange.js"]
                },async() => {
                    const result = await chrome.storage.local.get('theme');
                    const themeValue = result.theme;
                    console.log(themeValue)
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'applyColorChange', value: themeValue });
                });
            }
        });
    }
});