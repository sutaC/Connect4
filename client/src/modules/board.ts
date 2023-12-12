import { GameOverEvent } from "@/app/(games)/game";

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

export function isMovePlayable(board: Player[][], row: number): boolean {
    if (row < 0 || row >= board[0].length) return false;

    for (let y = 0; y < board.length; y++) {
        if (board[y][row] === null) return true;
    }

    return false;
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

function checkDiagonal(
    board: Player[][],
    y: number,
    x: number,
    move: (y: number, x: number) => { nY: number; nX: number }
): boolean {
    let count = 0;

    while (y < board.length && x < board[0].length && y >= 0 && x >= 0) {
        const { nY, nX } = move(y, x);

        if (nY < 0 || nX < 0 || nX >= board[0].length || nY >= board.length)
            return false;

        count =
            board[y][x] === board[nY][nX] && board[y][x] !== null
                ? count + 1
                : 0;

        if (count >= 3) return true;

        y = nY;
        x = nX;
    }

    return false;
}

export function checkDraw(board: Player[][]): boolean {
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            if (board[y][x] === null) {
                return false;
            }
        }
    }
    return true;
}

export function checkGameOver(board: Player[][]): boolean {
    {
        let countX = 0;

        for (let y = 0; y < board.length; y++) {
            for (let x = 1; x < board[0].length; x++) {
                countX =
                    board[y][x] === board[y][x - 1] && board[y][x] !== null
                        ? countX + 1
                        : 0;
                if (countX >= 3) return true;
            }
        }
    }

    {
        let countY = 0;

        for (let x = 0; x < board[0].length; x++) {
            for (let y = 1; y < board.length; y++) {
                countY =
                    board[y][x] === board[y - 1][x] && board[y][x] !== null
                        ? countY + 1
                        : 0;
                if (countY >= 3) return true;
            }
        }
    }

    {
        // Diagonals
        for (let x = 0; x < board[0].length; x++) {
            // DownRight
            const diagDR = checkDiagonal(board, 0, x, (y, x) => {
                return { nY: y + 1, nX: x + 1 };
            });
            if (diagDR) return true;

            // DownLeft
            const diagDL = checkDiagonal(board, 0, x, (y, x) => {
                return { nY: y + 1, nX: x - 1 };
            });
            if (diagDL) return true;
        }

        for (let x = 0; x < board[0].length; x++) {
            // UpRight
            const diagUR = checkDiagonal(board, board.length - 1, x, (y, x) => {
                return { nY: y - 1, nX: x + 1 };
            });
            if (diagUR) return true;

            // UpLeft
            const diagUL = checkDiagonal(board, board.length - 1, x, (y, x) => {
                return { nY: y - 1, nX: x - 1 };
            });
            if (diagUL) return true;
        }
    }

    return false;
}

export function checkGameState(
    board: Player[][],
    playerMsg: string,
    document: Document
): boolean {
    const gameOver = checkGameOver(board);
    if (gameOver) {
        const gameOverEvent: GameOverEvent = new CustomEvent("gameOver", {
            detail: { msg: `${playerMsg} won!` },
        });
        document.dispatchEvent(gameOverEvent);
        return true;
    }

    const draw = checkDraw(board);
    if (draw) {
        const gameOverEvent: GameOverEvent = new CustomEvent("gameOver", {
            detail: { msg: "Draw!" },
        });
        document.dispatchEvent(gameOverEvent);
        return true;
    }

    return false;
}
