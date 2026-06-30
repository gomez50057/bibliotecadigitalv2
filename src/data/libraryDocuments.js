import { datosBibliotecaDigital } from "./datosBibliotecaDigital";
import { adaptDocuments } from "@/utils/documentAdapter";

export const { documents: libraryDocuments, pendingClassification } =
  adaptDocuments(datosBibliotecaDigital.cards);
