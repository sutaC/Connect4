"use client";
import { useEffect, useRef } from "react";
import styles from "./customModal.module.css";

export default function CustomModal({
	children,
	open,
}: {
	children?: React.ReactNode;
	open?: boolean;
}) {
	const element = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (open) {
			element.current?.showModal();
		} else {
			element.current?.close();
		}
	}, [open]);

	return (
		<dialog
			ref={element}
			className={`${styles.customModal} ${
				open ? styles.open : styles.close
			}`}
		>
			{children}
		</dialog>
	);
}
