import type { CaptureStrategy } from '@servicenow-fixer/shared';

export class GlobalVariableCaptureStrategy implements CaptureStrategy {
  id = 'global_variable';
  name = 'Global Variable Reader';

  supports(): boolean {
    // We check if the global window has any variable that looks like our data
    return true; 
  }

  async capture(): Promise<string[] | null> {
    // Check known ServiceNow variable names
    const win = window as any;
    if (win._PIVOT_DATA_ && win._PIVOT_DATA_.aggregateLabels) {
      return win._PIVOT_DATA_.aggregateLabels;
    }
    if (win.pivotData && win.pivotData.aggregateLabels) {
      return win.pivotData.aggregateLabels;
    }
    
    // Deep search through window (only 1 level to avoid perf issues)
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
