export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "txt",
  "csv",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "zip",
];

export const ACCEPT_ATTRIBUTE = ALLOWED_EXTENSIONS.map((ext) => "." + ext).join(",");

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0 || dot === fileName.length - 1) {
    return "";
  }
  return fileName.substring(dot + 1).toLowerCase();
}

export function validateFile(file: File): string {
  if (file.size === 0) {
    return "The file is empty.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "The file is too large. The limit is 10 MB.";
  }
  if (!ALLOWED_EXTENSIONS.includes(getExtension(file.name))) {
    return "This file type is not allowed. Allowed types: " + ALLOWED_EXTENSIONS.join(", ") + ".";
  }
  return "";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " B";
  }
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  }
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export async function readErrorMessage(response: Response): Promise<string> {
  let message = `Request failed (${response.status})`;
  try {
    const data = await response.json();
    if (data.message) message = data.message;
    else if (data.error) message = data.error;
  } catch {
  }
  return message;
}

export async function downloadFile(url: string, fileName: string): Promise<void> {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}