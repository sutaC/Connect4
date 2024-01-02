import styles from "./customButton.module.css";

export default function CustomButton({
    children,
    type = "Primary",
    disabled = false,
}: {
    children?: React.ReactNode;
    type?: "Primary" | "Secondary" | "Accent";
    disabled?: boolean;
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
            disabled={disabled}
        >
            {children}
        </button>
    );
}
