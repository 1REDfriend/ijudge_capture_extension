document.getElementById("save-colors").addEventListener('click', async()=> {
    const customTheme = {
        body: await document.getElementById("color-body").value,
        backLayer: await document.getElementById("color-backLayer").value,
        frontLayer: await document.getElementById("color-frontLayer").value,
        font: await document.getElementById("color-font").value
    }
    await chrome.storage.local.set({customTheme}, async()=> {
        console.log(await chrome.storage.local.get('customTheme'))
    })
})