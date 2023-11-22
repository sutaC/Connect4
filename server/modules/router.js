import { Router } from "express";

const router = new Router();

router.get("/api/game/join", (req, res) => {
    return res.sendStatus(400);
});

router.get("/api/game/join/:code", (req, res) => {
    let code;

    try {
        code = Number(req.params.code);
    } catch (error) {
        return res.status(400).send();
    }
    if (!code) return res.status(400).send();

    // TODO: Check if code exist

    return res.status(200).send();
});

router.post("/api/game/host", (req, res) => {
    const data = req.body;
    const { gamePublic } = data;

    if (gamePublic === undefined) return res.status(400).send();

    // TODO: Create game
    const body = { code: 12345678 };

    return res.send(JSON.stringify(body));
});

router.get("/api/game/find", (req, res) => {
    // TODO: Find game
    const body = { code: 12345678 };

    return res.send(JSON.stringify(body));
});

export default router;
