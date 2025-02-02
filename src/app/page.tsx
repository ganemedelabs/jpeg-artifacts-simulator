import ImageProcessor from "@/components/ImageProcessor";

export default function Home() {
    return (
        <main>
            <div className="title-bar">
                <h1 className="title-bar-text text-base">JPEG Artifacts Simulator</h1>
            </div>
            <ImageProcessor />
        </main>
    );
}
