import { LIBRARY_TAXONOMY } from "@/config/taxonomy";
import { normalizeText } from "./normalizeText";

const COLORS = {
  planes: ["#14395f", "#1d4f7a", "#0b2447"],
  programas: ["#7d1735", "#9a2445", "#4a1024"],
  guias: ["#b08032", "#c6944a", "#8f6724"],
  atlas: ["#2f5c52", "#3c7264", "#24483f"],
  informes: ["#68152b", "#8a0f2e", "#4a1024"],
  reglamentos: ["#374151", "#4b5563", "#1f2937"]
};

function shortTitle(title) {
  const words = title.replace(/\b(de|del|la|el|para|y|los|las)\b/gi, " ").split(/\s+/).filter(Boolean);
  return words.slice(0, 4).join(" ").slice(0, 32);
}

export function adaptDocument(item, index) {
  const categoryKey = normalizeText(item.types?.[0]).replace(/\s+/g, "");
  const subcategory = normalizeText(item.subcategory || "inexistente");
  const valid = LIBRARY_TAXONOMY[categoryKey]?.includes(subcategory);
  if (!valid) return { pending: item, reason: `${categoryKey || "sin categoría"}/${subcategory}` };

  const palette = COLORS[categoryKey];
  return {
    id: `${categoryKey}-${item.booksIndex || index + 1}`,
    title: item.name,
    shortTitle: shortTitle(item.name),
    category: categoryKey,
    categoryKey,
    subcategory,
    year: String(item.año || "Sin año"),
    description: item.descriptionBook || "Documento de planeación.",
    type: "PDF",
    url: item.pdfSrc,
    booksIndex: String(item.booksIndex || index + 1),
    tags: [categoryKey, subcategory, item.año].filter(Boolean),
    colorVariant: palette[index % palette.length]
  };
}

export function adaptDocuments(cards = []) {
  const documents = [];
  const pendingClassification = [];

  cards.forEach((item, index) => {
    const adapted = adaptDocument(item, index);
    if (adapted.pending) pendingClassification.push(adapted);
    else documents.push(adapted);
  });

  return { documents, pendingClassification };
}
