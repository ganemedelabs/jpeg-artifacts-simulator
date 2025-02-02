export async function simulateJPEGCompression(
    imageData: ImageData,
    quality: number,
    onProgress: (progress: number) => void // eslint-disable-line no-unused-vars
): Promise<ImageData> {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    const Y: number[][] = Array.from({ length: height }, () => new Array<number>(width));
    const Cb: number[][] = Array.from({ length: height }, () => new Array<number>(width));
    const Cr: number[][] = Array.from({ length: height }, () => new Array<number>(width));

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            Y[y][x] = 0.299 * r + 0.587 * g + 0.114 * b;
            Cb[y][x] = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
            Cr[y][x] = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
        }
    }

    const yBlocks = Math.ceil(height / 8) * Math.ceil(width / 8);
    const subsampledW = Math.floor(width / 2);
    const subsampledH = Math.floor(height / 2);
    const chromaBlocks = Math.ceil(subsampledH / 8) * Math.ceil(subsampledW / 8);
    const totalBlocks = yBlocks + 2 * chromaBlocks;
    let processedBlocks = 0;

    const Cb_sub: number[][] = Array.from({ length: subsampledH }, () => new Array<number>(subsampledW));
    const Cr_sub: number[][] = Array.from({ length: subsampledH }, () => new Array<number>(subsampledW));
    for (let y = 0; y < subsampledH; y++) {
        for (let x = 0; x < subsampledW; x++) {
            Cb_sub[y][x] = Cb[y * 2][x * 2];
            Cr_sub[y][x] = Cr[y * 2][x * 2];
        }
    }

    const stdQuantMatrix: number[][] = [
        [16, 11, 10, 16, 24, 40, 51, 61],
        [12, 12, 14, 19, 26, 58, 60, 55],
        [14, 13, 16, 24, 40, 57, 69, 56],
        [14, 17, 22, 29, 51, 87, 80, 62],
        [18, 22, 37, 56, 68, 109, 103, 77],
        [24, 35, 55, 64, 81, 104, 113, 92],
        [49, 64, 78, 87, 103, 121, 120, 101],
        [72, 92, 95, 98, 112, 100, 103, 99],
    ];

    let scale = quality < 50 ? 5000 / quality : 200 - quality * 2;
    scale = scale / 100;
    const quantMatrix: number[][] = stdQuantMatrix.map((row) => row.map((val) => Math.max(1, Math.floor(val * scale))));

    async function processBlocks(
        channel: number[][],
        w: number,
        h: number,
        quantMatrix: number[][]
    ): Promise<number[][]> {
        const processed: number[][] = Array.from({ length: h }, () => new Array(w).fill(0));

        for (let i = 0; i < h; i += 8) {
            for (let j = 0; j < w; j += 8) {
                const block: number[][] = [];
                for (let u = 0; u < 8; u++) {
                    block[u] = [];
                    for (let v = 0; v < 8; v++) {
                        const yIdx = i + u;
                        const xIdx = j + v;
                        block[u][v] = yIdx < h && xIdx < w ? channel[yIdx][xIdx] : 0;
                    }
                }

                const dctBlock = dct2d(block);

                for (let u = 0; u < 8; u++) {
                    for (let v = 0; v < 8; v++) {
                        dctBlock[u][v] = Math.round(dctBlock[u][v] / quantMatrix[u][v]);
                    }
                }

                for (let u = 0; u < 8; u++) {
                    for (let v = 0; v < 8; v++) {
                        dctBlock[u][v] = dctBlock[u][v] * quantMatrix[u][v];
                    }
                }

                const blockIDCT = idct2d(dctBlock);

                for (let u = 0; u < 8; u++) {
                    for (let v = 0; v < 8; v++) {
                        const yIdx = i + u;
                        const xIdx = j + v;
                        if (yIdx < h && xIdx < w) {
                            processed[yIdx][xIdx] = blockIDCT[u][v];
                        }
                    }
                }

                processedBlocks++;
                onProgress((processedBlocks / totalBlocks) * 100);

                if (processedBlocks % 10 === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 0));
                }
            }
        }
        return processed;
    }

    function dct2d(block: number[][]): number[][] {
        const N = 8;
        const dct: number[][] = Array.from({ length: N }, () => new Array<number>(N).fill(0));
        for (let u = 0; u < N; u++) {
            for (let v = 0; v < N; v++) {
                let sum = 0;
                for (let x = 0; x < N; x++) {
                    for (let y = 0; y < N; y++) {
                        sum +=
                            block[x][y] *
                            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
                            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
                    }
                }
                const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
                const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
                dct[u][v] = 0.25 * cu * cv * sum;
            }
        }
        return dct;
    }

    function idct2d(dct: number[][]): number[][] {
        const N = 8;
        const block: number[][] = Array.from({ length: N }, () => new Array<number>(N).fill(0));
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                let sum = 0;
                for (let u = 0; u < N; u++) {
                    for (let v = 0; v < N; v++) {
                        const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
                        const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
                        sum +=
                            cu *
                            cv *
                            dct[u][v] *
                            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
                            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
                    }
                }
                block[x][y] = 0.25 * sum;
            }
        }
        return block;
    }

    const Y_processed = await processBlocks(Y, width, height, quantMatrix);
    const Cb_processed = await processBlocks(Cb_sub, subsampledW, subsampledH, quantMatrix);
    const Cr_processed = await processBlocks(Cr_sub, subsampledW, subsampledH, quantMatrix);

    const Cb_up: number[][] = Array.from({ length: height }, () => new Array<number>(width).fill(0));
    const Cr_up: number[][] = Array.from({ length: height }, () => new Array<number>(width).fill(0));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcY = Math.floor(y / 2);
            const srcX = Math.floor(x / 2);
            if (srcY < subsampledH && srcX < subsampledW) {
                Cb_up[y][x] = Cb_processed[srcY][srcX];
                Cr_up[y][x] = Cr_processed[srcY][srcX];
            }
        }
    }

    const outputData = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const Y_val = Y_processed[y][x];
            const Cb_val = Cb_up[y][x] - 128;
            const Cr_val = Cr_up[y][x] - 128;
            const r = Y_val + 1.402 * Cr_val;
            const g = Y_val - 0.344136 * Cb_val - 0.714136 * Cr_val;
            const b = Y_val + 1.772 * Cb_val;
            const idx = (y * width + x) * 4;
            outputData[idx] = Math.min(255, Math.max(0, Math.round(r)));
            outputData[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
            outputData[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
            outputData[idx + 3] = 255;
        }
    }

    return new ImageData(outputData, width, height);
}
