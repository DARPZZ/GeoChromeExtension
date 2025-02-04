let foundJavaScript = false;
const lookup = require("coordinate_to_country");
import countryCodeMap from "./alpha3hash";
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startListening") {
    foundJavaScript = false;

    const listener = function (details: chrome.webRequest.WebResponseHeadersDetails) {
      if (foundJavaScript) return;

      if (details.responseHeaders) {
        const contentTypeHeader = details.responseHeaders.find(header => header.name.toLowerCase() === "content-type");

        if (contentTypeHeader && contentTypeHeader.value.includes("javascript")) {
          fetch(details.url)
            .then(response => response.text())
            .then(text => {
              const match = text.match(/-?\d+\.\d+,\s*-?\d+\.\d+/);
              if (match && match[0]) {
                let coordinates = match[0].replace(/[\[\]\s]/g, '');
                let [lat, long] = coordinates.split(",");

                try {
                  let latNum = parseFloat(lat);
                  let longNum = parseFloat(long);
                  let country = lookup(latNum, longNum);
                  let fullCountry = countryCodeMap[country];
                  if(fullCountry != undefined)
                  {
                    chrome.storage.local.set({ detectedCountry: fullCountry });
                    
                  }else
                  {
                    chrome.storage.local.set({ detectedCountry: country });
                  }
                  foundJavaScript = true;
                  chrome.webRequest.onCompleted.removeListener(listener);
                  chrome.storage.local.set({ko: "https://maps.google.com/maps?q=48.13209658371673,17.10839892702297&z=5&output=embed"})
                } catch (error) {
                  console.log("Error converting coordinates to country:", error);
                }
              } else {
                console.log("No coordinates found in the response text.");
              }
            })
            .catch(err => console.error("Error fetching JavaScript response body:", err));
        }
      }
    };

    chrome.webRequest.onCompleted.addListener(
      listener,
      { urls: ["<all_urls>"] },
      ["responseHeaders"]
    );
  }
});
