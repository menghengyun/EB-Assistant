chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void) => {
  if (message.type === 'OPEN_INVENTORY') {
    const { sku, isMachine } = message;

    // Save SKU to storage so content script can find it
    chrome.storage.local.set({ pendingSearch: sku }, () => {
      chrome.system.display.getInfo((displays: chrome.system.display.DisplayInfo[]) => {
        const primaryDisplay = displays.find(d => d.isPrimary) || displays[0];
        const screenWidth = primaryDisplay.workArea.width;
        const screenHeight = primaryDisplay.workArea.height;

        // Use app.notion.com URLs consistently
        const stocksUrl = 'https://app.notion.com/p/typhonmachinery/STOCKS-3c87d201086e4295841fde6b53b7d0c4';
        const incomingUrl = 'https://app.notion.com/p/typhonmachinery/Incoming-Machines-assigned-a4a3bb316862442dba8f5fa6639eec79';

        if (isMachine) {
          // Open Stocks on the left
          chrome.windows.create({
            url: stocksUrl,
            type: 'normal',
            left: 0,
            top: 0,
            width: Math.floor(screenWidth / 2),
            height: screenHeight
          });

          // Open Incoming on the right
          chrome.windows.create({
            url: incomingUrl,
            type: 'normal',
            left: Math.floor(screenWidth / 2),
            top: 0,
            width: Math.floor(screenWidth / 2),
            height: screenHeight
          });
        } else {
          // Just open Stocks for attachments
          chrome.windows.create({
            url: stocksUrl,
            type: 'normal',
            left: Math.floor(screenWidth / 4),
            top: 0,
            width: Math.floor(screenWidth / 2),
            height: screenHeight
          });
        }
      });
    });
  }
});
