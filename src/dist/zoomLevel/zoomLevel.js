"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = test;
function test(zoom) {
    document.getElementById(zoom).addEventListener("click", () => {
        const inputElement = document.getElementById(zoom);
        const inputValue = inputElement.value;
        chrome.runtime.sendMessage({ action: "zoomLevelValue", value: inputValue }, (response) => {
            if (chrome.runtime.lastError) {
                console.log("Error sending message:", chrome.runtime.lastError);
            }
            else {
                console.log((response === null || response === void 0 ? void 0 : response.status) || "No response");
            }
        });
    });
}
