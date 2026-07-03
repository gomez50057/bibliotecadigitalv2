"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DocumentWorkflowHeader from "@/components/document-workflow/DocumentWorkflowHeader";
import styles from "@/components/document-workflow/DocumentWorkflow.module.css";
import { apiFetch } from "@/utils/api";

export default function ValidatorLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      router.push("/validador/panel");
    } catch (loginError) {
      setError(
        loginError.status === 429
          ? "Demasiados intentos. Espera unos minutos antes de volver a intentar."
          : "Credenciales incorrectas o acceso no autorizado."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <DocumentWorkflowHeader title="Acceso del validador" />
      <section className={styles.shell}>
        <div className={styles.titleBlock}>
          <span>Panel privado</span>
          <h1>Iniciar sesión</h1>
        </div>

        <form className={styles.form} onSubmit={submit}>
          {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
          <div className={styles.field}>
            <label htmlFor="username">Usuario</label>
            <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </main>
  );
}
