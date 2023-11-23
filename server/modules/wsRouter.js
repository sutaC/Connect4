import { getEmptyBoard } from "./board.js";

const clients = new Map();

// Func

function createWsEvent(event, data) {
    return JSON.stringify({ event, payload: data });
}

function handleUserConnect(event, socket) {
    const wsEvent = JSON.parse(event);

    if (wsEvent.event !== "userConnect") {
        socket.send(
            createWsEvent("userAuth", {
                status: "error",
                msg: "Recived wrong event",
            })
        );
        socket.close();
        return;
    }

    // TODO: Check user data
    socket.send(createWsEvent("userAuth", { status: "ready", color: "red" }));
    socket.send(
        createWsEvent("boardUpdate", { board: getEmptyBoard(), turn: "red" })
    );
}

export default function wsRouter(wss) {
    wss.on("connection", (socket) => {
        const userId = Date.now();
        clients.set(userId, socket);

        socket.once("message", (e) => {
            handleUserConnect(e, socket);
        });

        socket.on("close", () => {
            clients.delete(userId);
        });
    });
}
