type FileCategory = "image" | "document" | "other";

export const classifyFileType = (mimeType?: string): FileCategory => {
  if (!mimeType) return "other";

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (
    mimeType === "application/pdf" ||
    mimeType === "application/msword" ||
    mimeType.startsWith("application/vnd.openxmlformats-officedocument") ||
    mimeType === "text/plain"
  ) {
    return "document";
  }

  return "other";
};
