import { Player } from "./board";

interface WsEvent {
    event: string;
    payload: {};
}

interface WsEventBoardUpdate extends WsEvent {
    payload: {
        board: Player[][];
        turn: Player;
    };
}

interface WsEventAuthentication extends WsEvent {
    payload: {
        status: "ok" | "error";
        msg?: string;
        color?: string;
    };
}

export default class WsControll {
    private socket: WebSocket;
    private gameCode: number;
    private authenticated: boolean = false;

    public onWsAutentication?: (color: Player) => any;
    public onBoardUpdate?: (board: Player[][], turn: Player) => any;

    constructor(socket: WebSocket, gameCode: number) {
        this.socket = socket;
        this.gameCode = gameCode;

        this.socket.addEventListener("open", this.handleWsOpen.bind(this));
    }

    // --- Methods ---

    private getWsEvent(event: MessageEvent): WsEvent {
        return JSON.parse(event.data);
    }

    private sendMessage(event: string, data: {}) {
        const wsEvent: WsEvent = {
            event,
            payload: data,
        };

        this.socket.send(JSON.stringify(wsEvent));
    }

    // --- Receiving events ---

    private handleWsOpen() {
        const data = {
            gameCode: this.gameCode,
        };

        this.sendMessage("userConnect", data);

        this.socket.addEventListener("message", this.handleUserInit.bind(this));
    }

    private handleUserInit(event: MessageEvent) {
        const wsEvent = this.getWsEvent(event) as WsEventAuthentication;

        if (wsEvent.event !== "userAuth") {
            if (!this.authenticated) {
                return console.warn(
                    "User was not authenticated and recived: ",
                    wsEvent
                );
            }
            return;
        }

        if (wsEvent.payload.status === "ok") {
            this.authenticated = true;
            this.socket.removeEventListener(
                "message",
                this.handleUserInit.bind(this)
            );

            this.socket.addEventListener(
                "message",
                this.handleBoardUpdate.bind(this)
            );

            if (this.onWsAutentication)
                this.onWsAutentication(wsEvent.payload.color as Player);
        } else {
            console.error("Couldn't initialize user", wsEvent.payload.msg);
        }
    }

    private handleBoardUpdate(event: MessageEvent) {
        const wsEvent = this.getWsEvent(event) as WsEventBoardUpdate;
        if (wsEvent.event !== "boardUpdate") return;
        const { board, turn } = wsEvent.payload;
        if (this.onBoardUpdate) this.onBoardUpdate(board, turn);
    }

    // --- Sending events ---

    public sendPlayerMoveEvent(row: number): void {
        this.sendMessage("playerMove", { row });
    }
}
