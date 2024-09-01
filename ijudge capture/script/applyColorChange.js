async function applyColorChange(value) {
    if (value === 'light') {
        const full_dark = document.querySelector("body");
        const grey900 = document.querySelectorAll(".MuiButtonBase-root,.--vscode,.view-lines,.bg-gray-100, section,.MuiBox-root,nav, footer , code ,summary,MuiFormLabel-root");
        const tables_bg = document.querySelectorAll('.margin-view-overlays,.MuiTabs-flexContainer,.MuiTabs-scroller,.MuiPaper-root,.md-editor,.md-editor-previewOnly,.md-editor-input-wrapper,.cm-editor,img,ul,li');
        const fonts = document.querySelectorAll(".MuiButtonBase-root,div,span,p,a,h1,h3,h4,h5,.MuiTableCell-root,.MuiAlert-message,.MuiChip-label,.MuiButton-text,.MuiInputBase-input,.MuiFormLabel-root");

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
        // Apply dark theme colors
        const full_dark = document.querySelector("body");
        const grey900 = document.querySelectorAll(".MuiButtonBase-root,.--vscode,.view-lines, .bg-gray-100, section,.MuiBox-root,nav, footer, code ,summary,MuiFormLabel-root");
        const tables_bg = document.querySelectorAll('.margin-view-overlays,.MuiTabs-flexContainer,.MuiTabs-scroller,.MuiPaper-root,.md-editor,.md-editor-previewOnly,.md-editor-input-wrapper,.cm-editor,img,ul,li');
        const fonts = document.querySelectorAll(".MuiButtonBase-root,div,span,a,p,h1,h3,h4,h5,.MuiTableCell-root,.MuiAlert-message,.MuiChip-label,.MuiButton-text,.MuiInputBase-input,.MuiFormLabel-root")

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
chrome.runtime.onMessage.addListener(async(message) => {
    if (message.action === 'applyColorChange') {
        await applyColorChange(message.value);
    }
});