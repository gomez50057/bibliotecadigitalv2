"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import BibliotecaDigitalLogo from "@/components/brand/BibliotecaDigitalLogo";
import { CATEGORY_LABELS, SUBCATEGORY_LABELS } from "@/config/taxonomy";
import styles from "./BibliotecaDigital3D.module.css";

function Icon({ children }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.panelIcon}>
      {children}
    </svg>
  );
}

export default function DocumentDetailPanel({ document, onClose, shareUrl }) {
  const [copied, setCopied] = useState(false);

  const shareDocument = async () => {
    if (navigator.share) {
      await navigator.share({ title: document.title, url: shareUrl });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.aside
      className={styles.detailPanel}
      initial={{ opacity: 0, x: 30, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      aria-label={`Detalle de ${document.title}`}
    >
      <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar detalle">
        <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.closeIcon}>
          <path d="m18 6-12 12M6 6l12 12" />
        </svg>
      </button>
      <div className={styles.cover} style={{ "--book-color": document.colorVariant }}>
        <BibliotecaDigitalLogo compact className={styles.coverLogo} />
        <span>Documento de planeación</span>
        <strong title={document.title}>{document.title}</strong>
      </div>
      <div className={styles.detailContent}>
        <span className={styles.eyebrow}>Biblioteca Digital de Planeación</span>
        <h2>{document.title}</h2>
        <div className={styles.metadata}>
          <span>
            <Icon><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 1 4 16.5v-11Z" /><path d="M8 7h8M8 11h8M8 15h5" /></Icon>
            {CATEGORY_LABELS[document.categoryKey]}
          </span>
          <span>
            <Icon><path d="M4 4h16v5H4zM4 13h7v7H4zM15 13h5v7h-5z" /></Icon>
            {SUBCATEGORY_LABELS[document.subcategory]}
          </span>
          <span>
            <Icon><path d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z" /></Icon>
            {document.year}
          </span>
        </div>
        <p>{document.description}</p>
        <div className={styles.panelActions}>
          <a href={document.url} target="_blank" rel="noreferrer">
            <Icon><path d="M14 4h6v6M10 14 20 4" /><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" /></Icon>
            Ver documento
          </a>
          <a href={document.url} download target="_blank" rel="noreferrer" className={styles.secondaryAction}>
            <Icon><path d="M12 4v10M8 10l4 4 4-4" /><path d="M5 20h14" /></Icon>
            Descargar documento
          </a>
          <button type="button" className={styles.shareAction} onClick={shareDocument}>
            <Icon><path d="M16 5 8 12l8 7" /><circle cx="18" cy="4" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="20" r="2" /></Icon>
            {copied ? "Enlace copiado" : "Compartir enlace"}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
