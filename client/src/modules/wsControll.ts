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

interface WsEventInit extends WsEvent {
    payload: {
        status: "ready" | "waiting" | "error";
        msg?: string;
        color?: string;
    };
}

export default class WsControll {

    private socket: WebSocket;

    public onBoardUpdate?: (board: Player[][], turn: Player) => void;

    constructor(socket: WebSocket, gameCode: number){
        this.socket = socket;

        this.sendMessage(this.socket, "userConnect", {gameCode})

        socket.addEventListener("open", handleWsInit)

    }

    public getWsEvent(event: MessageEvent): WsEvent {
        return JSON.parse(event.data);
    }
    
    // ---
    
    public sendMessage(
        socket: WebSocket,
        event: string,
        data: {}
    ) {
        const userConnectEvent: WsEvent = {
            event,
            payload: data,
        };
        socket.send(JSON.stringify(userConnectEvent));
    }

    // ---

    private handleWsOpen(
        event: MessageEvent,
        socket: WebSocket,
    ) {
        const wsEvent = getWsEvent(event) as WsEventInit;
        if (wsEvent.event !== "userAuth") {
            return;
        }
    
        switch (wsEvent.payload.status) {
            case "error":
                console.error("Couldn't initialize user", wsEvent.payload.msg);
                return;
            case "waiting":
                console.warn("Waiting for other player", wsEvent.payload.msg);
                return;
            case "ready":
                socket.removeEventListener("message", listener);
                socket.addEventListener("message", (event) => {
                    handleWsBoardUpdate(event, handleBoardUpdate);
                });
                if (succesCb) succesCb((wsEvent.payload.color ?? null) as Player);
        }
    }
    


}


function handleWsBoardUpdate(
    event: MessageEvent,
    handleBoardUpdate: (board: Player[][], turn: Player) => void
) {
    const wsEvent = getWsEvent(event) as WsEventBoardUpdate;
    const { board, turn } = wsEvent.payload;
    handleBoardUpdate(board, turn);
}

export function handleWsInit(
    event: MessageEvent,
    socket: WebSocket,
) {
    const wsEvent = getWsEvent(event) as WsEventInit;
    if (wsEvent.event !== "userAuth") {
        return;
    }

    switch (wsEvent.payload.status) {
        case "error":
            console.error("Couldn't initialize user", wsEvent.payload.msg);
            return;
        case "waiting":
            console.warn("Waiting for other player", wsEvent.payload.msg);
            return;
        case "ready":
            socket.removeEventListener("message", listener);
            socket.addEventListener("message", (event) => {
                handleWsBoardUpdate(event, handleBoardUpdate);
            });
            if (succesCb) succesCb((wsEvent.payload.color ?? null) as Player);
    }
}
