import React, { useEffect, useState } from "react";
import { ArrowRight, FileText, Search, Sparkles } from "lucide-react";
import { api, isEditor } from "../api";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const draftsCount = items.filter((i) => i.status === "DRAFT").length;
  const publishedCount = items.filter((i) => i.status === "PUBLISHED").length;
  const topicsSet = new Set(items.flatMap((i) => i.topics || []));

  async function loadContent(nextQuery = query, nextStatus = status) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextQuery) params.set("q", nextQuery);
      if (nextStatus !== "ALL") params.set("status", nextStatus);
      const data = await api(`/content/search?${params.toString()}`);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContent("", "ALL");
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    loadContent();
  }

  return (
    <section>
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Your Content Hub</h1>
        </div>
        {isEditor() && (
          <a className="primary-button compact" href="/editor">
            <FileText size={16} /> New Draft
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-label">Total Items</div>
          <div className="stat-card-value blue">{items.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Drafts</div>
          <div className="stat-card-value amber">{draftsCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Published</div>
          <div className="stat-card-value green">{publishedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Topics</div>
          <div className="stat-card-value purple">{topicsSet.size}</div>
        </div>
      </div>

      {/* Search */}
      <form className="search-bar" onSubmit={submitSearch}>
        <Search size={17} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search by title, topic, or keyword…'
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); loadContent(query, e.target.value); }}>
          <option value="ALL">All Status</option>
          <option value="DRAFT">Drafts</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {/* Grid */}
      <div className="content-grid">
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            Loading content…
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <Sparkles size={28} />
            <p>No matching content found.</p>
            {isEditor() && (
              <a href="/editor" style={{ marginTop: 14, display: "inline-block", color: "var(--brand-600)", fontWeight: 700 }}>
                Create your first draft →
              </a>
            )}
          </div>
        ) : (
          items.map((item) => (
            <article className="content-card" key={item.id} onClick={() => isEditor() && (window.location.href = `/editor/${item.id}`)}>
              <div className="card-topline">
                <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
                <span>v{item.versionNumber}</span>
              </div>
              <h2>{item.title}</h2>
              <p>{item.summary || "No summary provided."}</p>
              <div className="topic-list">
                {item.topics?.slice(0, 3).map((t) => <span key={t}>{t}</span>)}
                {item.topics?.length > 3 && <span>+{item.topics.length - 3} more</span>}
              </div>
              <div className="card-footer">
                {isEditor() ? (
                  <a className="open-link" href={`/editor/${item.id}`}>
                    Open Editor <ArrowRight size={13} />
                  </a>
                ) : (
                  <span style={{ fontSize: ".8rem", color: "var(--slate-400)" }}>Read only</span>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
