import Image from "next/image";
import Link from "next/link";
import styles from "./ContributionBanner.module.css";

const steps = [
  { number: "1", icon: "upload", title: "Subes", text: "tu documento" },
  { number: "2", icon: "review", title: "Se revisa", text: "y valida" },
  { number: "3", icon: "publish", title: "Se publica", text: "en la Biblioteca Digital de Planeación" },
  { number: "4", icon: "community", title: "Contribuye", text: "al conocimiento público y a la planeación" }
];

const categories = [
  ["articles", "Artículos"],
  ["thesis", "Tesis"],
  ["document", "Tesinas"],
  ["research", "Investigaciones"],
  ["plans", "Planes"],
  ["diagnostics", "Diagnósticos"],
  ["studies", "Estudios"]
];

function BannerIcon({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "upload") return <svg viewBox="0 0 32 32" {...common}><path d="M9 24H7a5 5 0 0 1-.5-10A8 8 0 0 1 22 12a6 6 0 0 1 2 11.7h-2"/><path d="m11 17 5-5 5 5M16 12v15"/></svg>;
  if (name === "review") return <svg viewBox="0 0 32 32" {...common}><circle cx="16" cy="16" r="12"/><path d="m10 16 4 4 8-9"/></svg>;
  if (name === "publish" || name === "articles") return <svg viewBox="0 0 32 32" {...common}><path d="M4 7.5c4-1.7 8-1 12 1.4v18c-4-2.4-8-3.1-12-1.4zM28 7.5c-4-1.7-8-1-12 1.4v18c4-2.4 8-3.1 12-1.4z"/></svg>;
  if (name === "community") return <svg viewBox="0 0 32 32" {...common}><circle cx="16" cy="9" r="4"/><circle cx="6.5" cy="13" r="3"/><circle cx="25.5" cy="13" r="3"/><path d="M8 27v-3a8 8 0 0 1 16 0v3M1 26v-2a5.5 5.5 0 0 1 8-5M31 26v-2a5.5 5.5 0 0 0-8-5"/></svg>;
  if (name === "thesis") return <svg viewBox="0 0 32 32" {...common}><path d="m3 12 13-6 13 6-13 6zM8 15v7c5 4 11 4 16 0v-7M29 12v9"/></svg>;
  if (name === "document") return <svg viewBox="0 0 32 32" {...common}><path d="M8 3h11l6 6v20H8zM19 3v7h6M12 15h9M12 20h9M12 25h6"/></svg>;
  if (name === "research") return <svg viewBox="0 0 32 32" {...common}><path d="M4 28h24M7 24l6-7 5 3 8-11M21 9h5v5"/><path d="M8 20v5M13 17v8M18 20v5M23 14v11"/></svg>;
  if (name === "plans") return <svg viewBox="0 0 32 32" {...common}><path d="M9 6H5v23h22V6h-4M11 4h10v5H11zM10 15l2 2 4-4M10 23l2 2 4-4M19 16h4M19 24h4"/></svg>;
  if (name === "diagnostics") return <svg viewBox="0 0 32 32" {...common}><path d="M3 8h10l3 3h13v17H3z"/><path d="m7 23 5-5 4 3 5-6 4 3"/></svg>;
  return <svg viewBox="0 0 32 32" {...common}><circle cx="16" cy="16" r="12"/><path d="M16 4v12h12M16 16l-8.5 8.5"/></svg>;
}

export default function ContributionBanner() {
  return (
    <section className={styles.banner} aria-labelledby="contribution-banner-title">
      <div className={styles.copy}>
        <h2 id="contribution-banner-title">Tu conocimiento<br />planea el <span>futuro</span></h2>
        <strong>Comparte documentos sobre planeación</strong>
        <p>Contribuye al acervo público que fortalece mejores decisiones y construye territorios más justos, ordenados y sostenibles.</p>
      </div>

      <div className={styles.illustration}>
        <Image src="/img/baner.png" alt="Mujer consultando información de planeación urbana en una tableta" width={1024} height={1024} priority />
      </div>

      <div className={styles.workflow} aria-label="Proceso para compartir un documento">
        {steps.map((step) => (
          <div className={styles.step} key={step.number}>
            <b>{step.number}</b>
            <BannerIcon name={step.icon} />
            <span><strong>{step.title}</strong><small>{step.text}</small></span>
          </div>
        ))}
        <Link className={styles.cta} href="/subir-documento">Sube tu documento <BannerIcon name="upload" /></Link>
      </div>

      <div className={styles.categories} aria-label="Tipos de documentos aceptados">
        {categories.map(([icon, label]) => (
          <div key={label}><BannerIcon name={icon} /><span>{label}</span></div>
        ))}
      </div>
    </section>
  );
}
