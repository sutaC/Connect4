import styles from "./board.module.css";
import type { Player } from "@/modules/board";

export default function Board({ board }: { board: Player[][] }) {
	board[0][0] = "yellow";
	board[5][5] = "red";

	return (
		<div className={styles.board}>
			{board.map((row, y) =>
				row.map((cell, x) => (
					<div
						className={`${styles.cell} ${
							cell === null
								? ""
								: cell === "red"
								? styles.red
								: styles.yellow
						}`}
						key={y + "-" + x}
					></div>
				))
			)}
		</div>
	);
}
