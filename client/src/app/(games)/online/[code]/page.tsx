"use client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import GamePage, { GameOverEvent } from "../../game";
import CustomFooter from "@/components/customFooter";
import CustomModal from "@/components/customModal";
import CustomButton from "@/components/customButton";
import { Player, getEmptyBoard, isMovePlayable } from "@/modules/board";
import WsControll from "@/modules/wsControll";
import { BoardClickEvent } from "@/components/board";

export default function Page() {
    const wsControllRef: MutableRefObject<WsControll | undefined> = useRef();
    let gameCode = 0;

    let board: Player[][] = getEmptyBoard();
    let turn: Player = null;
    let player: Player = null;

    const [boardView, setBoardView] = useState(board);
    const [turnMsg, setTurnMsg] = useState<string>(turn ?? "");
    const [modalOpen, setModalOpen] = useState(true);
    const [gameCodeView, setGameCodeView] = useState(gameCode);

    // --- Game init ---

    useEffect(() => {
        // Get gamecode
        try {
            const devider = location.pathname.lastIndexOf("/");
            gameCode = Number(location.pathname.substring(devider + 1));
            setGameCodeView(gameCode);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        // Get ws controll
        if (wsControllRef.current) return;

        try {
            const socket = new WebSocket("ws://localhost:3040");
            wsControllRef.current = new WsControll(socket, gameCode);
            wsControllRef.current.onWsAutentication = handleWsAthentication;
            wsControllRef.current.onBoardUpdate = handleBoardUpdate;
            wsControllRef.current.onWsError = handleWsError;
            wsControllRef.current.onGameEnd = handleGameEnd;
        } catch (error) {
            console.error(error);
        }
    }, []);

    const boardClickeventListener = (e: Event) => {
        handleBoardClick(e as BoardClickEvent);
    };
    useEffect(() => {
        document.removeEventListener("boardClick", boardClickeventListener);
        document.addEventListener("boardClick", boardClickeventListener);
    }, []);

    // --- Game actions ---

    function handleBoardClick(event: BoardClickEvent) {
        if (player !== turn || !player) return;

        const { row } = event.detail;

        if (!isMovePlayable(board, row)) return;

        wsControllRef.current?.sendPlayerMoveEvent(row);
    }

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
        wsControllRef.current?.sendNewGameEvent();

        setModalOpen(true);
    }

    function handleWsAthentication(color: Player) {
        player = color;
        console.log("User authenticated as: " + color);
    }

    function handleBoardUpdate(newBoard: Player[][], newTurn: Player) {
        if (modalOpen) setModalOpen(false);

        board = newBoard;
        setBoardView(board);

        turn = newTurn;
        setTurnMsg((player === turn && turn ? "your" : "enemy's") + " turn!");
    }

    function handleGameEnd(result: Player) {
        let gameOverEvent: GameOverEvent;
        if (result) {
            gameOverEvent = new CustomEvent("gameOver", {
                detail: { msg: `${result} won!` },
            });
        } else {
            gameOverEvent = new CustomEvent("gameOver", {
                detail: { msg: "Draw!" },
            });
        }
        document.dispatchEvent(gameOverEvent);
    }

    function handleWsError(msg: string, critical?: boolean) {
        if (critical) console.error("CRITICAL::" + msg);
        else console.warn(msg);
        // TODO: User gui
    }

    // --- Render ---
    return (
        <>
            <GamePage
                board={boardView}
                turnMsg={turnMsg}
                handleNewGame={handleNewGame}
                handleExit={handleExit}
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
