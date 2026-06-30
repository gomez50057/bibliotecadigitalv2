import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap"
});

export const metadata = {
  title: "Biblioteca Digital de Planeación | Gobierno del Estado de Hidalgo",
  description:
    "Consulta y participa en la Actualización del Biblioteca Digital de Planeación impulsado por la Unidad de Planeación y Prospectiva del Gobierno del Estado de Hidalgo.",
  icons: {
    icon: "/favicon.ico",
  },
  authors: [
    {
      name: "Unidad de Planeación y Prospectiva - Coordinación General de Planeación y Proyectos - Gabriel Gómez Gómez",
      // url: "https://planestataldedesarrollo.hidalgo.gob.mx", // personalizar
    },
  ],
  // Open Graph (para compartir en redes como Facebook, WhatsApp, LinkedIn)
  openGraph: {
    title: "Biblioteca Digital de Planeación | Gobierno de Hidalgo",
    description:
      "Consulta y participa en la Actualización del Biblioteca Digital de Planeación impulsado por la Unidad de Planeación y Prospectiva del Gobierno del Estado de Hidalgo.",
    url: "https://bibliotecadigitaluplaph.hidalgo.gob.mx/",
    siteName: "Biblioteca Digital de Planeación",
    images: [
      {
        url: "/brand/biblioteca-digital.png",
        width: 1200,
        height: 630,
        alt: "Biblioteca Digital de Planeación",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  // URL base para generar links absolutos
  metadataBase: new URL("https://planestataldedesarrollo.hidalgo.gob.mx"),
};

// export const metadata = {
//   title: "Biblioteca Digital de Planeación",
//   description: "Acervo digital de instrumentos de planeación del Estado de Hidalgo.",
//   icons: { icon: "/brand/biblioteca-digital.png" }
// };

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
