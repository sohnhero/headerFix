import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertCircle, Download, FileJson } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { repairWorkbook, downloadWorkbook, type RepairResult } from '../lib/excel';
import { STORAGE_KEY, type CaptureData } from '@servicenow-fixer/shared';

export function Dashboard() {
  const { currentCapture, setCurrentCapture } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RepairResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Try reading from URL hash (passed from extension popup)
    if (window.location.hash.startsWith('#data=')) {
      try {
        const decoded = decodeURIComponent(window.location.hash.substring(6));
        const labels = JSON.parse(decoded);
        if (Array.isArray(labels)) {
          setCurrentCapture({
            labels,
            captureDate: new Date().toISOString(),
            instanceUrl: 'passed-via-url',
            dashboardTitle: 'Passed from Extension',
            strategyUsed: 'url'
          });
          // Clean the URL hash
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
      } catch (e) {}
    }

    // 2. Fallback: Note: In standard web app, chrome.storage might not exist. 
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEY], (res) => {
        if (res[STORAGE_KEY]) {
          setCurrentCapture(res[STORAGE_KEY] as CaptureData);
        }
      });
    }
  }, [setCurrentCapture]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!currentCapture || currentCapture.labels.length === 0) {
      setError("No labels loaded. Please capture data from ServiceNow or import manually.");
      return;
    }
    
    setError(null);
    setResult(null);
    
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    
    const res = await repairWorkbook(file, currentCapture.labels);
    setResult(res);
    setIsProcessing(false);
  }, [currentCapture]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1
  });

  const handleManualImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          // Very basic validation
          if (Array.isArray(json)) {
             setCurrentCapture({
               labels: json,
               captureDate: new Date().toISOString(),
               instanceUrl: 'manual-import',
               dashboardTitle: 'Manual Import',
               strategyUsed: 'manual'
             });
             setError(null);
          } else {
             setError("Invalid JSON format. Expected an array of strings.");
          }
        } catch(err) {
          setError("Failed to parse JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Repair your ServiceNow Pivot exports.</p>
        </div>
        
        {/* Status indicator */}
        <div className={`px-4 py-2 rounded-xl flex items-center space-x-3 border ${currentCapture ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary border-border text-muted-foreground'}`}>
          {currentCapture ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <div className="flex flex-col">
             <span className="text-sm font-medium leading-none">
               {currentCapture ? `${currentCapture.labels.length} Labels Loaded` : 'No Labels Loaded'}
             </span>
             {currentCapture && <span className="text-xs opacity-80 mt-1">{currentCapture.dashboardTitle}</span>}
          </div>
        </div>
      </div>

      {!currentCapture && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
           <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
             <FileJson className="w-6 h-6 text-muted-foreground" />
           </div>
           <div>
             <h3 className="font-semibold text-lg">Import Labels Manually</h3>
             <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
               If you don't have the Chrome extension installed, you can manually upload a JSON file containing the array of labels.
             </p>
           </div>
           <div>
             <input type="file" id="json-upload" accept=".json" className="hidden" onChange={handleManualImport} />
             <label htmlFor="json-upload" className="inline-flex items-center px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                Browse JSON
             </label>
           </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-colors cursor-pointer ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-secondary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Drop Excel File Here</h3>
        <p className="text-muted-foreground">Support for .xlsx and .xls formats</p>
      </div>

      {/* Result Section */}
      {isProcessing && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Repairing workbook...</p>
        </div>
      )}

      {result && result.success && result.workbook && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Repair Successful</h3>
                <p className="text-sm text-muted-foreground">Injected {result.injectedLabels} headers</p>
              </div>
            </div>
            <button 
              onClick={() => downloadWorkbook(result.workbook!, 'Fixed_Export.xlsx')}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download XLSX
            </button>
          </div>

          <div className="mt-6 border border-border rounded-xl overflow-hidden bg-background">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                  <tr>
                    {result.previewHeaders?.map((h, i) => (
                      <th key={i} className="px-4 py-3 font-medium whitespace-nowrap border-b border-border border-r last:border-r-0">{h || `Col ${i+1}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.previewData?.slice(0, 5).map((row: any, i: number) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      {row.map((cell: any, j: number) => (
                        <td key={j} className="px-4 py-2 whitespace-nowrap border-r border-border last:border-r-0">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 bg-secondary text-xs text-muted-foreground text-center">
              Showing preview of first 5 rows
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
