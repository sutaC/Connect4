import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Connect4",
	description: "Simple and classic Connect 4 game for anyone to enjoy!",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<head>
				<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
			</head>
			<body>{children}</body>
		</html>
	);
}
