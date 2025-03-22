let isSelecting = false;
let hasDownloaded = false; // yeni eklendi
let startX, startY, selectionDiv;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startSelection") {
        hasDownloaded = false; // 📌 her seçim öncesi sıfırlanmalı
        startSelection();
    } else if (request.action === "captureFullPage") {
        captureFullPage(request.dimensions);
    }
});

function startSelection() {
    document.body.style.cursor = "crosshair";
    document.body.style.userSelect = "none";
    document.addEventListener("mousedown", onMouseDown);
}

function onMouseDown(e) {
    e.preventDefault();

    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionDiv = document.createElement("div");
    selectionDiv.style.position = "fixed";
    selectionDiv.style.border = "2px dashed red";
    selectionDiv.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
    selectionDiv.style.pointerEvents = "none";
    selectionDiv.style.zIndex = 999999;
    document.body.appendChild(selectionDiv);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e) {
    if (!isSelecting) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionDiv.style.left = `${left}px`;
    selectionDiv.style.top = `${top}px`;
    selectionDiv.style.width = `${width}px`;
    selectionDiv.style.height = `${height}px`;
}

function onMouseUp(e) {
    isSelecting = false;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    const rect = selectionDiv.getBoundingClientRect();
    const area = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };

    selectionDiv.remove();

    chrome.runtime.sendMessage(
        { action: "captureSelection" },
        (response) => {
            if (response && response.dataUrl) {
                cropAndDownload(response.dataUrl, area);
            }
        }
    );
}

function cropAndDownload(dataUrl, area) {
    if (hasDownloaded) return;

    const img = new Image();

    img.onload = () => {
        if (hasDownloaded) return;

        const canvas = document.createElement("canvas");
        canvas.width = area.width;
        canvas.height = area.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

        const croppedDataUrl = canvas.toDataURL("image/png");

        const filename = prompt("Enter a filename for your screenshot:", "screenshot");
        if (!filename) return;

        const link = document.createElement("a");
        link.href = croppedDataUrl;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        hasDownloaded = true;
    };

    img.src = dataUrl;
}
