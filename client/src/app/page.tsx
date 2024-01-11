"use client";
import CustomFooter from "@/components/customFooter";
import CustomButton from "@/components/customButton";
import CustomModal from "@/components/customModal";
import Link from "next/link";
import styles from "./page.module.css";
import { FormEvent, SetStateAction, useEffect, useState } from "react";
import Toast from "@/components/toast";

export default function Home() {
    const [modalOpen, setModalOpen] = useState(false);
    const [gameCode, setGameCode] = useState("");
    const [gamePublic, setGamePublic] = useState(false);

    const [online, setOnline] = useState(true);

    const [codeError, setCodeError] = useState("");
    const [hostError, setHostError] = useState("");
    const [findError, setFindError] = useState("");

    function toastError(
        error: string,
        seter: (value: SetStateAction<string>) => any
    ): void {
        seter("");
        seter(error);
        setTimeout(() => seter(""), 1350);
    }

    async function handleJoinGame(event: FormEvent) {
        event.preventDefault();

        if (!gameCode) return toastError("Code is required", setCodeError);

        let data: undefined | number;
        try {
            data = Number(gameCode);
        } catch (error) {
            console.error(error);
            return;
        }

        if (!Number.isSafeInteger(data))
            return toastError("Game code must be an number", setCodeError);

        let res = undefined;
        try {
            res = await fetch(`http://localhost:3030/api/game/join/${data}`);
        } finally {
            if (res && res.ok) {
                location.href = `/online/${data}`;
            } else {
                return toastError(`Couldn't find game : ${data}`, setCodeError);
            }
        }
    }

    async function handleHostGame(event: FormEvent) {
        event.preventDefault();

        const body = JSON.stringify({
            gamePublic,
        });

        let res;

        try {
            res = await fetch("http://localhost:3030/api/game/host/", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body,
            });
        } catch (error) {
            console.error(error);
            return;
        }

        let data: undefined | { code: number };

        try {
            data = (await res.json()) as { code: number };
        } catch (error) {
            console.error(error);
        }

        if (!data) return toastError("Couldnt't host game", setHostError);

        location.href = `/online/${data.code}`;
    }

    async function handleFindGame() {
        let res;

        try {
            res = await fetch("http://localhost:3030/api/game/find");
        } catch (error) {
            console.error(error);
            return;
        }

        let data: undefined | { code: number };

        try {
            data = await res.json();
        } catch (error) {
            return console.error(error);
        }

        if (!data) return toastError("Coudn't get server data", setFindError);
        if (!data.code) return toastError("Coudn't find game", setFindError);

        location.href = `/online/${data.code}`;
    }

    // SW
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            console.log("Registering service worker");
            try {
                navigator.serviceWorker.register("/sw.js");
            } catch (error) {
                console.error("Registering service worker faild: " + error);
            }
        } else {
            console.warn("Service worker could not been registerd");
        }
    }, []);

    // Offline mode

    useEffect(() => {
        setOnline(navigator.onLine);

        window.addEventListener("online", () => {
            setOnline(true);
        });

        window.addEventListener("offline", () => {
            setOnline(false);
            setModalOpen(false);
        });
    }, []);

    // App

    return (
        <>
            <main className={styles.main}>
                <h1>Connect4</h1>
                <div className={styles.menu}>
                    <div>
                        <Link href="/ai">
                            <CustomButton>Play with AI</CustomButton>
                        </Link>
                    </div>
                    <div
                        onClick={() => {
                            setModalOpen(true);
                        }}
                    >
                        <CustomButton disabled={!online}>
                            Play online
                        </CustomButton>
                    </div>
                    <div>
                        <Link href="/local">
                            <CustomButton>Play locally</CustomButton>
                        </Link>
                    </div>
                </div>
            </main>

            <CustomModal open={modalOpen}>
                <header className={styles.modalHeader}>
                    <button
                        onClick={() => setModalOpen(false)}
                        className={styles.modalBtn}
                    >
                        &times;
                    </button>

                    <h2>Play online games</h2>
                </header>

                <form
                    className={styles.modalForm}
                    onSubmit={(e) => handleJoinGame(e)}
                >
                    <p>Join game</p>
                    <Toast open={!!codeError}>{codeError}</Toast>
                    <input
                        type="text"
                        name="gameCode"
                        placeholder="Game code..."
                        autoComplete="off"
                        value={gameCode}
                        onChange={(event) => {
                            setGameCode(event.target.value);
                        }}
                    />
                    <CustomButton>Join</CustomButton>
                </form>

                <form
                    className={styles.modalForm}
                    onSubmit={(e) => handleHostGame(e)}
                >
                    <p>Host game</p>
                    <Toast open={!!hostError}>{hostError}</Toast>
                    <div className={styles.customCheckbox}>
                        <input
                            type="checkbox"
                            name="publicGame"
                            id="publicGame"
                            checked={gamePublic}
                            onChange={() => setGamePublic(!gamePublic)}
                        />
                        <label htmlFor="publicGame">Public game</label>
                    </div>
                    <CustomButton>Host game</CustomButton>
                </form>

                <div>
                    <Toast open={!!findError}>{findError}</Toast>
                    <div onClick={handleFindGame}>
                        <CustomButton>Find quick game</CustomButton>
                    </div>
                </div>
            </CustomModal>
            <CustomFooter>{online ? "" : "Offline"}</CustomFooter>
        </>
    );
}
