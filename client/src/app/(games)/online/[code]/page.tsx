"use client";
import styles from "./page.module.css";
import CustomFooter from "@/components/customFooter";
import CustomModal from "@/components/customModal";
import CustomButton from "@/components/customButton";
import WsControll from "@/modules/wsControll";
import GamePage, { GameOverEvent } from "../../game";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Player, getEmptyBoard, isMovePlayable } from "@/modules/board";
import { BoardClickEvent } from "@/components/board";

export default function Page() {
    const wsControllRef: MutableRefObject<WsControll | undefined> = useRef();
    let gameCode = 0;

    let player: Player = null;
    let board: Player[][] = getEmptyBoard();
    let turn: Player = null;

    const [playerMsg, setPlayerMsg] = useState<Player>(null);

    const [boardView, setBoardView] = useState(board);
    const [turnMsg, setTurnMsg] = useState<string>(turn ?? "");

    const [modalWaitingOpen, setModalWaitingOpen] = useState(true);
    const [modalErrorOpen, setModalErrorOpen] = useState(false);

    const [gameCodeView, setGameCodeView] = useState(gameCode);
    const [errorMsg, setErrorMsg] = useState("Unknown");

    const refCopied = useRef<HTMLDialogElement>(null);

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
            const socket = new WebSocket("wss://connect4.sutac.pl/server/ws");
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

        setModalWaitingOpen(true);
    }

    function handleWsAthentication(color: Player) {
        player = color;
        setPlayerMsg(player);
        console.log("User authenticated as: " + color);
    }

    function handleBoardUpdate(newBoard: Player[][], newTurn: Player) {
        if (modalWaitingOpen) setModalWaitingOpen(false);

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
        if (!critical) {
            console.warn(msg);
            return;
        }

        console.error("CRITICAL::" + msg);

        setModalWaitingOpen(false);

        setErrorMsg(msg);
        setModalErrorOpen(true);
    }

    function handleCodeCopy() {
        navigator.clipboard.writeText(
            `Hey, join and play Connect4 with me! You can connect with me at this link:\n${location.href}\nor just entering my gamecode ${gameCodeView} in connect4.sutac.pl`
        );
        refCopied.current?.show();
        setTimeout(() => refCopied.current?.close(), 1350);
    }

    // --- Render ---
    return (
        <>
            <GamePage
                board={boardView}
                turnMsg={turnMsg}
                playerMsg={!!playerMsg ? `You are ${playerMsg}` : ""}
                handleNewGame={handleNewGame}
                handleExit={handleExit}
            ></GamePage>
            <CustomModal open={modalWaitingOpen}>
                <h2>Waiting for other player...</h2>
                <div>
                    <small>Game code:</small>
                    <dialog ref={refCopied} className={styles.popup}>
                        Link copied!
                    </dialog>
                    <p className="highlight" onClick={handleCodeCopy}>
                        {gameCodeView ?? ""}
                    </p>
                </div>
                <div onClick={handleExit}>
                    <CustomButton>Exit</CustomButton>
                </div>
            </CustomModal>
            <CustomModal open={modalErrorOpen}>
                <h2>Error occured!</h2>

                <p className="highlight">{errorMsg}</p>

                <div onClick={handleExit}>
                    <CustomButton>Exit</CustomButton>
                </div>
            </CustomModal>
            <CustomFooter>Online multiplayer</CustomFooter>
        </>
    );
}
