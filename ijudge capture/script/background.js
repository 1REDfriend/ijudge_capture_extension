chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveHTML") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]; // Get the active tab

      if (activeTab) {
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          function: function extractHTML() {
            return document.documentElement.outerHTML;
          }
        }, (result) => {
          if (chrome.runtime.lastError || !result || !result[0]) {
            console.error("Error extracting HTML:", chrome.runtime.lastError);
            return;
          }
          const html = result[0].result;
          const blob = new Blob([html], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          chrome.downloads.download({
            url: url,
            filename: 'page.md'
          });
        });
      } else {
        console.error("No active tab found");
      }
    });
  }
});
