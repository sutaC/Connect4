import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./modules/router.js";
import { WebSocketServer } from "ws";
import wsRouter from "./modules/wsRouter.js";

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

wsRouter(wss);

wss.on("connection", (socket) => {});

// Listen

app.listen(port, () => {
    console.log(`Listening on: http://localhost:${port}`);
});
