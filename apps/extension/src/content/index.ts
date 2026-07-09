import { STORAGE_KEY, INJECTION_EVENT, type CaptureData } from '@servicenow-fixer/shared';

// Inject the script into the MAIN world
const script = document.createElement('script');
script.src = chrome.runtime.getURL('assets/injected.js');
script.type = 'module';
script.onload = function () {
  (this as HTMLScriptElement).remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from the injected script
window.addEventListener('message', (event) => {
  // We log all messages that have our type, even if source is different
  if (event.data && event.data.type === INJECTION_EVENT) {
    console.log('[ServiceNow Fixer] Received INJECTION_EVENT message from injected script!', event.data);
    
    // Sometimes Shadow DOM or iframes can cause event.source to be a different window proxy
    // We will bypass the event.source !== window check if it's our exact event type
    
    const payload = event.data.payload;
    const { aggregateLabels, strategyUsed } = payload;
    
    if (aggregateLabels && Array.isArray(aggregateLabels) && aggregateLabels.length > 0) {
      
      const captureData: CaptureData = {
        labels: aggregateLabels,
        captureDate: new Date().toISOString(),
        instanceUrl: window.location.hostname,
        dashboardTitle: document.title,
        strategyUsed: strategyUsed,
      };

      chrome.storage.local.set({ [STORAGE_KEY]: captureData }, () => {
        console.log('[ServiceNow Fixer] Captured and stored pivot labels using strategy:', strategyUsed);
        
        // Notify background script to show a Chrome notification
        chrome.runtime.sendMessage({ 
          type: 'LABELS_CAPTURED',
          payload: captureData 
        });
      });
    }
  }
});
