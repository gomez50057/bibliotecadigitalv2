import assert from "node:assert/strict";
import { datosBibliotecaDigital } from "../src/data/datosBibliotecaDigital.js";

assert.equal(datosBibliotecaDigital.cards.length, 448);
assert.ok(datosBibliotecaDigital.cards.every((item) => item.pdfSrc && item.booksIndex));
assert.ok(datosBibliotecaDigital.cards.some((item) => item.types?.[0] === "guías"));
console.log("Dataset correcto: 448 documentos PDF.");
