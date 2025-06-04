import countryCodeMap from "./alpha3hash";
import countryCodeMapISO3166 from "./alpha2hash";
import getMapString from "./map";

let zoom = 5;

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === "geocode") {
    const { lat, lon } = request;

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
      console.log("Fetching reverse geocoding URL:", url);

      const response = await fetch(url, {
        headers: { "User-Agent": "Nejtak/1.0" }
      });

      if (!response.ok) {
        console.error("Nominatim API failed:", response.status);
        return;
      }

      const data = await response.json();
      console.log("Geocoding response:", data);

      const countryCode = data.address?.country_code?.toUpperCase();
      const fullCountry = countryCodeMapISO3166[countryCode] || countryCode || "Unknown";
      console.log("Detected country:", fullCountry);

      chrome.storage.local.set({
        detectedCountry: fullCountry,
        mapstringS: getMapString(lat, lon, zoom)
      }, () => {
        console.log("Saved country and mapstring to storage");
      });
    } catch (error) {
      console.error("Geocode fetch error:", error);
    }
  }
});
