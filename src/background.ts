let foundJavaScript = false;
const lookup = require("coordinate_to_country");
import countryCodeMap from "./alpha3hash";
import getMapString from "./map";
let zoom = 5;

const listener = function (details: chrome.webRequest.WebResponseHeadersDetails) {
  if (
    foundJavaScript ||
    !details.url.startsWith("https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?")
  ) {
    console.log("no start url")
    return;
  }
  fetch(details.url)
    .then(response => response.text())
    .then(async text => {
      const match = text.match(/-?\d+\.\d+,\s*-?\d+\.\d+/);
      if (match) {
        let [lat, long] = match[0].split(",").map(Number);
        let country = lookup(lat, long);
        let fullCountry = countryCodeMap[country] || country;
        
        chrome.storage.local.set({
          detectedCountry: fullCountry,
          mapstringS: getMapString(lat, long, zoom),
        });
        foundJavaScript = true;
        chrome.webRequest.onCompleted.removeListener(listener);
      }
    })
    .catch(err => console.error("Error fetching response body:", err));
};

chrome.runtime.onMessage.addListener( (request, sender, message) => {
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
  chrome.webRequest.onCompleted.addListener(
    listener,
    { urls: ["https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?*"] },
    ["responseHeaders"]
  );
}
