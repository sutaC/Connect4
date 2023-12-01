import { Player, checkDraw, getEmptyBoard, playMove } from "./board";

function splitArray<T>(array: T[], devider: T): T[][] {
    const result: T[][] = [];
    let segment: T[] = [];
    for (let i = 0; i < array.length; i++) {
        const val = array[i];
        if (val === devider) {
            if (segment.length === 0) continue;
            result.push(segment);
            segment = [];
            continue;
        }
        segment.push(val);
    }
    return result;
}

function evalLine(
    board: Player[][],
    y: number,
    x: number,
    move: (y: number, x: number) => { nY: number; nX: number }
): number {
    if (y < 0 || x < 0 || x >= board[0].length || y >= board.length) {
        throw new Error("Y or X out of scope");
    }

    const line: Player[] = [];

    while (true) {
        line.push(board[y][x]);
        const { nY, nX } = move(y, x);

        if (nY < 0 || nX < 0 || nX >= board[0].length || nY >= board.length) {
            break;
        }
        y = nY;
        x = nX;
    }

    if (!line.find((v) => v !== null)) return 0;

    const threadsR = splitArray(line, "yellow") as Player[][];
    const threadsY = splitArray(line, "red") as Player[][];

    let eva = 0;

    threadsR.forEach((thread) => {
        if (thread.length >= 4) {
            const filled = thread.filter((v) => v !== null).length;
            if (filled >= 4) return 1000;
            eva += filled * filled;
        }
    });

    threadsY.forEach((thread) => {
        if (thread.length >= 4) {
            const filled = thread.filter((v) => v !== null).length;
            if (filled >= 4) return -1000;
            eva -= filled * filled;
        }
    });

    return eva;
}

function evaluateGame(board: Player[][]): number {
    if (checkDraw(board)) return 0;

    let eva = 0;

    // Horizontal
    for (let y = 0; y < board.length; y++) {
        eva += evalLine(board, y, 0, (y, x) => {
            return { nY: y, nX: x + 1 };
        });
    }

    // Vertical
    for (let x = 0; x < board[0].length; x++) {
        eva += evalLine(board, 0, x, (y, x) => {
            return { nY: y + 1, nX: x };
        });
    }

    // Diagonals
    for (let x = 0; x < board[0].length; x++) {
        // DownRight
        eva += evalLine(board, 0, x, (y, x) => {
            return { nY: y + 1, nX: x + 1 };
        });
        // DownLeft
        eva += evalLine(board, 0, x, (y, x) => {
            return { nY: y + 1, nX: x - 1 };
        });
    }

    for (let x = 0; x < board[0].length; x++) {
        // UpRight
        eva += evalLine(board, board.length - 1, x, (y, x) => {
            return { nY: y - 1, nX: x + 1 };
        });
        // UpLeft
        eva += evalLine(board, board.length - 1, x, (y, x) => {
            return { nY: y - 1, nX: x - 1 };
        });
    }

    return eva;
}

function getAllPossibleMoves(board: Player[][], color: Player): Player[][][] {
    const moves: Player[][][] = [];

    for (let i = 0; i < board[0].length; i++) {
        const newBoard = structuredClone(board);
        const move = playMove(newBoard, i, color);
        if (!move) continue;
        moves.push(move);
    }

    return moves;
}

type EvalMove = {
    eva: number;
    move: Player[][];
};

function mimx(
    board: Player[][],
    color: Player,
    alpha: number,
    beta: number,
    depth: number
): EvalMove {
    if (depth <= 0) {
        const moves = getAllPossibleMoves(board, color);

        if (color === "red") {
            let maxEval = -Infinity;
            let bestMove = getEmptyBoard();

            for (let i = 0; i < moves.length; i++) {
                const eva = evaluateGame(moves[i]);
                if (maxEval < eva) {
                    maxEval = eva;
                    bestMove = moves[i];
                }
            }
            return { eva: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            let bestMove = getEmptyBoard();

            for (let i = 0; i < moves.length; i++) {
                const eva = evaluateGame(moves[i]);
                if (minEval > eva) {
                    minEval = eva;
                    bestMove = moves[i];
                }
            }
            return { eva: minEval, move: bestMove };
        }
    }

    // Recusion

    const moves = getAllPossibleMoves(board, color);
    const opp = color === "red" ? "yellow" : "red";

    if (color === "red") {
        let maxEval = -Infinity;
        let bestMove = getEmptyBoard();

        for (let i = 0; i < moves.length; i++) {
            const eva = mimx(moves[i], opp, alpha, beta, depth - 1).eva;
            if (maxEval < eva) {
                maxEval = eva;
                bestMove = moves[i];
            }
            alpha = Math.max(alpha, eva);
            if (beta < alpha) break;
        }
        return { eva: maxEval, move: bestMove };
    } else {
        let minEval = Infinity;
        let bestMove = getEmptyBoard();

        for (let i = 0; i < moves.length; i++) {
            const eva = mimx(moves[i], opp, alpha, beta, depth - 1).eva;
            if (minEval > eva) {
                minEval = eva;
                bestMove = moves[i];
            }
            beta = Math.min(beta, eva);
            if (beta < alpha) break;
        }
        return { eva: minEval, move: bestMove };
    }
}

function minimax(board: Player[][], color: Player, depth: number) {
    return mimx(board, color, -Infinity, Infinity, depth).move;
}

export default function playAIMove(
    board: Player[][],
    color: Player
): Player[][] {
    return minimax(board, color, 3);
}
