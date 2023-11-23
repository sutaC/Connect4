import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URL);

export async function createGame(gameCode, gamePublic) {
    if (typeof gameCode !== "number")
        throw new Error(
            "gameCode expected type was number got " + typeof gameCode
        );
    if (typeof gamePublic !== "boolean")
        throw new Error(
            "gameCode expected type was boolean got " + typeof gameCode
        );

    try {
        await client.connect();
        await client.db().collection("games").insertOne({
            gameCode,
            gamePublic,
            userRed: null,
            userYellow: null,
        });
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

export async function findPublicGame() {
    try {
        await client.connect();
        const game = await client
            .db()
            .collection("games")
            .findOne({
                gamePublic: true,
                $or: [{ userRed: null }, { userYellow: null }],
            });

        return game.gameCode;
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

export async function findGame(gameCode) {
    if (typeof gameCode !== "number")
        throw new Error(
            "gameCode expected type was number got " + typeof gameCode
        );

    try {
        await client.connect();
        const game = await client
            .db()
            .collection("games")
            .findOne({
                gameCode,
                $or: [{ userRed: null }, { userYellow: null }],
            });
        return game.gameCode;
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
