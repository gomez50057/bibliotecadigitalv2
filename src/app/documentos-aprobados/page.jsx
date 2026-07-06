"use client";

import { useEffect, useMemo, useState } from "react";
import BibliotecaDigital3DPage from "@/components/biblioteca-3d/BibliotecaDigital3DPage";
import { LIBRARY_TAXONOMY } from "@/config/taxonomy";
import { apiFetch } from "@/utils/api";

const COLORS = ["#14395f", "#7d1735", "#b08032", "#2f5c52", "#68152b", "#374151"];

function approvedDocumentToLibraryDocument(document, index) {
  const categoryKey = LIBRARY_TAXONOMY[document.category] ? document.category : "planes";

  return {
    id: `aprobado-${document.id}`,
    title: document.document_name,
    shortTitle: document.document_name,
    category: categoryKey,
    categoryKey,
    subcategory: "inexistente",
    year: String(document.publication_year || "Sin año"),
    description: document.description || "Documento compartido por la ciudadanía.",
    type: "PDF",
    url: document.pdf_url || document.download_url,
    booksIndex: String(index + 1),
    tags: [categoryKey, document.publication_year].filter(Boolean),
    colorVariant: COLORS[index % COLORS.length]
  };
}

export default function ApprovedDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/documents/approved/")
      .then(setDocuments)
      .catch(() => setError("No se pudieron cargar los documentos aprobados."))
      .finally(() => setLoading(false));
  }, []);

  const libraryDocuments = useMemo(
    () => documents.map(approvedDocumentToLibraryDocument),
    [documents]
  );

  if (loading) return <div style={{ padding: 24 }}>Cargando documentos...</div>;
  if (error) return <div style={{ padding: 24 }}>{error}</div>;

  return (
    <>
      <BibliotecaDigital3DPage
        documents={libraryDocuments}
        initialCategory=""
        roomLabel="Comparte y consulta / Documentos disponibles"
        heading="Documentos disponibles"
        headingAccent=" de la ciudadanía"
        emptyTitle="No hay documentos disponibles"
      />
      <p style={{ maxWidth: 680, margin: "0 24px 24px auto", color: "#6b6065", fontSize: "0.68rem", textAlign: "right" }}>
        La publicación de estos documentos no implica validación, certificación ni adhesión institucional a su contenido.
      </p>
    </>
  );
}
