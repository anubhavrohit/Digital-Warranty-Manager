'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Scan, CheckCircle2, AlertTriangle, UploadCloud, Volume2 } from 'lucide-react';
import { Button } from './Button';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (code: string, type?: string) => void;
  title?: string;
  description?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onDetected,
  title = 'Live Barcode / QR Scanner',
  description = 'Point camera at product barcode, box IMEI, or invoice serial sticker',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedValue, setDetectedValue] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Play subtle beep sound on detection using Web Audio API
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext may be restricted by browser policy
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setDetectedValue(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        startBarcodeDetection();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : err.message || 'Unable to access camera.'
      );
      setHasCamera(false);
    }
  };

  const startBarcodeDetection = () => {
    if (typeof window === 'undefined') return;

    // Check for native BarcodeDetector API
    const BarcodeDetectorClass = (window as any).BarcodeDetector;

    if (BarcodeDetectorClass) {
      try {
        const detector = new BarcodeDetectorClass({
          formats: [
            'qr_code',
            'code_128',
            'code_39',
            'ean_13',
            'ean_8',
            'upc_a',
            'upc_e',
            'data_matrix',
          ],
        });

        intervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const raw = barcodes[0].rawValue;
                if (raw && raw.trim().length > 3) {
                  stopCamera();
                  playBeep();
                  setDetectedValue(raw.trim());
                  setTimeout(() => {
                    onDetected(raw.trim(), barcodes[0].format);
                    onClose();
                  }, 800);
                }
              }
            } catch {
              // Frame scan skip
            }
          }
        }, 250);
      } catch (err) {
        console.warn('BarcodeDetector initialization failed:', err);
      }
    }
  };

  // Alternative fallback: scanning from uploaded barcode photo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    if (BarcodeDetectorClass) {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = async () => {
          URL.revokeObjectURL(url);
          const detector = new BarcodeDetectorClass({
            formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e'],
          });
          const barcodes = await detector.detect(img);
          if (barcodes && barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            playBeep();
            setDetectedValue(raw);
            setTimeout(() => {
              onDetected(raw, barcodes[0].format);
              onClose();
            }, 600);
          } else {
            setCameraError('No barcode or QR code found in this image. Try another angle.');
          }
        };
        img.src = url;
      } catch (err: any) {
        setCameraError('Failed to parse barcode image: ' + err.message);
      }
    } else {
      setCameraError('Barcode scanning API is not available on this browser.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          stopCamera();
          onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-[#121417] rounded-3xl border border-cream-dark dark:border-white/10 shadow-2xl max-w-lg w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cream-dark/60 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-carrot/15 text-carrot flex items-center justify-center font-bold">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-forest dark:text-cream">{title}</h3>
              <p className="text-xs text-forest/70 dark:text-cream/70">{description}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl text-forest/60 hover:text-forest hover:bg-cream-light dark:text-white/60 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Content */}
        <div className="p-5 space-y-4">
          {cameraError ? (
            <div className="p-6 text-center bg-tomato/10 rounded-2xl border border-tomato/30 space-y-3">
              <AlertTriangle className="w-8 h-8 text-tomato mx-auto" />
              <p className="text-xs font-semibold text-tomato">{cameraError}</p>
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-sunshine text-xs font-bold cursor-pointer hover:bg-forest/90">
                  <UploadCloud className="w-4 h-4" />
                  Upload Barcode Image Instead
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-video sm:aspect-square bg-black rounded-2xl overflow-hidden border border-cream-dark dark:border-white/10 flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />

              {/* Scanning Crosshair Overlay */}
              {isScanning && !detectedValue && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-3/4 h-1/2 border-2 border-carrot/80 rounded-2xl relative shadow-[0_0_20px_rgba(242,100,25,0.4)]">
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-carrot shadow-[0_0_8px_#F26419] animate-pulse" />
                    {/* Corner Reticles */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-white rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-white rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-white rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-white rounded-br" />
                  </div>
                </div>
              )}

              {/* Success Detected Overlay */}
              {detectedValue && (
                <div className="absolute inset-0 bg-forest/90 flex flex-col items-center justify-center text-center p-4 text-cream animate-in fade-in duration-200">
                  <CheckCircle2 className="w-12 h-12 text-kiwi mb-2 animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider text-kiwi">
                    Barcode Detected!
                  </span>
                  <span className="text-lg font-mono font-extrabold text-white mt-1 break-all">
                    {detectedValue}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-forest/70 dark:text-cream/70 pt-1">
            <span>Align code inside the orange frame</span>
            <label className="text-carrot font-bold hover:underline cursor-pointer flex items-center gap-1">
              <UploadCloud className="w-3.5 h-3.5" />
              Upload photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
