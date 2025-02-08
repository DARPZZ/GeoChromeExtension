export default function test(zoom : string)
{
    document.getElementById(zoom).addEventListener("click", ()=>{
        const inputElement = document.getElementById(zoom) as HTMLInputElement;
        const inputValue = inputElement.value;
        chrome.runtime.sendMessage({action: "zoomLevelValue", value: inputValue},(response)=>{
          if (chrome.runtime.lastError) {
            console.log("Error sending message:", chrome.runtime.lastError);
          } else {
            console.log(response?.status || "No response");
          }
        })
      });
}