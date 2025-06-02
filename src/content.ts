import countryCodeMap from "./alpha3hash";
import countryCodeMapISO3166 from "./alpha2hash";
import getMapString from "./map";
let zoom = 5;

chrome.runtime.onMessage.addListener(async (request, sender, message) => {
  if (request.action === "geocode") {
    const { lat, lon } = request;

    try {
      
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Nejtak/1.0", 
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const countryCode = data.address?.country_code?.toUpperCase();

      const fullCountry = countryCodeMapISO3166[countryCode] || countryCode || "Unknown";

      chrome.storage.local.set({
        detectedCountry: fullCountry,
        mapstringS: getMapString(lat, lon, zoom),
      });

    } catch (error) {
      console.error("Nominatim geocoder failed:", error);
    }
  }
});
