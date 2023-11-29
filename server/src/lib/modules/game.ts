export type Player = "red" | "yellow" | null;

export function getEmptyBoard(): Player[][] {
    const board = new Array(6);
    for (let y = 0; y < board.length; y++) {
        board[y] = new Array(7);
        for (let x = 0; x <= board.length; x++) {
            board[y][x] = null;
        }
    }
    return board;
}

export function playMove(
    board: Player[][],
    row: number,
    color: Player
): Player[][] | null {
    for (let i = 0; i < board.length; i++) {
        if (board[i][row] !== null) {
            if (i === 0) {
                return null;
            }
            board[i - 1][row] = color;
            return board;
        }
    }
    board[board.length - 1][row] = color;
    return board;
}
