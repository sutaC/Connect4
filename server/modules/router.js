import { Router } from "express";
import { createEvent } from "./eventStream.js";

const router = new Router();

router.get("/api/online", (req, res) => {
    const headers = {
        "Cache-Control": "no-store",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream",
    };
    res.writeHead(200, headers);

    res.write(createEvent("hello", { msg: "hello" }));

    setTimeout(() => {
        res.write(createEvent("hello", { msg: "hello2" }));
    }, 2000);

    setTimeout(() => {
        res.write(createEvent("hello", { msg: "hello3" }));
    }, 10000);

    return;
});

export default router;
