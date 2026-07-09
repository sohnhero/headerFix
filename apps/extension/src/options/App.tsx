export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Extension Settings</h1>
        <p className="text-muted-foreground">Configure how the extension captures Pivot data.</p>
        
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="space-y-1">
             <h3 className="font-medium">Capture Strategies</h3>
             <p className="text-sm text-muted-foreground">The extension uses multiple strategies to intercept the pivot data from ServiceNow.</p>
          </div>
          
          <div className="flex items-center space-x-3">
             <input type="checkbox" id="s1" defaultChecked disabled className="rounded border-border text-primary focus:ring-primary" />
             <label htmlFor="s1" className="text-sm font-medium">Global Variable Reader</label>
          </div>
          <div className="flex items-center space-x-3">
             <input type="checkbox" id="s2" defaultChecked disabled className="rounded border-border text-primary focus:ring-primary" />
             <label htmlFor="s2" className="text-sm font-medium">Console Interceptor</label>
          </div>
        </div>
      </div>
    </div>
  );
}
