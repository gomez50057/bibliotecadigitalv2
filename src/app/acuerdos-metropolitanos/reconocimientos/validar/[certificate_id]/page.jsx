"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import DocumentWorkflowHeader from "@/components/document-workflow/DocumentWorkflowHeader";
import styles from "@/components/document-workflow/DocumentWorkflow.module.css";
import { apiFetch } from "@/utils/api";

function RecognitionValidationContent() {
  const { certificate_id: certificateId } = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    apiFetch(`/api/recognitions/validate/${certificateId}/?token=${encodeURIComponent(token)}`)
      .then(setCertificate)
      .catch(() => setError("Reconocimiento no encontrado o token inválido."))
      .finally(() => setLoading(false));
  }, [certificateId, token]);

  return (
    <main className={styles.page}>
      <DocumentWorkflowHeader title="Validación de reconocimiento" />
      <section className={styles.shell}>
        <div className={styles.titleBlock}>
          <span>Autenticidad</span>
          <h1>Validar reconocimiento</h1>
          <p>Consulta el folio, la persona reconocida, el documento relacionado y el estado del reconocimiento.</p>
        </div>

        {loading && <div className={styles.message}>Validando reconocimiento...</div>}
        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
        {certificate && (
          <div className={styles.validationCard}>
            <dl>
              <div>
                <dt>Folio</dt>
                <dd>{certificate.folio}</dd>
              </div>
              <div>
                <dt>Nombre</dt>
                <dd>{certificate.nombre}</dd>
              </div>
              <div>
                <dt>Acuerdo relacionado</dt>
                <dd>{certificate.acuerdo}</dd>
              </div>
              <div>
                <dt>Fecha de emisión</dt>
                <dd>{new Date(certificate.fecha_emision).toLocaleString("es-MX")}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{certificate.estado}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>
    </main>
  );
}

export default function RecognitionValidationPage() {
  return (
    <Suspense fallback={<main className={styles.page}><div className={styles.message}>Cargando validación...</div></main>}>
      <RecognitionValidationContent />
    </Suspense>
  );
}
