import React, { useState } from 'react';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import PassportPhotoUploader from '@/components/ui/PassportPhotoUploader';

export default function PassportDemoPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    return (
        <MainLayout
            title="Passport Photo Demo | Cabi"
            description="Test the passport photo uploader"
        >
            <div className="min-h-screen bg-slate-50 dark:bg-brand-black py-12 px-4">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Passport Photo Tool</h1>
                        <p className="text-gray-500 mt-2">Upload, crop, and compress your photo to meet professional standards.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                        <PassportPhotoUploader
                            onFileSelect={handleFileSelect}
                            aspectRatio={1}
                            label="Select Portrait Photo"
                        />
                    </div>

                    {file && previewUrl && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl space-y-4 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Result</h2>

                            <div className="flex gap-6 items-start">
                                <img
                                    src={previewUrl}
                                    alt="Processed"
                                    className="w-32 h-32 rounded-lg object-cover shadow-md border border-gray-200 dark:border-gray-700"
                                />
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <p><span className="font-bold">File Name:</span> {file.name}</p>
                                    <p><span className="font-bold">Size:</span> {(file.size / 1024).toFixed(2)} KB</p>
                                    <p><span className="font-bold">Type:</span> {file.type}</p>
                                    <p className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                        ✓ Ready for upload
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
