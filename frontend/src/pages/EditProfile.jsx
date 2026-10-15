
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  UserRound,
  Camera,
  Mail,
  Phone,
  AtSign,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  LoaderCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

const API_URL = "http://localhost:3000/api";

const getToken = () => localStorage.getItem("token");

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  "Something went wrong. Please try again.";

function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    username: "",
    email: "",
    role: "",
    profile_image: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  // Load current user's profile
  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await api.get("/users/me");

        // รองรับทั้ง response ที่คืน user โดยตรง
        // และ response รูปแบบ { data: user }
        const user = response.data?.data ?? response.data;

        if (active) {
          setProfile((previous) => ({
            ...previous,
            ...user,
          }));
        }
      } catch (error) {
        if (active) {
          setNotice({
            type: "error",
            message: getErrorMessage(error),
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // Clean up temporary image preview
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const showNotice = (type, message) => {
    setNotice({ type, message });
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setNotice({ type: "", message: "" });

    if (!profile.full_name.trim()) {
      return showNotice("error", "Please enter your full name.");
    }

    if (profile.phone && !/^[+\d\s()-]{7,20}$/.test(profile.phone)) {
      return showNotice("error", "Please enter a valid phone number.");
    }

    setSavingProfile(true);

    try {
      const response = await api.patch("/users/me", {
        full_name: profile.full_name.trim(),
        phone: profile.phone.trim(),
        username: profile.username.trim(),
        email: profile.email.trim(),
      });

      const updatedUser = response.data?.data;

      if (updatedUser) {
        setProfile((previous) => ({
          ...previous,
          ...updatedUser,
        }));
      }

      showNotice(
        "success",
        response.data?.message || "Profile updated successfully."
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showNotice("error", "Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotice("error", "Image size must not exceed 2 MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setNotice({ type: "", message: "" });
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {
      return showNotice("error", "Please select an image first.");
    }

    setUploadingImage(true);
    setNotice({ type: "", message: "" });

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await api.patch(
        "/users/me/profile-image",
        formData
      );

      const result = response.data?.data ?? response.data;
      const imagePath = result?.profile_image;

      if (imagePath) {
        setProfile((previous) => ({
          ...previous,
          profile_image: imagePath,
        }));
      }

      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      showNotice(
        "success",
        response.data?.message || "Profile picture updated."
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setNotice({ type: "", message: "" });

    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return showNotice("error", "Please complete all password fields.");
    }

    if (newPassword.length < 8) {
      return showNotice(
        "error",
        "Your new password must be at least 8 characters."
      );
    }

    if (newPassword !== confirmPassword) {
      return showNotice("error", "New passwords do not match.");
    }

    if (oldPassword === newPassword) {
      return showNotice(
        "error",
        "Your new password must differ from your current password."
      );
    }

    setChangingPassword(true);

    try {
      const response = await api.patch("/users/me/password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showNotice(
        "success",
        response.data?.message || "Password changed successfully."
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";

    if (/^https?:\/\//i.test(path)) return path;

    return `http://localhost:3000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  if (loading) {
    return (
      <div className="edit-profile-loading">
        <LoaderCircle className="spin" size={32} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <main className="edit-profile-page">
      <div className="edit-profile-container">
        <button
          type="button"
          className="ep-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <header className="ep-page-header">
          <div className="ep-header-icon">
            <UserRound size={25} />
          </div>

          <div>
            <h1>Edit Profile</h1>
            <p>Manage your personal information and account security.</p>
          </div>
        </header>

        {notice.message && (
          <div
            className={`ep-notice ${notice.type}`}
            role="status"
            aria-live="polite"
          >
            {notice.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{notice.message}</span>
            <button
              type="button"
              className="ep-notice-close"
              aria-label="Dismiss message"
              onClick={() => setNotice({ type: "", message: "" })}
            >
              ×
            </button>
          </div>
        )}

        {/* Profile photo */}
        <section className="ep-card">
          <div className="ep-card-heading">
            <div>
              <h2>Profile photo</h2>
              <p>Choose a professional picture for your account.</p>
            </div>
          </div>

          <div className="ep-photo-layout">
            <div className="ep-avatar">
              {imagePreview || profile.profile_image ? (
                <img
                  src={
                    imagePreview ||
                    getImageUrl(profile.profile_image)
                  }
                  alt="Profile preview"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <UserRound size={42} />
              )}

              <button
                type="button"
                className="ep-avatar-camera"
                aria-label="Choose profile picture"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={17} />
              </button>
            </div>

            <div className="ep-photo-details">
              <h3>{profile.full_name || profile.username || "Your profile"}</h3>
              <p>
                {profile.role
                  ? profile.role.charAt(0).toUpperCase() +
                    profile.role.slice(1)
                  : "Member"}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleImageSelect}
              />

              <div className="ep-photo-actions">
                <button
                  type="button"
                  className="ep-button ep-button-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  Choose image
                </button>

                {selectedImage && (
                  <button
                    type="button"
                    className="ep-button ep-button-primary"
                    onClick={handleUploadImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <LoaderCircle size={17} className="spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {uploadingImage ? "Uploading..." : "Upload photo"}
                  </button>
                )}
              </div>

              <small>JPG, PNG or WebP. Maximum file size: 2 MB.</small>
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section className="ep-card">
          <div className="ep-card-heading">
            <div>
              <h2>Personal information</h2>
              <p>Update the information associated with your account.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="ep-form-grid">
              <div className="ep-field">
                <label htmlFor="full_name">Full name</label>
                <div className="ep-input-wrap">
                  <UserRound size={18} />
                  <input
                    id="full_name"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    maxLength={150}
                    required
                  />
                </div>
              </div>

              <div className="ep-field">
                <label htmlFor="phone">Phone number</label>
                <div className="ep-input-wrap">
                  <Phone size={18} />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone || ""}
                    onChange={handleProfileChange}
                    placeholder="Enter your phone number"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="ep-field">
                <label htmlFor="email">Email address</label>
                <div className="ep-input-wrap">
                  <Mail size={18} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="ep-field">
                <label htmlFor="username">Username</label>
                <div className="ep-input-wrap">
                  <AtSign size={18} />
                  <input
                    id="username"
                    name="username"
                    value={profile.username}
                    onChange={handleProfileChange}
                    placeholder="Enter your username"
                    maxLength={50}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="ep-form-footer">
              <p>Only your own account information can be updated.</p>
              <button
                type="submit"
                className="ep-button ep-button-primary"
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <LoaderCircle size={18} className="spin" />
                ) : (
                  <Save size={18} />
                )}
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Password */}
        <section className="ep-card">
          <div className="ep-card-heading ep-security-heading">
            <div className="ep-security-icon">
              <ShieldCheck size={23} />
            </div>
            <div>
              <h2>Security settings</h2>
              <p>Change your password to keep your account secure.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="ep-password-fields">
              {[
                {
                  name: "oldPassword",
                  label: "Current password",
                  key: "old",
                  placeholder: "Enter your current password",
                },
                {
                  name: "newPassword",
                  label: "New password",
                  key: "new",
                  placeholder: "At least 8 characters",
                },
                {
                  name: "confirmPassword",
                  label: "Confirm new password",
                  key: "confirm",
                  placeholder: "Re-enter your new password",
                },
              ].map((field) => (
                <div className="ep-field" key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <div className="ep-input-wrap">
                    <LockKeyhole size={18} />
                    <input
                      id={field.name}
                      name={field.name}
                      type={showPassword[field.key] ? "text" : "password"}
                      value={passwordForm[field.name]}
                      onChange={handlePasswordChange}
                      placeholder={field.placeholder}
                      autoComplete={
                        field.name === "oldPassword"
                          ? "current-password"
                          : "new-password"
                      }
                      required
                    />
                    <button
                      type="button"
                      className="ep-password-toggle"
                      aria-label={
                        showPassword[field.key]
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        togglePasswordVisibility(field.key)
                      }
                    >
                      {showPassword[field.key] ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ep-form-footer">
              <p>Use a unique password with at least 8 characters.</p>
              <button
                type="submit"
                className="ep-button ep-button-primary"
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <LoaderCircle size={18} className="spin" />
                ) : (
                  <ShieldCheck size={18} />
                )}
                {changingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </section>

        <footer className="ep-page-footer">
          <ShieldCheck size={16} />
          Your account information is protected by authenticated access.
        </footer>
      </div>
    </main>
  );
}

export default EditProfile;
