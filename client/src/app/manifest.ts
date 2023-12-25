import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Connect4",
        short_name: "Connect4",
        description: "Simple and classic Connect 4 game for anyone to enjoy!",
        start_url: "/",
        display: "fullscreen",
        background_color: "#181419",
        theme_color: "#38303b",
        icons: [
            {
                src: "/icon-64x64.png",
                sizes: "64x64",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icon-128x128.png",
                sizes: "128x128",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icon-256x256.png",
                sizes: "256x256",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icon-64x64.png",
                sizes: "64x64",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icon-128x128.png",
                sizes: "128x128",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icon-256x256.png",
                sizes: "256x256",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
