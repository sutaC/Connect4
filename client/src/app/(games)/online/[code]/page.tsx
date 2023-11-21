"use client";
import { useEffect, useState } from "react";
import GamePage from "../../game";
import CustomFooter from "@/components/customFooter";
import CustomModal from "@/components/customModal";
import CustomButton from "@/components/customButton";
import { getEmptyBoard } from "@/modules/board";

let evtSource: EventSource;

function handleMsgHello(event: MessageEvent) {
    evtSource.close();

    const data = JSON.parse(event.data);
    console.log(data);
}

export default function Page() {
    useEffect(() => {
        evtSource = new EventSource("http://localhost:3030/api/online");

        evtSource.addEventListener("hello", handleMsgHello);
    }, []);

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
                    <p className="highlight">0123456789</p>
                </div>
                <div onClick={handleExit}>
                    <CustomButton>Exit</CustomButton>
                </div>
            </CustomModal>
            <CustomFooter>Online multiplayer</CustomFooter>
        </>
    );
}
