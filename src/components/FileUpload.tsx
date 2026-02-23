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
        <>
          <p className="text-sm font-medium text-foreground">Drop your CSV file here or click to browse</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Required columns: assignment_id, average_score, kc_list
          </p>
        </>
      )}
    </div>
  );
}
