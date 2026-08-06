import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const ViewUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete user.");
    } finally { setDeleting(null); }
  };

  const filtered = users.filter((u) =>
    (u.name  || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const font = "'Inter','Segoe UI',sans-serif";

  const card = {
    background: "var(--card)",
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    border: "0.5px solid var(--border)",
    borderRadius: "14px", fontFamily: font,
  };

  const initials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

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
          padding: "24px", overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            maxWidth: "1000px", width: "100%", margin: "0 auto",
            display: "flex", flexDirection: "column", gap: "18px", height: "100%",
          }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: 0 }}>
                  User Management
                </h2>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "5px 0 0" }}>
                  Manage all registered accounts in the system
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{
                  padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                  background: "rgba(74,158,255,0.1)", border: "0.5px solid rgba(74,158,255,0.2)",
                  color: "var(--dot)",
                }}>
                  {users.length} users
                </span>
                <Link to="/add-user" style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "8px 16px", background: "var(--accent)",
                  border: "none", borderRadius: "8px", color: "#fff",
                  fontSize: "12px", fontWeight: "600", textDecoration: "none",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 7a4 4 0 110 8 4 4 0 010-8zM19 8v6M22 11h-6"
                      stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add User
                </Link>
              </div>
            </div>

            {/* ── Search bar ── */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)",
                pointerEvents: "none",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                  <path d="M21 21l-4.35-4.35" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "9px",
                  padding: "11px 13px 11px 38px", color: "#fff", fontSize: "13px",
                  fontFamily: font, outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(74,158,255,0.4)"}
                onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* ── Table card ── */}
            <div style={{ ...card, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>

              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "2fr 2.5fr 1fr 1fr",
                padding: "12px 20px",
                borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)", flexShrink: 0,
              }}>
                {["User", "Email", "Role", "Actions"].map((h, i) => (
                  <span key={h} style={{
                    fontSize: "10px", fontWeight: "600", letterSpacing: "1.2px",
                    color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
                    textAlign: i === 3 ? "center" : "left",
                  }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              <div style={{ overflowY: "auto", flex: 1 }}>
                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "14px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      border: "2px solid rgba(74,158,255,0.3)", borderTopColor: "var(--dot)",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
                      Loading user database...
                    </span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "10px" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.2 }}>
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                        stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>
                      {search ? "No users match your search" : "No users found in the database"}
                    </span>
                  </div>
                ) : (
                  filtered.map((user, i) => (
                    <div key={user.id} style={{
                      display: "grid", gridTemplateColumns: "2fr 2.5fr 1fr 1fr",
                      padding: "13px 20px", alignItems: "center",
                      borderBottom: i < filtered.length - 1 ? "0.5px solid rgba(255,255,255,0.04)" : "none",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Name + Avatar */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                          background: user.role === "Admin" ? "rgba(251,191,36,0.15)" : "var(--border)",
                          border: user.role === "Admin" ? "0.5px solid rgba(251,191,36,0.3)" : "0.5px solid rgba(74,158,255,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: "700",
                          color: user.role === "Admin" ? "#fbbf24" : "var(--dot)",
                        }}>
                          {initials(user.name)}
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>
                          {user.name || "No Name"}
                        </span>
                      </div>

                      {/* Email */}
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
                        {user.email}
                      </span>

                      {/* Role badge */}
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: "5px",
                        fontSize: "10px", fontWeight: "600", width: "fit-content",
                        background: user.role === "Admin" ? "rgba(251,191,36,0.12)" : "rgba(74,158,255,0.12)",
                        border: user.role === "Admin" ? "0.5px solid rgba(251,191,36,0.3)" : "0.5px solid rgba(74,158,255,0.3)",
                        color: user.role === "Admin" ? "#fbbf24" : "var(--dot)",
                      }}>
                        {user.role || "User"}
                      </span>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Link to={`/edit-user/${user.id}`} title="Edit User" style={{
                          width: "30px", height: "30px", borderRadius: "7px",
                          background: "rgba(251,191,36,0.1)", border: "0.5px solid rgba(251,191,36,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "opacity 0.2s", textDecoration: "none",
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                              stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>

                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={deleting === user.id}
                          title="Delete User"
                          style={{
                            width: "30px", height: "30px", borderRadius: "7px",
                            background: "rgba(248,113,113,0.1)", border: "0.5px solid rgba(248,113,113,0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: deleting === user.id ? "not-allowed" : "pointer",
                            transition: "opacity 0.2s",
                            opacity: deleting === user.id ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => { if (deleting !== user.id) e.currentTarget.style.opacity = "0.7"; }}
                          onMouseLeave={(e) => { if (deleting !== user.id) e.currentTarget.style.opacity = "1"; }}
                        >
                          {deleting === user.id ? (
                            <div style={{
                              width: "11px", height: "11px", borderRadius: "50%",
                              border: "1.5px solid rgba(248,113,113,0.3)", borderTopColor: "#f87171",
                              animation: "spin 0.8s linear infinite",
                            }} />
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                              <polyline points="3 6 5 6 21 6" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"
                                stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Back button */}
            <div style={{ flexShrink: 0 }}>
              <Link to="/admin-dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "9px 18px",
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", color: "rgba(255,255,255,0.5)",
                fontSize: "12px", fontWeight: "600", textDecoration: "none",
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Dashboard
              </Link>
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

export default ViewUsers;