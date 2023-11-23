"use client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import GamePage from "../../game";
import CustomFooter from "@/components/customFooter";
import CustomModal from "@/components/customModal";
import CustomButton from "@/components/customButton";
import { Player, getEmptyBoard } from "@/modules/board";
import { handleWsInit, wsSendUserConnect } from "@/modules/wsControll";

export default function Page() {
    let board: Player[][] = getEmptyBoard();
    let turn: Player = null;
    let player: Player = null;

    const [boardView, setBoardView] = useState(board);
    const [turnMsg, setTurnMsg] = useState<string>(turn ?? "");
    const [modalOpen, setModalOpen] = useState(true);

    let gameCode = 0;
    const [gameCodeView, setGameCodeView] = useState(gameCode);
    const socketRef: MutableRefObject<WebSocket | undefined> = useRef();

    // --- Game init ---
    function getGameCode() {
        try {
            gameCode = Number(
                location.pathname.substring(location.pathname.length - 8)
            );
            setGameCodeView(gameCode);
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(getGameCode, []);

    function connectionSucced(color: Player) {
        player = color;
        setModalOpen(false);
    }

    function handleWebsocket() {
        if (socketRef.current) return;

        socketRef.current = new WebSocket("ws://localhost:3040");

        socketRef.current.addEventListener("open", () => {
            if (!socketRef.current) return;

            wsSendUserConnect(socketRef.current, {
                gameCode,
            });

            const initLister = (event: MessageEvent) => {
                if (socketRef.current)
                    handleWsInit(
                        event,
                        socketRef.current,
                        initLister,
                        handleBoardUpdate,
                        connectionSucced
                    );
            };

            socketRef.current.addEventListener("message", initLister);
        });
    }
    useEffect(handleWebsocket, []);

    // --- App ---
    function handleExit() {
        if (
            confirm(
                "Are you sure you want to exit game? It will be lost forever!"
            )
        ) {
            location.href = "/";
        }
    }

    function handleNewGame() {
        board = getEmptyBoard();
        setBoardView(board);
    }

    function handleBoardUpdate(newBoard: Player[][], newTurn: Player) {
        board = newBoard;
        setBoardView(board);
        turn = newTurn;
        setTurnMsg((player === turn ? "your" : "enemy's") + " turn!");
    }

    // --- Render ---
    return (
        <>
            <GamePage
                board={boardView}
                turnMsg={turnMsg}
                handleNewGame={handleNewGame}
            ></GamePage>
            <CustomModal open={modalOpen}>
                <h2>Waiting for other player...</h2>
                <div>
                    <small>Game code:</small>
                    <p className="highlight">{gameCodeView ?? ""}</p>
                </div>
                <div onClick={handleExit}>
                    <CustomButton>Exit</CustomButton>
                </div>
            </CustomModal>
            <CustomFooter>Online multiplayer</CustomFooter>
        </>
    );
}
