import { Player } from "./board";

interface WsEvent {
    event: string;
    payload: {};
}

interface WsEventBoardUpdate extends WsEvent {
    event: "boardUpdate";
    payload: {
        board: Player[][];
        turn: Player;
    };
}

interface WsEventAuthentication extends WsEvent {
    event: "userAuth";
    payload: {
        color: string;
    };
}

interface WsEventError extends WsEvent {
    event: "error";
    payload: {
        msg: string;
        critical?: boolean;
    };
}

interface WsEventGameEnd extends WsEvent {
    event: "gameEnd";
    payload: {
        result: Player;
    };
}

export default class WsControll {
    private socket: WebSocket;
    private gameCode: number;
    private authenticated: boolean = false;

    public onWsAutentication?: (color: Player) => any;
    public onBoardUpdate?: (board: Player[][], turn: Player) => any;
    public onWsError?: (msg: string, critical?: boolean) => any;
    public onGameEnd?: (result: Player) => any;

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
        this.socket.addEventListener("message", this.handleError.bind(this));
    }

    private handleUserInit(event: MessageEvent) {
        const wsEvent = this.getWsEvent(event) as WsEventAuthentication;

        if (wsEvent.event !== "userAuth") {
            if (!this.authenticated) {
                return console.warn(
                    "User was not authenticated but received: ",
                    wsEvent
                );
            }
            return;
        }

        this.authenticated = true;
        this.socket.removeEventListener(
            "message",
            this.handleUserInit.bind(this)
        );

        this.socket.addEventListener(
            "message",
            this.handleBoardUpdate.bind(this)
        );
        this.socket.addEventListener("message", this.handleGameEnd.bind(this));

        if (this.onWsAutentication)
            this.onWsAutentication(wsEvent.payload.color as Player);
    }

    private handleBoardUpdate(event: MessageEvent) {
        const wsEvent = this.getWsEvent(event) as WsEventBoardUpdate;
        if (wsEvent.event !== "boardUpdate") return;
        const { board, turn } = wsEvent.payload;
        if (this.onBoardUpdate) this.onBoardUpdate(board, turn);
    }

    private handleError(event: MessageEvent) {
        const wsEvent = this.getWsEvent(event) as WsEventError;
        if (wsEvent.event !== "error") return;
        const { msg, critical } = wsEvent.payload;
        if (this.onWsError) this.onWsError(msg, critical);
        else console.error(wsEvent);
    }

    private handleGameEnd(event: MessageEvent) {
        const wsEvent = this.getWsEvent(event) as WsEventGameEnd;
        if (wsEvent.event !== "gameEnd") return;
        const { result } = wsEvent.payload;
        if (this.onGameEnd) this.onGameEnd(result);
        else console.log(wsEvent);
    }

    // --- Sending events ---

    public sendPlayerMoveEvent(row: number): void {
        this.sendMessage("playerMove", { row });
    }

    public sendNewGameEvent(): void {
        this.sendMessage("newGame", {});
    }
}
