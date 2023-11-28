import { getEmptyBoard } from "./game.js";
import { findGame, updateGame } from "./db.js";

const clients = new Map();

// Func

function createWsEvent(event, data) {
    return JSON.stringify({ event, payload: data });
}

async function handleUserConnect(event, socket, userId) {
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

    const gameCode = wsEvent.payload.gameCode;
    if (typeof gameCode !== "number") {
        socket.send(
            createWsEvent("userAuth", {
                status: "error",
                msg: "Wrong game code provided",
            })
        );
        socket.close();
        return;
    }

    const game = await findGame(gameCode);

    if (!game) {
        socket.send(
            createWsEvent("userAuth", {
                status: "error",
                msg: "Game was not found",
            })
        );
        socket.close();
        return;
    }

    if (game.userRed !== null && game.userYellow !== null) {
        socket.send(
            createWsEvent("userAuth", {
                status: "error",
                msg: "Game is already active",
            })
        );
        socket.close();
        return;
    }

    let color;
    let oppId;

    if (game.userRed === null) {
        color = "red";
        updateGame(gameCode, userId, null);
        oppId = game.userYellow;
    } else {
        color = "yellow";
        updateGame(gameCode, null, userId);
        oppId = game.userRed;
    }

    socket.send(
        createWsEvent("userAuth", {
            status: "ok",
            color,
        })
    );

    if (!oppId) return
    
    const oppSocket = clients.get(oppId);

    if (!oppSocket) {
        socket.send(
            createWsEvent("userAuth", {
                status: "error",
                msg: "Opponent is not avaliable",
            })
        );
        socket.close();
        return;
    }

    socket.send(
        createWsEvent("boardUpdate", {
            board: getEmptyBoard(),
            turn: "red",
        })
    );

    oppSocket.send(
        createWsEvent("boardUpdate", {
            board: getEmptyBoard(),
            turn: "red",
        })
    )
}

export default function wsRouter(wss) {
    wss.on("connection", (socket) => {
        const userId = Date.now();
        clients.set(userId, socket);

        socket.once("message", (e) => {
            handleUserConnect(e, socket, userId);
        });

        socket.on("close", () => {
            clients.delete(userId);
        });
    });
}
