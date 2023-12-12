"use client";
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

export default function Page() {
    let turn = "red";
    let board: Player[][] = getEmptyBoard();

    const [boardView, setBoardView] = useState(board);
    const [turnMsg, setTurnMsg] = useState(turn);

    function handleNewGame() {
        location.reload();
    }

    function handleBoardClick(event: BoardClickEvent) {
        const { row } = event.detail;

        const move = playMove([...board], row, turn as Player);
        if (!move) return;
        board = move;

        setBoardView(board);

        if (checkGameState(board, turn, document)) return;

        turn = turn === "red" ? "yellow" : "red";
        setTurnMsg(turn);
    }
    const boardClickeventListener = (e: Event) => {
        handleBoardClick(e as BoardClickEvent);
    };

    function handleExit() {
        if (
            confirm(
                "Are you sure you want to exit game? It will be lost forever!"
            )
        ) {
            location.href = "/";
        }
    }

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
            <GamePage
                board={boardView}
                turnMsg={`${turnMsg} turn!`}
                handleNewGame={handleNewGame}
                handleExit={handleExit}
            ></GamePage>
            <CustomFooter>Local multiplayer</CustomFooter>
        </>
    );
}
