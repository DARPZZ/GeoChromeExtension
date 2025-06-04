import { CheckDifForLongitudeAndLatitude } from "./DiffChecker";
let hasSeenGeoRequest = false;

async function Listener(details) {
  if (hasSeenGeoRequest) return;
  hasSeenGeoRequest = true;

  try {
    const response = await fetch(details.url, {
      headers: { "User-Agent": "MyExtension/1.0" }
    });
    if (!response.ok) {
      console.error("Request failed with status:", response.status);
      return;
    }

    const text = await response.text();
    const match = text.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (!match) {
      console.warn("No lat/lon match found in response body");
      return;
    }

    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if(CheckDifForLongitudeAndLatitude(lon,lat))
    {
      hasSeenGeoRequest = false;
    }

    const tabId = details.tabId;
    if (tabId >= 0) {
      chrome.tabs.sendMessage(tabId, {
        action: "geocode",
        lat: lat,
        lon: lon
      });
    } 
  } catch (error) {
    console.error("Error in Listener:", error);
  }
}

chrome.runtime.onStartup.addListener(() => {
  hasSeenGeoRequest = false;
});

chrome.webRequest.onCompleted.addListener(
  Listener,
  { urls: ["https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?*"] },
  ["responseHeaders"]
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startListening") {
    hasSeenGeoRequest = false;
    try {
      chrome.webRequest.onCompleted.removeListener(Listener);
    } catch (e) {
      console.warn("Listener removal failed or not registered yet", e);
    }

    chrome.webRequest.onCompleted.addListener(
      Listener,
      { urls: ["https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?*"] },
      ["responseHeaders"]
    );
    sendResponse({ status: "Listener restarted" });
  }
});