"use client";
import CustomFooter from "@/components/customFooter";
import CustomButton from "@/components/customButton";
import CustomModal from "@/components/customModal";
import Link from "next/link";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {
	const [modalOpen, setModalOpen] = useState(false);

	function closeModal() {
		setModalOpen(false);
	}

	return (
		<>
			<main className={styles.main}>
				<h1>Connect4</h1>
				<div className={styles.menu}>
					<div>
						<Link href='/ai'>
							<CustomButton>Play with AI</CustomButton>
						</Link>
					</div>
					<div
						onClick={() => {
							setModalOpen(true);
						}}
					>
						<CustomButton>Play online</CustomButton>
					</div>
					<div>
						<Link href='/local'>
							<CustomButton>Play locally</CustomButton>
						</Link>
					</div>
				</div>
			</main>
			<CustomModal open={modalOpen}>
				<button onClick={closeModal} className={styles.modalCloseBtn}>
					x
				</button>

				<h2>Play online games</h2>

				<form className={styles.modalForm}>
					<p>Join game</p>
					<input
						type='text'
						name='gameCode'
						placeholder='Game code...'
						required
						minLength={8}
						maxLength={8}
					/>
					<CustomButton>Join</CustomButton>
				</form>

				<form className={styles.modalForm}>
					<p>Host game</p>
					<div className={styles.customCheckbox}>
						<input
							type='checkbox'
							name='publicGame'
							id='publicGame'
						/>
						<label htmlFor='publicGame'>Public game</label>
					</div>
					<CustomButton>Host game</CustomButton>
				</form>

				<div>
					<CustomButton>Find quick game</CustomButton>
				</div>
			</CustomModal>
			<CustomFooter></CustomFooter>
		</>
	);
}
