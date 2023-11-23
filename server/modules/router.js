import { Router } from "express";
import { createGame, findGame, findPublicGame } from "./db.js";

const router = new Router();

router.get("/api/game/join", (req, res) => {
    return res.sendStatus(400);
});

router.get("/api/game/join/:code", async (req, res) => {
    let code;

    try {
        code = Number(req.params.code);
    } catch (error) {
        return res.status(400).send();
    }
    if (!code) return res.status(400).send();

    const gameCode = await findGame(code);

    if (!gameCode) return res.status(404).send();

    return res.status(200).send();
});

router.post("/api/game/host", async (req, res) => {
    const data = req.body;
    const { gamePublic } = data;

    if (typeof gamePublic !== "boolean") return res.status(400).send();

    const gameCode = Date.now();
    await createGame(gameCode, gamePublic);

    const body = { code: gameCode };

    return res.send(JSON.stringify(body));
});

router.get("/api/game/find", async (req, res) => {
    const code = await findPublicGame();

    const body = { code };

    return res.send(JSON.stringify(body));
});

export default router;
