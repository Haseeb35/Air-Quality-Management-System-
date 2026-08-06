import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useTheme } from "./ThemeContext";

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const auth      = getAuth();
  const db        = getFirestore();
  const { theme, themeName, setTheme, themes } = useTheme();

  const [role, setRole]           = useState(null);
  const [userName, setUserName]   = useState("");
  const [loading, setLoading]     = useState(true);
  const [dropOpen, setDropOpen]   = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const dropRef  = useRef(null);
  const themeRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const cachedRole = localStorage.getItem("userRole");
        const cachedName = localStorage.getItem("userName");
        if (cachedRole) setRole(cachedRole);
        if (cachedName) { setUserName(cachedName); setLoading(false); }
        try {
          const docSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (docSnap.exists()) {
            const d = docSnap.data();
            const r = d.role || "User";
            const n = d.name || currentUser.displayName || "User";
            setRole(r); setUserName(n);
            localStorage.setItem("userRole", r);
            localStorage.setItem("userName", n);
          }
        } catch (err) { console.error(err); }
      } else { setRole(null); setUserName(""); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, db]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current  && !dropRef.current.contains(e.target))  setDropOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    try { await signOut(auth); localStorage.clear(); navigate("/signin"); }
    catch (err) { console.error(err); }
  };

  const dashboardPath = role === "Admin" ? "/admin-dashboard" : "/user-dashboard";
  const initials = userName ? userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const font = "'Inter','Segoe UI',sans-serif";

  return (
    <nav style={{
      height: "64px",
      // background: "rgba(0,0,0,0.6)",
      background: `${theme.card}`,
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderBottom: `0.5px solid ${theme.border}`,
      padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 1000,
      fontFamily: font, flexShrink: 0,
    }}>

      {/* ── LEFT: Logo ── */}
      <Link to={dashboardPath} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "9px",
          background: theme.accent,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 4C9.5 4 7 5.8 6.2 8.2C4.4 8.6 3 10.1 3 12C3 14.2 4.8 16 7 16H17C19.2 16 21 14.2 21 12C21 10.1 19.6 8.6 17.8 8.2C17 5.8 14.5 4 12 4Z"
              stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.15)" />
            <line x1="12" y1="16" x2="12" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="20.5" r="1" fill="white" />
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#fff", lineHeight: 1.1 }}>AirSense</p>
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "1.2px", textTransform: "uppercase" }}>
            Air Quality System
          </span>
        </div>
      </Link>

      {/* ── RIGHT ── */}
      {!loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

          {/* Theme switcher */}
          <div ref={themeRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setThemeOpen(p => !p); setDropOpen(false); }}
              title="Change Theme"
              style={{
                width: "36px", height: "36px", borderRadius: "9px",
                background: themeOpen ? `${theme.dot}20` : "rgba(255,255,255,0.05)",
                border: themeOpen ? `0.5px solid ${theme.dot}60` : "0.5px solid rgba(255,255,255,0.1)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if (!themeOpen) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { if (!themeOpen) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" stroke={theme.dot} strokeWidth="1.5"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke={theme.dot} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Theme dropdown */}
            {themeOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: "220px",
                background: "rgba(8,8,8,0.97)",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: `0.5px solid ${theme.border}`,
                borderRadius: "12px", overflow: "hidden",
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                zIndex: 9999,
              }}>
                <div style={{
                  padding: "10px 14px 8px",
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                }}>
                  <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "1.2px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                    Choose Theme
                  </span>
                </div>
                <div style={{ padding: "6px" }}>
                  {Object.values(themes).map((t) => (
                    <button key={t.name} onClick={() => { setTheme(t.name); setThemeOpen(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 10px", borderRadius: "8px",
                        background: themeName === t.name ? `${t.dot}15` : "transparent",
                        border: themeName === t.name ? `0.5px solid ${t.dot}40` : "0.5px solid transparent",
                        cursor: "pointer", fontFamily: font, transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { if (themeName !== t.name) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={(e) => { if (themeName !== t.name) e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* Color swatches */}
                      <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                        {t.preview.map((c, i) => (
                          <div key={i} style={{
                            width: "10px", height: "22px", borderRadius: "3px",
                            background: c, border: "0.5px solid rgba(255,255,255,0.1)",
                          }} />
                        ))}
                      </div>
                      <span style={{
                        fontSize: "12px", fontWeight: themeName === t.name ? "600" : "400",
                        color: themeName === t.name ? t.dot : "rgba(255,255,255,0.6)",
                        flex: 1, textAlign: "left",
                      }}>
                        {t.name}
                      </span>
                      {themeName === t.name && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke={t.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div style={{ width: "0.5px", height: "24px", background: "rgba(255,255,255,0.1)" }} />

          {/* Avatar dropdown */}
          <div ref={dropRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setDropOpen(p => !p); setThemeOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "5px 10px 5px 5px",
                background: dropOpen ? `${theme.dot}12` : "rgba(255,255,255,0.04)",
                border: dropOpen ? `0.5px solid ${theme.dot}35` : "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: "40px", cursor: "pointer", transition: "all 0.2s", fontFamily: font,
              }}
              onMouseEnter={(e) => { if (!dropOpen) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}}
              onMouseLeave={(e) => { if (!dropOpen) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}}
            >
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: `${theme.dot}30`, border: `1px solid ${theme.dot}50`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "700", color: theme.dot, flexShrink: 0,
              }}>
                {initials}
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: "#fff", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                  {userName}
                </p>
                <span style={{ fontSize: "10px", fontWeight: "600", color: role === "Admin" ? "#fbbf24" : theme.dot }}>
                  {role}
                </span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                style={{ color: "rgba(255,255,255,0.35)", transform: dropOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Avatar dropdown menu */}
            {dropOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: "210px",
                background: "rgba(8,8,8,0.97)",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: `0.5px solid ${theme.border}`,
                borderRadius: "12px", overflow: "hidden",
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                zIndex: 9999,
              }}>
                <div style={{
                  padding: "14px 16px",
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  background: `${theme.dot}08`,
                }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#fff" }}>{userName}</p>
                  <span style={{
                    display: "inline-block", marginTop: "4px",
                    padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "600",
                    background: role === "Admin" ? "rgba(251,191,36,0.15)" : `${theme.dot}20`,
                    border: role === "Admin" ? "0.5px solid rgba(251,191,36,0.3)" : `0.5px solid ${theme.dot}40`,
                    color: role === "Admin" ? "#fbbf24" : theme.dot,
                  }}>
                    {role}
                  </span>
                </div>

                <div style={{ padding: "6px" }}>
                  {[
                    { to: dashboardPath,      label: "Dashboard",       color: theme.dot,   icon: "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" },
                    { to: "/profile",         label: "Profile",         color: "#a78bfa",   icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" },
                    { to: "/change-password", label: "Change Password", color: "#fbbf24",   icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
                  ].map((item) => (
                    <Link key={item.to} to={item.to} onClick={() => setDropOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "9px 10px", borderRadius: "8px",
                        textDecoration: "none", color: "rgba(255,255,255,0.65)",
                        fontSize: "13px", transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                    >
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
                        background: `${item.color}15`, border: `0.5px solid ${item.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d={item.icon} stroke={item.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div style={{ height: "0.5px", background: "rgba(255,255,255,0.06)", margin: "0 6px" }} />

                <div style={{ padding: "6px" }}>
                  <button onClick={() => { setDropOpen(false); handleSignOut(); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 10px", borderRadius: "8px",
                      background: "transparent", border: "none",
                      color: "#f87171", fontSize: "13px", fontFamily: font,
                      cursor: "pointer", transition: "background 0.15s", textAlign: "left",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
                      background: "rgba(248,113,113,0.1)", border: "0.5px solid rgba(248,113,113,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                          stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;