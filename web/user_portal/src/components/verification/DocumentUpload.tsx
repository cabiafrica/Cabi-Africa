import React, { useState, useCallback } from 'react';
import { FaUpload, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

interface DocumentUploadProps {
    documentType: 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'PASSPORT';
    userId: string;
    onUploadSuccess: (verificationId: string, extractedFields: any) => void;
    onUploadError: (error: string) => void;
}

export default function DocumentUpload({
    documentType,
    userId,
    onUploadSuccess,
    onUploadError,
}: DocumentUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            onUploadError('Please upload an image file (JPEG or PNG)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            onUploadError('File size must be less than 5MB');
            return;
        }

        setFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!file) {
            onUploadError('Please select a file first');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('documentType', documentType);
            formData.append('userId', userId);

            const response = await fetch('http://localhost:3003/api/v1/verification/document/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onUploadSuccess(data.id, data.extractedFields);
        } catch (error) {
            console.error('Upload error:', error);
            onUploadError('Failed to upload document. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getDocumentTypeLabel = () => {
        switch (documentType) {
            case 'NATIONAL_ID':
                return 'National ID Card';
            case 'DRIVERS_LICENSE':
                return "Driver's License";
            case 'PASSPORT':
                return 'Passport';
            default:
                return 'Document';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold mb-2">Upload {getDocumentTypeLabel()}</h3>
                <p className="text-gray-400 text-sm">
                    Please upload a clear photo of your {getDocumentTypeLabel().toLowerCase()}. Ensure all text is readable.
                </p>
            </div>

            {/* Drag and Drop Area */}
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${dragActive
                        ? 'border-brand-yellow bg-brand-yellow/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="document-upload"
                    aria-label={`Upload ${getDocumentTypeLabel()}`}
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleChange}
                />

                {!preview ? (
                    <label
                        htmlFor="document-upload"
                        className="flex flex-col items-center justify-center cursor-pointer"
                    >
                        <div className="h-16 w-16 bg-brand-dark rounded-full flex items-center justify-center mb-4 text-brand-yellow">
                            <FaUpload className="text-2xl" />
                        </div>
                        <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-gray-500 text-sm">JPEG or PNG (max 5MB)</p>
                    </label>
                ) : (
                    <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden">
                            <img src={preview} alt="Verified driver identification document preview" width={600} height={400} loading="lazy" decoding="async" className="w-full h-auto max-h-96 object-contain bg-gray-900" />
                        </div>
                        <div className="flex gap-3">
                            <label
                                htmlFor="document-upload"
                                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-center cursor-pointer transition-colors text-sm"
                            >
                                Change Image
                            </label>
                            <button
                                type="button"
                                onClick={handleUpload}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleUpload();
                                    }
                                }}
                                disabled={uploading}
                                className="flex-1 px-4 py-2 bg-brand-yellow hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                                {uploading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle />
                                        Upload & Extract
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="bg-brand-dark/50 border border-gray-800 rounded-lg p-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <FaExclamationTriangle className="text-brand-yellow" />
                    Tips for best results
                </h4>
                <ul className="text-xs text-gray-400 space-y-1 ml-6 list-disc">
                    <li>Ensure good lighting - avoid shadows</li>
                    <li>Place document on a flat, contrasting surface</li>
                    <li>Keep camera parallel to document (no angles)</li>
                    <li>Make sure all text is in focus and readable</li>
                    <li>Avoid glare from flash or bright lights</li>
                </ul>
            </div>
        </div>
    );
}
