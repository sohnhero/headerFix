import { useAppStore } from '../store/useAppStore';

export function Diagnostics() {
  const { currentCapture, templates } = useAppStore();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Diagnostics</h1>
        <p className="text-muted-foreground mt-1">Developer insights and current state.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Current Capture Data</h3>
          <pre className="bg-secondary p-4 rounded-lg text-xs overflow-auto max-h-[400px]">
            {JSON.stringify(currentCapture, null, 2) || "null"}
          </pre>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">System Information</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">User Agent</span>
              <span className="text-right max-w-[200px] truncate" title={navigator.userAgent}>{navigator.userAgent}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Templates Count</span>
              <span>{templates.length}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Chrome Storage</span>
              <span>{typeof chrome !== 'undefined' && chrome.storage ? 'Available' : 'Unavailable'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
