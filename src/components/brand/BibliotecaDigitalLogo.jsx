import Image from "next/image";
import styles from "./BibliotecaDigitalLogo.module.css";

export default function BibliotecaDigitalLogo({ compact = false, className = "" }) {
  return (
    <span className={`${styles.group} ${compact ? styles.compact : ""} ${className}`}>
      <Image
        className={styles.logoImage}
        src="/brand/Coordinación.png"
        alt="Coordinación"
        width={260}
        height={92}
        priority
      />
      <Image
        className={styles.logoImage}
        src="/brand/biblioteca-digital.png"
        alt="Biblioteca Digital de Planeación"
        width={260}
        height={92}
        priority
      />
    </span>
  );
}
