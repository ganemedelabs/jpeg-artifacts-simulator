import ImageProcessor from "@/components/ImageProcessor";

export default function Home() {
    return (
        <main>
            <div className="title-bar">
                <h1 className="title-bar-text text-base">JPEG Artifacts Simulator</h1>
            </div>
            <div className="mx-auto max-w-6xl p-5">
                <ImageProcessor />
                <small className="mt-4 block text-xs">
                    This project is open source under the MIT License.{" "}
                    <a
                        href="https://github.com/ganemedelabs/jpeg-artifacts-simulator"
                        className="text-[#000080] underline"
                    >
                        View on GitHub
                    </a>
                    .
                </small>
            </div>
        </main>
    );
}
