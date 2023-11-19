"use client";
import { useEffect, useState } from "react";
import Board from "@/components/board";
import styles from "./game.module.css";
import CustomModal from "@/components/customModal";
import CustomButton from "@/components/customButton";
import { Player } from "@/modules/board";

export type GameOverEvent = CustomEvent<{ msg: string }>;

export default function GamePage({
	board,
	turnMsg,
	handleNewGame,
}: {
	board: Player[][];
	turnMsg: string;
	handleNewGame?: () => void;
}) {
	const [modalOpen, setModalOpen] = useState(false);
	const [endMsg, setEndMsg] = useState("");

	function handleExit() {
		if (
			confirm(
				"Are you sure you want to exit game? It will be lost forever!"
			)
		) {
			location.href = "/";
		}
	}

	function gameEnd(event: GameOverEvent) {
		setEndMsg(event.detail.msg);
		setModalOpen(true);
	}
	const gameOverEventListener  =(event: Event) => {
		gameEnd(event as GameOverEvent);
	}

	useEffect(() => {
		document.removeEventListener("gameOver", gameOverEventListener);
		document.addEventListener("gameOver", gameOverEventListener);
	}, []);

	return (
		<main className={styles.main}>
			<button className={styles.exitButton} onClick={handleExit}>
				Exit game
			</button>

			<h1>{turnMsg}</h1>

			<Board board={board}></Board>

			<CustomModal open={modalOpen}>
				<h2>Game finished</h2>
				<p className={styles.endMsg}>{endMsg}</p>
				<div
					onClick={() => {
						if (handleNewGame) {
							handleNewGame();
						}
						setModalOpen(false);
					}}
				>
					<CustomButton>Play again</CustomButton>
				</div>
				<div onClick={handleExit}>
					<CustomButton>Exit</CustomButton>
				</div>
			</CustomModal>
		</main>
	);
}
