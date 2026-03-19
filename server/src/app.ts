import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import router from "./lib/modules/router.js";
import WsService from "./lib/modules/wsService.js";

const httpport = 3010;
const wsport = 3020;

// APP

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use(router);

// WS

const wss = new WebSocketServer({ port: wsport });

wss.once("listening", () => {
    console.log(`Listening on: ws://localhost:${wsport}`);
});

const wsService = new WsService(wss);

// HTTP

app.listen(httpport, () => {
    console.log(`Listening on: http://localhost:${httpport}`);
});
