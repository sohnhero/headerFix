import * as XLSX from 'xlsx';

export interface RepairResult {
  success: boolean;
  message?: string;
  workbook?: XLSX.WorkBook;
  injectedLabels?: number;
  previewData?: any[];
  previewHeaders?: string[];
}

export async function repairWorkbook(file: File, labels: string[]): Promise<RepairResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellStyles: true, cellNF: true, cellDates: true, cellFormula: true });
        
        // Find the pivot sheet. Usually the first one or named specifically.
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        
        // SheetJS encodes cells as A1, B1, etc.
        // We need to find where the labels should be injected.
        // ServiceNow usually leaves the metric headers empty starting from a specific row/col.
        // For simplicity, if we just convert to array of arrays, inject headers, and convert back, we might lose formatting.
        // So we will inject directly into the worksheet object.
        
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
        let injected = 0;
        let headerRow = -1;
        let startCol = -1;

        // Find the first empty cell in a row that looks like a header row
        // or just inject the labels starting at the first blank column in the first row.
        for (let R = range.s.r; R <= Math.min(range.e.r, 10); ++R) {
          let hasData = false;
          let firstEmptyCol = -1;
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = {c: C, r: R};
            const cellRef = XLSX.utils.encode_cell(cellAddress);
            const cell = ws[cellRef];
            const hasActualData = cell && cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== '';
            
            if (hasActualData) {
              hasData = true;
            } else if (hasData && firstEmptyCol === -1) {
              firstEmptyCol = C;
            }
          }
          if (hasData && firstEmptyCol !== -1) {
            headerRow = R;
            startCol = firstEmptyCol;
            break;
          }
        }

        if (headerRow !== -1 && startCol !== -1) {
          for (let i = 0; i < labels.length; i++) {
            const cellAddress = {c: startCol + i, r: headerRow};
            const cellRef = XLSX.utils.encode_cell(cellAddress);
            ws[cellRef] = { t: 's', v: labels[i] };
            injected++;
          }
          
          // Update range if we extended columns
          if (startCol + labels.length - 1 > range.e.c) {
            range.e.c = startCol + labels.length - 1;
            ws['!ref'] = XLSX.utils.encode_range(range);
          }
        }
        
        const previewData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const previewHeaders = (previewData[headerRow > -1 ? headerRow : 0] || []) as string[];

        resolve({
          success: true,
          workbook: wb,
          injectedLabels: injected,
          previewData: previewData.slice(Math.max(0, headerRow + 1)), // Just some rows for preview
          previewHeaders
        });
        
      } catch (err) {
        console.error(err);
        resolve({ success: false, message: 'Failed to process Excel file.' });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, message: 'Failed to read file.' });
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}
