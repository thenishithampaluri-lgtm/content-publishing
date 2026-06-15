import React, { useEffect, useState } from "react";
import { BookOpen, Calendar } from "lucide-react";
import { api } from "../api";

export default function Published() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublished() {
      try {
        const data = await api("/api/content/published");
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadPublished();
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Reader View</p>
          <h1>Published Content</h1>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner" />
          Loading articles...
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={28} />
          <p>No published content yet.</p>
        </div>
      ) : (
        <div className="published-list">
          {items.map((item) => (
            <article
              key={item.id}
              className="published-article"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8
                }}
              >
                <span className="status published">
                  PUBLISHED
                </span>

                <span
                  style={{
                    fontSize: ".8rem",
                    color: "var(--slate-400)"
                  }}
                >
                  <Calendar size={12} />
                  {" "}
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString()
                    : ""}
                </span>

                <span
                  style={{
                    fontSize: ".8rem",
                    color: "var(--slate-400)"
                  }}
                >
                  v{item.versionNumber}
                </span>
              </div>

              <h2>{item.title}</h2>

              {item.summary && (
                <p className="article-summary">
                  {item.summary}
                </p>
              )}

              {item.topics?.length > 0 && (
                <div className="topic-list">
                  {item.topics.map((topic) => (
                    <span key={topic}>{topic}</span>
                  ))}
                </div>
              )}

              {item.body && (
                <div className="article-body">
                  {item.body}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}