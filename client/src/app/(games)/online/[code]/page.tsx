"use client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import GamePage from "../../game";
import CustomFooter from "@/components/customFooter";
import CustomModal from "@/components/customModal";
import CustomButton from "@/components/customButton";
import { getEmptyBoard } from "@/modules/board";

export default function Page() {
    const [gameCode, setGameCode] = useState(0);
    const socketRef: MutableRefObject<WebSocket | undefined> = useRef();

    useEffect(() => {
        try {
            setGameCode(
                Number(
                    location.pathname.substring(location.pathname.length - 8)
                )
            );
        } catch (error) {
            console.error(error);
        }
    }, []);

    function handleWebsocket() {
        if (socketRef.current) return;

        socketRef.current = new WebSocket("ws://localhost:3040");

        socketRef.current.addEventListener("open", () => {
            console.log("We are connected!");
        });

        socketRef.current.addEventListener("message", (event: MessageEvent) => {
            console.log(event);
        });
    }
    useEffect(handleWebsocket, []);

    // App
    const [modalOpen, setModalOpen] = useState(true);
    const [board, setBoard] = useState(getEmptyBoard());

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
        setBoard(getEmptyBoard());
    }

    return (
        <>
            <GamePage
                board={board}
                turnMsg="Your turn!"
                handleNewGame={handleNewGame}
            ></GamePage>
            <CustomModal open={modalOpen}>
                <h2>Waiting for other player...</h2>
                <div>
                    <small>Game code:</small>
                    <p className="highlight">{gameCode ?? ""}</p>
                </div>
                <div onClick={handleExit}>
                    <CustomButton>Exit</CustomButton>
                </div>
            </CustomModal>
            <CustomFooter>Online multiplayer</CustomFooter>
        </>
    );
}
