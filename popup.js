document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("capture-visible").addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.runtime.sendMessage({ action: "captureVisible", tabId: tabs[0].id });
            window.close();
        });
    });

    document.getElementById("capture-selection").addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ["content.js"]
            }, () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: "startSelection" });
                window.close();
            });
        });
    });
});