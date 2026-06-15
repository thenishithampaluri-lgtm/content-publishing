import React, { useEffect, useState } from "react";
import { Clock, History, Save, Send } from "lucide-react";
import { api, isEditor } from "../api";

const emptyContent = {
  title: "",
  summary: "",
  body: "",
  topicsText: ""
};

export default function Editor() {
  const id = window.location.pathname.split("/")[2];

  const [content, setContent] = useState(emptyContent);
  const [versions, setVersions] = useState([]);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  if (!isEditor()) {
    return (
      <div className="access-denied">
        <h2>🚫 Access Denied</h2>
        <p>
          You need <strong>Editor</strong> or <strong>Admin</strong> privileges
          to create or edit content.
        </p>

        <a
          href="/"
          className="primary-button compact"
          style={{ marginTop: 16, display: "inline-flex" }}
        >
          Go to Workspace
        </a>
      </div>
    );
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    async function load() {
      if (!id) return;

      try {
        const item = await api(`/api/content/${id}`);

        setContent({
          title: item.title,
          summary: item.summary || "",
          body: item.body || "",
          topicsText: item.topics?.join(", ") || ""
        });

        const history = await api(`/api/content/${id}/versions`);
        setVersions(history);
      } catch (err) {
        showToast(err.message || "Failed to load content", "error");
      }
    }

    load();
  }, [id]);

  function update(event) {
    setContent({
      ...content,
      [event.target.name]: event.target.value
    });
  }

  function payload() {
    return {
      title: content.title,
      summary: content.summary,
      body: content.body,
      topics: content.topicsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    };
  }

  async function saveDraft() {
    if (!content.title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    setSaving(true);

    try {
      const saved = await api(
        id
          ? `/api/content/${id}/draft`
          : "/api/content/draft",
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(payload())
        }
      );

      showToast("Draft saved successfully");

      if (!id) {
        window.location.href = `/editor/${saved.id}`;
      }
    } catch (err) {
      showToast(err.message || "Failed to save draft", "error");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!content.title.trim()) {
      showToast("Title is required before publishing", "error");
      return;
    }

    setPublishing(true);

    try {
      const saved = await api(
        id
          ? `/api/content/${id}/publish`
          : "/api/content/publish",
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(payload())
        }
      );

      showToast("🎉 Published successfully!");

      if (!id) {
        window.location.href = `/editor/${saved.id}`;
        return;
      }

      const history = await api(
        `/api/content/${saved.id}/versions`
      );

      setVersions(history);
    } catch (err) {
      showToast(
        err.message || "Publish failed — check your connection",
        "error"
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <section>
      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type}`}>
            {toast.msg}
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <p className="eyebrow">
            {id ? "Edit content" : "New content"}
          </p>

          <h1>{content.title || "Untitled draft"}</h1>
        </div>

        <div className="button-row">
          <button
            className="secondary-button"
            onClick={saveDraft}
            disabled={saving || publishing}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            className="primary-button compact"
            onClick={publish}
            disabled={saving || publishing}
          >
            <Send size={16} />
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-main">
          <div className="editor-card">
            <label>
              Title *
              <input
                name="title"
                value={content.title}
                onChange={update}
              />
            </label>

            <label>
              Summary
              <input
                name="summary"
                value={content.summary}
                onChange={update}
              />
            </label>

            <label>
              Topics
              <input
                name="topicsText"
                value={content.topicsText}
                onChange={update}
              />
            </label>

            <label>
              Body
              <textarea
                name="body"
                value={content.body}
                onChange={update}
                rows={18}
              />
            </label>
          </div>
        </div>

        <aside className="version-panel">
          <h2>
            <History size={17} /> Version History
          </h2>

          {versions.length === 0 ? (
            <p className="version-empty">
              No published versions yet.
              <br />
              Hit Publish to create v1.
            </p>
          ) : (
            versions.map((v) => (
              <div
                className="version-item"
                key={v.id}
              >
                <strong>
                  Version {v.versionNumber} — {v.title}
                </strong>

                <span>
                  <Clock
                    size={11}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginRight: 4
                    }}
                  />
                  {new Date(
                    v.createdAt
                  ).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </aside>
      </div>
    </section>
  );
}