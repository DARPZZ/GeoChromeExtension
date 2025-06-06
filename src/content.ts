import countryCodeMap from "./alpha3hash";
import countryCodeMapISO3166 from "./alpha2hash";
import getMapString from "./map";

let zoom = 10;
function PlaceCountryInStorage(fullCountry,lat,lon)
{
  chrome.storage.local.set({
        detectedCountry: fullCountry,
        mapstringS: getMapString(lat, lon, zoom)
      }, () => {
        console.log("Saved country and mapstring to storage");
  });
}
function GetCountry(data)
{
  const countryCode = data.address?.country_code?.toUpperCase();
  const fullCountry = countryCodeMapISO3166[countryCode] || countryCode || "Unknown";
  console.log("Detected country:", fullCountry);
  return fullCountry
}

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === "geocode") {
    const { lat, lon } = request;

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=${zoom}&addressdetails=1`;
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
      PlaceCountryInStorage(GetCountry(data),lat,lon)
    } catch (error) {
      console.error("Geocode fetch error:", error);
    }
  }
});
