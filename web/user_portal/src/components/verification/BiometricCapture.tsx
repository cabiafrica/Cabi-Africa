import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FaCamera, FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

interface BiometricCaptureProps {
    userId: string;
    documentVerificationId: string;
    onCaptureSuccess: (verificationId: string, matchScore: number, livenessScore: number) => void;
    onCaptureError: (error: string) => void;
}

export default function BiometricCapture({
    userId,
    documentVerificationId,
    onCaptureSuccess,
    onCaptureError,
}: BiometricCaptureProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraError(null);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setCameraError('Unable to access camera. Please ensure you have granted camera permissions.');
        }
    }, []);

    // Stop camera
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    }, [stream]);

    // Capture photo
    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);

        // Stop camera after capture
        stopCamera();
    }, [stopCamera]);

    // Retake photo
    const retakePhoto = useCallback(() => {
        setCapturedImage(null);
        startCamera();
    }, [startCamera]);

    // Upload selfie
    const uploadSelfie = async () => {
        if (!capturedImage) return;

        setUploading(true);

        try {
            // Convert data URL to blob
            const response = await fetch(capturedImage);
            const blob = await response.blob();

            // Create form data
            const formData = new FormData();
            formData.append('selfie', blob, 'selfie.jpg');
            formData.append('userId', userId);
            formData.append('documentVerificationId', documentVerificationId);

            // Upload to backend
            const uploadResponse = await fetch('http://localhost:3003/api/v1/verification/biometric/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            const data = await uploadResponse.json();
            onCaptureSuccess(data.id, data.matchScore, data.livenessScore);
        } catch (error) {
            console.error('Upload error:', error);
            onCaptureError('Failed to upload selfie. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Initialize camera on mount
    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold mb-2">Biometric Verification</h3>
                <p className="text-gray-400 text-sm">
                    Take a selfie to verify your identity. Make sure your face is clearly visible.
                </p>
            </div>

            {/* Camera/Preview Area */}
            <div className="relative bg-brand-dark rounded-2xl overflow-hidden aspect-video">
                {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
                        <p className="text-white font-medium mb-2">Camera Access Required</p>
                        <p className="text-gray-400 text-sm mb-4">{cameraError}</p>
                        <button
                            onClick={startCamera}
                            className="px-6 py-2 bg-brand-yellow hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : capturedImage ? (
                    <img src={capturedImage} alt="Captured selfie" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {/* Face detection overlay (visual guide) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-80 border-4 border-brand-yellow/50 rounded-full"></div>
                        </div>
                    </>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="space-y-3">
                {!capturedImage ? (
                    <button
                        onClick={capturePhoto}
                        disabled={!stream || cameraError !== null}
                        className="w-full py-4 bg-brand-yellow hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <FaCamera />
                        Capture Photo
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={retakePhoto}
                            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                        >
                            Retake
                        </button>
                        <button
                            onClick={uploadSelfie}
                            disabled={uploading}
                            className="flex-1 px-4 py-3 bg-brand-yellow hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle />
                                    Verify
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Guidelines */}
            <div className="bg-brand-dark/50 border border-gray-800 rounded-lg p-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <FaExclamationTriangle className="text-brand-yellow" />
                    Selfie Guidelines
                </h4>
                <ul className="text-xs text-gray-400 space-y-1 ml-6 list-disc">
                    <li>Face the camera directly</li>
                    <li>Ensure good lighting from the front</li>
                    <li>Remove glasses, hats, or face coverings</li>
                    <li>Keep a neutral expression</li>
                    <li>Make sure your entire face is visible</li>
                    <li>Position your face within the oval guide</li>
                </ul>
            </div>
        </div>
    );
}
