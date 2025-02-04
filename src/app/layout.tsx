import ConfigProvider from "@/contexts/ConfigContext";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "JPEG Artifacts Simulator",
    description: "An open-source Progressive Web App that simulates JPEG compression artifacts.",
    icons: {
        icon: [
            { rel: "icon", type: "image/png", sizes: "32x32", url: "/images/favicons/favicon-32x32.png" },
            { rel: "icon", type: "image/png", sizes: "16x16", url: "/images/favicons/favicon-16x16.png" },
        ],
        apple: "/images/favicons/apple-touch-icon.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#c0c0c0",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html className="h-full" lang="en">
            <head>
                <link rel="stylesheet" href="/98.css" />
            </head>
            <ConfigProvider>
                <body className="window min-h-full">{children}</body>
            </ConfigProvider>
        </html>
    );
}
