import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ACCEPT_ATTRIBUTE,
  downloadFile,
  formatFileSize,
  readErrorMessage,
  validateFile,
} from "../../utils/fileHelpers";

type Course = {
  id: number;
  title: string;
  instructorId: number | null;
};

type ResourceItem = {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
};

function LecturerResources() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const token = localStorage.getItem("token");
  const lecturerId = Number(localStorage.getItem("userId"));

  const lecturerCourses = courses.filter(
    (course) => course.instructorId === lecturerId
  );

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courseId) {
      loadResources(Number(courseId));
    } else {
      setResources([]);
    }
  }, [courseId]);

  async function loadCourses() {
    if (!token) {
      setError("You must be logged in to manage resources.");
      return;
    }

    try {
      const response = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: Course[] = await response.json();
        setCourses(data);

        const mine = data.filter((course) => course.instructorId === lecturerId);
        if (mine.length > 0) {
          setCourseId(String(mine[0].id));
        }
      } else {
        setError("Could not load your courses.");
      }
    } catch (error) {
      setError("ERROR: " + String(error));
    }
  }

  async function loadResources(id: number) {
    setLoadingList(true);

    try {
      const response = await fetch(`/api/courses/${id}/resources`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: ResourceItem[] = await response.json();
        setResources(data);
      } else {
        setResources([]);
        setError(await readErrorMessage(response));
      }
    } catch (error) {
      setResources([]);
      setError("ERROR: " + String(error));
    } finally {
      setLoadingList(false);
    }
  }

  async function uploadResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!courseId) {
      setError("Please choose a course.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await fetch(`/api/courses/${courseId}/resources`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const saved: ResourceItem = await response.json();

        setSuccess(
          `"${saved.title}" was uploaded. Students enrolled in this course can now download it.`
        );
        setTitle("");
        setDescription("");
        setFile(null);
        setFileInputKey((current) => current + 1);

        await loadResources(Number(courseId));
      } else {
        setError(await readErrorMessage(response));
      }
    } catch (error) {
      setError("ERROR: " + String(error));
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(resource: ResourceItem) {
    setError("");

    try {
      await downloadFile(`/api/resources/${resource.id}/download`, resource.fileName);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }

  async function deleteResource(resource: ResourceItem) {
    const confirmed = window.confirm(
      `Delete "${resource.title}"? Students will no longer be able to download it.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/resources/${resource.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess(`"${resource.title}" was deleted.`);
        await loadResources(Number(courseId));
      } else {
        setError(await readErrorMessage(response));
      }
    } catch (error) {
      setError("ERROR: " + String(error));
    }
  }

  return (
    <>
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">LECTURER PORTAL</p>

          <h1>Resources</h1>

          <p className="dashboard-description">
            Upload notes, slides and other files for your students.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}
      {success && <div className="res-success">{success}</div>}

      <section className="assignments-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">UPLOAD</p>
            <h2>Upload a Resource</h2>
            <p>Maximum 10 MB. PDF, Word, PowerPoint, Excel, text, images and zip files.</p>
          </div>
        </div>

        {lecturerCourses.length === 0 ? (
          <div className="dashboard-empty">
            <p>You need a course before you can upload resources.</p>
          </div>
        ) : (
          <form onSubmit={uploadResource}>
            <div className="dashboard-form-field">
              <label>Course</label>

              <select
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                required
              >
                {lecturerCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="dashboard-form-field">
              <label>Title</label>

              <input
                type="text"
                placeholder="e.g. Week 1 lecture slides"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="dashboard-form-field dashboard-form-wide">
              <label>Description (optional)</label>

              <input
                type="text"
                placeholder="A short note for students"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="dashboard-form-field dashboard-form-wide">
              <label>File</label>

              <input
                key={fileInputKey}
                type="file"
                accept={ACCEPT_ATTRIBUTE}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                required
              />
            </div>

            <div className="dashboard-form-actions">
              <button type="submit" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Resource"}
              </button>
            </div>
          </form>
        )}
      </section>

      {lecturerCourses.length > 0 && (
        <section className="courses-section">
          <div className="section-heading">
            <div>
              <p className="section-eyebrow">UPLOADED</p>
              <h2>Uploaded Resources</h2>
              <p>Files students in the selected course can download.</p>
            </div>
          </div>

          {loadingList ? (
            <div className="dashboard-empty">
              <p>Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="dashboard-empty">
              <p>No resources uploaded for this course yet.</p>
            </div>
          ) : (
            <div className="res-list">
              {resources.map((resource) => (
                <div className="res-item" key={resource.id}>
                  <div className="res-item-main">
                    <strong>{resource.title}</strong>

                    {resource.description && <p>{resource.description}</p>}

                    <small>
                      {resource.fileName} &middot; {formatFileSize(resource.sizeBytes)} &middot;{" "}
                      {new Date(resource.uploadedAt).toLocaleDateString()}
                    </small>
                  </div>

                  <div className="res-item-actions">
                    <button type="button" onClick={() => handleDownload(resource)}>
                      Download
                    </button>

                    <button
                      type="button"
                      className="res-delete"
                      onClick={() => deleteResource(resource)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default LecturerResources;