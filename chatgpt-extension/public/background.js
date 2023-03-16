const extensionId = chrome.runtime.id;
let activeTab;
let scriptInjected = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'takeScreenshot') {
    console.log("background.js -> Sending message to contentScript")
    getCurrentTab().then(activeTabId => {
      takeScreenshot(activeTabId).then(screenshotUrl => {
        sendResponse(screenshotUrl);
        console.log('Screenshot in listener', { screenshotUrl });
      })
    })
    // Indicate that the response will be sent asynchronously
    return true;
  }
});

async function takeScreenshot(tabId) {
  // return new Promise(resolve => {
    const screenshotUrl = await chrome.tabs.sendMessage(tabId, { action: 'takeScreenshot' })
    console.log('Screenshot in inner', { screenshotUrl });
    return screenshotUrl;
    
}

async function getCurrentTab() {
  // Maybe filter out the tab of the chrome extension?
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true, windowType: "normal" });
  return tab.id;
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'minimizeWindow') {
    console.log(extensionId)
    chrome.windows.update(extensionId, { state: 'minimized' });
  } else if (request.action === 'normalWindow') {
    chrome.windows.update(extensionId, { state: 'normal' });
  }
});