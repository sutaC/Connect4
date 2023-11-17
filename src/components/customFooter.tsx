import styles from "./customFooter.module.css";

export default function CustomFooter({
	children,
}: {
	children?: React.ReactNode;
}) {
	return (
		<footer className={styles.customFooter}>
			<p>{children}</p>
			<small className={styles.author}>
				Game by{" "}
				<a
					href='https://github.com/sutaC'
					target='_blank'
					rel='noopener noreferrer'
				>
					sutaC
				</a>
			</small>
		</footer>
	);
}
