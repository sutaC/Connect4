import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Connect4",
    description: "Simple and classic Connect 4 game for anyone to enjoy!",
    authors: { name: "sutaC", url: "sutac.pl" },
    creator: "sutaC",
    icons: "/favicon.ico",
    keywords:
        "connect4 game multiplayer singleplayer play board connectfour connect webgame htmlgame online gameonline",
    openGraph: {
        images: "/icon-128x128.png",
        type: "website",
        description: "Simple and classic Connect 4 game for anyone to enjoy!",
        siteName: "Connect4",
        url: "connect4.sutac.pl",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <meta name="theme-color" content="#38303b" />
                <link
                    rel="shortcut icon"
                    href="/favicon.ico"
                    type="image/x-icon"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
