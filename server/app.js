import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./modules/router.js";
import { WebSocketServer } from "ws";

const port = process.env.PORT ?? 3001;
const wsport = process.env.WSPORT ?? 3002;

// APP

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use(router);

// WS

const wss = new WebSocketServer({ port: wsport });

wss.on("connection", (socket) => {
    console.log("New user connected");

    socket.send("hello");

    socket.on("close", () => {
        console.log("User disconnected");
    });
});

// Listen

app.listen(port, () => {
    console.log(`Listening on: http://localhost:${port}`);
});
