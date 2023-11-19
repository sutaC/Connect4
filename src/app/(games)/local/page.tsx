"use client";
import { useEffect, useState } from "react";
import GamePage, { GameOverEvent } from "../game";
import CustomFooter from "@/components/customFooter";
import { Player, checkDraw, checkGameOver, getEmptyBoard, playMove } from "@/modules/board";
import { BoardClickEvent } from "@/components/board";

export default function Page() {
	let turn: Player = "red";
	let board: Player[][] = getEmptyBoard();
	const [boardView, setBoardView] = useState(board);
	const [turnMsg, setTurnMsg] = useState<string>(turn);

	function handleNewGame() {
		location.reload();
	}

	function handleBoardClick(event: BoardClickEvent){
		const {row} = event.detail;
		const move = playMove(board, row, turn as Player)

		if(!move){
			return;
		}

		setBoardView(board);

		const gameOver = checkGameOver(board);
		if(gameOver){
			const msg = `${turn} won!`
			const gameOverEvent: GameOverEvent = new CustomEvent("gameOver", {detail: {msg}});
			document.dispatchEvent(gameOverEvent);
			return
		}

		const draw = checkDraw(board);
		if(draw){
			const msg = `Draw!`
			const gameOverEvent: GameOverEvent = new CustomEvent("gameOver", {detail: {msg}});
			document.dispatchEvent(gameOverEvent);
			return
		}

		turn = turn === "red" ? "yellow" : "red";
		setTurnMsg(turn);
	}
	const boardClickeventListener = (e: Event) => {handleBoardClick(e as BoardClickEvent)};

	useEffect(() => {
		document.removeEventListener("boardClick", boardClickeventListener, true)
		document.addEventListener("boardClick", boardClickeventListener)	
	}, [])

	return (
		<>
			<GamePage
				board={boardView}
				turnMsg={`${turnMsg} turn!`}
				handleNewGame={handleNewGame}
			></GamePage>
			<CustomFooter>Local multiplayer</CustomFooter>
		</>
	);
}
