import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

const SAMPLE_CSV = `assignment_id,average_score,kc_list
A01,0.89,variables;printing;basic_types
A02,0.89,printing;variables
A03,0.85,basic_types;variables
A04,0.84,expressions;operators
A05,0.81,expressions;operators
A06,0.79,operators;expressions
A07,0.7,operators;expressions
A08,0.68,string_formatting;input_output
A09,0.73,string_formatting;input_output
A10,0.73,boolean_logic;conditionals;input_output
A11,0.72,boolean_logic;comparison_operators
A12,0.63,boolean_logic;comparison_operators
A13,0.6,for_loops;loops
A14,0.6,while_loops;for_loops
A15,0.57,while_loops;for_loops;loops
A16,0.56,indexing;slicing;lists
A17,0.55,slicing;lists;indexing
A18,0.55,slicing;lists;indexing
A19,0.55,functions;scope
A20,0.55,scope;return_values
A21,0.6,scope;return_values
A22,0.57,key_value_access;dictionaries;iteration;return_values;scope
A23,0.55,iteration;key_value_access
A24,0.55,iteration;key_value_access
A25,0.55,file_io;files;key_value_access
A26,0.55,files;file_io
A27,0.55,files;file_io
A28,0.55,methods;oop_basics;attributes;files;classes
A29,0.55,methods;oop_basics;attributes;files;classes
A30,0.55,attributes;methods;oop_basics;files`;

const downloadSampleCsv = (e: React.MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_assignments.csv';
  a.click();
  URL.revokeObjectURL(url);
};

interface FileUploadProps {
  onFileLoaded: (content: string) => void;
}

export function FileUpload({ onFileLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => onFileLoaded(e.target?.result as string);
    reader.readAsText(file);
  }, [onFileLoaded]);

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">CSV Format Requirements</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>The file must contain columns: <code className="bg-muted px-1 rounded">assignment_id</code>, <code className="bg-muted px-1 rounded">average_score</code>, <code className="bg-muted px-1 rounded">kc_list</code></li>
          <li>KCs in <code className="bg-muted px-1 rounded">kc_list</code> should be separated by a delimiter (default: semicolon)</li>
          <li><strong className="text-foreground">Row order matters:</strong> assignments must appear in the order they are given in the course (earliest first)</li>
        </ul>
        <button
          onClick={downloadSampleCsv}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
        >
          ↓ Download sample CSV
        </button>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.csv';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
      >
        <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        {fileName ? (
          <p className="text-sm font-medium text-foreground">{fileName}</p>
        ) : (
          <p className="text-sm font-medium text-foreground">Drop your CSV file here or click to browse</p>
        )}
      </div>
    </div>
  );
}
