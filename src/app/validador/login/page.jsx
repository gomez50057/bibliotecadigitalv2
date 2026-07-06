"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BibliotecaDigitalLogo from "@/components/brand/BibliotecaDigitalLogo";
import DocumentWorkflowHeader from "@/components/document-workflow/DocumentWorkflowHeader";
import styles from "@/components/document-workflow/DocumentWorkflow.module.css";
import { apiFetch } from "@/utils/api";

export default function ValidatorLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch("/api/validator/documents/?status=pending")
      .then(() => router.replace("/validador/panel"))
      .catch(() => null);
  }, [router]);

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
      <section className={`${styles.shell} ${styles.loginShell}`}>
        <div className={styles.loginIntro}>
          <BibliotecaDigitalLogo compact />
          <h1><span>Acervo</span> compartido</h1>
          <p className={styles.loginAgency}>Gobierno del Estado de Hidalgo</p>
          <div className={styles.loginCopy}>
            <h2><strong>Comparte</strong> información, construimos <strong>conocimiento.</strong></h2>
            <p>Inicia sesión para revisar, validar y gestionar los documentos que la ciudadanía comparte con nuestra comunidad.</p>
          </div>
          <svg className={styles.loginArt} aria-hidden="true" viewBox="0 0 420 260">
            <path className={styles.artBase} d="M0 217c67-28 126-20 174-14 72 10 126-52 246-21v78H0Z" />
            <rect className={styles.artFolder} x="88" y="142" width="94" height="84" rx="7" />
            <path className={styles.artFolderTab} d="M95 132h39l13 15h35v24H95Z" />
            <rect className={styles.artBookRed} x="184" y="84" width="80" height="142" rx="7" />
            <path className={styles.artBookPage} d="M264 92h35v129h-35z" />
            <rect className={styles.artBookGold} x="292" y="146" width="90" height="19" rx="4" />
            <rect className={styles.artBookRed} x="285" y="168" width="92" height="19" rx="4" />
            <rect className={styles.artBookGold} x="296" y="190" width="80" height="19" rx="4" />
            <circle className={styles.artCircle} cx="360" cy="92" r="68" />
            <rect className={styles.artDot} x="54" y="178" width="10" height="10" rx="3" />
            <rect className={styles.artDot} x="101" y="118" width="26" height="26" rx="5" />
          </svg>
        </div>

        <div className={styles.loginPanel}>
          <div className={styles.loginTitle}>
            <h2>Iniciar sesión</h2>
            <p>Accede con tu cuenta para continuar.</p>
          </div>

          <form className={`${styles.form} ${styles.loginForm}`} onSubmit={submit}>
            {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
            <div className={styles.field}>
              <label htmlFor="username">Usuario</label>
              <div className={styles.inputIcon}>
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /></svg>
                <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Ingresa tu usuario" required />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.inputIcon}>
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v11H6z" /></svg>
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Ingresa tu contraseña" required />
                <button
                  className={styles.passwordToggle}
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M3 3l18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M7.5 7.8C4.5 9.3 3 12 3 12s3.5 6 9 6c1.5 0 2.8-.4 4-.9M11 6.1c.3 0 .7-.1 1-.1 5.5 0 9 6 9 6s-.8 1.4-2.3 2.8" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button className={styles.loginButton} type="submit" disabled={submitting}>
              {submitting ? "Entrando..." : "Iniciar sesión"}
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
