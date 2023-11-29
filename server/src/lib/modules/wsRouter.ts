import WebSocket, { RawData, WebSocketServer } from "ws";
import { getEmptyBoard } from "$/lib/modules/game";
import { findGame, updateGame } from "$/lib/db/db";

// --- Types ---

interface WsEvent {
    event: string;
    payload: {};
}

interface UserConnectWsEvent extends WsEvent {
    event: "userConnect";
    payload: {
        gameCode: number;
    };
}

export default class WsService {
    private clients = new Map<number, WebSocket>();

    constructor(wss: WebSocketServer) {
        wss.on("connection", (socket: WebSocket) => {
            const clientId = Date.now();

            const client = new WsClient(socket, clientId, this);

            this.clients.set(clientId, socket);

            socket.on("close", () => {
                this.clients.delete(clientId);
            });
        });
    }

    public findClient(clientId: number): WebSocket | undefined {
        return this.clients.get(clientId);
    }
}

class WsClient {
    constructor(
        private socket: WebSocket,
        private clientId: number,
        private service: WsService
    ) {
        socket.on("close", () => {
            // TODO: handle db game user deletion
            // TODO: handle opponnet notification
        });

        socket.once("message", this.handleUserConnectEvent.bind(this));
    }

    // --- Methods ---

    private createWsEvent(event: string, data: {}): string {
        return JSON.stringify({ event, payload: data });
    }

    // --- Events ---

    private async handleUserConnectEvent(event: RawData) {
        const wsEvent = JSON.parse(event.toString()) as UserConnectWsEvent;

        if (wsEvent.event !== "userConnect") {
            this.socket.send(
                this.createWsEvent("userAuth", {
                    status: "error",
                    msg: "Recived wrong event",
                })
            );
            this.socket.close();
            return;
        }

        const gameCode = wsEvent.payload.gameCode;
        if (typeof gameCode !== "number") {
            this.socket.send(
                this.createWsEvent("userAuth", {
                    status: "error",
                    msg: "Wrong game code provided",
                })
            );
            this.socket.close();
            return;
        }

        const game = await findGame(gameCode);

        if (!game) {
            this.socket.send(
                this.createWsEvent("userAuth", {
                    status: "error",
                    msg: "Game was not found",
                })
            );
            this.socket.close();
            return;
        }

        if (game.userRed !== null && game.userYellow !== null) {
            this.socket.send(
                this.createWsEvent("userAuth", {
                    status: "error",
                    msg: "Game is already active",
                })
            );
            this.socket.close();
            return;
        }

        let color: string;
        let oppId: number | null;

        if (game.userRed === null) {
            color = "red";
            updateGame(gameCode, this.clientId, null);
            oppId = game.userYellow;
        } else {
            color = "yellow";
            updateGame(gameCode, null, this.clientId);
            oppId = game.userRed;
        }

        this.socket.send(
            this.createWsEvent("userAuth", {
                status: "ok",
                color,
            })
        );

        // TODO: add board update handler

        if (!oppId) return;

        const oppSocket = this.service.findClient(oppId);

        if (!oppSocket) {
            this.socket.send(
                this.createWsEvent("userAuth", {
                    status: "error",
                    msg: "Opponent is not avaliable",
                })
            );
            this.socket.close();
            return;
        }

        this.socket.send(
            this.createWsEvent("boardUpdate", {
                board: getEmptyBoard(),
                turn: "red",
            })
        );

        oppSocket.send(
            this.createWsEvent("boardUpdate", {
                board: getEmptyBoard(),
                turn: "red",
            })
        );
    }

    // TODO: board uopdate handler
}
