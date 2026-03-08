let latestKnowLat: number | null = null;
let latestKnowLon: number | null = null;
const offset: number = 0.5;
let hasSeenGeoRequest = false;
async function Listener(details) {
  if (hasSeenGeoRequest) return;
  hasSeenGeoRequest = true;
  try {
    const response = await fetch(details.url, {
      headers: { "User-Agent": "MyExtension/1.0" }
    });
    if (!response.ok) {
      hasSeenGeoRequest = false;
      console.error("Request failed with status:", response.status);
      return;
    }

    const text = await response.text();
    const match = text.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (!match) {
      console.warn("No lat/lon match found in response body");
      hasSeenGeoRequest = false;
      return;
    }

    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    hasSeenGeoRequest = false;
    if (latestKnowLat !== null &&latestKnowLon !== null && Math.abs(lat - latestKnowLat) < offset &&Math.abs(lon - latestKnowLon) < offset) {
      return;
    }
    else{
      const tabId = details.tabId;
      if (tabId >= 0) {
        chrome.tabs.sendMessage(tabId, {
          action: "geocode",
          lat,
          lon
        });
      }
    latestKnowLat = lat;
    latestKnowLon = lon;
    return;
    }

  } catch (error) {
    console.error("Error in Listener:", error);
  }
}

chrome.runtime.onStartup.addListener(() => {
  latestKnowLat = null;
  latestKnowLon = null;
});

chrome.webRequest.onCompleted.addListener(
  Listener,
  { urls: ["https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?*"] }
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startListening") {
    hasSeenGeoRequest = false;
    latestKnowLat = null;
    latestKnowLon = null;
    try {
      chrome.webRequest.onCompleted.removeListener(Listener);
    } catch (e) {
      console.warn("Listener removal failed or not registered yet", e);
    }

    chrome.webRequest.onCompleted.addListener(
      Listener,
      { urls: ["https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?*"] }
    );
    sendResponse({ status: "Listener restarted" });
  }
});