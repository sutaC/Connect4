export type Player = null | "red" | "yellow";

export function getEmptyBoard(): Player[][] {
	const board: Player[][] = new Array(6);
	for (let y = 0; y < board.length; y++) {
		board[y] = new Array(7);
		for (let x = 0; x <= board.length; x++) {
			board[y][x] = null;
		}
	}
	return board;
}
