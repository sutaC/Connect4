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

function getWsEvent(event: MessageEvent): WsEvent {
    return JSON.parse(event.data);
}

// Func

export function wsSendUserConnect(
    socket: WebSocket,
    data: { gameCode: number }
) {
    const userConnectEvent: WsEvent = {
        event: "userConnect",
        payload: data,
    };

    socket.send(JSON.stringify(userConnectEvent));
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
    listener: (event: MessageEvent) => void,
    handleBoardUpdate: (board: Player[][], turn: Player) => void,
    succesCb?: (color: Player) => void
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
