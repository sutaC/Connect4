import WebSocket, { RawData, WebSocketServer } from "ws";
import { getEmptyBoard, playMove } from "$/lib/modules/game";
import * as db from "$/lib/db/db";

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

interface PlayerMoveWsEvent extends WsEvent {
    event: "playerMove";
    payload: {
        row: number;
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
    private gameCode: number | undefined;

    constructor(
        private socket: WebSocket,
        private clientId: number,
        private service: WsService
    ) {
        socket.on("close", () => {
            if (this.gameCode) db.deleteGame(this.gameCode);
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

        const game = await db.findGame(gameCode);

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

        this.gameCode = gameCode;

        let color: string;
        let oppId: number | null;

        if (game.userRed === null) {
            color = "red";
            db.updateGameUsers(gameCode, this.clientId, null);
            oppId = game.userYellow;
        } else {
            color = "yellow";
            db.updateGameUsers(gameCode, null, this.clientId);
            oppId = game.userRed;
        }

        this.socket.send(
            this.createWsEvent("userAuth", {
                status: "ok",
                color,
            })
        );

        this.socket.on("message", this.handlePlayerMoveEvent.bind(this));

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

    private async handlePlayerMoveEvent(event: RawData) {
        const wsEvent = JSON.parse(event.toString()) as PlayerMoveWsEvent;

        if (wsEvent.event !== "playerMove") return;

        if (!this.gameCode) return; // TODO: error handle

        const game = await db.findGame(this.gameCode);
        if (!game) return; // TODO: error handle

        const player = game.userRed === this.clientId ? "red" : "yellow";
        const opponent = this.service.findClient(
            (player === "red" ? game.userYellow : game.userRed) as number
        );
        if (!opponent) return; // TODO: error handle

        const board = playMove(game.board, wsEvent.payload.row, player);
        if (!board) return; // TODO: error handle

        db.updateGameBoard(this.gameCode, board);

        const boardUpdateEvent = this.createWsEvent("boardUpdate", {
            board,
            turn: player === "red" ? "yellow" : "red",
        });

        this.socket.send(boardUpdateEvent);
        opponent.send(boardUpdateEvent);
    }
}
