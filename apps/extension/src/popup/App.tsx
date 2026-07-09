import { useState, useEffect } from 'react';
import { STORAGE_KEY, type CaptureData } from '@servicenow-fixer/shared';
import { CheckCircle2, Copy, Loader2, Settings, ExternalLink } from 'lucide-react';

function App() {
  const [data, setData] = useState<CaptureData | null>(null);

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        setData(result[STORAGE_KEY] as CaptureData);
      }
    });

    const listener = (changes: any, namespace: string) => {
      if (namespace === 'local' && changes[STORAGE_KEY]) {
        setData(changes[STORAGE_KEY].newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data.labels, null, 2));
  };

  const handleClear = () => {
    chrome.storage.local.remove([STORAGE_KEY]);
    setData(null);
  };

  const handleOpenWeb = () => {
    // Open the local dev server or prod web app with data in URL hash
    let url = 'http://localhost:5173/dashboard';
    if (data && data.labels) {
       const encoded = encodeURIComponent(JSON.stringify(data.labels));
       url += `#data=${encoded}`;
    }
    chrome.tabs.create({ url }); 
  };

  return (
    <div className="w-[400px] min-h-[300px] bg-background text-foreground p-4 flex flex-col font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold tracking-tight">Pivot Header Fixer</h1>
        <button onClick={() => chrome.runtime.openOptionsPage()} className="p-2 hover:bg-secondary rounded-full transition-colors">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {!data ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center animate-pulse">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <div>
            <p className="font-medium">Listening for Exports...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Open ServiceNow Platform Analytics and export a pivot table to Excel. We'll automatically capture the headers.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary">Successfully Captured!</p>
              <p className="text-sm text-primary/80 mt-0.5">Found {data.labels.length} metric headers.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Instance</span>
              <span className="text-sm truncate">{data.instanceUrl}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dashboard</span>
              <span className="text-sm truncate">{data.dashboardTitle}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Captured At</span>
              <span className="text-sm">{new Date(data.captureDate).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
            <button 
              onClick={handleCopy}
              className="flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy JSON</span>
            </button>
            <button 
              onClick={handleOpenWeb}
              className="flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
            >
              <span>Repair Excel</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          
          <button onClick={handleClear} className="text-xs text-muted-foreground hover:text-destructive transition-colors text-center">
            Clear captured data
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
