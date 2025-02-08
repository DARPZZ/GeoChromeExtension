"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let foundJavaScript = false;
const lookup = require("coordinate_to_country");
const alpha3hash_1 = require("./alpha3hash");
const map_1 = require("./map");
let zoom = 5;
chrome.runtime.onMessage.addListener((request, sender, message) => {
    if (request.action === "startListening") {
        GetCountryAndCordinates();
    }
    if (request.action === "zoomLevelValue") {
        zoom = request.value;
        GetCountryAndCordinates();
    }
});
function GetCountryAndCordinates() {
    foundJavaScript = false;
    const listener = function (details) {
        if (foundJavaScript || !details.url.startsWith("https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?")) {
            return;
        }
        fetch(details.url)
            .then(response => response.text())
            .then(text => {
            const match = text.match(/-?\d+\.\d+,\s*-?\d+\.\d+/);
            if (match) {
                let [lat, long] = match[0].split(",").map(Number);
                let country = lookup(lat, long);
                let fullCountry = alpha3hash_1.default[country] || country;
                chrome.storage.local.set({
                    detectedCountry: fullCountry,
                    mapstringS: (0, map_1.default)(lat, long, zoom),
                });
                foundJavaScript = true;
                chrome.webRequest.onCompleted.removeListener(listener);
            }
        })
            .catch(err => console.error("Error fetching response body:", err));
    };
    chrome.webRequest.onCompleted.addListener(listener, { urls: ["https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?*"] }, ["responseHeaders"]);
}
