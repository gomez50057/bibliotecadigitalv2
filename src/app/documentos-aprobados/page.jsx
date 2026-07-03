"use client";

import { useEffect, useState } from "react";
import DocumentWorkflowHeader from "@/components/document-workflow/DocumentWorkflowHeader";
import styles from "@/components/document-workflow/DocumentWorkflow.module.css";
import { CATEGORY_LABELS } from "@/config/taxonomy";
import { apiFetch } from "@/utils/api";

export default function ApprovedDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/documents/approved/")
      .then(setDocuments)
      .catch(() => setError("No se pudieron cargar los Biblioteca ciudadana."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className={styles.page}>
      <DocumentWorkflowHeader title="Biblioteca ciudadana" />
      <section className={styles.shell}>
        <div className={styles.titleBlock}>
          <span>Comparte y consulta</span>
          <h1>Biblioteca ciudadana</h1>
          <p>
            Este espacio reúne <strong>documentos, materiales e información útil para la ciudadanía</strong>.
            Aquí puedes consultar archivos publicados y también formar parte de este acervo compartiendo tus propios documentos.
          </p>
          <p>
            Si cuentas con algún <em>texto, artículo, estudio, informe, guía, manual, investigación, diagnóstico, memoria, proyecto</em>
            {" "}o material de consulta relevante, puedes enviarlo. Una vez validado, podrá integrarse a la plataforma para que más personas lo consulten, descarguen y aprovechen.
          </p>
          <p><strong>Tu participación ayuda a construir una biblioteca más completa, abierta y colaborativa.</strong></p>
          <a className={styles.button} href="/subir-documento">Subir documento</a>
        </div>

        {loading && <div className={styles.message}>Cargando documentos...</div>}
        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
        {!loading && !error && documents.length === 0 && (
          <div className={styles.message}>Aún no hay Biblioteca ciudadana.</div>
        )}

        <div className={styles.documents}>
          {documents.map((document) => (
            <article key={document.id} className={styles.card}>
              <h2>{document.document_name}</h2>
              <div className={styles.meta}>
                <span>{CATEGORY_LABELS[document.category] || document.category}</span>
                <span>{document.publication_year}</span>
              </div>
              <p>{document.description}</p>
              <div className={styles.actions}>
                <a className={styles.button} href={document.pdf_url} target="_blank" rel="noreferrer">Visualizar PDF</a>
                <a className={styles.secondaryButton} href={document.download_url}>Descargar PDF</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
