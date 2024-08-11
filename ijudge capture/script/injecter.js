document.getElementById("saveAllButton").addEventListener('click', async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            const url = activeTab["url"]

            // Check if the URL matches the desired pattern
            if (!url || !url.startsWith("https://ijudge.it.kmitl.ac.th/courses/")) {
                console.error("The URL does not match the required pattern or is undefined");
                return; // Exit if the URL does not match
            }

            console.log("Active Tab ID:", activeTab.id); // Debugging log
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: async () => {
                    async function intoProblem() {
                        const problemList = document.querySelectorAll("tr.MuiTableRow-root.mui-qechus")
                        for (const element of problemList) {
                            const problemLink = element.querySelectorAll("th p.flex.items-center.gap-2.font-bold a")
                            let counter = 0
                            for (const link of problemLink) {
                                counter++;
                                if (counter >= 2) {
                                    console.log("Enther the Problem Page now!")
                                    window.location.href = link.href; // Navigate to the href URL
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                }
                            }
                        }
                    }
                    return intoProblem();
                }
            })
            // (result) => {
            //     console.log("Execution Result:", result); // Debugging log
            //     if (chrome.runtime.lastError || !result || !result[0]) {
            //         console.error("Error extracting HTML:", chrome.runtime.lastError);
            //         return;
            //     }
            //     const { combinedMarkdown, headerText } = result[0].result;
            //     const blob = new Blob([combinedMarkdown], { type: 'text/markdown' });
            //     const url = URL.createObjectURL(blob);
            //     chrome.downloads.download({
            //         url: url,
            //         filename: `${headerText}.md`
            //     });
            // });
        }
    })
});