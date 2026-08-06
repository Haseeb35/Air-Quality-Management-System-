import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/NavBar";
import Sidebar from "./components/Sidebar";
import { auth, db, realDb } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ref, onValue } from "firebase/database";

const AdminDashboard = () => {
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSensors: 0,
    systemStatus: "Normal",
    alertCount: 0,
  });

  useEffect(() => {
    if (auth.currentUser)
      setAdminName(
        auth.currentUser.displayName ||
          localStorage.getItem("userName") ||
          "Administrator",
      );

    const fetchUserCount = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "users"), where("role", "==", "User")),
        );
        setStats((p) => ({ ...p, totalUsers: snap.size }));
      } catch (e) {
        console.error(e);
      }
    };
    fetchUserCount();

    const unsubscribe = onValue(
      ref(realDb, "air_quality/device1"),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          const co2 = Number(data.CO2_Levels || 0);
          const mq135 = Number(data.MQ135 || 0);

          let sensorCount = 0;
          if (data.CO2_Levels !== undefined) sensorCount++;
          if (data.MQ135 !== undefined) sensorCount++;
          if (data.Tempature_Sensor !== undefined) sensorCount++;
          if (data.Humidity_Sensor !== undefined) sensorCount++;

          let status = "Normal";
          let alerts = 0;

          if (co2 >= 800 || mq135 >= 800) {
            status = "Critical";
            alerts = 1;
          } else if (co2 >= 600 || mq135 >= 600) {
            status = "Warning";
            alerts = 1;
          }

          setStats((p) => ({
            ...p,
            activeSensors: sensorCount,
            systemStatus: status,
            alertCount: alerts,
          }));
        } else {
          setStats((p) => ({
            ...p,
            activeSensors: 0,
            systemStatus: "Normal",
            alertCount: 0,
          }));
        }
      },
    );

    return () => unsubscribe();
  }, []);

  const statusCfg = {
    Normal: {
      color: "#4ade80",
      bg: "rgba(74,222,128,0.12)",
      border: "rgba(74,222,128,0.3)",
    },
    Warning: {
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.12)",
      border: "rgba(251,191,36,0.3)",
    },
    Critical: {
      color: "#f87171",
      bg: "rgba(248,113,113,0.12)",
      border: "rgba(248,113,113,0.3)",
    },
  };

  const sc = statusCfg[stats.systemStatus] || statusCfg.Normal;
  const font = "'Inter','Segoe UI',sans-serif";

  const card = {
    background: "var(--card)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "0.5px solid var(--border)",
    borderRadius: "14px",
    fontFamily: font,
  };

  const initials = adminName
    ? adminName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const statCards = [
    {
      label: "Total Users",
      val: stats.totalUsers,
      color: "var(--dot)",
      bg: "rgba(74,158,255,0.1)",
      border: "rgba(74,158,255,0.2)",
      icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
      sub: "Registered accounts",
    },
    {
      label: "Active Sensors",
      val: `${stats.activeSensors}/4`,
      color: "var(--dot)",
      bg: "rgba(74,222,128,0.1)",
      border: "rgba(74,222,128,0.2)",
      icon: "M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4zM8 14a7 7 0 0010.95 1M5.07 13A7 7 0 0112 19",
      sub: "Temp · Hum · CO₂ · MQ135",
      progress: stats.activeSensors / 4,
    },
    {
      label: "System Alerts",
      val: stats.alertCount,
      color: stats.alertCount > 0 ? "#f87171" : "#4ade80",
      bg:
        stats.alertCount > 0 ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)",
      border:
        stats.alertCount > 0 ? "rgba(248,113,113,0.2)" : "rgba(74,222,128,0.2)",
      icon: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
      sub: stats.alertCount > 0 ? "Thresholds exceeded" : "All systems stable",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
        fontFamily: font,
      }}
    >
      <Navbar />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />

        <div
          style={{
            flex: 1,
            marginLeft: "240px",
            padding: "24px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              width: "100%",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              height: "100%",
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  Command Center
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.4)",
                    margin: "5px 0 0",
                  }}
                >
                  Welcome back,{" "}
                  <span style={{ color: "var(--dot)", fontWeight: "600" }}>
                    {adminName}
                  </span>
                </p>
              </div>

              {/* System status pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 16px",
                  borderRadius: "20px",
                  background: sc.bg,
                  border: `0.5px solid ${sc.border}`,
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: sc.color,
                    boxShadow: `0 0 6px ${sc.color}`,
                    animation: "pulse-dot 1.5s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: sc.color,
                  }}
                >
                  System {stats.systemStatus}
                </span>
              </div>
            </div>

            {/* ── Stat Cards ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "14px",
                flexShrink: 0,
              }}
            >
              {statCards.map((s) => (
                <div
                  key={s.label}
                  style={{
                    ...card,
                    padding: "18px",
                    background: s.bg,
                    border: `0.5px solid ${s.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: "10px",
                          fontWeight: "600",
                          letterSpacing: "1.5px",
                          color: "rgba(255,255,255,0.4)",
                          textTransform: "uppercase",
                        }}
                      >
                        {s.label}
                      </p>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: "30px",
                          fontWeight: "700",
                          color: "#fff",
                          lineHeight: 1,
                        }}
                      >
                        {s.val}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {s.sub}
                      </p>
                    </div>

                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        flexShrink: 0,
                        background: `${s.color}20`,
                        border: `0.5px solid ${s.color}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d={s.icon}
                          stroke={s.color}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {s.progress !== undefined && (
                    <div
                      style={{
                        marginTop: "12px",
                        height: "3px",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: "2px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "2px",
                          background: s.color,
                          width: `${s.progress * 100}%`,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Bottom row: Actions + Admin card ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "14px",
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* Quick Operations */}
              <div
                style={{
                  ...card,
                  padding: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      stroke="var(--dot)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#fff",
                    }}
                  >
                    User Management
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                    padding: "16px",
                  }}
                >
                  {[
                    {
                      to: "/add-user",
                      title: "Register New User",
                      sub: "Onboard a new client account",
                      color: "var(--dot)",
                      bg: "rgba(74,158,255,0.08)",
                      border: "rgba(74,158,255,0.2)",
                      icon: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 7a4 4 0 110 8 4 4 0 010-8zM19 8v6M22 11h-6",
                    },
                    {
                      to: "/view-users",
                      title: "Manage Users",
                      sub: "View, edit or delete accounts",
                      color: "#a78bfa",
                      bg: "rgba(167,139,250,0.08)",
                      border: "rgba(167,139,250,0.2)",
                      icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
                    },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          height: "100%",
                          padding: "20px",
                          background: item.bg,
                          border: `0.5px solid ${item.border}`,
                          borderRadius: "12px",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          transition: "opacity 0.2s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: `${item.color}15`,
                            border: `0.5px solid ${item.color}40`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d={item.icon}
                              stroke={item.color}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        <div>
                          <p
                            style={{
                              margin: "0 0 4px",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#fff",
                            }}
                          >
                            {item.title}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              color: "rgba(255,255,255,0.4)",
                            }}
                          >
                            {item.sub}
                          </p>
                        </div>

                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 14px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            marginTop: "4px",
                            background: `${item.color}20`,
                            border: `0.5px solid ${item.color}40`,
                            color: item.color,
                          }}
                        >
                          Open →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Admin profile card */}
              <div
                style={{
                  ...card,
                  padding: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: "4px",
                    background:
                      "linear-gradient(90deg, var(--accent), var(--dot), #a78bfa)",
                  }}
                />

                <div
                  style={{
                    flex: 1,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: `var(--dot)30`,
                      border: `2px solid var(--dot)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      fontWeight: "700",
                      color: "var(--dot)",
                      position: "relative",
                    }}
                  >
                    {initials}

                    <div
                      style={{
                        position: "absolute",
                        bottom: "2px",
                        right: "2px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#4ade80",
                        border: `2px solid var(--card)`,
                        boxShadow: "0 0 6px #4ade80",
                      }}
                    />
                  </div>

                  <div>
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#fff",
                      }}
                    >
                      {adminName}
                    </p>
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: "5px",
                        fontSize: "10px",
                        fontWeight: "600",
                        background: "rgba(251,191,36,0.15)",
                        border: "0.5px solid rgba(251,191,36,0.3)",
                        color: "#fbbf24",
                      }}
                    >
                      Admin
                    </span>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "0.5px",
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      width: "100%",
                    }}
                  >
                    {[
                      {
                        to: "/profile",
                        label: "Account Settings",
                        color: "var(--dot)",
                        bg: "rgba(74,158,255,0.1)",
                        border: "rgba(74,158,255,0.2)",
                        icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
                      },
                      {
                        to: "/change-password",
                        label: "Security",
                        color: "#a78bfa",
                        bg: "rgba(167,139,250,0.1)",
                        border: "rgba(167,139,250,0.2)",
                        icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                      },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          borderRadius: "9px",
                          textDecoration: "none",
                          background: item.bg,
                          border: `0.5px solid ${item.border}`,
                          color: item.color,
                          fontSize: "12px",
                          fontWeight: "600",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.75")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d={item.icon}
                            stroke={item.color}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
