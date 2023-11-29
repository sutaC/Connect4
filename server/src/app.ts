import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import router from "$/lib/modules/router";
import WsService from "$/lib/modules/wsRouter";

const port = Number(process.env.PORT) ?? 3001;
const wsport = Number(process.env.WSPORT) ?? 3002;

// APP

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use(router);

// WS

const wss = new WebSocketServer({ port: wsport });
const wsService = new WsService(wss);

// Listen

app.listen(port, () => {
    console.log(`Listening on: http://localhost:${port}`);
});
