import type { CaptureStrategy } from '@servicenow-fixer/shared';

export class ConsoleLogCaptureStrategy implements CaptureStrategy {
  id = 'console_log';
  name = 'Console Log Interceptor';

  private originalConsoleLog: any;
  private capturedLabels: string[] | null = null;

  constructor() {
    this.originalConsoleLog = console.log;
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

  supports(): boolean {
    return true; // Always supported since it patches console
  }

  async capture(): Promise<string[] | null> {
    const labels = this.capturedLabels;
    this.capturedLabels = null; // Reset after capturing
    return labels;
  }
}
