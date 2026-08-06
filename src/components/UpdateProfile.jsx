import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const UpdateProfile = () => {
  const navigate = useNavigate();

  const [uid, setUid]         = useState(null);
  const [role, setRole]       = useState("");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [age, setAge]         = useState("");
  const [gender, setGender]   = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUid(currentUser.uid);
        setEmail(currentUser.email);
        try {
          const docSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (docSnap.exists()) {
            const d = docSnap.data();
            setName(d.name || "");
            setAge(d.age || "");
            setGender(d.gender || "");
            setPhone(d.phone || "");
            setAddress(d.address || "");
            setRole(d.role || "User");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/signin");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleNavigation = () =>
    navigate(role === "Admin" ? "/admin-dashboard" : "/user-dashboard");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid) return;
    setSaving(true); setError(""); setSuccess(false);
    try {
      await updateDoc(doc(db, "users", uid), { name, age, gender, phone, address });
      setSuccess(true);
      setTimeout(() => handleNavigation(), 1200);
    } catch (err) {
      console.error(err);
      setError("Error updating profile. Please try again.");
    } finally { setSaving(false); }
  };

  const font = "'Inter','Segoe UI',sans-serif";

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "9px",
    padding: "10px 13px", color: "#fff", fontSize: "13px",
    fontFamily: font, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const lbl = {
    display: "block", fontSize: "11px", fontWeight: "600",
    letterSpacing: "0.8px", color: "rgba(255,255,255,0.4)", marginBottom: "5px",
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

        {/* Main — no outer scroll, card internally scrolls if needed */}
        <div style={{
          flex: 1, marginLeft: "240px",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px", overflow: "hidden",
        }}>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "2px solid rgba(74,158,255,0.3)", borderTopColor: "var(--dot)",
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading profile...</span>
            </div>
          ) : (
            <div style={{
              width: "100%", maxWidth: "680px",
              display: "flex", flexDirection: "column", gap: "14px",
              maxHeight: "100%",
            }}>

              {/* Page title — compact */}
              <div style={{ flexShrink: 0 }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", margin: 0 }}>
                  Profile Settings
                </h2>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: "3px 0 0" }}>
                  Update your personal information
                </p>
              </div>

              {/* Card — scrollable internally */}
              <div style={{
                background: "var(--card)",
                backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                border: "0.5px solid var(--border)",
                borderRadius: "14px", overflow: "hidden",
                display: "flex", flexDirection: "column",
                flex: 1, minHeight: 0,
              }}>

                {/* Avatar strip — compact */}
                <div style={{
                  padding: "16px 24px",
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", gap: "14px",
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
                    background: "rgba(30,111,255,0.25)", border: "1.5px solid rgba(74,158,255,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px", fontWeight: "700", color: "var(--dot)",
                  }}>
                    {initials}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                      {name || "Your Name"}
                    </p>
                    <p style={{ margin: "2px 0 5px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      {email}
                    </p>
                    <span style={{
                      display: "inline-block", padding: "2px 8px", borderRadius: "4px",
                      fontSize: "10px", fontWeight: "600",
                      background: role === "Admin" ? "rgba(251,191,36,0.15)" : "var(--border)",
                      color: role === "Admin" ? "#fbbf24" : "var(--dot)",
                      border: role === "Admin" ? "0.5px solid rgba(251,191,36,0.3)" : "0.5px solid rgba(74,158,255,0.3)",
                    }}>
                      {role}
                    </span>
                  </div>
                </div>

                {/* Form — scrollable area */}
                <form onSubmit={handleSubmit} style={{
                  padding: "16px 24px", overflowY: "auto", flex: 1,
                  display: "flex", flexDirection: "column", gap: "12px",
                }}>

                  {/* Alerts */}
                  {success && (
                    <div style={{
                      padding: "9px 13px", borderRadius: "8px",
                      background: "rgba(74,222,128,0.1)", border: "0.5px solid rgba(74,222,128,0.3)",
                      color: "#4ade80", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px",
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Profile updated! Redirecting...
                    </div>
                  )}
                  {error && (
                    <div style={{
                      padding: "9px 13px", borderRadius: "8px",
                      background: "rgba(248,113,113,0.1)", border: "0.5px solid rgba(248,113,113,0.3)",
                      color: "#f87171", fontSize: "12px",
                    }}>
                      {error}
                    </div>
                  )}

                  {/* Row 1: Name + Email */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={lbl}>Full Name</label>
                      <input type="text" value={name} required placeholder="John Doe"
                        onChange={(e) => setName(e.target.value)} style={inp}
                        onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                        onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                    </div>
                    <div>
                      <label style={lbl}>Email (Read Only)</label>
                      <input type="email" value={email} disabled
                        style={{ ...inp, opacity: 0.4, cursor: "not-allowed" }} />
                    </div>
                  </div>

                  {/* Row 2: Age + Gender */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={lbl}>Age</label>
                      <input type="number" value={age} min="1" max="120" placeholder="25"
                        onChange={(e) => setAge(e.target.value)} style={inp}
                        onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                        onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                    </div>
                    <div>
                      <label style={lbl}>Gender</label>
                      <select value={gender} onChange={(e) => setGender(e.target.value)}
                        style={{ ...inp, appearance: "none", cursor: "pointer" }}
                        onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                        onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}>
                        <option value=""       style={{ background: "#041830" }}>Select gender</option>
                        <option value="Male"   style={{ background: "#041830" }}>Male</option>
                        <option value="Female" style={{ background: "#041830" }}>Female</option>
                        <option value="Other"  style={{ background: "#041830" }}>Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={lbl}>Phone Number</label>
                    <input type="tel" value={phone} placeholder="+92 300 1234567"
                      onChange={(e) => setPhone(e.target.value)} style={inp}
                      onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                      onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>

                  {/* Address */}
                  <div>
                    <label style={lbl}>Address</label>
                    <textarea rows={2} value={address} placeholder="Street, City, Country"
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ ...inp, resize: "none", lineHeight: "1.6" }}
                      onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.5)"}
                      onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>

                  {/* Divider */}
                  <div style={{ height: "0.5px", background: "rgba(255,255,255,0.06)" }} />

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" disabled={saving} style={{
                      flex: 1, padding: "11px",
                      background: saving ? "rgba(30,111,255,0.4)" : "var(--accent)",
                      border: "none", borderRadius: "9px", color: "#fff",
                      fontSize: "13px", fontWeight: "600", fontFamily: font,
                      cursor: saving ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}>
                      {saving ? (
                        <>
                          <div style={{
                            width: "13px", height: "13px", borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                            animation: "spin 0.8s linear infinite",
                          }} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M17 21v-8H7v8M7 3v5h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button type="button" onClick={handleNavigation} style={{
                      flex: 1, padding: "11px",
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
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        select option { background: #041830; color: #fff; }
      `}</style>
    </div>
  );
};

export default UpdateProfile;