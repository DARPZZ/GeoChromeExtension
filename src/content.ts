import countryCodeMap from "./alpha3hash";
import getMapString from "./map";
let zoom = 5;

const geocoder = new google.maps.Geocoder();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "geocode") {
    const { lat, lon } = request;

    geocoder.geocode({ location: { lat, lng: lon } }, (results, status) => {
      if (status === "OK" && results.length) {
        const countryComp = results[0].address_components.find(comp =>
          comp.types.includes("country")
        );
        const countryCode = countryComp?.short_name; // "US"
        const fullCountry = countryCodeMap[countryCode] || countryCode;

        chrome.storage.local.set({
          detectedCountry: fullCountry,
          mapstringS: getMapString(lat, lon, zoom),
        });

      } else {
        console.error("Geocoder failed:", status);
      }
    });
  }
});
