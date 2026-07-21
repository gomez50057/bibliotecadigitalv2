"use client";

import { useState } from "react";
import DocumentWorkflowHeader from "@/components/document-workflow/DocumentWorkflowHeader";
import WorkflowModal from "@/components/document-workflow/WorkflowModal";
import styles from "@/components/document-workflow/DocumentWorkflow.module.css";
import { LIBRARY_TAXONOMY, SUBCATEGORY_LABELS } from "@/config/taxonomy";
import { MAX_FILE_SIZE_BYTES, UPLOAD_FILE_FIELDS, UPLOAD_LIMITS } from "@/config/upload";
import { apiErrorMessage, apiUrl } from "@/utils/api";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  document_name: "",
  category: "propuestas_ciudadanas",
  description: "",
  observations: "",
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
  const [modal, setModal] = useState(null);

  const update = (key) => (event) => {
    const value = key === "phone" ? event.target.value.replace(/\D/g, "").slice(0, 10) : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validateForm = () => {
    if ([form.full_name, form.email, form.phone, form.document_name, form.category, form.description].some((value) => !String(value).trim())) {
      return "Todos los campos son obligatorios.";
    }
    if (!/^\d{10}$/.test(form.phone)) {
      return "El teléfono debe tener exactamente 10 dígitos.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Ingresa un correo electrónico válido.";
    }
    if (form.document_name.length > UPLOAD_LIMITS.documentNameMax) {
      return `El nombre del documento no puede superar ${UPLOAD_LIMITS.documentNameMax} caracteres.`;
    }
    if (form.description.length > UPLOAD_LIMITS.descriptionMax) {
      return `La descripción no puede superar ${UPLOAD_LIMITS.descriptionMax} caracteres.`;
    }
    if (form.observations.length > UPLOAD_LIMITS.observationsMax) {
      return `Las observaciones no pueden superar ${UPLOAD_LIMITS.observationsMax} caracteres.`;
    }
    if ([form.full_name, form.document_name, form.description, form.observations].some((value) => UNSAFE_TEXT.test(value))) {
      return "No se permiten caracteres de código como <, >, { o }.";
    }
    return validateFile(file, "documento") || validateFile(responsiveFile, "responsivo");
  };

  const submit = (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    setMessage("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setModal({
      title: "Enviar documento",
      message: "¿Confirmas que deseas enviar este documento para revisión?",
      confirmLabel: "Enviar documento",
      onConfirm: () => uploadDocument(formElement),
    });
  };

  const uploadDocument = async (formElement) => {
    setModal(null);
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
      formElement.reset();
      setModal({
        title: "Documento recibido",
        message: "Documento recibido correctamente. Será revisado antes de publicarse.",
      });
    } catch (uploadError) {
      setError(uploadError.message || "No se pudo enviar el documento. Revisa la información e intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      {modal && (
        <WorkflowModal
          title={modal.title}
          confirmLabel={modal.confirmLabel}
          onClose={() => setModal(null)}
          onConfirm={modal.onConfirm}
        >
          <p>{modal.message}</p>
        </WorkflowModal>
      )}
      <DocumentWorkflowHeader title="Carga de documentos" />
      <section className={styles.shell}>
        <div className={styles.titleBlock}>
          <span>Carga pública</span>
          <h1>Enviar documento para revisión</h1>
          <p>El documento quedará pendiente de validación y solo será público después de ser aprobado.</p>
          <div className={styles.downloadNotice}>
            <p>
              Descarga la <strong>carta responsiva</strong>, léela y llénala a mano o en digital.
              La firma debe realizarse forzosamente a mano. Después súbela en PDF en el campo
              <strong> Carta responsiva</strong>.
            </p>
            <a href="/docs/carta-responsiva.pdf" download>
              Descargar carta responsiva
            </a>
          </div>
        </div>

        <form className={styles.form} onSubmit={submit}>
          {message && <div className={`${styles.message} ${styles.success}`}>{message}</div>}
          {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="full_name">Nombre completo <span className={styles.requiredMark}>*</span></label>
              <input id="full_name" value={form.full_name} onChange={update("full_name")} placeholder="Ejemplo: Juan Perez Hernandez" required />
              <span className={styles.hint}>Escribe primero nombre, luego apellido paterno y después apellido materno.</span>
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Correo electrónico <span className={styles.requiredMark}>*</span></label>
              <input id="email" type="email" value={form.email} onChange={update("email")} placeholder="Ejemplo: nombre@correo.com" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="phone">Teléfono a 10 dígitos <span className={styles.requiredMark}>*</span></label>
              <input id="phone" inputMode="numeric" pattern="\d{10}" maxLength={10} value={form.phone} onChange={update("phone")} placeholder="Ejemplo: 7711234567" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="document_name">Nombre del documento <span className={styles.requiredMark}>*</span></label>
              <input id="document_name" maxLength={UPLOAD_LIMITS.documentNameMax} value={form.document_name} onChange={update("document_name")} placeholder="Ejemplo: Diagnóstico comunitario 2026" required />
              <span className={styles.hint}>{form.document_name.length}/{UPLOAD_LIMITS.documentNameMax} caracteres</span>
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="category">Categoría <span className={styles.requiredMark}>*</span></label>
              <select id="category" value={form.category} onChange={update("category")} required>
                {LIBRARY_TAXONOMY.ciudadanos.map((key) => (
                  <option key={key} value={key}>{SUBCATEGORY_LABELS[key]}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="pdf_file">Documento <span className={styles.requiredMark}>*</span></label>
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
              <label htmlFor="responsive_pdf_file">Carta responsiva <span className={styles.requiredMark}>*</span></label>
              <input
                id="responsive_pdf_file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] || null;
                  const fileError = validateFile(nextFile, "carta responsiva");
                  setResponsiveFile(fileError ? null : nextFile);
                  setError(fileError);
                  if (fileError) event.target.value = "";
                }}
                required
              />
              <span className={styles.hint}>Sube la carta responsiva firmada. Solo PDF, máximo {UPLOAD_LIMITS.maxFileSizeMb} MB.</span>
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="description">Descripción del documento <span className={styles.requiredMark}>*</span></label>
              <textarea id="description" maxLength={UPLOAD_LIMITS.descriptionMax} value={form.description} onChange={update("description")} placeholder="Ejemplo: Describe el contenido, origen y utilidad del documento." required />
              <span className={styles.hint}>{form.description.length}/{UPLOAD_LIMITS.descriptionMax} caracteres</span>
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="observations">Agregar observaciones</label>
              <textarea id="observations" maxLength={UPLOAD_LIMITS.observationsMax} value={form.observations} onChange={update("observations")} placeholder="Aquí agrega aclaraciones o dudas que tenga." />
              <span className={styles.hint}>{form.observations.length}/{UPLOAD_LIMITS.observationsMax} caracteres</span>
            </div>
          </div>

          <button className={styles.button} type="submit" disabled={submitting}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 16V4m0 0-4 4m4-4 4 4M5 16v3h14v-3" /></svg>
            {submitting ? "Enviando..." : "Enviar documento"}
          </button>
        </form>
      </section>
    </main>
  );
}
