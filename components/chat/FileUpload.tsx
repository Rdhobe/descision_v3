import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onClearFiles: () => void;
  selectedFiles: File[];
}

export const FileUpload = ({ 
  onFileSelect, 
  onClearFiles, 
  selectedFiles 
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    validateAndSelectFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      validateAndSelectFiles(files);
      e.target.value = ''; // Reset the input
    }
  };

  const validateAndSelectFiles = (files: File[]) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = files.filter(file => file.size <= maxSize);
    
    if (validFiles.length !== files.length) {
      toast.error('Some files exceed the 5MB limit and were removed');
    }
    
    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const getFilePreview = (file: File) => {
    if (isImageFile(file)) {
      return (
        <div className="relative w-16 h-16 rounded overflow-hidden">
          <Image 
            src={URL.createObjectURL(file)} 
            alt={file.name} 
            layout="fill" 
            objectFit="cover"
            className="rounded"
          />
        </div>
      );
    }
    
    return (
      <div className="w-16 h-16 flex items-center justify-center bg-muted rounded">
        <FileIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="w-full">
      {selectedFiles.length > 0 ? (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">
              {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearFiles}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                {getFilePreview(file)}
                <div className="absolute -top-1 -right-1 bg-background border rounded-full w-5 h-5 flex items-center justify-center cursor-pointer">
                  <X 
                    className="h-3 w-3" 
                    onClick={() => {
                      const newFiles = [...selectedFiles];
                      newFiles.splice(index, 1);
                      onFileSelect(newFiles);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md p-4 mb-2 transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">
              Drag and drop files here
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Or click to browse (max 5MB)
            </p>
            <input
              type="file"
              id="fileInput"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              Choose files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 