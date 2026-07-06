import styles from "./DocumentWorkflow.module.css";

export default function WorkflowModal({
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancelar",
  danger = false,
  onClose,
  onConfirm,
}) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="workflow-modal-title">
      <div className={styles.modal}>
        <button className={styles.modalClose} type="button" aria-label="Cerrar" onClick={onClose}>x</button>
        <h2 id="workflow-modal-title">{title}</h2>
        <div className={styles.modalBody}>{children}</div>
        <div className={styles.modalActions}>
          {onConfirm && (
            <button className={danger ? styles.dangerButton : styles.button} type="button" onClick={onConfirm}>
              <svg aria-hidden="true" viewBox="0 0 24 24">{danger ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="m5 12 4 4L19 6" />}</svg>
              {confirmLabel}
            </button>
          )}
          <button className={styles.secondaryButton} type="button" onClick={onClose}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
            {onConfirm ? cancelLabel : "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
