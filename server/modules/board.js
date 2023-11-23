export function getEmptyBoard() {
    const board = new Array(6);
    for (let y = 0; y < board.length; y++) {
        board[y] = new Array(7);
        for (let x = 0; x <= board.length; x++) {
            board[y][x] = null;
        }
    }
    return board;
}
