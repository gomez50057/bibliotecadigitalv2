import Image from "next/image";
import styles from "./BibliotecaDigitalLogo.module.css";

export default function BibliotecaDigitalLogo({ compact = false, className = "" }) {
  return (
    <span className={`${styles.frame} ${compact ? styles.compact : ""} ${className}`}>
      <Image
        src="/brand/biblioteca-digital.png"
        alt="Biblioteca Digital de Planeación"
        fill
        priority
        sizes={compact ? "64px" : "(max-width: 700px) 64px, 310px"}
      />
    </span>
  );
}
