import styles from "./customButton.module.css";

export default function CustomButton({
	children,
	type = "Primary",
}: {
	children?: React.ReactNode;
	type?: "Primary" | "Secondary";
}) {
	return (
		<button
			type='submit'
			className={`${styles.customButton} ${
				type === "Secondary" ? styles.secondary : styles.primary
			}`}
		>
			{children}
		</button>
	);
}
