function applyColorChange(value) {
    if (value === 'light') {
        const full_dark = document.querySelector("body");
        const grey900 = document.querySelectorAll("nav, footer , code ,summary,MuiFormLabel-root");
        const tables_bg = document.querySelectorAll('.MuiPaper-root,.md-editor,.md-editor-previewOnly,.md-editor-input-wrapper,.cm-editor');
        const fonts = document.querySelectorAll("div,span,p,h1,h2,h3,h4,h5,.MuiTableCell-root,.MuiAlert-message,.MuiChip-label,.MuiButton-text,.MuiInputBase-input,.MuiFormLabel-root");

        tables_bg.forEach(element => {
            element.style.backgroundColor = "#ffffff";
        });
        full_dark.style.backgroundColor = "#f3f4f6";
        grey900.forEach(element => {
            element.style.backgroundColor = "#ffffff";
            element.style.borderColor = "#ffffff";
        });
        fonts.forEach(element => {
            element.style.color = "#000000";
        });
    } else if (value === "dark") {
        const full_dark = document.querySelector("body");
        const grey900 = document.querySelectorAll("nav, footer, code ,summary,MuiFormLabel-root");
        const tables_bg = document.querySelectorAll('.MuiPaper-root,.md-editor,.md-editor-previewOnly,.md-editor-input-wrapper,.cm-editor');
        const fonts = document.querySelectorAll("div,span,p,h1,h2,h3,h4,h5,.MuiTableCell-root,.MuiAlert-message,.MuiChip-label,.MuiButton-text,.MuiInputBase-input,.MuiFormLabel-root");

        tables_bg.forEach(element => {
            element.style.backgroundColor = "#141d2e";
        });
        full_dark.style.backgroundColor = "#0d1016";
        grey900.forEach(element => {
            element.style.backgroundColor = "#141d2e";
            element.style.borderColor = "#1d4eb1";
        });
        fonts.forEach(element => {
            element.style.color = "#ffffff";
        });
    }
}


// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'applyColorChange') {
        applyColorChange(message.value);
    }
});