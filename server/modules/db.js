import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URL);

export async function connect() {
    try {
        await client.connect();
        await client
            .db()
            .collection("games")
            .insertOne({ gameCode: 12345678, userRed: 1234, userYellow: null });
        const result = await client.db().collection("games").find().toArray();
        console.log(result);
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
