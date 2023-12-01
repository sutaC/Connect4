import { MongoClient } from "mongodb";
import { Player, getEmptyBoard } from "../modules/game";

// --- Init ---
if (!process.env.MONGODB_URL) throw new Error("Could not find database url");

const client = new MongoClient(process.env.MONGODB_URL);

// --- Types ---

interface Game {
    gameCode: number;
    gamePublic: boolean;
    userRed: number | null;
    userYellow: number | null;
    board: Player[][];
}

// --- Functions ---

export async function createGame(
    gameCode: number,
    gamePublic: boolean
): Promise<void> {
    try {
        await client.connect();
        await client
            .db()
            .collection("games")
            .insertOne({
                gameCode,
                gamePublic,
                userRed: null,
                userYellow: null,
                board: getEmptyBoard(),
            } as Game);
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

export async function findPublicGame(): Promise<number | null> {
    try {
        await client.connect();
        const game = (await client
            .db()
            .collection("games")
            .findOne({
                gamePublic: true,
                $or: [{ userRed: null }, { userYellow: null }],
            })) as Game | null;

        return game ? game.gameCode : null;
    } catch (error) {
        console.error(error);
        return null;
    } finally {
        await client.close();
    }
    return null;
}

export async function findGame(gameCode: number): Promise<Game | null> {
    try {
        await client.connect();
        const game = (await client.db().collection("games").findOne({
            gameCode,
        })) as Game | null;
        return game;
    } catch (error) {
        console.error(error);
        return null;
    } finally {
        await client.close();
    }
}

export async function updateGameUsers(
    gameCode: number,
    userRed: number | null,
    userYellow: number | null
): Promise<void> {
    await client.connect();
    try {
        if (userRed) {
            await client.db().collection("games").updateOne(
                { gameCode },
                {
                    $set: {
                        userRed,
                    },
                }
            );
        }
        if (userYellow) {
            await client.db().collection("games").updateOne(
                { gameCode },
                {
                    $set: {
                        userYellow,
                    },
                }
            );
        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

export async function updateGameBoard(
    gameCode: number,
    board: Player[][]
): Promise<void> {
    await client.connect();
    try {
        await client.db().collection("games").updateOne(
            { gameCode },
            {
                $set: {
                    board,
                },
            }
        );
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

export async function deleteGame(gameCode: number): Promise<void> {
    await client.connect();
    try {
        await client.db().collection("games").deleteOne({ gameCode });
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
