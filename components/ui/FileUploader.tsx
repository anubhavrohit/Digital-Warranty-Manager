'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = 'image/jpeg,image/jpg,image/png,image/webp,application/pdf',
  maxSizeMB = 10,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-carrot bg-carrot-light/40 scale-[1.01]'
              : 'border-cream-dark/80 bg-white hover:border-forest/50 hover:bg-cream-light/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-16 h-16 rounded-2xl bg-forest-light text-forest mx-auto flex items-center justify-center mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-forest mb-1">
            Upload your bill or invoice
          </h4>
          <p className="text-xs text-forest/70 mb-4 max-w-sm mx-auto">
            Drag & drop your file here, or click to browse files from your device.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-light border border-cream-dark/60 text-[11px] font-semibold text-forest/70">
            <span>Supported formats: JPG, JPEG, PNG, WEBP, PDF</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-cream-dark p-6 shadow-warm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-kiwi font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>File Selected</span>
            </div>
            <button
              onClick={handleClear}
              className="p-1 rounded-lg text-forest/60 hover:text-tomato hover:bg-tomato-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 bg-cream-light/60 p-4 rounded-2xl border border-cream-dark/50">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Receipt Preview"
                className="w-20 h-20 rounded-xl object-cover border border-cream-dark shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-forest text-sunshine flex items-center justify-center shrink-0">
                <FileText className="w-8 h-8" />
              </div>
            )}
            <div className="truncate flex-1">
              <p className="text-sm font-bold text-forest truncate">{selectedFile.name}</p>
              <p className="text-xs text-forest/60 mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type || 'Document'}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs font-semibold text-tomato animate-fade-in text-center">{error}</p>
      )}
    </div>
  );
};
