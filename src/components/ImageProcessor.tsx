"use client";

import { simulateJPEGCompression } from "@/utils/utils";
import NextImage from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import FileInput from "./FileInput";
import TitleBar from "./TitleBar";

export default function ImageProcessor() {
    const originalCanvasRef = useRef<HTMLCanvasElement>(null);
    const processedCanvasRef = useRef<HTMLCanvasElement>(null);
    const [quality, setQuality] = useState<number>(30);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [imageProcessed, setImageProcessed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    function handleDownload() {
        const canvas = processedCanvasRef.current;
        if (!canvas || !imageProcessed) return;

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/jpeg");
        link.download = `${fileName || "processed"}.jpg`;
        link.click();
    }

    function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name.replace(/\.[^/.]+$/, ""));

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = originalCanvasRef.current;
                if (!canvas) return;
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    setImageUploaded(true);
                }
            };
            if (event.target && typeof event.target.result === "string") {
                img.src = event.target.result;
            }
        };
        reader.readAsDataURL(file);
    }

    async function handleGenerate() {
        setIsProcessing(true);
        setProgress(0);

        const canvas = originalCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const processedData = await simulateJPEGCompression(imageData, quality, (progress) =>
                setProgress(progress)
            );

            const outCanvas = processedCanvasRef.current;
            if (!outCanvas) return;
            outCanvas.width = canvas.width;
            outCanvas.height = canvas.height;
            const outCtx = outCanvas.getContext("2d");
            if (outCtx) {
                outCtx.putImageData(processedData, 0, 0);
            }
        } finally {
            setIsProcessing(false);
            setImageProcessed(true);
            setProgress(100);
        }
    }

    return (
        <>
            {/* Image Import Section */}
            <section className="mb-6">
                <label htmlFor="fileInput" className="mb-2 block text-sm">
                    Import Image:
                </label>
                <FileInput onChange={handleImageUpload} />
            </section>

            {/* Quality Slider Section */}
            <section className="mb-6">
                <label htmlFor="qualityRange" className="mb-2 block text-sm">
                    Quality (lower = more artifacts): {quality}
                </label>
                <input
                    id="qualityRange"
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none"
                />
            </section>

            {/* Processing / Generate Section */}
            <section className="mb-6">
                {isProcessing ? (
                    <div
                        id="progress"
                        className="box-border h-8 w-full appearance-none overflow-hidden rounded-none border-none bg-[#c0c0c0] p-1 shadow-[inset_-1px_-1px_#ffffff,_inset_1px_1px_#808080,_inset_-2px_-2px_#dfdfdf,_inset_2px_2px_#0a0a0a]"
                    >
                        <div
                            className="h-full bg-[#000080]"
                            style={{
                                width: `${Math.round(progress / 5) * 5}%`,
                            }}
                        />
                    </div>
                ) : (
                    <button
                        type="button"
                        disabled={!imageUploaded}
                        onClick={handleGenerate}
                        className="w-full px-6 py-2 sm:w-auto"
                        aria-disabled={!imageUploaded}
                    >
                        Generate Image
                    </button>
                )}
                <small className="m-2 block text-xs">All processing is done client-side.</small>
            </section>

            {/* Display Canvases Section */}
            <section className="grid gap-8 md:grid-cols-2">
                {/* Original Image */}
                <div className="window">
                    <TitleBar title="Original Image" />

                    <canvas
                        ref={originalCanvasRef}
                        className={`h-auto w-full max-w-full ${imageUploaded ? "" : "hidden"}`}
                        role="img"
                        aria-label="Original image"
                    />

                    {!imageUploaded && (
                        <div className="flex h-48 w-full items-center justify-center">
                            <NextImage src="/images/original.png" alt="Processed Icon" width={120} height={120} />
                        </div>
                    )}
                </div>

                {/* Processed Image */}
                <div className="window">
                    <TitleBar title="Processed Image" />

                    <canvas
                        ref={processedCanvasRef}
                        className={`h-auto w-full max-w-full ${imageProcessed ? "" : "hidden"}`}
                        role="img"
                        aria-label="Processed image"
                    />

                    {imageProcessed ? (
                        <div>
                            <button type="button" className="w-full px-4 py-2" onClick={handleDownload}>
                                Download Image
                            </button>
                        </div>
                    ) : (
                        <div className="flex h-48 w-full items-center justify-center">
                            <NextImage src="/images/processed.png" alt="Processed Icon" width={120} height={120} />
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
