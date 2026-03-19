import { deleteOldGames } from "./lib/db/db.js";

console.log("Starting cleanup...");

try {
    await deleteOldGames();
} catch (err) {
    console.error("Cleanup encountered an error: ", err);
}

console.log("Cleanup finished");
