import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig } from "../firebase";
import { useTheme } from "./ThemeContext"; // ✅ 1. Import

const AddUser = () => {
  const { theme } = useTheme(); // ✅ 2. Get theme
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("User");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (!name || !email || !password) { setError("Please fill all fields."); return; }
    setLoading(true);
    try {
      const secondaryApp  = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUser = userCredential.user;
      await signOut(secondaryAuth);
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid, name, email, role, createdAt: new Date(),
      });
      setSuccess(true);
      setTimeout(() => navigate("/view-users"), 1200);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("This email is already registered.");
      else if (err.code === "auth/weak-password")   setError("Password must be at least 6 characters.");
      else setError(err.message);
    } finally { setLoading(false); }
  };

  const font = "'Inter','Segoe UI',sans-serif";
  const inp = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: `0.5px solid ${theme.border}`, borderRadius: "9px",
    padding: "11px 13px", color: "#fff", fontSize: "13px",
    fontFamily: font, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const lbl = {
    display: "block", fontSize: "11px", fontWeight: "600",
    letterSpacing: "0.8px", color: "rgba(255,255,255,0.4)", marginBottom: "7px",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
      background: theme.bg, // ✅ 3. Use theme.bg
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
          <div style={{ width: "100%", maxWidth: "480px" }}>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: 0 }}>Register New User</h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "5px 0 0" }}>
                Create access credentials for a new client
              </p>
            </div>

            <div style={{
              background: theme.card,
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              border: `0.5px solid ${theme.border}`,
              borderRadius: "14px", overflow: "hidden",
            }}>
              <div style={{
                padding: "20px 28px", borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "11px", flexShrink: 0,
                  background: `${theme.dot}20`, border: `0.5px solid ${theme.dot}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 7a4 4 0 110 8 4 4 0 010-8zM19 8v6M22 11h-6"
                      stroke={theme.dot} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#fff" }}>New Account</p>
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                    Fill in the details below to create access
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
                {success && (
                  <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "18px", background: "rgba(74,222,128,0.1)", border: "0.5px solid rgba(74,222,128,0.3)", color: "#4ade80", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    User created successfully! Redirecting...
                  </div>
                )}
                {error && (
                  <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "18px", background: "rgba(248,113,113,0.1)", border: "0.5px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: "13px" }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div>
                    <label style={lbl}>Full Name</label>
                    <input type="text" value={name} required onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={inp}
                      onFocus={(e) => e.target.style.borderColor = theme.dot}
                      onBlur={(e)  => e.target.style.borderColor = theme.border} />
                  </div>
                  <div>
                    <label style={lbl}>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}
                      style={{ ...inp, cursor: "pointer", appearance: "none" }}
                      onFocus={(e) => e.target.style.borderColor = theme.dot}
                      onBlur={(e)  => e.target.style.borderColor = theme.border}>
                      <option value="User"  style={{ background: "#040404" }}>User</option>
                      <option value="Admin" style={{ background: "#040404" }}>Admin</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={lbl}>Email Address</label>
                  <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" style={inp}
                    onFocus={(e) => e.target.style.borderColor = theme.dot}
                    onBlur={(e)  => e.target.style.borderColor = theme.border} />
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <label style={lbl}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPass ? "text" : "password"} value={password} required minLength={6}
                      onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      style={{ ...inp, paddingRight: "42px" }}
                      onFocus={(e) => e.target.style.borderColor = theme.dot}
                      onBlur={(e)  => e.target.style.borderColor = theme.border} />
                    <span onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        {showPass
                          ? <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></>
                        }
                      </svg>
                    </span>
                  </div>
                  <p style={{ margin: "5px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>Must be at least 6 characters long</p>
                </div>

                <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "22px", background: role === "Admin" ? "rgba(251,191,36,0.08)" : `${theme.dot}10`, border: role === "Admin" ? "0.5px solid rgba(251,191,36,0.2)" : `0.5px solid ${theme.dot}30`, display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: role === "Admin" ? "#fbbf24" : theme.dot }} />
                  <span style={{ fontSize: "12px", color: role === "Admin" ? "#fbbf24" : theme.dot, fontWeight: "500" }}>
                    This user will be registered as <strong>{role}</strong>
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" disabled={loading} style={{
                    flex: 1, padding: "12px", background: loading ? `${theme.accent}60` : theme.accent,
                    border: "none", borderRadius: "9px", color: "#fff", fontSize: "13px", fontWeight: "600",
                    fontFamily: font, cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}>
                    {loading ? (
                      <><div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />Creating...</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 7a4 4 0 110 8 4 4 0 010-8zM19 8v6M22 11h-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Create User Account</>
                    )}
                  </button>
                  <button type="button" onClick={() => navigate("/admin-dashboard")} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "9px", color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: "600", fontFamily: font, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AddUser;