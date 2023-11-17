"use client"
import styles from "./board.module.css";
import type { Player } from "@/modules/board";

export type BoardClickEvent = CustomEvent<{row: number}>

function emitBoardClickEvent(row: number){
	const event: BoardClickEvent = new CustomEvent("boardClick", {detail: {row}})
	document.dispatchEvent(event);
}

function printBoard(board: Player[][]) {
	const boardPrint = [];


	for (let y = 0; y < board.length; y++) {
		for (let x = 0; x < board[y].length; x++) {
			const cell = board[y][x];
			boardPrint.push(
				<div
					className={`${styles.cell} ${
						cell === null
							? ""
							: cell === "red"
							? styles.red
							: styles.yellow
					}`}
					key={y + "-" + x}
					onClick={() => {emitBoardClickEvent(x)}}
				></div>
			);
		}
	}

	return boardPrint;
}

export default function Board({ board }: { board: Player[][] }) {
	const boardPrint = printBoard(board);

	return <div className={styles.board}>{boardPrint}</div>;
}
