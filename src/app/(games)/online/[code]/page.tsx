"use client";
import { useState } from "react";
import GamePage from "../../game";
import CustomFooter from "@/components/customFooter";
import CustomModal from "@/components/customModal";
import CustomButton from "@/components/customButton";
import { getEmptyBoard } from "@/modules/board";

export default function Page() {
	const [modalOpen, setModalOpen] = useState(true);
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
			<CustomModal open={modalOpen}>
				<h2>Waiting for other player...</h2>
				<div>
					<small>Game code:</small>
					<p className='highlight'>01234567</p>
				</div>
				<div onClick={handleExit}>
					<CustomButton>Exit</CustomButton>
				</div>
			</CustomModal>
			<CustomFooter>Online multiplayer</CustomFooter>
		</>
	);
}
