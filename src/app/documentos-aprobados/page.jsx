"use client";

import { useEffect, useMemo, useState } from "react";
import DocumentWorkflowHeader from "@/components/document-workflow/DocumentWorkflowHeader";
import styles from "@/components/document-workflow/DocumentWorkflow.module.css";
import { CATEGORY_LABELS } from "@/config/taxonomy";
import { apiFetch } from "@/utils/api";

export default function ApprovedDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [order, setOrder] = useState("recent");

  useEffect(() => {
    apiFetch("/api/documents/approved/")
      .then(setDocuments)
      .catch(() => setError("No se pudieron cargar los Biblioteca ciudadana."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [...new Set(documents.map((document) => document.category))].filter(Boolean),
    [documents]
  );
  const searchSuggestions = useMemo(
    () => [
      ...new Set(
        documents.flatMap((document) => [
          document.document_name,
          CATEGORY_LABELS[document.category],
          document.publication_year,
        ])
      ),
    ].filter(Boolean).slice(0, 30),
    [documents]
  );
  const visibleDocuments = useMemo(() => {
    const search = query.trim().toLowerCase();
    return documents
      .filter((document) => !category || document.category === category)
      .filter((document) => {
        if (!search) return true;
        return [document.document_name, document.description, CATEGORY_LABELS[document.category], document.publication_year]
          .join(" ")
          .toLowerCase()
          .includes(search);
      })
      .sort((a, b) => {
        const yearA = Number(a.publication_year) || 0;
        const yearB = Number(b.publication_year) || 0;
        if (order === "oldest") return yearA - yearB;
        if (order === "title") return a.document_name.localeCompare(b.document_name, "es");
        return yearB - yearA;
      });
  }, [category, documents, order, query]);

  return (
    <main className={styles.page}>
      <DocumentWorkflowHeader title="Biblioteca ciudadana" />
      <section className={styles.approvedHero}>
        <svg className={styles.heroBook} aria-hidden="true" viewBox="0 0 220 220">
          <path d="M28 78c38 0 58 12 82 36 24-24 44-36 82-36v92c-38 0-58 12-82 36-24-24-44-36-82-36V78Z" />
          <path d="M110 114v92M40 94c27 2 46 11 70 34m70-34c-27 2-46 11-70 34" />
        </svg>
        <svg className={styles.heroRings} aria-hidden="true" viewBox="0 0 260 260">
          <path d="M255 12C148 24 57 103 17 255" />
          <path d="M233 4C133 25 47 102 7 239" />
          <path d="M260 45C172 61 94 124 55 260" />
        </svg>
        <div className={styles.shell}>
          <div className={styles.approvedHeroContent}>
            <span className={styles.heroKicker}>Comparte y consulta</span>
            <h1>Biblioteca ciudadana</h1>
            <p>
              Este espacio reúne <strong>documentos, materiales e información útil</strong> para la ciudadanía.
              Aquí puedes consultar archivos publicados y también formar parte de este acervo compartiendo tus propios documentos.
            </p>
            <p>
              Si cuentas con algún <em>texto, artículo, estudio, informe, guía, manual, investigación, diagnóstico,
              memoria, proyecto</em> o material de consulta relevante, puedes enviarlo. Una vez validado,
              podrá integrarse a la plataforma para que más personas lo consulten, descarguen y aprovechen.
            </p>
            <div className={styles.heroNote}>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M16 11a4 4 0 1 0-8 0m8 0a4 4 0 1 1-8 0m8 0c2.8.7 5 2.6 5 5v1H3v-1c0-2.4 2.2-4.3 5-5" />
              </svg>
              <strong>Tu participación ayuda a construir una biblioteca más completa, abierta y colaborativa.</strong>
            </div>
            <div className={styles.heroActions}>
              <a className={styles.heroButton} href="/subir-documento">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12 3v12m0-12 4 4m-4-4-4 4M5 21h14M7 15v6m10-6v6" />
                </svg>
                Subir documento
              </a>
              <a className={styles.heroLink} href="#documentos-disponibles">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M6 3h9l3 3v15H6V3Zm9 0v4h4M9 13h6m-6 4h4" />
                </svg>
                Explorar documentos
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="documentos-disponibles" className={`${styles.shell} ${styles.documentsShell}`}>
        <div className={`${styles.titleBlock} ${styles.documentsHeader}`}>
          <div>
            <h1>Documentos disponibles</h1>
            <p>Explora y consulta los documentos que la ciudadanía ha compartido.</p>
          </div>
          <div className={styles.documentTools}>
            <label className={styles.searchInput}>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="m21 21-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
              </svg>
              <input
                list="document-search-suggestions"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar documentos o palabras clave..."
              />
              <datalist id="document-search-suggestions">
                {searchSuggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar por categoría">
              <option value="">Todas las categorías</option>
              {categories.map((key) => (
                <option key={key} value={key}>{CATEGORY_LABELS[key] || key}</option>
              ))}
            </select>
            <select value={order} onChange={(event) => setOrder(event.target.value)} aria-label="Ordenar documentos">
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="title">Título A-Z</option>
            </select>
          </div>
        </div>

        {loading && <div className={styles.message}>Cargando documentos...</div>}
        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
        {!loading && !error && visibleDocuments.length === 0 && (
          <div className={styles.message}>Aún no hay Biblioteca ciudadana.</div>
        )}

        <div className={styles.documents}>
          {visibleDocuments.map((document) => (
            <article key={document.id} className={styles.card}>
              <div className={styles.cardTop}>
                <img src="/img/pdf-icon.png" alt="" aria-hidden="true" />
                <div>
                  <div className={styles.meta}>
                    <span>{CATEGORY_LABELS[document.category] || document.category}</span>
                    <span>{document.publication_year}</span>
                  </div>
                  <h2>{document.document_name}</h2>
                </div>
              </div>
              <p>{document.description}</p>
              <div className={styles.actions}>
                <a className={styles.cardAction} href={document.pdf_url} target="_blank" rel="noreferrer">
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M2.5 12s3.5-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                  Ver PDF
                </a>
                <a className={styles.cardAction} href={document.download_url}>
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
                  </svg>
                  Descargar
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className={styles.documentDisclaimer}>
          La publicación de estos documentos no implica validación, certificación ni adhesión institucional a su contenido.
        </p>
      </section>
    </main>
  );
}
