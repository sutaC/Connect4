"use client";
import { useState } from "react";
import GamePage from "../game";
import CustomFooter from "@/components/customFooter";
import { getEmptyBoard } from "@/modules/board";

export default function Page() {
	const [board, setBoard] = useState(getEmptyBoard());

	function handleExit() {
		if (
			confirm(
				"Are you sure you want to exit game? It will be lost forever!"
			)
		) {
			location.href = "/";
		}
	}

	function handleNewGame() {
		setBoard(getEmptyBoard());
	}

	return (
		<>
			<GamePage
				board={board}
				turnMsg='Your turn!'
				handleExit={handleExit}
				handleNewGame={handleNewGame}
			></GamePage>
			<CustomFooter>Singleplayer with AI</CustomFooter>
		</>
	);
}
