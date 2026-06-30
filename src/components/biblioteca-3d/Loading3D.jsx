import BibliotecaDigitalLogo from "@/components/brand/BibliotecaDigitalLogo";
import styles from "./BibliotecaDigital3D.module.css";

export default function Loading3D() {
  return (
    <div className={styles.loader} role="status">
      <BibliotecaDigitalLogo compact />
      <span>Preparando sala digital…</span>
    </div>
  );
}
