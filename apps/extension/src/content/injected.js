// This script is injected directly into the MAIN world of the page.
// We keep it completely self-contained with no external imports to avoid Vite/CRXJS bundling issues.

const INJECTION_EVENT = 'servicenow-pivot-data-captured';

console.log("🔧 Pivot Fixer: Injected script initialized! Listening for exports...");

class NetworkInterceptorStrategy {
  constructor() {
    this.id = 'network_interceptor';
    this.name = 'Network Interceptor';
    this.capturedLabels = null;
    
    const self = this;

    // Intercept Fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch.apply(window, args);
      try {
        const clone = response.clone();
        clone.text().then(text => self.processText(text));
      } catch (e) {}
      return response;
    };

    // Intercept XHR
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function() {
      this.addEventListener('load', function() {
        try {
          if (this.responseText) {
            self.processText(this.responseText);
          }
        } catch (e) {}
      });
      return originalXHR.apply(this, arguments);
    };
  }

  processText(text) {
    if (!text) return;
    try {
      const data = JSON.parse(text);
      this.deepSearch(data);
    } catch (e) {}
  }

  deepSearch(obj, depth = 0) {
    if (this.capturedLabels || depth > 10) return;
    if (!obj || typeof obj !== 'object') return;
    
    if (obj.aggregateLabels && Array.isArray(obj.aggregateLabels)) {
      this.capturedLabels = obj.aggregateLabels;
      return;
    }
    
    // ServiceNow Analytics specific structures:
    // Sometimes it's in result.data.columns
    if (obj.columns && Array.isArray(obj.columns) && obj.columns.length > 0) {
      // Are they objects with labels?
      if (obj.columns[0] && typeof obj.columns[0] === 'object' && obj.columns[0].label) {
        this.capturedLabels = obj.columns.map(c => c.label);
        return;
      }
    }

    if (Array.isArray(obj)) {
      obj.forEach(item => this.deepSearch(item, depth + 1));
    } else {
      Object.values(obj).forEach(val => this.deepSearch(val, depth + 1));
    }
  }

  supports() {
    return true;
  }

  async capture() {
    const labels = this.capturedLabels;
    this.capturedLabels = null;
    return labels;
  }
}

class GlobalVariableCaptureStrategy {
  constructor() {
    this.id = 'global_variable';
    this.name = 'Global Variable Reader';
  }

  supports() {
    return true; 
  }

  async capture() {
    const win = window;
    if (win._PIVOT_DATA_ && win._PIVOT_DATA_.aggregateLabels) {
      return win._PIVOT_DATA_.aggregateLabels;
    }
    if (win.pivotData && win.pivotData.aggregateLabels) {
      return win.pivotData.aggregateLabels;
    }
    
    for (const key in win) {
      try {
        const obj = win[key];
        if (obj && typeof obj === 'object' && obj.aggregateLabels && Array.isArray(obj.aggregateLabels)) {
          return obj.aggregateLabels;
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    }
    
    return null;
  }
}

class ConsoleLogCaptureStrategy {
  constructor() {
    this.id = 'console_log';
    this.name = 'Console Log Interceptor';
    this.originalConsoleLog = console.log;
    this.capturedLabels = null;

    console.log = (...args) => {
      this.originalConsoleLog.apply(console, args);
      try {
        args.forEach(arg => {
          if (typeof arg === 'object' && arg !== null) {
             if (arg.aggregateLabels && Array.isArray(arg.aggregateLabels)) {
                this.capturedLabels = arg.aggregateLabels;
             }
          } else if (typeof arg === 'string' && arg.includes('aggregateLabels')) {
             const parsed = JSON.parse(arg);
             if (parsed.aggregateLabels) {
                this.capturedLabels = parsed.aggregateLabels;
             }
          }
        });
      } catch (e) {
        // Ignore JSON parse errors
      }
    };
  }

  supports() {
    return true;
  }

  async capture() {
    const labels = this.capturedLabels;
    this.capturedLabels = null; // Reset after capturing
    return labels;
  }
}

const strategies = [
  new NetworkInterceptorStrategy(),
  new GlobalVariableCaptureStrategy(),
  new ConsoleLogCaptureStrategy(),
];

let lastCaptured = '';

async function captureLoop() {
  for (const strategy of strategies) {
    if (strategy.supports()) {
      const labels = await strategy.capture();
      if (labels && labels.length > 0) {
        const currentCaptured = JSON.stringify(labels);
        if (currentCaptured !== lastCaptured) {
          console.log(`🔧 Pivot Fixer: Successfully captured labels using ${strategy.name}!`, labels);
          lastCaptured = currentCaptured;
          window.postMessage({
            type: INJECTION_EVENT,
            payload: {
              aggregateLabels: labels,
              strategyUsed: strategy.id,
            }
          }, '*');
        }
        return; // Stop after first successful strategy
      }
    }
  }
}

// Start polling/observing for the pivot data
setInterval(captureLoop, 2000);
// Also try once immediately
captureLoop();
