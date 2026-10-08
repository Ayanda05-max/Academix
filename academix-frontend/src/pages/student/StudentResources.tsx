import { useEffect, useState } from "react";
import {
  downloadFile,
  formatFileSize,
} from "../../utils/fileHelpers";

type Enrollment = {
  id: number;
  courseId: number;
  courseTitle: string;
  status: string;
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

type CourseResources = {
  courseId: number;
  courseTitle: string;
  items: ResourceItem[];
};

function StudentResources() {
  const [groups, setGroups] = useState<CourseResources[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");
  const studentId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    if (!token) {
      setError("You must be logged in to view resources.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/enrollments/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setError("Could not load your courses.");
        return;
      }

      const enrolled: Enrollment[] = await response.json();
      const result: CourseResources[] = [];

      for (const enrollment of enrolled) {
        if (enrollment.status !== "ACTIVE") {
          continue;
        }

        try {
          const res = await fetch(`/api/courses/${enrollment.courseId}/resources`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const items: ResourceItem[] = await res.json();

            result.push({
              courseId: enrollment.courseId,
              courseTitle: enrollment.courseTitle,
              items,
            });
          }
        } catch (error) {
          console.error("Could not load resources:", error);
        }
      }

      setGroups(result);
    } catch (error) {
      setError("ERROR: " + String(error));
    } finally {
      setLoading(false);
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

  return (
    <>
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">STUDENT PORTAL</p>

          <h1>Resources</h1>

          <p className="dashboard-description">
            Notes, slides and files shared by your lecturers.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {loading ? (
        <div className="dashboard-empty">
          <p>Loading resources...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="dashboard-empty">
          <h3>No courses yet</h3>
          <p>Resources appear here once you are enrolled in a course.</p>
        </div>
      ) : (
        groups.map((group) => (
          <section className="courses-section" key={group.courseId}>
            <div className="section-heading">
              <div>
                <p className="section-eyebrow">COURSE</p>
                <h2>{group.courseTitle}</h2>
              </div>

              <span className="section-count">{group.items.length}</span>
            </div>

            {group.items.length === 0 ? (
              <div className="dashboard-empty">
                <p>No resources have been shared for this course yet.</p>
              </div>
            ) : (
              <div className="res-list">
                {group.items.map((resource) => (
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </>
  );
}

export default StudentResources;