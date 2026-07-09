import type { CaptureData } from '@servicenow-fixer/shared';

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'LABELS_CAPTURED') {
    const payload = message.payload as CaptureData;
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('public/vite.svg'), // Need a valid icon
      title: 'ServiceNow Header Fixer',
      message: `Captured ${payload.labels.length} pivot labels from ${payload.dashboardTitle || 'ServiceNow'}!`,
      priority: 2
    });
  }
});
