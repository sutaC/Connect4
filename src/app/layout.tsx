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
			<body>{children}</body>
		</html>
	);
}
