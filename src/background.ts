let foundJavaScript = false;

const listener = function (details) {
  if (
    foundJavaScript ||
    !details.url.startsWith("https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata?")
  ) {
    return;
  }
console.log("Background script loaded");
  fetch(details.url)
    .then(response => response.text())
    .then(text => {
      const match = text.match(/-?\d+\.\d+,\s*-?\d+\.\d+/);
      if (match) {
        let [lat, lon] = match[0].split(",").map(Number);
        foundJavaScript = true;
        
        // chrome.runtime.sendMessage({
        //   action: "geocode",
        //   lat,
        //   lon,
        // });
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, (tabs) => {
          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { 
            action: "geocode",
            lat: lat,
            lon: lon
          });
        });

        chrome.webRequest.onCompleted.removeListener(listener);
        
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
