import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg, compressImage } from '../../utils/imageUtils';
import { FaCloudUploadAlt, FaCrop, FaCheck, FaTimes, FaSpinner, FaSearchPlus, FaSearchMinus, FaUserCheck } from 'react-icons/fa';

interface PassportPhotoUploaderProps {
    onFileSelect: (file: File) => void;
    aspectRatio?: number;
    label?: string;
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
}

async function analyzeImageClientSide(file: File): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            if (img.width < 300 || img.height < 300) {
                resolve({ ok: false, error: 'Passport photo must be at least 300x300 pixels.' });
                return;
            }
            const canvas = document.createElement('canvas');
            const size = 64;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve({ ok: true });
                return;
            }
            ctx.drawImage(img, 0, 0, size, size);
            const data = ctx.getImageData(0, 0, size, size).data;
            let totalLum = 0;
            for (let i = 0; i < data.length; i += 4) {
                totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            }
            const avgLum = totalLum / (size * size);
            if (avgLum < 45) {
                resolve({ ok: false, error: 'Photo is too dark. Use a well-lit official passport photo.' });
                return;
            }
            if (avgLum > 248) {
                resolve({ ok: false, error: 'Photo is overexposed. Please upload a clear passport photo.' });
                return;
            }
            resolve({ ok: true });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ ok: false, error: 'Unable to read image file.' });
        };
        img.src = url;
    });
}

export default function PassportPhotoUploader({
    onFileSelect,
    aspectRatio = 1,
    label = 'Upload Official Passport Photo',
    maxSizeMB = 0.5,
    maxWidthOrHeight = 1200,
}: PassportPhotoUploaderProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [verifiedPreviewUrl, setVerifiedPreviewUrl] = useState<string | null>(null);

    const onCropComplete = useCallback((_: any, croppedPixels: any) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setValidationError(null);
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setValidationError('Official passport photo must be JPG or PNG.');
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result as string));
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setProcessing(true);
        setValidationError(null);
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedFile) throw new Error('Cropping failed');

            const compressedFile = await compressImage(croppedFile, maxSizeMB, maxWidthOrHeight);

            const clientCheck = await analyzeImageClientSide(compressedFile);
            if (!clientCheck.ok) {
                setValidationError(clientCheck.error || 'Passport photo failed framing check.');
                return;
            }

            const formData = new FormData();
            formData.append('photo', compressedFile);
            const res = await fetch('/api/validate-passport-photo', {
                method: 'POST',
                body: formData,
            });
            const serverCheck = await res.json().catch(() => ({ valid: true }));
            if (!res.ok || serverCheck.valid === false) {
                setValidationError(serverCheck.message || 'Server validation failed for passport photo.');
                return;
            }

            setVerifiedPreviewUrl(URL.createObjectURL(compressedFile));
            onFileSelect(compressedFile);
            setImageSrc(null);
            setZoom(1);
        } catch (e: any) {
            console.error(e);
            setValidationError(e?.message || 'Failed to process passport photo.');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = () => {
        setImageSrc(null);
        setZoom(1);
    };

    return (
        <div className="w-full space-y-2">
            {imageSrc ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <FaCrop className="text-[#D4AF37]" />
                                Frame Official Passport Photo
                            </h3>
                            <button type="button" onClick={handleCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="relative flex-1 min-h-[380px] bg-gray-900">
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
                            {/* Face & Head Framing Guide Overlay */}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-56 rounded-full border-2 border-dashed border-[#D4AF37]/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Center your face inside the oval guide. Use a plain light background, neutral expression, no hats or sunglasses.
                            </p>
                            {validationError && (
                                <p className="text-xs font-semibold text-red-500">{validationError}</p>
                            )}
                            <div className="flex items-center gap-4">
                                <FaSearchMinus className="text-gray-400" />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-label="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#D4AF37]"
                                />
                                <FaSearchPlus className="text-gray-400" />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleCancel();
                                        }
                                    }}
                                    className="px-6 py-2 rounded-xl border border-slate-300 dark:border-white/15 font-medium hover:border-[#D4AF37]/50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleSave();
                                        }
                                    }}
                                    disabled={processing}
                                    className="px-6 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#ffe088] text-black font-extrabold transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processing ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                    Verify &amp; Save Photo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <label
                        htmlFor="passport-upload"
                        className="flex flex-col items-center justify-center w-full min-h-[160px] p-4 border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl cursor-pointer bg-slate-50 dark:bg-surface-dark hover:border-[#D4AF37]/50 transition-all group"
                    >
                        {verifiedPreviewUrl ? (
                            <div className="flex items-center gap-4">
                                <img
                                    src={verifiedPreviewUrl}
                                    alt="Verified passport preview"
                                    className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500"
                                />
                                <div className="text-left">
                                    <p className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                                        <FaUserCheck /> Official Passport Photo Verified
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click to replace photo</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 mb-3 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                                    <FaCloudUploadAlt className="text-2xl" />
                                </div>
                                <p className="mb-1 text-sm text-gray-700 dark:text-gray-200 font-semibold">{label}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Professional headshot • Plain background • Full face centered (JPG/PNG)
                                </p>
                            </div>
                        )}
                        <input
                            id="passport-upload"
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png"
                            onChange={handleFileChange}
                        />
                    </label>
                    {validationError && (
                        <p className="text-xs text-red-500 font-semibold mt-1.5">{validationError}</p>
                    )}
                </div>
            )}
        </div>
    );
}
