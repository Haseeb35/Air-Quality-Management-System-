import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role,            setRole]            = useState("User");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) setRole(snap.data().role || "User");
        } catch (e) { console.error(e); }
      }
    };
    fetchRole();
  }, []);

  const handleNavigation = () =>
    navigate(role === "Admin" ? "/admin-dashboard" : "/user-dashboard");

  // Password strength
  const strength = (p) => {
    if (!p) return { level: 0, label: "", color: "transparent" };
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { level: 1, label: "Weak",   color: "#f87171" };
    if (s <= 3) return { level: 2, label: "Medium", color: "#fbbf24" };
    return             { level: 3, label: "Strong", color: "#4ade80" };
  };
  const pw = strength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(false); setLoading(true);

    if (newPassword !== confirmPassword)       { setError("New passwords do not match.");              setLoading(false); return; }
    if (newPassword.length < 6)                { setError("Password must be at least 6 characters.");  setLoading(false); return; }
    if (currentPassword === newPassword)       { setError("New password cannot be same as current.");  setLoading(false); return; }

    const user = auth.currentUser;
    if (!user) { setError("No user logged in."); setLoading(false); return; }

    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      setSuccess(true);
      setTimeout(() => handleNavigation(), 1400);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Incorrect current password.");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Please sign out and sign in again before changing password.");
      } else {
        setError("Failed to update password. " + err.message);
      }
    } finally { setLoading(false); }
  };

  const font = "'Inter','Segoe UI',sans-serif";

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "9px",
    padding: "11px 42px 11px 13px", color: "#fff", fontSize: "13px",
    fontFamily: font, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const lbl = {
    display: "block", fontSize: "11px", fontWeight: "600",
    letterSpacing: "0.8px", color: "rgba(255,255,255,0.4)", marginBottom: "7px",
  };

  const EyeIcon = ({ show, onToggle }) => (
    <span onClick={onToggle} style={{
      position: "absolute", right: "12px", top: "50%",
      transform: "translateY(-50%)", cursor: "pointer",
      color: "rgba(255,255,255,0.3)", userSelect: "none",
      display: "flex", alignItems: "center",
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        {show
          ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>
          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></>
        }
      </svg>
    </span>
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
      background: "var(--bg)",
      fontFamily: font,
    }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />

        <div style={{
          flex: 1, marginLeft: "240px",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px", overflowY: "auto",
        }}>
          <div style={{ width: "100%", maxWidth: "460px" }}>

            {/* Page title */}
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: 0 }}>
                Change Password
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "5px 0 0" }}>
                Update your account password
              </p>
            </div>

            {/* Card */}
            <div style={{
              background: "var(--card)",
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              border: "0.5px solid var(--border)",
              borderRadius: "14px", overflow: "hidden",
            }}>

              {/* Lock icon header */}
              <div style={{
                padding: "24px 28px",
                borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "11px", flexShrink: 0,
                  background: "rgba(74,158,255,0.12)", border: "0.5px solid rgba(74,158,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--dot)" strokeWidth="1.5"/>
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="var(--dot)" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1.5" fill="var(--dot)"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#fff" }}>Security Settings</p>
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                    Choose a strong password to protect your account
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>

                {/* Success */}
                {success && (
                  <div style={{
                    padding: "10px 14px", borderRadius: "8px", marginBottom: "18px",
                    background: "rgba(74,222,128,0.1)", border: "0.5px solid rgba(74,222,128,0.3)",
                    color: "#4ade80", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Password updated! Redirecting...
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{
                    padding: "10px 14px", borderRadius: "8px", marginBottom: "18px",
                    background: "rgba(248,113,113,0.1)", border: "0.5px solid rgba(248,113,113,0.3)",
                    color: "#f87171", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                        stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {error}
                  </div>
                )}

                {/* Current Password */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={lbl}>Current Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword} required
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      style={inp}
                      onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                      onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                    <EyeIcon show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: "0.5px", background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />

                {/* New Password */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={lbl}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword} required
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      style={inp}
                      onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                      onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                    <EyeIcon show={showNew} onToggle={() => setShowNew(!showNew)} />
                  </div>

                  {/* Strength meter */}
                  {newPassword && (
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                        {[1, 2, 3].map((i) => (
                          <div key={i} style={{
                            flex: 1, height: "3px", borderRadius: "2px",
                            background: i <= pw.level ? pw.color : "rgba(255,255,255,0.08)",
                            transition: "background 0.3s",
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: "11px", color: pw.color, fontWeight: "600" }}>
                        {pw.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={lbl}>Confirm New Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword} required
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      style={{
                        ...inp,
                        borderColor: confirmPassword && confirmPassword !== newPassword
                          ? "rgba(248,113,113,0.5)"
                          : confirmPassword && confirmPassword === newPassword
                          ? "rgba(74,222,128,0.5)"
                          : "rgba(255,255,255,0.1)",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                      onBlur={(e) => {
                        if (confirmPassword && confirmPassword !== newPassword)
                          e.target.style.borderColor = "rgba(248,113,113,0.5)";
                        else if (confirmPassword && confirmPassword === newPassword)
                          e.target.style.borderColor = "rgba(74,222,128,0.5)";
                        else
                          e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      }}
                    />
                    <EyeIcon show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                  </div>
                  {/* Match indicator */}
                  {confirmPassword && (
                    <p style={{
                      margin: "5px 0 0", fontSize: "11px", fontWeight: "600",
                      color: confirmPassword === newPassword ? "#4ade80" : "#f87171",
                    }}>
                      {confirmPassword === newPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit" disabled={loading}
                    style={{
                      flex: 1, padding: "12px",
                      background: loading ? "rgba(30,111,255,0.4)" : "var(--accent)",
                      border: "none", borderRadius: "9px",
                      color: "#fff", fontSize: "13px", fontWeight: "600",
                      fontFamily: font, cursor: loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      transition: "background 0.2s",
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: "14px", height: "14px", borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                          animation: "spin 0.8s linear infinite",
                        }} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="1.5"/>
                          <path d="M7 11V7a5 5 0 0110 0v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Update Password
                      </>
                    )}
                  </button>

                  <button
                    type="button" onClick={handleNavigation}
                    style={{
                      flex: 1, padding: "12px",
                      background: "rgba(255,255,255,0.04)",
                      border: "0.5px solid rgba(255,255,255,0.12)",
                      borderRadius: "9px", color: "rgba(255,255,255,0.6)",
                      fontSize: "13px", fontWeight: "600",
                      fontFamily: font, cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ChangePassword;