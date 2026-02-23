import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

const SAMPLE_CSV = `assignment_id,part,average_score,kc_list
P1-A01,1,0.86,variables;printing;type_conversion
P1-A02,1,0.87,printing
P1-A03,1,0.84,type_conversion;expressions;printing;variables
P1-A04,1,0.89,type_conversion;expressions;printing;variables
P1-A05,1,0.93,expressions;printing;basic_types
P1-A06,1,0.82,expressions;printing;basic_types
P2-A01,2,0.85,strings;conditionals;string_formatting
P2-A02,2,0.84,boolean_logic;string_formatting;strings;comparison_operators;operators;basic_types
P2-A03,2,0.85,boolean_logic;string_formatting;comparison_operators;strings
P2-A04,2,0.88,strings;conditionals;comparison_operators;string_formatting
P2-A05,2,0.9,boolean_logic;input_output;comparison_operators
P2-A06,2,0.95,boolean_logic;input_output;comparison_operators
P3-A01,3,0.87,boolean_logic;input_output;lists;comparison_operators;slicing
P3-A02,3,0.89,lists;for_loops;conditionals;input_output;variables
P3-A03,3,0.85,basic_types;iteration;for_loops;string_formatting;type_conversion;printing;conditionals
P3-A04,3,0.84,iteration;for_loops;while_loops;lists;indexing;basic_types
P3-A05,3,0.71,iteration;for_loops;while_loops;lists;indexing;basic_types
P3-A06,3,0.75,indexing;iteration;lists;loops
P4-A01,4,0.67,indexing;iteration;lists;loops
P4-A02,4,0.73,paths;docstrings;key_value_access;parameters;strings;iteration
P4-A03,4,0.62,paths;docstrings;key_value_access;parameters;strings;iteration
P4-A04,4,0.67,dictionaries;parameters;printing;conditionals;loops
P4-A05,4,0.74,parameters;scope;key_value_access;loop_control;comparison_operators;loops;iteration
P4-A06,4,0.72,docstrings;dictionaries;expressions;variables
P5-A01,5,0.75,debugging;classes;methods;docstrings;error_handling;testing;expressions
P5-A02,5,0.79,debugging;classes;methods;docstrings;error_handling;testing;expressions
P5-A03,5,0.77,logging;classes;oop_basics;exceptions;lists;input_output
P5-A04,5,0.78,methods;exceptions;logging;testing;assertions;file_io
P5-A05,5,0.82,methods;exceptions;logging;testing;assertions;file_io
P5-A06,5,0.84,debugging;methods;error_handling;assertions;attributes;key_value_access;comparison_operators;basic_types;iteration;return_values`;

const downloadSampleCsv = (e: React.MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_course.csv';
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
