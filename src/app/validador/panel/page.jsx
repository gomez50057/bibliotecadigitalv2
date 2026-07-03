"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DocumentWorkflowHeader from "@/components/document-workflow/DocumentWorkflowHeader";
import styles from "@/components/document-workflow/DocumentWorkflow.module.css";
import { CATEGORY_LABELS } from "@/config/taxonomy";
import { apiBlobFetch, apiFetch } from "@/utils/api";

const tabs = [
  ["pending", "Pendientes"],
  ["approved", "Aprobados"],
  ["rejected", "Rechazados"],
];

export default function ValidatorPanelPage() {
  const router = useRouter();
  const [status, setStatus] = useState("pending");
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
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

  const logout = async () => {
    await apiFetch("/api/auth/logout/", { method: "POST" }).catch(() => null);
    router.push("/validador/login");
  };

  const changeStatus = async (documentId, action) => {
    setError("");
    try {
      await apiFetch(`/api/validator/documents/${documentId}/${action}/`, {
        method: "PATCH",
      });
    } catch {
      setError("No se pudo actualizar el documento.");
      return;
    }
    setDocuments((current) => current.filter((document) => document.id !== documentId));
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
      <DocumentWorkflowHeader title="Panel de validación" />
      <section className={styles.shell}>
        <div className={styles.titleBlock}>
          <span>Panel privado</span>
          <h1>Validación de documentos</h1>
          <p>Revisa documentos enviados por usuarios públicos y decide si se publican.</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={logout}>Cerrar sesión</button>
        </div>

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

        {loading && <div className={styles.message}>Cargando documentos...</div>}
        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
        {!loading && documents.length === 0 && <div className={styles.message}>No hay documentos en esta sección.</div>}

        {documents.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre del documento</th>
                  <th>Categoría</th>
                  <th>Año de publicación</th>
                  <th>Descripción</th>
                  <th>Solicitante</th>
                  <th>Correo electrónico</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Fecha de envío</th>
                  <th>Revisión</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.id}>
                    <td>{document.document_name}</td>
                    <td>{CATEGORY_LABELS[document.category] || document.category}</td>
                    <td>{document.publication_year}</td>
                    <td>{document.description}</td>
                    <td>{document.full_name}</td>
                    <td>{document.email}</td>
                    <td>{document.phone}</td>
                    <td><span className={styles.status}>{document.status_label}</span></td>
                    <td>{new Date(document.created_at).toLocaleString("es-MX")}</td>
                    <td>
                      {document.reviewed_at
                        ? `${document.reviewed_by_name || "Validador"} - ${new Date(document.reviewed_at).toLocaleString("es-MX")}`
                        : "Pendiente"}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.secondaryButton} type="button" onClick={() => openPdf(document)}>Ver documento</button>
                        <button className={styles.secondaryButton} type="button" onClick={() => openPdf(document, true)}>Descargar documento</button>
                        <button className={styles.secondaryButton} type="button" onClick={() => openPdf(document, false, "responsive")}>Ver responsivo</button>
                        <button className={styles.secondaryButton} type="button" onClick={() => openPdf(document, true, "responsive")}>Descargar responsivo</button>
                        {document.status !== "approved" && (
                          <button className={styles.button} type="button" onClick={() => changeStatus(document.id, "approve")}>Aprobar</button>
                        )}
                        {document.status !== "rejected" && (
                          <button className={styles.dangerButton} type="button" onClick={() => changeStatus(document.id, "reject")}>Rechazar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
