"use client";
import { useEffect, useState } from "react";
import Board from "@/components/board";
import styles from "./game.module.css";
import CustomModal from "@/components/customModal";
import CustomButton from "@/components/customButton";
import { Player } from "@/modules/board";

export default function GamePage({
	board,
	turnMsg,
	handleExit,
	handleNewGame,
}: {
	board: Player[][];
	turnMsg: string;
	handleExit?: () => void;
	handleNewGame?: () => void;
}) {
	const [modalOpen, setModalOpen] = useState(true);
	const [endMsg, setEndMsg] = useState("xxx");

	type GameEndEvent = CustomEvent<{ msg: string }>;
	function gameEnd(event: GameEndEvent) {
		setEndMsg(event.detail.msg);
		setModalOpen(true);
	}

	useEffect(() => {
		document.addEventListener("gameEnd", (event: any) => {
			gameEnd(event);
		});
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
				<p>{endMsg}</p>
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
