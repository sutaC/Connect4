"use client";
import stylesBoard from "@/components/board.module.css";
import { useEffect, useState } from "react";
import GamePage from "../game";
import CustomFooter from "@/components/customFooter";
import {
    Player,
    checkGameState,
    getEmptyBoard,
    playMove,
} from "@/modules/board";
import { BoardClickEvent } from "@/components/board";
import playAIMove from "@/modules/opponentAI";

export default function Page() {
    let turn = "red";
    let board: Player[][] = getEmptyBoard();

    const [boardView, setBoardView] = useState(board);
    const [turnMsg, setTurnMsg] = useState("your");

    function handleNewGame() {
        location.reload();
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

    function handleBoardClick(event: BoardClickEvent) {
        const { row } = event.detail;

        const move = playMove([...board], row, turn as Player);
        if (!move) return;
        board = move;

        setBoardView(board);

        if (checkGameState(board, "you", document)) return;

        turn = turn === "red" ? "yellow" : "red";
        setTurnMsg("AI");

        // AI turn

        board = playAIMove([...board], turn as Player);

        setBoardView(board);

        if (checkGameState(board, "AI", document)) return;

        turn = turn === "red" ? "yellow" : "red";
        setTurnMsg("your");
    }
    const boardClickeventListener = (e: Event) => {
        handleBoardClick(e as BoardClickEvent);
    };

    useEffect(() => {
        document.removeEventListener(
            "boardClick",
            boardClickeventListener,
            true
        );
        document.addEventListener("boardClick", boardClickeventListener);
    }, []);

    return (
        <>
            <div className={stylesBoard.aiGame}>
                <GamePage
                    board={boardView}
                    turnMsg={`${turnMsg} turn!`}
                    handleNewGame={handleNewGame}
                    handleExit={handleExit}
                ></GamePage>
            </div>
            <CustomFooter>Singleplayer with AI</CustomFooter>
        </>
    );
}
