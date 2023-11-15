import styles from "./board.module.css";

export type Player = "" | "red" | "yellow";

export default function Board({ board }: { board: Player[][] }) {
	return (
		<div className={styles.board}>
			{board.map((row, y) =>
				row.map((cell, x) => (
					<div className={cell} key={y + "-" + x}>
						{cell.length === 0 ? "none" : cell}
					</div>
				))
			)}
		</div>
	);
}
