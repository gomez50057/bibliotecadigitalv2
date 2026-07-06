"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DocumentWorkflowHeader from "@/components/document-workflow/DocumentWorkflowHeader";
import WorkflowModal from "@/components/document-workflow/WorkflowModal";
import styles from "@/components/document-workflow/DocumentWorkflow.module.css";
import { CATEGORY_LABELS } from "@/config/taxonomy";
import { apiBlobFetch, apiFetch } from "@/utils/api";

const tabs = [
  ["pending", "Pendientes"],
  ["approved", "Aprobados"],
  ["rejected", "Rechazados"],
];
const PAGE_SIZE = 6;

function emailResultText(email) {
  if (!email) return "";
  const certificate = email.recognition_certificate
    ? email.recognition_certificate.generated
      ? " Reconocimiento agregado."
      : " Reconocimiento actualizado."
    : "";
  if (email.sent) return `${certificate} Correo enviado con éxito.`;
  if (email.error) return `${certificate} Correo falló: ${email.error}`;
  if (email.warning) return `${certificate} Correo falló: ${email.warning}.`;
  return certificate;
}

export default function ValidatorPanelPage() {
  const router = useRouter();
  const [status, setStatus] = useState("pending");
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [page, setPage] = useState(0);
  const certificatePreviewRef = useRef(null);
  const [certificatePreviewScale, setCertificatePreviewScale] = useState(0.25);
  const [reviewOptions, setReviewOptions] = useState({
    send_email: false,
    review_observations: "",
    recipient_name: "",
    name_font_size: 48,
  });

  useEffect(() => {
    let mounted = true;
    setPage(0);
    setLoading(true);
    setError("");
    apiFetch(`/api/validator/documents/?status=${status}`)
      .then((data) => {
        if (mounted) setDocuments(data);
      })
      .catch(() => router.push("/validador/login"))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [router, status]);

  const pageCount = Math.max(1, Math.ceil(documents.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleDocuments = documents.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    if (!modal || modal.type !== "approve" || !certificatePreviewRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setCertificatePreviewScale(entry.contentRect.width / 792);
    });
    observer.observe(certificatePreviewRef.current);
    return () => observer.disconnect();
  }, [modal]);

  const confirmAction = (modalData) => {
    setReviewOptions({
      send_email: Boolean(modalData.resend),
      review_observations: "",
      recipient_name: modalData.document?.full_name || "",
      name_font_size: 48,
    });
    setModal(modalData);
  };

  const logout = async () => {
    setModal(null);
    await apiFetch("/api/auth/logout/", { method: "POST" }).catch(() => null);
    router.push("/validador/login");
  };

  const changeStatus = async (documentId, action) => {
    if (action === "reject" && !reviewOptions.review_observations.trim()) {
      setError("Las observaciones son obligatorias para rechazar.");
      return;
    }
    setModal(null);
    setError("");
    setMessage("");
    try {
      const data = await apiFetch(`/api/validator/documents/${documentId}/${action}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewOptions),
      });
      const email = data.email_notification;
      setMessage(`${action === "approve" ? "El cambio se agregó en la biblioteca." : "Respuesta guardada."}${emailResultText(email)}`);
    } catch {
      setError("No se pudo actualizar el documento.");
      return;
    }
    setDocuments((current) => current.filter((document) => document.id !== documentId));
  };

  const resendResponse = async (documentId) => {
    setModal(null);
    setError("");
    setMessage("");
    try {
      const data = await apiFetch(`/api/validator/documents/${documentId}/resend-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewOptions),
      });
      setMessage(`Respuesta guardada.${emailResultText(data.email_notification)}`);
    } catch (requestError) {
      setError(requestError.message || "No se pudo reenviar la respuesta.");
    }
  };

  const downloadRecognition = async (document) => {
    setError("");
    let blob;
    try {
      blob = await apiBlobFetch(`/api/validator/documents/${document.id}/recognition-pdf/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewOptions),
      });
    } catch {
      setError("No se pudo descargar el reconocimiento.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `reconocimiento-${document.folio || document.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openPdf = async (document, download = false, fileType = "document") => {
    const route = fileType === "responsive" ? "responsive-pdf" : "pdf";
    let blob;
    try {
      blob = await apiBlobFetch(`/api/validator/documents/${document.id}/${route}/${download ? "?download=1" : ""}`);
    } catch {
      setError("No se pudo abrir el PDF.");
      return;
    }
    const url = URL.createObjectURL(blob);
    if (download) {
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${document.document_name}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className={styles.page}>
      {modal && (
        <WorkflowModal
          title={modal.title}
          confirmLabel={modal.confirmLabel}
          danger={modal.danger}
          onClose={() => setModal(null)}
          onConfirm={modal.onConfirm}
        >
          <p>{modal.message}</p>
          {modal.type && (
            <div className={styles.modalFields}>
              {!modal.resend && (
                <label className={styles.modalCheck}>
                  <input
                    type="checkbox"
                    checked={reviewOptions.send_email}
                    onChange={(event) => setReviewOptions((current) => ({ ...current, send_email: event.target.checked }))}
                  />
                  Enviar correo al solicitante
                </label>
              )}
              {modal.type === "reject" && !modal.resend && (
                <label className={styles.modalField}>
                  Observaciones del rechazo
                  <textarea
                    value={reviewOptions.review_observations}
                    onChange={(event) => setReviewOptions((current) => ({ ...current, review_observations: event.target.value }))}
                    maxLength={1500}
                    required
                  />
                </label>
              )}
              {reviewOptions.send_email && modal.type === "approve" && (
                <>
                  <label className={styles.modalField}>
                    Nombre de la persona reconocida
                    <input
                      type="text"
                      value={reviewOptions.recipient_name}
                      maxLength={160}
                      onChange={(event) => setReviewOptions((current) => ({ ...current, recipient_name: event.target.value }))}
                    />
                  </label>
                  <label className={styles.modalField}>
                    Tamaño del nombre: {reviewOptions.name_font_size}px
                    <input
                      type="range"
                      min="24"
                      max="140"
                      value={reviewOptions.name_font_size}
                      onChange={(event) => setReviewOptions((current) => ({ ...current, name_font_size: Number(event.target.value) }))}
                    />
                  </label>
                </>
              )}
              {(reviewOptions.send_email || modal.resend) && modal.document && (
                <div className={styles.emailPreview}>
                  <span>Vista previa del correo</span>
                  <p>
                    Hola <strong>{modal.document.full_name}</strong>,<br />
                    Tu documento <strong>{modal.document.document_name}</strong>{" "}
                    {modal.type === "approve"
                      ? "fue aprobado para la Biblioteca Digital de Planeación."
                      : "fue rechazado."}
                  </p>
                  {modal.type === "approve" && (
                    <>
                      <p>Folio: {modal.document.folio || "Sin folio"}</p>
                      <div ref={certificatePreviewRef} className={styles.certificatePreview} aria-label="Vista previa del reconocimiento">
                        <strong style={{ fontSize: `${Math.max(1, reviewOptions.name_font_size * certificatePreviewScale)}px` }}>
                          {reviewOptions.recipient_name || modal.document.full_name}
                        </strong>
                      </div>
                      <button className={styles.secondaryButton} type="button" onClick={() => downloadRecognition(modal.document)}>
                        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" /></svg>
                        Descargar reconocimiento
                      </button>
                    </>
                  )}
                  {modal.type === "reject" && <p>Observaciones: {modal.document.review_observations || reviewOptions.review_observations || "Sin observaciones capturadas"}</p>}
                </div>
              )}
            </div>
          )}
        </WorkflowModal>
      )}
      <DocumentWorkflowHeader title="Panel de validación" />
      <section className={styles.shell}>
        <div className={styles.titleBlock}>
          <span>Panel privado</span>
          <h1>Validación de documentos</h1>
          <p>Revisa documentos enviados por usuarios públicos y decide si se publican.</p>
        </div>

        <div className={styles.panelToolbar}>
          <div className={styles.tabs} aria-label="Filtrar por estado">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={status === key ? styles.activeTab : ""}
                onClick={() => setStatus(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => confirmAction({
              title: "Cerrar sesión",
              message: "¿Confirmas que deseas cerrar la sesión?",
              confirmLabel: "Cerrar sesión",
              onConfirm: logout,
            })}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M15 3h4v4M10 14 19 5M19 12v7H5V5h7" /></svg>
            Cerrar sesión
          </button>
        </div>

        {loading && <div className={styles.message}>Cargando documentos...</div>}
        {message && <div className={`${styles.message} ${styles.success}`}>{message}</div>}
        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
        {!loading && documents.length === 0 && <div className={styles.message}>No hay documentos en esta sección.</div>}

        {documents.length > 0 && (
          <>
            <div className={styles.validatorList}>
              {visibleDocuments.map((document) => (
              <article className={styles.validatorItem} key={document.id}>
                <div className={styles.validatorItemHeader}>
                  <div>
                    <span>{document.folio || "Sin folio"}</span>
                    <h2>{document.document_name}</h2>
                  </div>
                  <span className={styles.status}>{document.status_label}</span>
                </div>

                <div className={styles.validatorMetaGrid}>
                  <div>
                    <span>Categoría</span>
                    <strong>{CATEGORY_LABELS[document.category] || document.category}</strong>
                  </div>
                  <div>
                    <span>Año</span>
                    <strong>{document.publication_year}</strong>
                  </div>
                  <div>
                    <span>Fecha de envío</span>
                    <strong>{new Date(document.created_at).toLocaleString("es-MX")}</strong>
                  </div>
                  <div>
                    <span>Teléfono</span>
                    <strong>{document.phone}</strong>
                  </div>
                  <div className={styles.metaWide}>
                    <span>Solicitante</span>
                    <strong>{document.full_name}</strong>
                    <small>{document.email}</small>
                  </div>
                  <div className={styles.metaWide}>
                    <span>Revisión</span>
                    <strong>
                      {document.reviewed_at
                        ? `${document.reviewed_by_name || "Validador"} - ${new Date(document.reviewed_at).toLocaleString("es-MX")}`
                        : "Pendiente"}
                    </strong>
                  </div>
                </div>

                <div className={styles.validatorTextGrid}>
                  <section>
                    <span>Descripción</span>
                    <p>{document.description}</p>
                  </section>
                  <section>
                    <span>Observaciones</span>
                    <p>{document.observations || "Sin observaciones"}</p>
                  </section>
                </div>

                <div className={styles.validatorActions}>
                  <button className={styles.secondaryButton} type="button" onClick={() => openPdf(document)}>
                    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                    Ver documento
                  </button>
                  <button className={styles.secondaryButton} type="button" onClick={() => openPdf(document, true)}>
                    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" /></svg>
                    Descargar documento
                  </button>
                  <button className={styles.secondaryButton} type="button" onClick={() => openPdf(document, false, "responsive")}>
                    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 3h8l4 4v14H7zM14 3v5h5M9 13h6M9 17h6" /></svg>
                    Ver responsivo
                  </button>
                  <button className={styles.secondaryButton} type="button" onClick={() => openPdf(document, true, "responsive")}>
                    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" /></svg>
                    Descargar responsivo
                  </button>
                  {document.status !== "approved" && (
                    <button
                      className={styles.button}
                      type="button"
                      onClick={() => confirmAction({
                        title: "Aprobar documento",
                        message: `¿Confirmas que deseas aprobar "${document.document_name}"?`,
                        confirmLabel: "Aprobar",
                        type: "approve",
                        document,
                        onConfirm: () => changeStatus(document.id, "approve"),
                      })}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
                      Aprobar
                    </button>
                  )}
                  {document.status !== "rejected" && (
                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() => confirmAction({
                        title: "Rechazar documento",
                        message: `¿Confirmas que deseas rechazar "${document.document_name}"?`,
                        confirmLabel: "Rechazar",
                        danger: true,
                        type: "reject",
                        document,
                        onConfirm: () => changeStatus(document.id, "reject"),
                      })}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      Rechazar
                    </button>
                  )}
                  {document.status !== "pending" && (
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => confirmAction({
                        title: "Reenviar respuesta",
                        message: `¿Deseas reenviar la respuesta a ${document.email}?`,
                        confirmLabel: "Reenviar",
                        type: document.status === "approved" ? "approve" : "reject",
                        resend: true,
                        document,
                        onConfirm: () => resendResponse(document.id),
                      })}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 4v6h6M20 20v-6h-6M5 15a7 7 0 0 0 12 3M19 9A7 7 0 0 0 7 6" /></svg>
                      Reenviar respuesta
                    </button>
                  )}
                  {document.status === "approved" && (
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => confirmAction({
                        title: "Descargar reconocimiento",
                        message: "Ajusta el nombre y tamaño antes de descargar. Se conserva el mismo folio del reconocimiento.",
                        confirmLabel: "Cerrar",
                        type: "approve",
                        resend: true,
                        document,
                        onConfirm: () => setModal(null),
                      })}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM5 6H3a4 4 0 0 0 4 4M19 6h2a4 4 0 0 1-4 4" /></svg>
                      Descargar reconocimiento
                    </button>
                  )}
                </div>
              </article>
              ))}
            </div>
            {documents.length > PAGE_SIZE && (
              <div className={styles.pagination}>
                <button className={styles.secondaryButton} type="button" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
                  Anterior
                </button>
                <span>Página {currentPage + 1} de {pageCount}</span>
                <button className={styles.secondaryButton} type="button" disabled={currentPage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>
                  Siguiente
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
