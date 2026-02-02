import ConfigProvider from "@/contexts/ConfigContext";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const APP_NAME = "JPEG Artifacts Simulator";
const APP_DESCRIPTION = "An open-source Progressive Web App that simulates JPEG compression artifacts.";
const APP_URL = "https://jpeg-artifacts-simulator.vercel.app";

export const metadata: Metadata = {
    title: {
        default: APP_NAME,
        template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    keywords: ["JPEG artifacts", "compression simulator", "PWA", "image glitch", "ganemedelabs", "open source tools"],
    authors: [{ name: "Ganemede Labs" }],
    metadataBase: new URL(APP_URL),

    openGraph: {
        type: "website",
        siteName: APP_NAME,
        title: APP_NAME,
        description: APP_DESCRIPTION,
        url: APP_URL,
        images: [
            {
                url: "images/og-image.png",
                width: 1200,
                height: 630,
                alt: "JPEG Artifacts Simulator Preview",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: APP_NAME,
        description: APP_DESCRIPTION,
        images: ["/images/twitter-image.png"],
    },

    manifest: "/manifest.json",
    icons: {
        icon: [
            { rel: "icon", type: "image/png", sizes: "32x32", url: "/images/favicons/favicon-32x32.png" },
            { rel: "icon", type: "image/png", sizes: "16x16", url: "/images/favicons/favicon-16x16.png" },
        ],
        apple: [{ url: "/images/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
};

export const viewport: Viewport = {
    themeColor: "#c0c0c0",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html className="h-full" lang="en">
            <head>
                {/* eslint-disable-next-line @next/next/no-css-tags */}
                <link rel="stylesheet" href="/98.css" />
            </head>
            <ConfigProvider>
                <body className="window min-h-full">{children}</body>
            </ConfigProvider>
        </html>
    );
}
