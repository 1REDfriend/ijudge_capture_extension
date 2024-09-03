chrome.storage.local.get('theme', (theme) => {
    const themeIs = theme.theme
    if (themeIs == "dark") {
        document.getElementById("dark-mode").checked = true
    }
})

chrome.storage.local.get('customTheme', async(result) => {
    const theme = result.customTheme;
    if (theme) {
        document.getElementById("color-body").value = await theme.body || "#000000"
        document.getElementById("color-backLayer").value = await theme.backLayer || "#000000"
        document.getElementById("color-frontLayer").value = await theme.frontLayer || "#000000"
        document.getElementById("color-font").value = await theme.font || "#000000"
    }
})