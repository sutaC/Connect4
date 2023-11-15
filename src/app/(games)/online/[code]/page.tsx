"use client";
import { useState } from "react";
import { Player } from "@/components/board";
import GamePage from "../../game";
import CustomFooter from "@/components/customFooter";
import CustomModal from "@/components/customModal";
import CustomButton from "@/components/customButton";

export default function Page() {
	const [modalOpen, setModalOpen] = useState(true);
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
				turnMsg='Your turn!'
				handleExit={handleExit}
				handleNewGame={handleNewGame}
			></GamePage>
			<CustomModal open={modalOpen}>
				<h2>Waiting for other player...</h2>
				<small>Game code:</small>
				<p className='highlight'>01234567</p>
				<div onClick={handleExit}>
					<CustomButton>Exit</CustomButton>
				</div>
			</CustomModal>
			<CustomFooter>Local multiplayer</CustomFooter>
		</>
	);
}
