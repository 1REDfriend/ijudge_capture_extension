chrome.storage.local.get('theme', (theme) => {
    const themeIs = theme.theme
    if (themeIs == "dark") {
        document.getElementById("dark-mode").checked = true
    }
})