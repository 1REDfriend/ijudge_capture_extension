document.getElementById("dark-mode").addEventListener('change' , async()=>{
    await chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length > 0) {
            await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => {
                    function injectTransitionStyles() {
                        const style = document.createElement('style');
                        style.textContent = `
                            body,nav,footer,p,h1,h2,h3,h4,h5,.MuiTableCell-root,.MuiAlert-message,.MuiChip-label,.MuiButton-text {
                                transition: background-color 0.3s ease, border-color 0.3s ease;
                            }
                        `;
                        document.head.appendChild(style);
                    }
                    injectTransitionStyles()
                }
            })
        }
    })
    
    const value = document.getElementById("dark-mode").checked;
    if (value) {
        await chrome.storage.local.set({theme: 'light'})
    }else {
        await chrome.storage.local.set({theme: 'dark'})
    }
    console.log("theme toggle : ",value)
    
})