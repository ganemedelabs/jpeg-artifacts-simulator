import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "JPEG Artifacts Simulator",
        short_name: "JPEG Artifacts Simulator",
        description: "An open-source Progressive Web App that simulates JPEG compression artifacts.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
            {
                src: "/images/favicons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/images/favicons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
