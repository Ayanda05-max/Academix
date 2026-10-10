import { downloadSubmissionFile, formatFileSize } from "../utils/submissionFiles";
import type { SubmissionFileInfo } from "../utils/submissionFiles";

type Props = {
  files?: SubmissionFileInfo[];
  fileUrl?: string | null;
};

// Shows the files and/or link a student submitted, with download buttons.
// Used on the student page and on the lecturer's submissions page.
function SubmissionFiles({ files = [], fileUrl }: Props) {
  async function handleDownload(file: SubmissionFileInfo) {
    try {
      await downloadSubmissionFile(file.id, file.name);
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    }
  }

  if (files.length === 0 && !fileUrl) {
    return <small>No files attached.</small>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "8px 0" }}>
      {files.map((file) => (
        <li key={file.id} style={{ marginBottom: 4 }}>
          <button type="button" onClick={() => handleDownload(file)}>
            Download
          </button>{" "}
          {file.name} <small>({formatFileSize(file.size)})</small>
        </li>
      ))}

      {fileUrl && (
        <li>
          <a href={fileUrl} target="_blank" rel="noreferrer">
            Open submitted link
          </a>
        </li>
      )}
    </ul>
  );
}

export default SubmissionFiles;
