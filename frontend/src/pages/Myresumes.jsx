import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye, Pencil, Trash2, Power, X, Plus, Loader2,
    FileText, AlertCircle, CheckCircle2, RefreshCw,
} from "lucide-react";
import "./ResumeForm.css";
import "./MyResumes.css";

/* ------------------------------------------------------------------ *
 * API helper
 * ปรับ 3 จุดนี้ให้ตรงกับโปรเจกต์ (base URL / ที่เก็บ token / หน้า login)
 * ถ้าโปรเจกต์มี axios instance หรือ api client อยู่แล้ว ให้แทนที่ฟังก์ชัน api() ด้วยของเดิม
 * ------------------------------------------------------------------ */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const getToken = () => localStorage.getItem("token");
const clearToken = () => localStorage.removeItem("token");
const LOGIN_PATH = "/login";
const UPLOAD_PATH = "/upload";

class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

async function api(path, { method = "GET", body } = {}) {
    let res;
    try {
        res = await fetch(`${API_BASE}/api/resumes${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError("Unable to connect to the server. Check your connection and try again.", 0);
    }
    const json = await res.json().catch(() => null);
    if (!res.ok) {
        throw new ApiError(json?.message || json?.error || `Request failed (${res.status}).`, res.status);
    }
    return json;
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
const FIELD_LABELS = {
    full_name: "Full Name",
    email: "Email",
    address: "Address",
    career_summary: "Career Summary",
    skills: "Skills",
    spoken_languages: "Spoken Languages",
    education: "Education",
    employment_history: "Employment History",
    projects_or_research: "Projects & Research",
};
const STRUCTURED = ["education", "employment_history", "projects_or_research"];
const prettyKey = (k) => k.replace(/_/g, " ");

const asArray = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== "") : []);
const isEmpty = (v) =>
    v === null || v === undefined || v === "" ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return isNaN(date) ? "" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// แสดงค่าที่อาจเป็น string / array / object แบบอ่านง่าย ไม่โชว์ JSON ดิบ
function Value({ value }) {
    if (isEmpty(value)) return <span className="mr-muted">No information available</span>;
    if (typeof value === "string" || typeof value === "number") {
        return <p className="mr-text">{String(value)}</p>;
    }
    if (Array.isArray(value)) {
        return (
            <ul className="mr-entries">
                {value.map((item, i) => (
                    <li key={i}>
                        <Value value={item} />
                    </li>
                ))}
            </ul>
        );
    }
    if (typeof value === "object") {
        return (
            <dl className="mr-kv">
                {Object.entries(value)
                    .filter(([, v]) => !isEmpty(v))
                    .map(([k, v]) => (
                        <div key={k}>
                            <dt>{prettyKey(k)}</dt>
                            <dd><Value value={v} /></dd>
                        </div>
                    ))}
            </dl>
        );
    }
    return <p className="mr-text">{String(value)}</p>;
}

function Chips({ items }) {
    const list = asArray(items);
    if (!list.length) return <span className="mr-muted">No information available</span>;
    return (
        <ul className="mr-chips">
            {list.map((s, i) => <li key={`${s}-${i}`}>{String(s)}</li>)}
        </ul>
    );
}

/* ------------------------------------------------------------------ *
 * Modal (ปิดด้วย Esc, คลิกพื้นหลัง, โฟกัสเข้า dialog)
 * ------------------------------------------------------------------ */
function Modal({ title, onClose, children, footer, size = "md", busy = false }) {
    const ref = useRef(null);
    useEffect(() => {
        ref.current?.focus();
        const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose, busy]);

    return (
        <div className="mr-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
            <div className={`mr-modal mr-modal-${size}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
                <header className="mr-modal-head">
                    <h2>{title}</h2>
                    <button type="button" className="mr-icon-btn" onClick={onClose} disabled={busy} aria-label="Close">
                        <X size={18} />
                    </button>
                </header>
                <div className="mr-modal-body">{children}</div>
                {footer && <footer className="mr-modal-foot">{footer}</footer>}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ *
 * Tag input (skills / spoken_languages)
 * ------------------------------------------------------------------ */
function TagInput({ id, value, onChange, placeholder }) {
    const [draft, setDraft] = useState("");
    const add = () => {
        const next = draft.trim();
        if (next && !value.some((item) => item.toLowerCase() === next.toLowerCase())) onChange([...value, next]);
        setDraft("");
    };
    return (
        <div className="rf-skill-input-row">
            <input id={id} className="rf-input" value={draft} placeholder={placeholder}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }} />
            <button type="button" className="rf-add-btn" onClick={add}><Plus size={14} /> Add</button>
        </div>
    );
}

/* ------------------------------------------------------------------ *
 * Edit form
 * ------------------------------------------------------------------ */
const structuredToText = (v) => (v === null || v === undefined ? "" : typeof v === "string" ? v : JSON.stringify(v, null, 2));
const parseStructured = (value, original, key, errors) => {
    const text = value.trim();
    if (typeof original === "string" || original == null) return text;
    if (!text) return Array.isArray(original) ? [] : {};
    try { return JSON.parse(text); }
    catch { errors[key] = "Please enter valid JSON."; return undefined; }
};

function EditForm({ resume, saving, onCancel, onSubmit }) {
    const initial = {
        full_name: resume.full_name ?? "",
        email: resume.email ?? "",
        address: resume.address ?? "",
        career_summary: resume.career_summary ?? "",
        skills: asArray(resume.skills).map(String),
        spoken_languages: asArray(resume.spoken_languages).map(String),
        education: structuredToText(resume.education),
        employment_history: structuredToText(resume.employment_history),
        projects_or_research: structuredToText(resume.projects_or_research),
    };
    const educationInitial = Array.isArray(resume.education)
        ? resume.education.map((item) => ({ ...item })) : [];
    const [form, setForm] = useState(initial);
    const [education, setEducation] = useState(educationInitial);
        const [errors, setErrors] = useState({});
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const updateEducation = (index, key, value) => setEducation((items) => items.map((item, i) => i === index ? { ...item, [key]: value } : item));
    const addEducation = () => setEducation((items) => [...items, { degree: "", institution: "", year: "" }]);
    const removeEducation = (index) => setEducation((items) => items.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.full_name.trim()) errs.full_name = "Full name is required.";
        if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "Please enter a valid email address.";
        const updates = {};
        for (const key of ["full_name", "email", "address", "career_summary", "skills", "spoken_languages"]) {
            if (JSON.stringify(form[key]) !== JSON.stringify(initial[key])) {
                updates[key] = typeof form[key] === "string" ? form[key].trim() : form[key];
            }
        }
        if (Array.isArray(resume.education)) {
            if (JSON.stringify(education) !== JSON.stringify(educationInitial)) updates.education = education;
        } else if (form.education !== initial.education) {
            const parsed = parseStructured(form.education, resume.education, "education", errs);
            if (parsed !== undefined) updates.education = parsed;
        }
        for (const key of ["employment_history", "projects_or_research"]) {
            if (form[key] !== initial[key]) {
                const parsed = parseStructured(form[key], resume[key], key, errs);
                if (parsed !== undefined) updates[key] = parsed;
            }
        }
        setErrors(errs);
        if (Object.keys(errs).length) return;
        if (!Object.keys(updates).length) return onCancel();
        onSubmit(updates);
    };

    const textField = (key, props = {}) => (
        <div className="rf-field" key={key}>
            <label className="rf-label" htmlFor={`f-${key}`}>{FIELD_LABELS[key]}{key === "full_name" ? " *" : ""}</label>
            <input id={`f-${key}`} className="rf-input" value={form[key]} onChange={(e) => set(key, e.target.value)} aria-invalid={!!errors[key]} {...props} />
            {errors[key] && <p className="mr-field-error">{errors[key]}</p>}
        </div>
    );

    const structuredField = (key) => {
        const original = resume[key];
        const isText = typeof original === "string" || original == null;
        return <section className="rf-section" key={key}>
            <p className="rf-section-label">{FIELD_LABELS[key]}</p>
            <textarea id={`f-${key}`} className="rf-textarea" rows={5} value={form[key]} onChange={(e) => set(key, e.target.value)} aria-invalid={!!errors[key]} spellCheck={false} placeholder={isText ? `Enter ${FIELD_LABELS[key].toLowerCase()}...` : "Edit the JSON while preserving its existing structure."} />
            {!isText && <p className="mr-hint">This field uses structured data. Keep the JSON format valid when editing.</p>}
            {errors[key] && <p className="mr-field-error">{errors[key]}</p>}
        </section>;
    };

    return (
        <form id="mr-edit-form" className="rf-form mr-edit-form" onSubmit={handleSubmit} noValidate>
            <div className="rf-header">
                <div><p className="rf-header-sub">Resume</p><h2 className="rf-header-title">Personal Information</h2></div>
            </div>
            <div className="rf-body">
                <section className="rf-section">
                    <p className="rf-section-label">Contact</p>
                    {textField("full_name")}
                    <div className="rf-row">{textField("email", { type: "email" })}{textField("address")}</div>
                </section>
                <section className="rf-section">
                    <p className="rf-section-label">Career Summary</p>
                    <textarea id="f-career_summary" className="rf-textarea" rows={4} placeholder="Brief overview of your professional background..." value={form.career_summary} onChange={(e) => set("career_summary", e.target.value)} />
                </section>
                <section className="rf-section">
                    <div className="rf-section-header"><p className="rf-section-label">Education</p><button type="button" className="rf-add-btn" onClick={addEducation}>+ Add</button></div>
                    {Array.isArray(resume.education) ? <div className="rf-list">
                        {education.map((edu, index) => <div className="rf-card" key={index}>
                            <button type="button" className="rf-remove-btn" onClick={() => removeEducation(index)} aria-label={`Remove education ${index + 1}`}>×</button>
                            <div className="rf-row">
                                <div className="rf-field"><label className="rf-label">Degree</label><input className="rf-input" value={edu.degree ?? ""} onChange={(e) => updateEducation(index, "degree", e.target.value)} placeholder="Degree" /></div>
                                <div className="rf-field"><label className="rf-label">Institution</label><input className="rf-input" value={edu.institution ?? ""} onChange={(e) => updateEducation(index, "institution", e.target.value)} placeholder="University / Institution" /></div>
                            </div>
                            <div className="rf-field rf-year-field"><label className="rf-label">Year</label><input className="rf-input" value={edu.year ?? ""} onChange={(e) => updateEducation(index, "year", e.target.value)} placeholder="Year" /></div>
                        </div>)}
                        {!education.length && <p className="mr-muted">No education entries yet. Select + Add to create one.</p>}
                    </div> : <>
                        <textarea className="rf-textarea" rows={4} value={form.education} onChange={(e) => set("education", e.target.value)} placeholder="Enter education details..." />
                        {errors.education && <p className="mr-field-error">{errors.education}</p>}
                    </>}
                </section>
                <section className="rf-section"><p className="rf-section-label">Skills</p>
                    <div className="rf-skills">{form.skills.map((skill, index) => <div className="rf-skill-tag" key={`${skill}-${index}`}><span>{skill}</span><button type="button" className="rf-skill-remove" aria-label={`Remove ${skill}`} onClick={() => set("skills", form.skills.filter((_, i) => i !== index))}>×</button></div>)}</div>
                    <TagInput id="f-skills" value={form.skills} onChange={(v) => set("skills", v)} placeholder="Add a skill..." />
                </section>
                <section className="rf-section"><p className="rf-section-label">Spoken Languages</p>
                    <div className="rf-skills">{form.spoken_languages.map((language, index) => <div className="rf-skill-tag" key={`${language}-${index}`}><span>{language}</span><button type="button" className="rf-skill-remove" aria-label={`Remove ${language}`} onClick={() => set("spoken_languages", form.spoken_languages.filter((_, i) => i !== index))}>×</button></div>)}</div>
                    <TagInput id="f-languages" value={form.spoken_languages} onChange={(v) => set("spoken_languages", v)} placeholder="Add a language..." />
                </section>
                {structuredField("employment_history")}
                {structuredField("projects_or_research")}
            </div>
            <div className="rf-footer">
                <button type="button" className="rf-btn-cancel" onClick={onCancel} disabled={saving}>Cancel</button>
                <button type="submit" className="rf-btn-save" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
        </form>
    );
}

