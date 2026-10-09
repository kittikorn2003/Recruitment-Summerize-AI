import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import "./AdminRoleRequests.css";

const API_BASE = "http://localhost:3000/api";

const STATUS_TABS = ["all", "pending", "approved", "rejected", "cancelled"];

const STATUS_META = {
  pending: { label: "Pending", tone: "pending" },
  approved: { label: "Approved", tone: "approved" },
  rejected: { label: "Rejected", tone: "rejected" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export default function AdminRoleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedId, setSelectedId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/role-requests`, {
        headers: authHeader(),
      });
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Fetch role requests error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filtered = useMemo(() => {
    if (activeTab === "all") return requests;
    return requests.filter((r) => r.status === activeTab);
  }, [requests, activeTab]);

  const counts = useMemo(() => {
    const c = { all: requests.length };
    for (const status of ["pending", "approved", "rejected", "cancelled"]) {
      c[status] = requests.filter((r) => r.status === status).length;
    }
    return c;
  }, [requests]);

  const selectedRequest = requests.find((r) => r.id === selectedId) || null;

  const handleUpdated = () => {
    fetchRequests();
  };

  return (
    <div className="ar-page">
      <div className="ar-header">
        <h1 className="ar-title">Role requests</h1>
        <p className="ar-subtitle">Review HR access requests and manage existing HR users.</p>
      </div>

      <div className="ar-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            className={`ar-tab ${activeTab === tab ? "ar-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "All" : STATUS_META[tab]?.label}
            <span className="ar-tab-count">{counts[tab] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="ar-table-wrap">
        {loading ? (
          <p className="ar-loading">Loading requests…</p>
        ) : filtered.length === 0 ? (
          <p className="ar-empty">No {activeTab === "all" ? "" : activeTab} requests.</p>
        ) : (
          <table className="ar-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const meta = STATUS_META[r.status] || STATUS_META.pending;
                return (
                  <tr
                    key={r.id}
                    className={r.id === selectedId ? "ar-row--active" : ""}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <td>
                      <div className="ar-user">
                        <span className="ar-user-name">{r.username}</span>
                        <span className="ar-user-email">{r.email}</span>
                      </div>
                    </td>
                    <td className="ar-reason-cell">{r.reason}</td>
                    <td>
                      <span className={`ar-badge ar-badge--${meta.tone}`}>{meta.label}</span>
                    </td>
                    <td className="ar-date-cell">{formatDate(r.created_at)}</td>
                    <td className="ar-arrow-cell">→</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedRequest && (
        <RequestDrawer
          request={selectedRequest}
          onClose={() => setSelectedId(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}

function RequestDrawer({ request, onClose, onUpdated }) {
  const [evidenceUrl, setEvidenceUrl] = useState(null);
  const [evidenceType, setEvidenceType] = useState(null);
  const [evidenceLoading, setEvidenceLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const meta = STATUS_META[request.status] || STATUS_META.pending;

  useEffect(() => {
    let objectUrl = null;
    setEvidenceLoading(true);
    setEvidenceUrl(null);
    setShowRejectInput(false);
    setRejectReason("");
    setActionError("");

    axios
      .get(`${API_BASE}/role-requests/${request.id}/evidence`, {
        headers: authHeader(),
        responseType: "blob",
      })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setEvidenceUrl(objectUrl);
        setEvidenceType(res.data.type);
      })
      .catch((err) => console.error("Fetch evidence error:", err))
      .finally(() => setEvidenceLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [request.id]);

  const runAction = async (payload, successMsg) => {
    setActionLoading(true);
    setActionError("");
    try {
      await axios.patch(`${API_BASE}/role-requests/${request.id}`, payload, {
        headers: authHeader(),
      });
      onUpdated();
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => runAction({ status: "approved" });

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setActionError("Please provide a reason for rejecting");
      return;
    }
    runAction({ status: "rejected", reject_reason: rejectReason.trim() });
  };

  const handleRevoke = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      // NOTE: backend endpoint for this does not exist yet — needs to be added.
      await axios.patch(
        `${API_BASE}/users/${request.user_id}/revoke-hr`,
        {},
        { headers: authHeader() }
      );
      onUpdated();
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not revoke HR access");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="ar-overlay" onClick={onClose} />
      <div className="ar-drawer">
        <button className="ar-drawer-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <span className={`ar-badge ar-badge--${meta.tone}`}>{meta.label}</span>
        <h2 className="ar-drawer-title">{request.username}</h2>
        <p className="ar-drawer-email">{request.email}</p>
        <p className="ar-drawer-date">
          Submitted {formatDate(request.created_at)}
          {request.reviewed_at && ` · Reviewed ${formatDate(request.reviewed_at)}`}
        </p>

        <div className="ar-drawer-section">
          <p className="ar-drawer-label">Reason</p>
          <p className="ar-drawer-value">{request.reason}</p>
        </div>

        {request.status === "rejected" && request.reject_reason && (
          <div className="ar-drawer-section">
            <p className="ar-drawer-label">Rejection reason</p>
            <p className="ar-drawer-value">{request.reject_reason}</p>
          </div>
        )}

        <div className="ar-drawer-section">
          <p className="ar-drawer-label">Evidence</p>
          {evidenceLoading ? (
            <p className="ar-evidence-loading">Loading evidence…</p>
          ) : evidenceUrl ? (
            evidenceType === "application/pdf" ? (
              <iframe title="evidence" src={evidenceUrl} className="ar-evidence-pdf" />
            ) : (
              <img src={evidenceUrl} alt="Evidence" className="ar-evidence-img" />
            )
          ) : (
            <p className="ar-evidence-loading">No evidence file found.</p>
          )}
          {evidenceUrl && (
            <a href={evidenceUrl} download className="ar-evidence-download">
              Download original file
            </a>
          )}
        </div>

        {actionError && <p className="ar-drawer-error">{actionError}</p>}

        <div className="ar-drawer-actions">
          {request.status === "pending" && !showRejectInput && (
            <>
              <button
                className="ar-btn ar-btn--approve"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? "Approving…" : "Approve"}
              </button>
              <button
                className="ar-btn ar-btn--reject"
                onClick={() => setShowRejectInput(true)}
                disabled={actionLoading}
              >
                Reject
              </button>
            </>
          )}

          {request.status === "pending" && showRejectInput && (
            <div className="ar-reject-form">
              <textarea
                className="ar-reject-textarea"
                placeholder="Reason for rejecting this request…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <div className="ar-reject-form-actions">
                <button
                  className="ar-btn ar-btn--reject"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Rejecting…" : "Confirm reject"}
                </button>
                <button
                  className="ar-btn ar-btn--ghost"
                  onClick={() => setShowRejectInput(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {request.status === "approved" && (
            <button
              className="ar-btn ar-btn--revoke"
              onClick={handleRevoke}
              disabled={actionLoading}
            >
              {actionLoading ? "Revoking…" : "Revoke HR access"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}