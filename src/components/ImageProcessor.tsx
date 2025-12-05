"use client";

import init, { compress_jpeg } from "compress-jpeg";
import NextImage from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import FileInput from "./FileInput";
import TitleBar from "./TitleBar";

export default function ImageProcessor() {
    const originalCanvasRef = useRef<HTMLCanvasElement>(null);
    const processedCanvasRef = useRef<HTMLCanvasElement>(null);

    const [compression, setCompression] = useState<number>(30);

    const [imageUploaded, setImageUploaded] = useState(false);
    const [imageProcessed, setImageProcessed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const [lastCompression, setLastCompression] = useState<number | null>(null);
    const [imageHash, setImageHash] = useState<string | null>(null);
    const [lastProcessedHash, setLastProcessedHash] = useState<string | null>(null);

    function generateImageHash(data: Uint8ClampedArray): string {
        let hash = 0;
        for (let i = 0; i < data.length; i += 100) {
            hash = (hash << 5) - hash + data[i];
            hash = hash & hash;
        }
        return hash.toString();
    }

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
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    setImageHash(generateImageHash(imageData.data));
                    setImageUploaded(true);
                    setImageProcessed(false);
                    setLastProcessedHash(null);
                    setLastCompression(null);
                }
            };

            if (event.target && typeof event.target.result === "string") {
                img.src = event.target.result;
            }
        };

        reader.readAsDataURL(file);
    }

    async function handleGenerate() {
        const processedCanvas = processedCanvasRef.current;
        if (processedCanvas) {
            processedCanvas.width = 0;
            processedCanvas.height = 0;
        }

        setImageProcessed(false);
        setIsProcessing(true);
        await new Promise((resolve) => setTimeout(resolve, 10));

        const canvas = originalCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await init();

        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const output = compress_jpeg(imageData, compression / 100);

            const outCanvas = processedCanvasRef.current;
            if (!outCanvas) return;

            outCanvas.width = canvas.width;
            outCanvas.height = canvas.height;

            const outCtx = outCanvas.getContext("2d");
            if (outCtx) outCtx.putImageData(output, 0, 0);

            setLastCompression(compression);
            setLastProcessedHash(imageHash);
        } catch (err) {
            console.error("Error processing image:", err);
        } finally {
            setIsProcessing(false);
            setImageProcessed(true);
        }
    }

    const isGenerateDisabled =
        !imageUploaded || isProcessing || (compression === lastCompression && imageHash === lastProcessedHash);

    return (
        <>
            {/* Image Import Section */}
            <section className="mb-6">
                <label htmlFor="fileInput" className="mb-2 block text-sm">
                    Import Image:
                </label>
                <FileInput onChangeAction={handleImageUpload} />
            </section>

            {/* Compression Slider Section */}
            <section className="mb-6">
                <label htmlFor="compressionRange" className="mb-2 block text-sm">
                    Compression Strength (0 = none, 100 = maximum): {compression.toFixed()}
                </label>

                <input
                    id="compressionRange"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={compression}
                    onChange={(e) => setCompression(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none"
                />
            </section>

            {/* Processing Section */}
            <section className="mb-6">
                <button
                    type="button"
                    disabled={isGenerateDisabled && !isProcessing}
                    onClick={handleGenerate}
                    className="w-full px-6 py-2 sm:w-auto"
                    aria-disabled={isGenerateDisabled}
                >
                    {isProcessing ? "Generating Image..." : "Generate Image"}
                </button>
                <small className="m-2 block text-sm">All processing is done client-side.</small>
            </section>

            {/* Display Canvases */}
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
                            <NextImage src="/images/original.png" alt="Original Icon" width={120} height={120} />
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
