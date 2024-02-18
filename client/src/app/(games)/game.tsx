"use client";
import { useEffect, useState } from "react";
import Board from "@/components/board";
import styles from "./game.module.css";
import CustomModal from "@/components/customModal";
import CustomButton from "@/components/customButton";
import { Player } from "@/modules/board";

export type GameOverEvent = CustomEvent<{ msg: string }>;

export default function GamePage({
    board,
    turnMsg,
    playerMsg,
    handleNewGame,
    handleExit,
}: {
    board: Player[][];
    turnMsg: string;
    playerMsg?: string;
    handleNewGame?: () => any;
    handleExit?: () => any;
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalGameView, setModalGameView] = useState(false);
    const [endMsg, setEndMsg] = useState("");

    function gameEnd(event: GameOverEvent) {
        setEndMsg(event.detail.msg);
        setModalOpen(true);
    }
    const gameOverEventListener = (event: Event) => {
        gameEnd(event as GameOverEvent);
    };

    useEffect(() => {
        document.removeEventListener("gameOver", gameOverEventListener);
        document.addEventListener("gameOver", gameOverEventListener);
    }, []);

    return (
        <main className={styles.main}>
            <button className={styles.exitButton} onClick={handleExit}>
                Exit game
            </button>

            <h1>{turnMsg}</h1>

            <p className={styles.playerMsg}>{playerMsg ?? ""}</p>

            <Board board={board}></Board>

            <div
                className={`${styles.modalWrapper} ${
                    modalGameView ? styles.gameView : ""
                }`}
            >
                <CustomModal open={modalOpen}>
                    <header className={styles.modalHeader}>
                        <button
                            onClick={() => {
                                setModalGameView(!modalGameView);
                            }}
                            className={styles.modalBtn}
                        >
                            &#11206;
                        </button>

                        <h2>Game finished</h2>
                    </header>
                    <p className={styles.endMsg}>{endMsg}</p>
                    <div
                        onClick={() => {
                            if (handleNewGame) {
                                handleNewGame();
                            }
                            setModalOpen(false);
                        }}
                    >
                        <CustomButton>Play again</CustomButton>
                    </div>
                    <div onClick={handleExit}>
                        <CustomButton>Exit</CustomButton>
                    </div>
                </CustomModal>
            </div>
        </main>
    );
}
