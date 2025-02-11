let framdata;
document.addEventListener("DOMContentLoaded", function () {
    const countryDisplay = document.getElementById("countryDisplay");
    console.log(document.getElementById("zoom"));
    // Retrieve and display the stored country on page load
    chrome.storage.local.get("detectedCountry", function (data) {
        if (data.detectedCountry) {
            countryDisplay.textContent = `Country: ${data.detectedCountry}`;
        }
        else {
            countryDisplay.textContent = "Waiting...";
        }
    });
    chrome.storage.local.get("mapstringS", function (data) {
        document.getElementById("frame").setAttribute('src', `${data.mapstringS}`);
    });
    // Listen for messages to update country
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "updateCountry") {
            countryDisplay.textContent = `Country: ${message.fullCountry}`;
            chrome.storage.local.set({ detectedCountry: message.fullCountry });
        }
    });
    // Listen for changes in storage and update the country display
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local" && changes.detectedCountry) {
            countryDisplay.textContent = `Country: ${changes.detectedCountry.newValue}`;
        }
        if (areaName === "local" && changes.mapstringS) {
            document.getElementById("frame").setAttribute('src', `${changes.mapstringS.newValue}`);
        }
    });
    createEventListener("zoom4");
    createEventListener("zoom5");
    createEventListener("zoom6");
    createEventListener("zoom7");
    createEventListener("zoom8");
    // Handle button click to send a message to the background script
    document.getElementById("messageButton").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "startListening" }, (response) => {
            if (chrome.runtime.lastError) {
                console.log("Error sending message:", chrome.runtime.lastError);
            }
            else {
                console.log((response === null || response === void 0 ? void 0 : response.status) || "No response");
            }
        });
    });
});
function createEventListener(zoom) {
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
