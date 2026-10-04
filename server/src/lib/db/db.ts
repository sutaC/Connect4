/*
 * This version of Connect4 relies solely on server memory for keeping game state, rather than MongoDB.
 */
import { Player, getEmptyBoard } from "../modules/game.js";

// --- Types ---

type GameStatus = "waiting" | "active";

interface Game {
    gameCode: number;
    gamePublic: boolean;
    userRed: number | null;
    userYellow: number | null;
    board: Player[][];
    status: GameStatus;
    lastTimeUsed: Date;
}

// --- "Database" ---
const db: Map<number, Game> = new Map();

// --- Functions ---

export async function createGame(
    gameCode: number,
    gamePublic: boolean,
): Promise<void> {
    const game: Game = Object.preventExtensions({
        gameCode,
        gamePublic,
        userRed: null,
        userYellow: null,
        board: getEmptyBoard(),
        status: "waiting",
        lastTimeUsed: new Date(),
    });
    db.set(game.gameCode, game);
}

export async function findPublicGame(): Promise<number | null> {
    for (const game of db.values()) {
        if (
            game.gamePublic &&
            (game.userRed === null || game.userYellow === null)
        )
            return game.gameCode;
    }
    return null;
}

export async function findGame(gameCode: number): Promise<Game | null> {
    return db.get(gameCode) ?? null;
}

export async function updateGameUsers(
    gameCode: number,
    userRed: number | null,
    userYellow: number | null,
): Promise<void> {
    const game = db.get(gameCode);
    if (!game) {
        console.error(`Game with code ${gameCode} not found.`);
        return;
    }
    if (userRed) {
        game.userRed = userRed;
    }
    if (userYellow) {
        game.userYellow = userYellow;
    }
}

export async function updateGameStatus(
    gameCode: number,
    status: GameStatus,
): Promise<void> {
    const game = db.get(gameCode);
    if (!game) {
        console.error(`Game with code ${gameCode} not found.`);
        return;
    }
    game.status = status;
}

export async function updateGameBoard(
    gameCode: number,
    board: Player[][],
): Promise<void> {
    const game = db.get(gameCode);
    if (!game) {
        console.error(`Game with code ${gameCode} not found.`);
        return;
    }
    game.board = board;
}

export async function deleteGame(gameCode: number): Promise<void> {
    db.delete(gameCode);
}

export async function deleteOldGames() {
    const toDelete: number[] = [];
    const treshold: Date = new Date(new Date().getTime() - 1000 * 60 * 60);
    for (const game of db.values()) {
        if (game.lastTimeUsed <= treshold) toDelete.push(game.gameCode);
    }
    for (const gCode of toDelete) db.delete(gCode);
}

export async function updateGameLTU(gameCode: number) {
    const game = db.get(gameCode);
    if (!game) {
        console.error(`Game with code ${gameCode} not found.`);
        return;
    }
    game.lastTimeUsed = new Date();
}
