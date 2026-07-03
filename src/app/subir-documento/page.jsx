"use client";

import { useState } from "react";
import DocumentWorkflowHeader from "@/components/document-workflow/DocumentWorkflowHeader";
import styles from "@/components/document-workflow/DocumentWorkflow.module.css";
import { CATEGORY_LABELS } from "@/config/taxonomy";
import { MAX_FILE_SIZE_BYTES, UPLOAD_FILE_FIELDS, UPLOAD_LIMITS } from "@/config/upload";
import { apiErrorMessage, apiUrl } from "@/utils/api";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  document_name: "",
  category: "planes",
  description: "",
};

const UNSAFE_TEXT = /[<>{}\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

function validateFile(file, label = "archivo PDF") {
  if (!file) return `El ${label} es obligatorio.`;
  if (file.type !== "application/pdf") return "Solo se permiten archivos PDF.";
  if (file.name.toLowerCase().split(".").filter(Boolean).length !== 2 || !file.name.toLowerCase().endsWith(".pdf")) {
    return "El archivo debe ser PDF y no debe tener doble extensión.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) return `El PDF no puede superar ${UPLOAD_LIMITS.maxFileSizeMb} MB.`;
  return "";
}

export default function UploadDocumentPage() {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [responsiveFile, setResponsiveFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) => {
    const value = key === "phone" ? event.target.value.replace(/\D/g, "").slice(0, 10) : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (Object.values(form).some((value) => !String(value).trim())) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setError("El teléfono debe tener exactamente 10 dígitos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (form.document_name.length > UPLOAD_LIMITS.documentNameMax) {
      setError(`El nombre del documento no puede superar ${UPLOAD_LIMITS.documentNameMax} caracteres.`);
      return;
    }
    if (form.description.length > UPLOAD_LIMITS.descriptionMax) {
      setError(`La descripción no puede superar ${UPLOAD_LIMITS.descriptionMax} caracteres.`);
      return;
    }
    if ([form.full_name, form.document_name, form.description].some((value) => UNSAFE_TEXT.test(value))) {
      setError("No se permiten caracteres de código como <, >, { o }.");
      return;
    }
    const fileError = validateFile(file, "documento") || validateFile(responsiveFile, "responsivo");
    if (fileError) {
      setError(fileError);
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append(UPLOAD_FILE_FIELDS.document, file);
    data.append(UPLOAD_FILE_FIELDS.responsive, responsiveFile);

    setSubmitting(true);
    try {
      const response = await fetch(apiUrl("/api/documents/upload/"), {
        method: "POST",
        credentials: "include",
        body: data,
      });
      const responseData = await response.json().catch(() => null);
      if (response.status === 429) {
        throw new Error("Has enviado demasiados documentos. Espera unos minutos antes de intentar nuevamente.");
      }
      if (!response.ok) throw new Error(apiErrorMessage(responseData, "No se pudo enviar el documento."));
      setForm(initialForm);
      setFile(null);
      setResponsiveFile(null);
      event.currentTarget.reset();
      setMessage("Documento recibido correctamente. Será revisado antes de publicarse.");
    } catch (uploadError) {
      setError(uploadError.message || "No se pudo enviar el documento. Revisa la información e intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <DocumentWorkflowHeader title="Carga de documentos" />
      <section className={styles.shell}>
        <div className={styles.titleBlock}>
          <span>Carga pública</span>
          <h1>Enviar documento para revisión</h1>
          <p>El documento quedará pendiente de validación y solo será público después de ser aprobado.</p>
        </div>

        <form className={styles.form} onSubmit={submit}>
          {message && <div className={`${styles.message} ${styles.success}`}>{message}</div>}
          {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="full_name">Nombre completo</label>
              <input id="full_name" value={form.full_name} onChange={update("full_name")} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" type="email" value={form.email} onChange={update("email")} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="phone">Teléfono a 10 dígitos</label>
              <input id="phone" inputMode="numeric" pattern="\d{10}" maxLength={10} value={form.phone} onChange={update("phone")} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="document_name">Nombre del documento</label>
              <input id="document_name" maxLength={UPLOAD_LIMITS.documentNameMax} value={form.document_name} onChange={update("document_name")} required />
              <span className={styles.hint}>{form.document_name.length}/{UPLOAD_LIMITS.documentNameMax} caracteres</span>
            </div>
            <div className={styles.field}>
              <label htmlFor="category">Categoría</label>
              <select id="category" value={form.category} onChange={update("category")} required>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="pdf_file">Documento</label>
              <input
                id="pdf_file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] || null;
                  const fileError = validateFile(nextFile, "documento");
                  setFile(fileError ? null : nextFile);
                  setError(fileError);
                  if (fileError) event.target.value = "";
                }}
                required
              />
              <span className={styles.hint}>Solo PDF, máximo {UPLOAD_LIMITS.maxFileSizeMb} MB.</span>
            </div>
            <div className={styles.field}>
              <label htmlFor="responsive_pdf_file">Responsivo</label>
              <input
                id="responsive_pdf_file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] || null;
                  const fileError = validateFile(nextFile, "responsivo");
                  setResponsiveFile(fileError ? null : nextFile);
                  setError(fileError);
                  if (fileError) event.target.value = "";
                }}
                required
              />
              <span className={styles.hint}>Solo PDF, máximo {UPLOAD_LIMITS.maxFileSizeMb} MB.</span>
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="description">Descripción del documento</label>
              <textarea id="description" maxLength={UPLOAD_LIMITS.descriptionMax} value={form.description} onChange={update("description")} required />
              <span className={styles.hint}>{form.description.length}/{UPLOAD_LIMITS.descriptionMax} caracteres</span>
            </div>
          </div>

          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar documento"}
          </button>
        </form>
      </section>
    </main>
  );
}
