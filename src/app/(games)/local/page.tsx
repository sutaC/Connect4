"use client";
import { useState } from "react";
import { Player } from "@/components/board";
import GamePage from "../game";
import CustomFooter from "@/components/customFooter";

export default function Page() {
	const [board, setBoard] = useState(
		new Array(6).fill(new Array<Player>(7).fill(""))
	);

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
		setBoard(new Array(6).fill(new Array<Player>(7).fill("")));
	}

	return (
		<>
			<GamePage
				board={board}
				turnMsg='Red turn!'
				handleExit={handleExit}
				handleNewGame={handleNewGame}
			></GamePage>
			<CustomFooter>Local multiplayer</CustomFooter>
		</>
	);
}
