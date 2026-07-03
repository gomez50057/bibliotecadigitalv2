"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BibliotecaDigitalLogo from "@/components/brand/BibliotecaDigitalLogo";
import { isActivePath, MAIN_NAV_LINKS } from "@/config/navigation";
import styles from "./DocumentWorkflow.module.css";

export default function DocumentWorkflowHeader({ title = "Biblioteca Digital de Planeación" }) {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <BibliotecaDigitalLogo compact />
        <div className={styles.brandText}>
          <strong>{title}</strong>
          <span>Gobierno del Estado de Hidalgo</span>
        </div>
      </div>
      <nav className={styles.nav} aria-label="Navegación principal">
        {MAIN_NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            className={isActivePath(pathname, link.match) ? styles.navActive : ""}
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
