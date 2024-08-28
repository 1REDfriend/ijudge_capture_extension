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
        const value = await changes.theme.oldValue;
        if (value == 'light') {
            await chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                if (await tabs.length > 0) {
                    await chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: async() => {
                            const bg_elements = document.querySelector("body");
                            const bg2 = document.querySelectorAll("nav, footer");
                            const tables_bg = document.querySelectorAll('.MuiPaper-root')
                            const fonts = document.querySelectorAll("p,h1,h2,h3,h4,h5,.MuiTableCell-root,.MuiAlert-message,.MuiChip-label,.MuiButton-text")

                            tables_bg.forEach(element => {
                                element.style.backgroundColor = "#f3f4f6"
                            })
                            bg_elements.style.backgroundColor = "#f3f4f6"
                            bg2.forEach(element => {
                                element.style.backgroundColor = "#f3f4f6";
                                element.style.borderColor = "#ffffff";
                            });
                            fonts.forEach(element => {
                                element.style.color = "#000000";
                            })
                        }
                    })
                }
            })
        } else if (value == "dark") {
            await chrome.tabs.query({ active: true, currentWindow: true }, async(tabs) => {
                if (await tabs.length > 0) {
                    await chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: async() => {
                            const bg_elements = document.querySelector("body");
                            const bg2 = document.querySelectorAll("nav, footer");
                            const tables_bg = document.querySelectorAll('.MuiPaper-root')
                            const fonts = document.querySelectorAll("p,h1,h2,h3,h4,h5,.MuiTableCell-root,.MuiAlert-message,.MuiChip-label,.MuiButton-text")

                            tables_bg.forEach(element => {
                                element.style.backgroundColor = "#141d2e"
                            })
                            bg_elements.style.backgroundColor = "#0d1016"
                            bg2.forEach(element => {
                                element.style.backgroundColor = "#141d2e";
                                element.style.borderColor = "#1d4eb1";
                            });
                            fonts.forEach(element => {
                                element.style.color = "#ffffff";
                            })
                        }
                    })
                }
            })
        }
    }
});