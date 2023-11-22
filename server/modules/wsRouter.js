function createWsEvent(event, data) {
    return JSON.stringify({ event, payload: data });
}

function getEmptyBoard() {
    const board = new Array(6);
    for (let y = 0; y < board.length; y++) {
        board[y] = new Array(7);
        for (let x = 0; x <= board.length; x++) {
            board[y][x] = null;
        }
    }
    return board;
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
    socket.send(createWsEvent("userAuth", { status: "ready" }));
    socket.send(
        createWsEvent("boardUpdate", { board: getEmptyBoard(), turn: "red" })
    );
}

export default function wsRouter(wss) {
    wss.on("connection", (socket) => {
        console.log("New user connected");

        socket.once("message", (e) => {
            handleUserConnect(e, socket);
        });

        socket.on("close", () => {
            console.log("User disconnected");
        });
    });
}
