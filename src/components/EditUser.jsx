import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const EditUser = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [role,    setRole]    = useState("User");
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const snap = await getDoc(doc(db, "users", id));
        if (snap.exists()) {
          const d = snap.data();
          setName(d.name  || "");
          setEmail(d.email || "");
          setRole(d.role  || "User");
        } else {
          navigate("/view-users");
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(false); setSaving(true);
    try {
      await updateDoc(doc(db, "users", id), { name, email, role });
      setSuccess(true);
      setTimeout(() => navigate("/view-users"), 1200);
    } catch (err) {
      console.error(err);
      setError("Failed to update user. Please try again.");
    } finally { setSaving(false); }
  };

  const font = "'Inter','Segoe UI',sans-serif";

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "9px",
    padding: "11px 13px", color: "#fff", fontSize: "13px",
    fontFamily: font, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const lbl = {
    display: "block", fontSize: "11px", fontWeight: "600",
    letterSpacing: "0.8px", color: "rgba(255,255,255,0.4)", marginBottom: "7px",
  };

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

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

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "2px solid rgba(74,158,255,0.3)", borderTopColor: "var(--dot)",
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading user...</span>
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: "460px" }}>

              {/* Page title */}
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: 0 }}>
                  Edit User
                </h2>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "5px 0 0" }}>
                  Update credentials for this account
                </p>
              </div>

              {/* Card */}
              <div style={{
                background: "var(--card)",
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                border: "0.5px solid var(--border)",
                borderRadius: "14px", overflow: "hidden",
              }}>

                {/* Header strip */}
                <div style={{
                  padding: "20px 28px",
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", gap: "14px",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: "46px", height: "46px", borderRadius: "50%", flexShrink: 0,
                    background: role === "Admin" ? "rgba(251,191,36,0.2)" : "rgba(74,158,255,0.2)",
                    border: role === "Admin" ? "1.5px solid rgba(251,191,36,0.4)" : "1.5px solid rgba(74,158,255,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px", fontWeight: "700",
                    color: role === "Admin" ? "#fbbf24" : "var(--dot)",
                  }}>
                    {initials}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                      {name || "User"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "600",
                        background: role === "Admin" ? "rgba(251,191,36,0.15)" : "var(--border)",
                        border: role === "Admin" ? "0.5px solid rgba(251,191,36,0.3)" : "0.5px solid rgba(74,158,255,0.3)",
                        color: role === "Admin" ? "#fbbf24" : "var(--dot)",
                      }}>
                        {role}
                      </span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
                        ID: {id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdate} style={{ padding: "24px 28px" }}>

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
                      User updated! Redirecting...
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

                  {/* Full Name */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={lbl}>Full Name</label>
                    <input
                      type="text" value={name} required
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      style={inp}
                      onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                      onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={lbl}>Email Address</label>
                    <input
                      type="email" value={email} required
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      style={inp}
                      onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                      onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                  </div>

                  {/* Role */}
                  <div style={{ marginBottom: "8px" }}>
                    <label style={lbl}>Access Level</label>
                    <select
                      value={role} onChange={(e) => setRole(e.target.value)}
                      style={{ ...inp, cursor: "pointer", appearance: "none" }}
                      onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                      onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    >
                      <option value="User"  style={{ background: "#041830" }}>Standard User</option>
                      <option value="Admin" style={{ background: "#041830" }}>Administrator</option>
                    </select>
                  </div>

                  {/* Role preview */}
                  <div style={{
                    padding: "10px 14px", borderRadius: "8px", marginBottom: "22px",
                    background: role === "Admin" ? "rgba(251,191,36,0.08)" : "rgba(74,158,255,0.08)",
                    border: role === "Admin" ? "0.5px solid rgba(251,191,36,0.2)" : "0.5px solid rgba(74,158,255,0.2)",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <div style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: role === "Admin" ? "#fbbf24" : "var(--dot)",
                    }} />
                    <span style={{ fontSize: "12px", color: role === "Admin" ? "#fbbf24" : "var(--dot)", fontWeight: "500" }}>
                      Access level will be set to <strong>{role}</strong>
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "0.5px", background: "rgba(255,255,255,0.06)", marginBottom: "20px" }} />

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" disabled={saving} style={{
                      flex: 1, padding: "12px",
                      background: saving ? "rgba(30,111,255,0.4)" : "var(--accent)",
                      border: "none", borderRadius: "9px", color: "#fff",
                      fontSize: "13px", fontWeight: "600", fontFamily: font,
                      cursor: saving ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      transition: "background 0.2s",
                    }}>
                      {saving ? (
                        <>
                          <div style={{
                            width: "14px", height: "14px", borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                            animation: "spin 0.8s linear infinite",
                          }} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8"
                              stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>

                    <button type="button" onClick={() => navigate("/view-users")} style={{
                      flex: 1, padding: "12px",
                      background: "rgba(255,255,255,0.04)",
                      border: "0.5px solid rgba(255,255,255,0.12)",
                      borderRadius: "9px", color: "rgba(255,255,255,0.6)",
                      fontSize: "13px", fontWeight: "600", fontFamily: font, cursor: "pointer",
                    }}>
                      Cancel
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #041830; color: #fff; }
      `}</style>
    </div>
  );
};

export default EditUser;