"use client";

import { useEffect, useMemo, useState } from "react";
import BibliotecaDigital3DPage from "@/components/biblioteca-3d/BibliotecaDigital3DPage";
import { LIBRARY_TAXONOMY } from "@/config/taxonomy";
import { libraryDocuments } from "@/data/libraryDocuments";
import { apiFetch } from "@/utils/api";

function citizenDocumentToLibraryDocument(document, index) {
  const subcategory = LIBRARY_TAXONOMY.ciudadanos.includes(document.category) ? document.category : "otros_planeacion";
  return {
    id: `ciudadano-${document.id}`,
    title: document.document_name,
    category: "ciudadanos",
    categoryKey: "ciudadanos",
    subcategory,
    year: String(document.publication_year || "Sin año"),
    description: document.description || "Documento compartido por la ciudadanía.",
    type: "PDF",
    url: document.pdf_url || document.download_url,
    booksIndex: String(index + 1),
    tags: ["ciudadanos", subcategory, document.publication_year].filter(Boolean),
    colorVariant: "#5d4a2f"
  };
}

export default function BibliotecaDigitalPage() {
  const [citizenDocuments, setCitizenDocuments] = useState([]);

  useEffect(() => {
    apiFetch("/api/documents/approved/").then(setCitizenDocuments).catch(() => null);
  }, []);

  const documents = useMemo(
    () => [...libraryDocuments, ...citizenDocuments.map(citizenDocumentToLibraryDocument)],
    [citizenDocuments]
  );

  return <BibliotecaDigital3DPage documents={documents} />;
}
