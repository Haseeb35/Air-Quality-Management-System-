import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useTheme } from "./ThemeContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    photoURL: "/assets/profile.png",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const cachedRole = localStorage.getItem("userRole");
        const cachedName = localStorage.getItem("userName");

        if (cachedRole && cachedName) {
          setUserData((prev) => ({
            ...prev,
            role: cachedRole,
            name: cachedName,
            email: currentUser.email,
          }));
          setLoading(false);
        }

        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const dbData = docSnap.data();
            const role = dbData.role || "User";
            const name =
              dbData.name ||
              dbData.username ||
              currentUser.displayName ||
              "User";

            setUserData({
              name,
              email: currentUser.email,
              role,
              photoURL: currentUser.photoURL || "/assets/profile.png",
            });

            localStorage.setItem("userRole", role);
            localStorage.setItem("userName", name);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData({ name: "Guest", email: "", role: "", photoURL: "" });
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    color: isActive(path) ? "#fff" : "rgba(255,255,255,0.5)",
    background: isActive(path) ? "rgba(30,111,255,0.2)" : "transparent",
    borderLeft: isActive(path)
      ? "2px solid var(--accent)"
      : "2px solid transparent",
    borderRadius: "0 8px 8px 0",
    marginRight: "12px",
    transition: "all 0.2s ease",
    cursor: "pointer",
  });

  const sectionLabel = {
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "rgba(255,255,255,0.2)",
    padding: "16px 18px 6px",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    textTransform: "uppercase",
  };

  // Icon SVGs (inline, no font-awesome needed)
  const Icon = ({ d, d2 }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      style={{ flexShrink: 0, opacity: 0.8 }}>
      <path d={d} stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {d2 && <path d={d2} stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );

  const initials = userData.name
    ? userData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div style={{
      height: "100vh",
      width: "240px",
      background: theme.card,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRight: "0.5px solid ${theme.border}`",
      color: "white",
      position: "fixed",
      left: 0,
      top: 66,
      zIndex: 900,
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>

      {/* Top glow line */}
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(74,158,255,0.5), transparent)",
      }} />

      {/* 1. Profile Section */}
      <div style={{
        padding: "24px 18px 18px",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
      }}>
        {loading ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "50%",
              background: "rgba(255,255,255,0.06)", flexShrink: 0,
            }} />
            <div>
              <div style={{ width: "80px", height: "10px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", marginBottom: "6px" }} />
              <div style={{ width: "110px", height: "8px", background: "rgba(255,255,255,0.04)", borderRadius: "4px" }} />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Avatar */}
            {userData.photoURL && !userData.photoURL.includes("/assets/") ? (
              <img
                src={userData.photoURL}
                alt="Profile"
                style={{
                  width: "42px", height: "42px", borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid rgba(74,158,255,0.3)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: "42px", height: "42px", borderRadius: "50%",
                background: "rgba(30,111,255,0.3)",
                border: "1px solid rgba(74,158,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: "600", color: "var(--dot)",
                flexShrink: 0,
              }}>
                {initials}
              </div>
            )}
            <div style={{ overflow: "hidden" }}>
              <p style={{
                margin: 0, fontSize: "13px", fontWeight: "600",
                color: "#fff", whiteSpace: "nowrap",
                overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {userData.name}
              </p>
              <p style={{
                margin: "1px 0 5px", fontSize: "11px",
                color: "rgba(255,255,255,0.35)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {userData.email}
              </p>
              <span style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "600",
                letterSpacing: "0.5px",
                background: userData.role === "Admin"
                  ? "rgba(251,191,36,0.15)"
                  : "var(--border)",
                color: userData.role === "Admin" ? "#fbbf24" : "var(--dot)",
              }}>
                {userData.role}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: "8px" }}>

        {/* Dashboard */}
        <div style={sectionLabel}>Overview</div>
        <Link
          to={userData.role === "Admin" ? "/admin-dashboard" : "/user-dashboard"}
          style={linkStyle(userData.role === "Admin" ? "/admin-dashboard" : "/user-dashboard")}
        >
          <Icon d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" d2="M9 21V12h6v9" />
          Dashboard
        </Link>

        {!loading && (
          <>
            {/* ADMIN LINKS */}
            {userData.role === "Admin" && (
              <>
                <div style={sectionLabel}>Management</div>
                <Link to="/add-user" style={linkStyle("/add-user")}>
                  <Icon d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 7a4 4 0 110 8 4 4 0 010-8zM19 8v6M22 11h-6" />
                  Add User
                </Link>
                <Link to="/view-users" style={linkStyle("/view-users")}>
                  <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  View Users
                </Link>
              </>
            )}

            {/* USER LINKS */}
            {userData.role === "User" && (
              <>
                <div style={sectionLabel}>Monitoring</div>
                <Link to="/sensor-data" style={linkStyle("/sensor-data")}>
                  <Icon d="M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z" d2="M8 14a7 7 0 0010.95 1M5.07 13A7 7 0 0112 19" />
                  Sensor Data
                </Link>
                <Link to="/google-map" style={linkStyle("/google-map")}>
                  <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" d2="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  Live Map
                </Link>
                <Link to="/predictions" style={linkStyle("/predictions")}>
                  <Icon d="M3 17l4-8 4 4 4-6 4 5" />
                  Predictions
                </Link>
                <Link to="/history" style={linkStyle("/history")}>
                  <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  History
                </Link>
              </>
            )}
          </>
        )}

        {/* Settings */}
        <div style={sectionLabel}>Settings</div>
        <Link to="/profile" style={linkStyle("/profile")}>
          <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
          Profile
        </Link>
        <Link to="/change-password" style={linkStyle("/change-password")}>
          <Icon d="M15 7a4 4 0 010 5.66M17.66 4.34a8 8 0 010 11.32M6.34 17.66a8 8 0 010-11.32M9 12a3 3 0 106 0 3 3 0 00-6 0z" />
          Password
        </Link>
      </div>

      {/* 3. Sign Out */}
      <div style={{
        padding: "14px 16px",
        borderTop: "0.5px solid rgba(255,255,255,0.06)",
      }}>
        <a
          href="#signout"
          onClick={handleSignOut}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            textDecoration: "none", color: "rgba(255,255,255,0.45)",
            fontSize: "13px", fontWeight: "500",
            padding: "10px 16px",
            borderRadius: "8px",
            transition: "all 0.2s",
            border: "0.5px solid rgba(239,68,68,0.15)",
            background: "rgba(239,68,68,0.05)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            style={{ flexShrink: 0, color: "#f87171" }}>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: "#f87171" }}>Sign Out</span>
        </a>
      </div>

    </div>
  );
};

export default Sidebar;