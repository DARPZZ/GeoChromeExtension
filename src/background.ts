let foundJavaScript = false;
const listener = function (details) {
  if (
    foundJavaScript ||
    !details.url.startsWith("https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?")
  ) {
    return;
  }

  fetch(details.url)
    .then(response => response.text())
    .then(text => {
      const match = text.match(/-?\d+\.\d+,\s*-?\d+\.\d+/);
      if (match) {
        let [lat, lon] = match[0].split(",").map(Number);
        foundJavaScript = true;
        chrome.webRequest.onCompleted.removeListener(listener);
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "geocode",
              lat,
              lon,
            });
          }
        });
      }
    })
    .catch(err => console.error("Error fetching response body:", err));
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "startListening") {
    foundJavaScript = false;
    chrome.webRequest.onCompleted.addListener(
      listener,
      { urls: ["https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?*"] },
      ["responseHeaders"]
    );
  }
});
