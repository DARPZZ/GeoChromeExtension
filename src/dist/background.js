"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
let foundJavaScript = false;
const lookup = require("coordinate_to_country");
const alpha3hash_1 = require("./alpha3hash");
const map_1 = require("./map");
let zoom = 5;
chrome.runtime.onMessage.addListener((request, sender, message) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.action === "startListening") {
        yield GetCountryAndCordinates();
    }
    if (request.action === "zoomLevelValue") {
        zoom = request.value;
        yield GetCountryAndCordinates();
    }
}));
function GetCountryAndCordinates() {
    return __awaiter(this, void 0, void 0, function* () {
        foundJavaScript = false;
        const listener = function (details) {
            if (foundJavaScript || !details.url.startsWith("https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?")) {
                return;
            }
            fetch(details.url)
                .then(response => response.text())
                .then((text) => __awaiter(this, void 0, void 0, function* () {
                const match = text.match(/-?\d+\.\d+,\s*-?\d+\.\d+/);
                if (match) {
                    let [lat, long] = match[0].split(",").map(Number);
                    let country = lookup(lat, long);
                    let fullCountry = alpha3hash_1.default[country] || country;
                    chrome.storage.local.set({
                        detectedCountry: fullCountry,
                        mapstringS: yield (0, map_1.default)(lat, long, zoom),
                    });
                    foundJavaScript = true;
                    chrome.webRequest.onCompleted.removeListener(listener);
                }
            }))
                .catch(err => console.error("Error fetching response body:", err));
        };
        chrome.webRequest.onCompleted.addListener(listener, { urls: ["https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?*"] }, ["responseHeaders"]);
    });
}
