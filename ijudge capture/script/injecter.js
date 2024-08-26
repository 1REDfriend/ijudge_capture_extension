document.addEventListener('DOMContentLoaded', () => {
    const saveAllButton = document.getElementById('saveAllButton');
    
    if (saveAllButton) {
        saveAllButton.addEventListener('click', async() => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                if (tabs.length > 0) {
                    const activeTab = tabs[0];
                    const url = activeTab["url"];

                    // Check if the URL matches the desired pattern
                    if (!url || !url.startsWith("https://ijudge.it.kmitl.ac.th/courses")) {
                        console.error("The URL does not match the required pattern or is undefined");
                        return; // Exit if the URL does not match
                    }

                    chrome.scripting.executeScript({
                        target: { tabId: activeTab.id },
                        function: async () => {
                            const problemList = document.querySelectorAll('table tbody.MuiTableBody-root.mui-1xnox0e tr');
                            let problemLinkStack = [];
                            for (const problemLink of problemList) {
                                const links = problemLink.querySelectorAll('th p.flex.items-center.gap-2.font-bold a');
                                let count = 0;
                                for (const link of links) {
                                    count++;
                                    if (count >= 2) {
                                        problemLinkStack.push(link.href);
                                    }
                                }
                            }
                            chrome.storage.local.remove('problemLinkStack', () => {
                                console.log('problemLinkStack removed from storage.');
                            });                            
                            chrome.storage.local.set({ problemLinkStack: problemLinkStack }, () => {
                                console.log("Problem links saved:", problemLinkStack);
                            });
                        }
                    });
                }
            });
        });
    } else {
        console.error("Save All Button not found in the DOM.");
    }
});
