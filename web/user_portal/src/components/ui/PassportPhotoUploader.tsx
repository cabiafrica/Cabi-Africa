import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg, compressImage } from '../../utils/imageUtils';
import { FaCloudUploadAlt, FaCrop, FaCheck, FaTimes, FaSpinner, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

interface PassportPhotoUploaderProps {
    onFileSelect: (file: File) => void;
    aspectRatio?: number;
    label?: string;
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
}

export default function PassportPhotoUploader({
    onFileSelect,
    aspectRatio = 1,
    label = "Upload Passport Photo",
    maxSizeMB = 0.5,
    maxWidthOrHeight = 1200,
}: PassportPhotoUploaderProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [fileName, setFileName] = useState<string>('');

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFileName(file.name);

            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result as string));
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setProcessing(true);
        try {
            // 1. Crop
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedFile) throw new Error("Cropping failed");

            // 2. Compress
            const compressedFile = await compressImage(
                croppedFile,
                maxSizeMB,
                maxWidthOrHeight
            );

            // 3. Return
            onFileSelect(compressedFile);

            // Reset
            setImageSrc(null);
            setZoom(1);
        } catch (e) {
            console.error(e);
            alert("Failed to process image");
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = () => {
        setImageSrc(null);
        setZoom(1);
        setFileName('');
    };

    return (
        <div className="w-full">
            {imageSrc ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <FaCrop className="text-[#D4AF37]" />
                                Adjust Photo
                            </h3>
                            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="relative flex-1 min-h-[400px] bg-gray-900">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                showGrid={true}
                                objectFit="contain"
                            />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900 space-y-4">
                            <div className="flex items-center gap-4">
                                <FaSearchMinus className="text-gray-400" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#D4AF37]"
                                />
                                <FaSearchPlus className="text-gray-400" />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2 rounded-xl border border-slate-300 dark:border-white/15 font-medium hover:border-[#D4AF37]/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={processing}
                                    className="px-6 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processing ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                    Save Photo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <label
                        htmlFor="passport-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl cursor-pointer bg-slate-50 dark:bg-surface-dark hover:border-[#D4AF37]/50 transition-all group"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="w-12 h-12 mb-3 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                                <FaCloudUploadAlt className="text-2xl" />
                            </div>
                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                            <p className="text-xs text-gray-400">JPG or PNG</p>
                        </div>
                        <input
                            id="passport-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}
