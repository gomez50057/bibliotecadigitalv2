export const UPLOAD_LIMITS = {
  maxFileSizeMb: 10,
  documentNameMax: 135,
  descriptionMax: 1500,
  observationsMax: 1500,
};

export const MAX_FILE_SIZE_BYTES = UPLOAD_LIMITS.maxFileSizeMb * 1024 * 1024;
export const UPLOAD_FILE_FIELDS = {
  document: "pdf_file",
  responsive: "responsive_pdf_file",
};
