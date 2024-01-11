import styles from "./toast.module.css";

export default function Toast({
    children,
    open,
}: {
    children?: React.ReactNode;
    open?: boolean;
    time?: number;
}) {
    if (!open) {
        return null;
    }

    return (
        <dialog open className={styles.popup}>
            {children}
        </dialog>
    );
}
