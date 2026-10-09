import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./RoleRequest.css";

const API_BASE = "http://localhost:3000/api";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const STATUS_META = {
  pending: { label: "Pending review", tone: "pending" },
  approved: { label: "Approved", tone: "approved" },
  rejected: { label: "Rejected", tone: "rejected" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RoleRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // form state
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchMyRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/role-requests/me`, {
        headers: authHeader,
      });
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Fetch role requests error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  // the request that currently blocks a new submission
  const activeRequest = requests.find(
    (r) => r.status === "pending" || r.status === "approved"
  );
  const history = requests.filter((r) => r !== activeRequest);

  const validateAndSetFile = (candidate) => {
    setErrorMsg("");
    if (!candidate) return;
    if (!ALLOWED_TYPES.includes(candidate.type)) {
      setErrorMsg("Only PDF, JPG, or PNG files are accepted");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setErrorMsg("File must be smaller than 5MB");
      return;
    }
    setFile(candidate);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!reason.trim()) {
      setErrorMsg("Please explain why you need HR access");
      return;
    }
    if (!file) {
      setErrorMsg("Please attach an evidence file");
      return;
    }

    const formData = new FormData();
    formData.append("reason", reason.trim());
    formData.append("evidence", file);

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/role-requests`, formData, {
        headers: { ...authHeader, "Content-Type": "multipart/form-data" },
      });
      setReason("");
      setFile(null);
      await fetchMyRequests();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await axios.delete(`${API_BASE}/role-requests/${id}`, {
        headers: authHeader,
      });
      await fetchMyRequests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Could not cancel this request");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rr-page">
        <div className="rr-shell">
          <p className="rr-loading">Loading your access status…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rr-page">
      <div className="rr-shell">
        <span className="rr-eyebrow">HR ACCESS</span>
        <h1 className="rr-title">Request HR access</h1>
        <p className="rr-subtitle">
          Candidate resumes contain personal information, so search access is
          limited to HR and admins. Tell us why you need it and attach proof
          of your role.
        </p>

        {activeRequest ? (
          <StatusCard
            request={activeRequest}
            onCancel={handleCancel}
            cancelling={cancellingId === activeRequest.id}
          />
        ) : (
          <form className="rr-card" onSubmit={handleSubmit}>
            <label className="rr-label" htmlFor="reason">
              Reason
            </label>
            <textarea
              id="reason"
              className="rr-textarea"
              placeholder="e.g. I'm the recruiting lead for the engineering team and need to search candidate resumes."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />

            <span className="rr-label">Evidence</span>
            <label
              className={`rr-dropzone ${isDragging ? "rr-dropzone--active" : ""} ${
                file ? "rr-dropzone--filled" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => validateAndSetFile(e.target.files?.[0])}
                hidden
              />
              {file ? (
                <>
                  <FileIcon />
                  <span className="rr-dropzone-filename">{file.name}</span>
                  <span className="rr-dropzone-hint">Click to replace</span>
                </>
              ) : (
                <>
                  <FileIcon />
                  <span className="rr-dropzone-filename">
                    Drop a file, or click to browse
                  </span>
                  <span className="rr-dropzone-hint">PDF, JPG or PNG · up to 5MB</span>
                </>
              )}
            </label>

            {errorMsg && <p className="rr-error">{errorMsg}</p>}

            <button className="rr-submit" type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </button>
          </form>
        )}

        {history.length > 0 && (
          <div className="rr-history">
            <h2 className="rr-history-title">Previous requests</h2>
            {history.map((r) => (
              <HistoryRow key={r.id} request={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({ request, onCancel, cancelling }) {
  const meta = STATUS_META[request.status] || STATUS_META.pending;

  return (
    <div className={`rr-card rr-status rr-status--${meta.tone}`}>
      <div className="rr-status-header">
        <StatusIcon tone={meta.tone} />
        <div>
          <p className="rr-status-label">{meta.label}</p>
          <p className="rr-status-date">Submitted {formatDate(request.created_at)}</p>
        </div>
      </div>

      <div className="rr-status-body">
        <p className="rr-status-field-label">Reason</p>
        <p className="rr-status-field-value">{request.reason}</p>
      </div>

      {request.status === "rejected" && request.reject_reason && (
        <div className="rr-status-body">
          <p className="rr-status-field-label">Reason for rejection</p>
          <p className="rr-status-field-value">{request.reject_reason}</p>
        </div>
      )}

      {request.status === "approved" && (
        <p className="rr-status-approved-note">
          You now have HR access. Head to candidate search to get started.
        </p>
      )}

      {request.status === "pending" && (
        <button
          className="rr-cancel"
          onClick={() => onCancel(request.id)}
          disabled={cancelling}
        >
          {cancelling ? "Cancelling…" : "Cancel request"}
        </button>
      )}
    </div>
  );
}

function HistoryRow({ request }) {
  const meta = STATUS_META[request.status] || STATUS_META.neutral;
  return (
    <div className="rr-history-row">
      <span className={`rr-dot rr-dot--${meta.tone}`} />
      <span className="rr-history-status">{meta.label}</span>
      <span className="rr-history-date">{formatDate(request.created_at)}</span>
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function StatusIcon({ tone }) {
  if (tone === "approved") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="var(--rr-success-soft)" />
        <path
          d="M8 12.5l2.5 2.5L16 9"
          stroke="var(--rr-success)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (tone === "rejected") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="var(--rr-danger-soft)" />
        <path
          d="M9 9l6 6M15 9l-6 6"
          stroke="var(--rr-danger)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="var(--rr-pink-soft)" />
      <path
        d="M12 7v5l3 2"
        stroke="var(--rr-pink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}