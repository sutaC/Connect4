import styles from "./customButton.module.css";

export default function CustomButton({
	children,
	type = "Primary",
}: {
	children?: React.ReactNode;
	type?: "Primary" | "Secondary" | "Accent";
}) {
	return (
		<button
			type="submit"
			className={`${styles.customButton} ${
				type === "Primary"
					? styles.primary
					: type === "Secondary"
					? styles.secondary
					: type === "Accent"
					? styles.accent
					: ""
			}`}
		>
			{children}
		</button>
	);
}
