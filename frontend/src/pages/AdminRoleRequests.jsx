import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import "./AdminRoleRequests.css";

const API_BASE = "http://localhost:3000/api";

const STATUS_TABS = ["pending", "approved", "rejected", "cancelled", "all"];

const STATUS_META = {
  pending: { label: "Pending", tone: "pending" },
  approved: { label: "Approved", tone: "approved" },
  rejected: { label: "Rejected", tone: "rejected" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

const REJECT_PRESETS = [
  "Evidence is unclear or unreadable",
  "Evidence doesn't show an HR role",
  "Reason is incomplete",
];

/* ---------- icons (inline, no extra dependency) ---------- */

function Icon({ size = 18, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ShieldCheckIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
);
const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Icon>
);
const ArrowUpIcon = (p) => (
  <Icon {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Icon>
);
const ArrowDownIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </Icon>
);
const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Icon>
);
const ChevronRightIcon = (p) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);
const CheckCircleIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l3 3 5-6" />
  </Icon>
);
const ExternalIcon = (p) => (
  <Icon {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Icon>
);
const DownloadIcon = (p) => (
  <Icon {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </Icon>
);

/* ---------- helpers ---------- */

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(dateStr) {
  const diff = (new Date(dateStr).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs > 30 * 86400) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  for (const [unit, secs] of [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ]) {
    if (abs >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return "just now";
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

/* ---------- page ---------- */

export default function AdminRoleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchRequests = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setLoadError("");
    try {
      const res = await axios.get(`${API_BASE}/role-requests`, {
        headers: authHeader(),
      });
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Fetch role requests error:", err);
      setLoadError(err.response?.data?.message || "Could not load role requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => {
    const c = { all: requests.length };
    for (const s of ["pending", "approved", "rejected", "cancelled"]) {
      c[s] = requests.filter((r) => r.status === s).length;
    }
    return c;
  }, [requests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = requests.filter((r) => {
      if (activeTab !== "all" && r.status !== activeTab) return false;
      if (!q) return true;
      return [r.username, r.email, r.reason].some((v) => (v || "").toLowerCase().includes(q));
    });
    list.sort((a, b) => {
      const diff = new Date(a.created_at) - new Date(b.created_at);
      return sort === "newest" ? -diff : diff;
    });
    return list;
  }, [requests, activeTab, query, sort]);

  const selectedIndex = filtered.findIndex((r) => r.id === selectedId);
  const selectedRequest = selectedIndex >= 0 ? filtered[selectedIndex] : null;

  const reviewOldestPending = () => {
    const oldest = requests
      .filter((r) => r.status === "pending")
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
    if (!oldest) return;
    setActiveTab("pending");
    setQuery("");
    setSort("oldest");
    setSelectedId(oldest.id);
  };

  // After approve/reject, jump to the next request so admins can work through the queue.
  const handleDone = (message, { advance }) => {
    if (advance && selectedIndex >= 0) {
      const next = filtered[selectedIndex + 1] || filtered[selectedIndex - 1];
      setSelectedId(next ? next.id : null);
    } else {
      setSelectedId(null);
    }
    setToast(message);
    fetchRequests({ silent: true });
  };

  const emptyText = query.trim()
    ? `No requests match “${query.trim()}”.`
    : activeTab === "pending"
    ? "No pending requests. You're all caught up."
    : activeTab === "all"
    ? "No requests yet."
    : `No ${STATUS_META[activeTab].label.toLowerCase()} requests.`;

  return (
    <div className="ar-page">
      <div className="ar-container">
        <header className="ar-page-header">
          <span className="ar-header-icon">
            <ShieldCheckIcon size={26} />
          </span>
          <div className="ar-header-text">
            <h1>Role requests</h1>
            <p>Review HR access requests and manage existing HR users.</p>
          </div>
          {counts.pending > 0 && (
            <button className="ar-button ar-button-primary" onClick={reviewOldestPending}>
              Review pending
              <span className="ar-button-count">{counts.pending}</span>
            </button>
          )}
        </header>

        <div className="ar-toolbar">
          <div className="ar-tabs" role="tablist" aria-label="Filter by status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`ar-tab ${activeTab === tab ? "ar-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "all" ? "All" : STATUS_META[tab].label}
                <span className="ar-tab-count">{counts[tab] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="ar-controls">
            <label className="ar-input-wrap">
              <SearchIcon size={16} />
              <input
                type="search"
                placeholder="Search name, email or reason"
                aria-label="Search requests"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              className="ar-select"
              aria-label="Sort requests"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="ar-list" aria-label="Loading requests">
            {[0, 1, 2].map((i) => (
              <div key={i} className="ar-skeleton" />
            ))}
          </div>
        ) : loadError ? (
          <div className="ar-card ar-state">
            <p className="ar-state-title">{loadError}</p>
            <button className="ar-button ar-button-secondary" onClick={() => fetchRequests()}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ar-card ar-state">
            <span className="ar-state-icon">
              <CheckCircleIcon size={24} />
            </span>
            <p className="ar-state-title">{emptyText}</p>
          </div>
        ) : (
          <ul className="ar-list">
            {filtered.map((r) => {
              const meta = STATUS_META[r.status] || STATUS_META.pending;
              return (
                <li key={r.id}>
                  <button
                    className={`ar-row ${r.id === selectedId ? "ar-row--active" : ""}`}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <span className="ar-user">
                      <span className="ar-avatar" aria-hidden="true">
                        {initials(r.username)}
                      </span>
                      <span className="ar-user-text">
                        <span className="ar-user-name">{r.username}</span>
                        <span className="ar-user-email">{r.email}</span>
                      </span>
                    </span>
                    <span className="ar-reason">{r.reason}</span>
                    <span className={`ar-badge ar-badge--${meta.tone}`}>{meta.label}</span>
                    <span className="ar-date" title={formatDate(r.created_at)}>
                      {timeAgo(r.created_at)}
                    </span>
                    <span className="ar-chevron" aria-hidden="true">
                      <ChevronRightIcon size={18} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedRequest && (
        <RequestDrawer
          request={selectedRequest}
          position={{ index: selectedIndex, total: filtered.length }}
          onClose={() => setSelectedId(null)}
          onPrev={() => selectedIndex > 0 && setSelectedId(filtered[selectedIndex - 1].id)}
          onNext={() =>
            selectedIndex < filtered.length - 1 && setSelectedId(filtered[selectedIndex + 1].id)
          }
          onDone={handleDone}
        />
      )}

      {toast && (
        <div className="ar-toast" role="status">
          <CheckCircleIcon size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------- drawer ---------- */

function RequestDrawer({ request, position, onClose, onPrev, onNext, onDone }) {
  const [evidence, setEvidence] = useState({ status: "loading", url: null, type: null });
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const meta = STATUS_META[request.status] || STATUS_META.pending;

  // Load evidence whenever the selected request changes
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = null;

    setEvidence({ status: "loading", url: null, type: null });
    setShowRejectInput(false);
    setShowRevokeConfirm(false);
    setRejectReason("");
    setActionError("");

    axios
      .get(`${API_BASE}/role-requests/${request.id}/evidence`, {
        headers: authHeader(),
        responseType: "blob",
        signal: controller.signal,
      })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setEvidence({ status: "ready", url: objectUrl, type: res.data.type });
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        console.error("Fetch evidence error:", err);
        setEvidence({ status: "error", url: null, type: null });
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [request.id]);

  // Keyboard: Esc closes, ↑/↓ (or K/J) switch request
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      const tag = e.target.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        onPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  const runAction = async (requestFn, message, advance) => {
    setActionLoading(true);
    setActionError("");
    try {
      await requestFn();
      onDone(message, { advance });
    } catch (err) {
      setActionError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const patchRequest = (payload) =>
    axios.patch(`${API_BASE}/role-requests/${request.id}`, payload, { headers: authHeader() });

  const handleApprove = () =>
    runAction(() => patchRequest({ status: "approved" }), `Approved ${request.username}`, true);

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setActionError("Add a reason so the user knows why.");
      return;
    }
    runAction(
      () => patchRequest({ status: "rejected", reject_reason: rejectReason.trim() }),
      `Rejected ${request.username}`,
      true
    );
  };

  const handleRevoke = () =>
    runAction(
      // NOTE: backend endpoint for this does not exist yet — needs to be added.
      () =>
        axios.patch(
          `${API_BASE}/users/${request.user_id}/revoke-hr`,
          {},
          { headers: authHeader() }
        ),
      `Revoked HR access for ${request.username}`,
      false
    );

  const hasActions = request.status === "pending" || request.status === "approved";

  return (
    <>
      <div className="ar-overlay" onClick={onClose} />
      <aside
        className="ar-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Request from ${request.username}`}
      >
        <div className="ar-drawer-top">
          <div className="ar-nav">
            <button
              className="ar-icon-btn"
              onClick={onPrev}
              disabled={position.index === 0}
              aria-label="Previous request"
            >
              <ArrowUpIcon size={16} />
            </button>
            <button
              className="ar-icon-btn"
              onClick={onNext}
              disabled={position.index >= position.total - 1}
              aria-label="Next request"
            >
              <ArrowDownIcon size={16} />
            </button>
            <span className="ar-nav-pos">
              {position.index + 1} of {position.total}
            </span>
          </div>
          <button className="ar-icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="ar-drawer-body">
          <div className="ar-drawer-head">
            <span className="ar-avatar ar-avatar--lg" aria-hidden="true">
              {initials(request.username)}
            </span>
            <h2 className="ar-drawer-title">{request.username}</h2>
            <p className="ar-drawer-email">{request.email}</p>
            <span className={`ar-badge ar-badge--${meta.tone}`}>{meta.label}</span>
          </div>

          <dl className="ar-facts">
            <div>
              <dt>Submitted</dt>
              <dd>{formatDate(request.created_at)}</dd>
            </div>
            {request.reviewed_at && (
              <div>
                <dt>Reviewed</dt>
                <dd>{formatDate(request.reviewed_at)}</dd>
              </div>
            )}
          </dl>

          <section className="ar-section">
            <h3 className="ar-label">Reason</h3>
            <p className="ar-text">{request.reason}</p>
          </section>

          {request.status === "rejected" && request.reject_reason && (
            <section className="ar-section">
              <h3 className="ar-label">Rejection reason</h3>
              <p className="ar-text">{request.reject_reason}</p>
            </section>
          )}

          <section className="ar-section">
            <h3 className="ar-label">Evidence</h3>
            {evidence.status === "loading" && <div className="ar-evidence-skeleton" />}
            {evidence.status === "error" && (
              <p className="ar-muted">Couldn't load the evidence file.</p>
            )}
            {evidence.status === "ready" && (
              <>
                {evidence.type === "application/pdf" ? (
                  <iframe title="Evidence" src={evidence.url} className="ar-evidence-pdf" />
                ) : evidence.type?.startsWith("image/") ? (
                  <a href={evidence.url} target="_blank" rel="noreferrer" className="ar-evidence-frame">
                    <img src={evidence.url} alt="Evidence" className="ar-evidence-img" />
                  </a>
                ) : (
                  <p className="ar-muted">This file type can't be previewed.</p>
                )}
                <div className="ar-evidence-links">
                  <a href={evidence.url} target="_blank" rel="noreferrer">
                    <ExternalIcon size={14} /> Open in new tab
                  </a>
                  <a href={evidence.url} download>
                    <DownloadIcon size={14} /> Download
                  </a>
                </div>
              </>
            )}
          </section>
        </div>

        {(hasActions || actionError) && (
          <div className="ar-drawer-foot">
            {actionError && (
              <p className="ar-error" role="alert">
                {actionError}
              </p>
            )}

            {request.status === "pending" && !showRejectInput && (
              <div className="ar-actions">
                <button
                  className="ar-button ar-button-primary ar-grow"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Approving…" : "Approve"}
                </button>
                <button
                  className="ar-button ar-button-danger-outline"
                  onClick={() => setShowRejectInput(true)}
                  disabled={actionLoading}
                >
                  Reject
                </button>
              </div>
            )}

            {request.status === "pending" && showRejectInput && (
              <div className="ar-reject">
                <div className="ar-chips">
                  {REJECT_PRESETS.map((p) => (
                    <button key={p} className="ar-chip" onClick={() => setRejectReason(p)}>
                      {p}
                    </button>
                  ))}
                </div>
                <textarea
                  className="ar-textarea"
                  placeholder="Tell the user why this request was rejected"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  autoFocus
                />
                <div className="ar-actions">
                  <button
                    className="ar-button ar-button-danger ar-grow"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Rejecting…" : "Confirm reject"}
                  </button>
                  <button
                    className="ar-button ar-button-secondary"
                    onClick={() => {
                      setShowRejectInput(false);
                      setActionError("");
                    }}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {request.status === "approved" && !showRevokeConfirm && (
              <div className="ar-actions">
                <button
                  className="ar-button ar-button-danger-outline ar-grow"
                  onClick={() => setShowRevokeConfirm(true)}
                >
                  Revoke HR access
                </button>
              </div>
            )}

            {request.status === "approved" && showRevokeConfirm && (
              <div className="ar-reject">
                <p className="ar-text">
                  {request.username} will lose HR access immediately. This can't be undone.
                </p>
                <div className="ar-actions">
                  <button
                    className="ar-button ar-button-danger ar-grow"
                    onClick={handleRevoke}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Revoking…" : "Revoke access"}
                  </button>
                  <button
                    className="ar-button ar-button-secondary"
                    onClick={() => setShowRevokeConfirm(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}