import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

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
        <a
          href="/sample_assignments.csv"
          download
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          ↓ Download sample CSV
        </a>
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