/* ------------------------------------------------------------------ *
 * Main page
 * ------------------------------------------------------------------ */
export default function MyResumes() {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null); // { type: 'view'|'edit'|'delete'|'toggle', resume }
    const [busy, setBusy] = useState(false);
    const toastTimer = useRef(null);

    const notify = useCallback((type, message) => {
        setToast({ type, message });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 4500);
    }, []);
    useEffect(() => () => clearTimeout(toastTimer.current), []);

    // แปลง error เป็นข้อความ + จัดการ 401
    const describeError = useCallback((err) => {
        if (err.status === 401) {
            clearToken();
            navigate(LOGIN_PATH, { replace: true });
            return "Your session has expired. Please sign in again.";
        }
        if (err.status === 403) return "You do not have permission to perform this action.";
        return err.message || "An unexpected error occurred.";
    }, [navigate]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const json = await api("/my");
            const list = Array.isArray(json) ? json : json?.data;
            if (!Array.isArray(list)) throw new ApiError("The server returned an unexpected response.", 0);
            setResumes(list);
        } catch (err) {
            setError(describeError(err));
        } finally {
            setLoading(false);
        }
    }, [describeError]);

    useEffect(() => {
        if (!getToken()) { navigate(LOGIN_PATH, { replace: true }); return; }
        load();
    }, [load, navigate]);

    const closeModal = useCallback(() => { if (!busy) setModal(null); }, [busy]);

    // เปิดรายละเอียด: ดึงข้อมูลล่าสุดจาก GET /my/:id
    const openView = async (resume) => {
        setModal({ type: "view", resume });
        try {
            const json = await api(`/my/${resume.id}`);
            if (json?.data) setModal((m) => (m?.type === "view" && m.resume.id === resume.id ? { ...m, resume: json.data } : m));
        } catch (err) {
            if (err.status === 404) { setModal(null); notify("error", "This resume could not be found."); load(); }
        }
    };

    const openEdit = async (resume) => {
        // ใช้ข้อมูลเต็มจาก GET /my/:id เพื่อให้มีฟิลด์ address ฯลฯ ครบ
        setBusy(true);
        try {
            const json = await api(`/my/${resume.id}`);
            setModal({ type: "edit", resume: json?.data || resume });
        } catch (err) {
            notify("error", describeError(err));
        } finally {
            setBusy(false);
        }
    };

    const saveEdit = async (updates) => {
        const { resume } = modal;
        setBusy(true);
        try {
            const json = await api(`/my/${resume.id}`, { method: "PUT", body: updates });
            const updated = json?.data;
            setResumes((list) => list.map((r) => (r.id === resume.id ? { ...r, ...updated } : r)));
            setModal(null);
            notify("success", "Resume updated successfully.");
        } catch (err) {
            if (err.status === 404) { setModal(null); load(); }
            notify("error", describeError(err));
        } finally {
            setBusy(false);
        }
    };

    const confirmToggle = async () => {
        const { resume } = modal;
        const next = !resume.is_active;
        setBusy(true);
        try {
            const json = await api(`/my/${resume.id}/status`, { method: "PATCH", body: { is_active: next } });
            const confirmed = typeof json?.data?.is_active === "boolean" ? json.data.is_active : next;
            setResumes((list) => list.map((r) => (r.id === resume.id ? { ...r, is_active: confirmed } : r)));
            setModal(null);
            notify("success", confirmed ? "Resume enabled. HR can find it in candidate search again." : "Resume disabled. It is now hidden from HR search.");
        } catch (err) {
            if (err.status === 404) { setModal(null); load(); }
            notify("error", describeError(err));
        } finally {
            setBusy(false);
        }
    };

    const confirmDelete = async () => {
        const { resume } = modal;
        setBusy(true);
        try {
            await api(`/my/${resume.id}`, { method: "DELETE" });
            setResumes((list) => list.filter((r) => r.id !== resume.id));
            setModal(null);
            notify("success", "Resume deleted successfully.");
        } catch (err) {
            if (err.status === 404) {
                // ถูกลบไปแล้ว — เอาออกจากรายการให้ตรงกับเซิร์ฟเวอร์
                setResumes((list) => list.filter((r) => r.id !== resume.id));
                setModal(null);
                notify("error", "Resume not found. It may have already been deleted.");
            } else {
                notify("error", describeError(err));
            }
        } finally {
            setBusy(false);
        }
    };

    const activeCount = resumes.filter((r) => r.is_active).length;

    return (
        <main className="mr-page">
            <header className="mr-header">
                <div>
                    <h1>My Resumes</h1>
                    <p>Manage your uploaded resumes, update your information, control HR visibility, or delete a resume.</p>
                </div>
                {!loading && !error && (
                    <p className="mr-count" aria-live="polite">
                        {resumes.length} Resume · enabled {activeCount}
                    </p>
                )}
            </header>

            {toast && (
                <div className={`mr-toast mr-toast-${toast.type}`} role={toast.type === "error" ? "alert" : "status"}>
                    {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{toast.message}</span>
                    <button type="button" className="mr-icon-btn" onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={16} /></button>
                </div>
            )}

            {loading && (
                <div className="mr-grid" aria-busy="true" aria-label="Loading resumes">
                    {[0, 1, 2].map((i) => <div key={i} className="mr-card mr-skeleton" />)}
                </div>
            )}

            {!loading && error && (
                <div className="mr-state" role="alert">
                    <AlertCircle size={36} />
                    <h2>Unable to load resumes</h2>
                    <p>{error}</p>
                    <button type="button" className="mr-btn mr-btn-primary" onClick={load}><RefreshCw size={16} /> Try again</button>
                </div>
            )}

            {!loading && !error && resumes.length === 0 && (
                <div className="mr-state">
                    <FileText size={36} />
                    <h2>No resumes yet</h2>
                    <p>Resumes you upload and save will appear here.</p>
                    <Link to={UPLOAD_PATH} className="mr-btn mr-btn-primary">Upload Resume</Link>
                </div>
            )}

            {!loading && !error && resumes.length > 0 && (
                <div className="mr-grid">
                    {resumes.map((r) => (
                        <article key={r.id} className={`mr-card ${r.is_active ? "" : "mr-card-off"}`}>
                            <div className="mr-card-top">
                                <div className="mr-card-title">
                                    <h2>{r.full_name || "Unnamed resume"}</h2>
                                    {r.file_name && <p className="mr-file"><FileText size={14} /> {r.file_name}</p>}
                                </div>
                                <span className={`mr-badge ${r.is_active ? "mr-badge-on" : "mr-badge-off"}`}>
                                    {r.is_active ? <CheckCircle2 size={13} /> : <Power size={13} />}
                                    {r.is_active ? "Enabled" : "Disabled"}
                                </span>
                            </div>
                            <p className="mr-visibility">
                                {r.is_active ? "Visible in HR candidate search" : "Hidden from HR search"}
                            </p>

                            <p className="mr-summary">{r.career_summary || <span className="mr-muted">No career summary available</span>}</p>

                            <div className="mr-meta">
                                <span className="mr-meta-label">Skills</span>
                                <Chips items={asArray(r.skills).slice(0, 6)} />
                                {asArray(r.skills).length > 6 && <span className="mr-more">+{asArray(r.skills).length - 6}</span>}
                            </div>
                            <div className="mr-meta">
                                <span className="mr-meta-label">Languages</span>
                                <Chips items={r.spoken_languages} />
                            </div>

                            <footer className="mr-card-foot">
                                <time className="mr-date" dateTime={r.created_at}>{formatDate(r.created_at) && `Uploaded ${formatDate(r.created_at)}`}</time>
                                <div className="mr-actions">
                                    <button type="button" className="mr-icon-btn" title="View details" aria-label={`View details for ${r.full_name || "resume"}`} onClick={() => openView(r)}><Eye size={18} /></button>
                                    <button type="button" className="mr-icon-btn" title="Edit" aria-label={`Edit ${r.full_name || "resume"}`} disabled={busy} onClick={() => openEdit(r)}><Pencil size={18} /></button>
                                    <button type="button" className="mr-icon-btn" title={r.is_active ? "Disable resume" : "Enable resume"} aria-label={r.is_active ? "Disable resume" : "Enable resume"} onClick={() => setModal({ type: "toggle", resume: r })}><Power size={18} /></button>
                                    <button type="button" className="mr-icon-btn mr-danger" title="Delete" aria-label={`Delete ${r.full_name || "resume"}`} onClick={() => setModal({ type: "delete", resume: r })}><Trash2 size={18} /></button>
                                </div>
                            </footer>
                        </article>
                    ))}
                </div>
            )}

            {/* ---------- View ---------- */}
            {modal?.type === "view" && (
                <Modal title={modal.resume.full_name || "Resume Details"} onClose={closeModal} size="lg"
                    footer={<>
                        <button type="button" className="mr-btn mr-btn-ghost" onClick={closeModal}>Close</button>
                        <button type="button" className="mr-btn mr-btn-primary" onClick={() => openEdit(modal.resume)}><Pencil size={16} /> Edit</button>
                    </>}>
                    <span className={`mr-badge ${modal.resume.is_active ? "mr-badge-on" : "mr-badge-off"}`}>
                        {modal.resume.is_active ? "Enabled · Visible to HR" : "Disabled · Hidden from HR"}
                    </span>
                    <section className="mr-section"><h3>Personal Information</h3>
                        <dl className="mr-kv">
                            {["full_name", "email", "address"].map((k) => (
                                <div key={k}><dt>{FIELD_LABELS[k]}</dt><dd><Value value={modal.resume[k]} /></dd></div>
                            ))}
                            {modal.resume.file_name && <div><dt>File</dt><dd><Value value={modal.resume.file_name} /></dd></div>}
                        </dl>
                    </section>
                    <section className="mr-section"><h3>{FIELD_LABELS.career_summary}</h3><Value value={modal.resume.career_summary} /></section>
                    <section className="mr-section"><h3>{FIELD_LABELS.skills}</h3><Chips items={modal.resume.skills} /></section>
                    <section className="mr-section"><h3>{FIELD_LABELS.spoken_languages}</h3><Chips items={modal.resume.spoken_languages} /></section>
                    {STRUCTURED.map((k) => (
                        <section className="mr-section" key={k}><h3>{FIELD_LABELS[k]}</h3><Value value={modal.resume[k]} /></section>
                    ))}
                </Modal>
            )}

            {/* ---------- Edit ---------- */}
            {modal?.type === "edit" && (
                <Modal title="Edit Resume" onClose={closeModal} size="lg" busy={busy}>
                    <EditForm resume={modal.resume} saving={busy} onCancel={closeModal} onSubmit={saveEdit} />
                </Modal>
            )}

            {/* ---------- Toggle ---------- */}
            {modal?.type === "toggle" && (
                <Modal title={modal.resume.is_active ? "Disable Resume?" : "Enable Resume?"} onClose={closeModal} size="sm" busy={busy}
                    footer={<>
                        <button type="button" className="mr-btn mr-btn-ghost" onClick={closeModal} disabled={busy}>Cancel</button>
                        <button type="button" className="mr-btn mr-btn-primary" onClick={confirmToggle} disabled={busy}>
                            {busy && <Loader2 size={16} className="mr-spin" />}
                            {modal.resume.is_active ? "Disable Resume" : "Enable Resume"}
                        </button>
                    </>}>
                    {modal.resume.is_active ? (
                        <p>The resume belonging to <strong>{modal.resume.full_name}</strong> will be hidden from HR search. Your data will remain saved, and you can enable it again at any time. This does not delete the resume.</p>
                    ) : (
                        <p>The resume belonging to <strong>{modal.resume.full_name}</strong> will become visible in HR search again.</p>
                    )}
                </Modal>
            )}

            {/* ---------- Delete ---------- */}
            {modal?.type === "delete" && (
                <Modal title="Delete Resume Permanently?" onClose={closeModal} size="sm" busy={busy}
                    footer={<>
                        <button type="button" className="mr-btn mr-btn-ghost" onClick={closeModal} disabled={busy}>Cancel</button>
                        <button type="button" className="mr-btn mr-btn-danger" onClick={confirmDelete} disabled={busy}>
                            {busy && <Loader2 size={16} className="mr-spin" />} Delete Permanently
                        </button>
                    </>}>
                    <p>You are about to permanently delete the resume belonging to <strong>{modal.resume.full_name}</strong>. This action <strong>cannot be undone</strong>.</p>
                    <p className="mr-hint">If you only want to hide it from HR temporarily, choose “Disable” instead. Your data will be preserved.</p>
                </Modal>
            )}
        </main>
    );
}