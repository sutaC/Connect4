import { deleteOldGames } from "./db.js";

export default function configDbCleaner(frequency: number = 3_600_000): void {
    setInterval(deleteOldGames, frequency);
}
