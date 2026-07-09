export interface PivotData {
  aggregateLabels: string[];
  rowGroupLabels?: string[];
  rows?: any[];
  columns?: any[];
}

export interface CaptureData {
  labels: string[];
  captureDate: string;
  instanceUrl: string;
  dashboardTitle: string;
  serviceNowVersion?: string;
  strategyUsed: string;
}

export interface LabelTemplate {
  id: string;
  name: string;
  labels: string[];
  createdDate: string;
  lastUsedDate: string;
}

export interface CaptureStrategy {
  /**
   * Identifies the strategy.
   */
  id: string;
  
  /**
   * Name for the strategy.
   */
  name: string;

  /**
   * Determine if this strategy is supported in the current context.
   */
  supports(): boolean;

  /**
   * Capture the labels.
   */
  capture(): Promise<string[] | null>;
}
