import WebSocket, { RawData, WebSocketServer } from "ws";
import {
    checkDraw,
    checkGameOver,
    getEmptyBoard,
    playMove,
} from "$/lib/modules/game";
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
        socket.on("close", async () => {
            if (!this.gameCode) return;

            const game = await db.findGame(this.gameCode);
            if (!game) return;
            await db.deleteGame(this.gameCode);

            const oppId =
                this.clientId === game.userRed ? game.userYellow : game.userRed;
            if (!oppId) return;

            const opponent = this.service.findClient(oppId);
            if (!opponent) return;

            opponent.send(
                this.createWsEvent("error", {
                    msg: "Opponent disconnected",
                    critical: true,
                })
            );
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
                this.createWsEvent("error", {
                    msg: "Recived wrong event",
                    critical: true,
                })
            );
            this.socket.close();
            return;
        }

        const gameCode = wsEvent.payload.gameCode;
        if (typeof gameCode !== "number") {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: "Wrong game code provided",
                    critical: true,
                })
            );
            this.socket.close();
            return;
        }

        const game = await db.findGame(gameCode);

        if (!game) {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: "Game was not found",
                    critical: true,
                })
            );
            this.socket.close();
            return;
        }

        if (game.userRed !== null && game.userYellow !== null) {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: "Game is already active",
                    critical: true,
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
            await db.updateGameUsers(gameCode, this.clientId, null);
            oppId = game.userYellow;
        } else {
            color = "yellow";
            await db.updateGameUsers(gameCode, null, this.clientId);
            oppId = game.userRed;
        }

        this.socket.send(
            this.createWsEvent("userAuth", {
                color,
            })
        );

        this.socket.on("message", this.handlePlayerMoveEvent.bind(this));

        if (!oppId) return;

        const oppSocket = this.service.findClient(oppId);

        if (!oppSocket) {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: "Opponent is not avaliable",
                    critical: true,
                })
            );
            this.socket.close();
            return;
        }

        await db.updateGameStatus(gameCode, "active");

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

        if (!this.gameCode) {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: "Cannot acces gamecode on server",
                })
            );
            return;
        }

        const game = await db.findGame(this.gameCode);
        if (!game) {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: `Cannot find game with gamecode ${this.gameCode}`,
                    critical: true,
                })
            );
            this.socket.close();
            return;
        }

        const player = game.userRed === this.clientId ? "red" : "yellow";
        const opponent = this.service.findClient(
            (player === "red" ? game.userYellow : game.userRed) as number
        );
        if (!opponent) {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: "Opponent is not avaliable",
                    critical: true,
                })
            );
            this.socket.close();
            return;
        }

        const board = playMove(game.board, wsEvent.payload.row, player);
        if (!board) {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: "Player cannot play that move",
                })
            );
            return;
        }

        await db.updateGameBoard(this.gameCode, board);

        const boardUpdateEvent = this.createWsEvent("boardUpdate", {
            board,
            turn: player === "red" ? "yellow" : "red",
        });

        this.socket.send(boardUpdateEvent);
        opponent.send(boardUpdateEvent);

        let gameEndEvent;
        if (checkDraw(board)) {
            gameEndEvent = this.createWsEvent("gameEnd", {
                result: null,
            });
        } else if (checkGameOver(board)) {
            gameEndEvent = this.createWsEvent("gameEnd", {
                result: player,
            });
        }

        if (gameEndEvent) {
            this.socket.send(gameEndEvent);
            opponent.send(gameEndEvent);

            this.socket.once("message", this.handleNewGame.bind(this));
            opponent.once("message", this.handleNewGame.bind(this));
        }
    }

    private async handleNewGame(event: RawData) {
        const wsEvent = JSON.parse(event.toString()) as WsEvent;

        if (wsEvent.event !== "newGame") return;

        if (!this.gameCode) {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: "Cannot acces gamecode on server",
                })
            );
            return;
        }

        const game = await db.findGame(this.gameCode);
        if (!game) {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: `Cannot find game with gamecode ${this.gameCode}`,
                    critical: true,
                })
            );
            this.socket.close();
            return;
        }

        const opponent = this.service.findClient(
            (this.clientId === game.userRed
                ? game.userYellow
                : game.userRed) as number
        );
        if (!opponent) {
            this.socket.send(
                this.createWsEvent("error", {
                    msg: "Opponent is not avaliable",
                    critical: true,
                })
            );
            this.socket.close();
            return;
        }

        if (game.status === "active") {
            await db.updateGameStatus(this.gameCode, "waiting");
            return;
        }

        const board = getEmptyBoard();

        await db.updateGameLTU(this.gameCode);
        await db.updateGameStatus(this.gameCode, "active");
        await db.updateGameBoard(this.gameCode, board);

        this.socket.send(
            this.createWsEvent("boardUpdate", {
                board,
                turn: "red",
            })
        );

        opponent.send(
            this.createWsEvent("boardUpdate", {
                board,
                turn: "red",
            })
        );
    }
}
