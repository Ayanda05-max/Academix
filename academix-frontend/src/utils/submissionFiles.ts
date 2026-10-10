// Helpers for files attached to assignment submissions

export type SubmissionFileInfo = {
  id: number;
  name: string;
  contentType: string;
  size: number;
};

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

// Same list the backend accepts
export const ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "txt", "csv", "png", "jpg", "jpeg", "gif", "zip",
];

export const ACCEPT_ATTRIBUTE = ALLOWED_EXTENSIONS.map((e) => "." + e).join(",");

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Returns an error message, or "" if the file is fine
export function checkFile(file: File): string {
  const dot = file.name.lastIndexOf(".");
  const extension = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "";

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return `"${file.name}" is not an allowed file type.`;
  }
  if (file.size > MAX_FILE_BYTES) {
    return `"${file.name}" is larger than 10 MB.`;
  }
  return "";
}

// The download endpoint needs the login token, so a plain link will not work.
// Fetch the file with the token and let the browser save it.
export async function downloadSubmissionFile(fileId: number, fileName: string) {
  const token = localStorage.getItem("token");

  const response = await fetch(`/api/submissions/files/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(
      response.status === 403
        ? "You do not have access to this file."
        : "Could not download the file."
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
