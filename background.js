
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureVisible") {
        captureVisibleTab(request.tabId);
    } else if (request.action === "captureSelection") {
        chrome.tabs.captureVisibleTab({ format: "png" }, (dataUrl) => {
            sendResponse({ dataUrl: dataUrl }); 
        });
        return true; 
    } else if (request.action === "downloadImage") { 
        downloadImage(request.dataUrl, request.filename);
    }
});

function captureVisibleTab(tabId) {
    chrome.tabs.captureVisibleTab({ format: "png" }, (dataUrl) => {
        downloadImage(dataUrl, "visible-area");
    });
}

function downloadImage(dataUrl, prefix) {
    chrome.downloads.download({
        url: dataUrl,
        filename: `${prefix}-${Date.now()}.png`,
        saveAs: true 
    });
}