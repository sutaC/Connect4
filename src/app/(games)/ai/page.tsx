"use client";
import { useState } from "react";
import GamePage from "../game";
import CustomFooter from "@/components/customFooter";
import { getEmptyBoard } from "@/modules/board";

export default function Page() {
	const [board, setBoard] = useState(getEmptyBoard());

	function handleNewGame() {
		setBoard(getEmptyBoard());
	}

	return (
		<>
			<GamePage
				board={board}
				turnMsg='Your turn!'

				handleNewGame={handleNewGame}
			></GamePage>
			<CustomFooter>Singleplayer with AI</CustomFooter>
		</>
	);
}
