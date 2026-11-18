import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaFileAlt, FaImage } from 'react-icons/fa';

interface FileUploadProps {
  label: string;
  name: string;
  accept?: string;
  maxSize?: number; // in MB
  required?: boolean;
  onChange: (file: File | null) => void;
  value?: File | null;
  error?: string;
  helperText?: string;
}

export default function FileUpload({
  label,
  name,
  accept = 'image/*,application/pdf',
  maxSize = 5, // 5MB default
  required = false,
  onChange,
  value,
  error,
  helperText,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileType = file.type;
    const fileExtension = `.${file.name.split('.').pop()}`;

    const isAccepted = acceptedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType);
      }
      return type === fileType || type === fileExtension;
    });

    if (!isAccepted) {
      return `File type not accepted. Please upload: ${accept}`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setUploadError(validationError);
      onChange(null);
      return;
    }

    setUploadError(null);
    onChange(file);

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayError = error || uploadError;

  return (
    <div className="space-y-2">
      <label htmlFor={`file-upload-${name}`} className="text-xs uppercase tracking-wider text-gray-500 font-bold">
        {label} {required && <span className="text-brand-yellow">*</span>}
      </label>

      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
          ${isDragging ? 'border-brand-yellow bg-brand-yellow/10' : 'border-gray-700 hover:border-gray-600'}
          ${displayError ? 'border-red-500' : ''}
          ${value ? 'bg-brand-dark/50' : 'bg-brand-dark'}
        `}
      >
        <input
          ref={fileInputRef}
          id={`file-upload-${name}`}
          type="file"
          name={name}
          accept={accept}
          aria-label={label}
          onChange={handleFileChange}
          className="hidden"
          required={required}
        />

        {!value ? (
          <div className="text-center">
            <FaCloudUploadAlt className="mx-auto text-4xl text-gray-500 mb-3" />
            <p className="text-sm text-gray-400 mb-1">
              Drag and drop or <span className="text-brand-yellow">browse</span>
            </p>
            <p className="text-xs text-gray-600">
              Max size: {maxSize}MB
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preview ? (
                <img src={preview} alt="Uploaded document preview thumbnail" width={48} height={48} loading="lazy" decoding="async" className="w-12 h-12 object-cover rounded" />
              ) : (
                <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                  {value.type === 'application/pdf' ? (
                    <FaFileAlt className="text-red-400 text-xl" />
                  ) : (
                    <FaImage className="text-gray-400 text-xl" />
                  )}
                </div>
              )}
              <div>
                <p className="text-sm text-white font-medium truncate max-w-[200px]">
                  {value.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(value.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label={`Remove uploaded ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove();
                }
              }}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <FaTimesCircle className="text-xl" />
            </button>
          </div>
        )}
      </div>

      {helperText && !displayError && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {displayError && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <FaTimesCircle /> {displayError}
        </p>
      )}
    </div>
  );
}
