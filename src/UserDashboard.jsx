import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db, realDb } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import Navbar from "./components/NavBar";
import Sidebar from "./components/Sidebar";

const UserDashboard = () => {
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);

  const [sensorData, setSensorData] = useState({
    temp: 0,
    humidity: 0,
    co2: 0,
    mq135: 0,
    active: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || auth.currentUser.displayName);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
      setLoading(false);
    };

    fetchUserData();

    const dbRef = ref(realDb, "air_quality/device1");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        setSensorData({
          temp: Number(data.Tempature_Sensor || 0),
          humidity: Number(data.Humidity_Sensor || 0),
          co2: Number(data.CO2_Levels || 0),
          mq135: Number(data.MQ135 || 0),
          active: true,
        });
      } else {
        setSensorData((prev) => ({
          ...prev,
          active: false,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const getStatus = () => {
    if (sensorData.co2 >= 800 || sensorData.mq135 >= 800) return "Poor";
    if (sensorData.co2 >= 600 || sensorData.mq135 >= 600) return "Moderate";
    return "Good";
  };

  const currentStatus = getStatus();

  const statusConfig = {
    Good: {
      color: "#4ade80",
      bg: "rgba(74,222,128,0.12)",
      border: "rgba(74,222,128,0.25)",
    },
    Moderate: {
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.12)",
      border: "rgba(251,191,36,0.25)",
    },
    Poor: {
      color: "#f87171",
      bg: "rgba(248,113,113,0.12)",
      border: "rgba(248,113,113,0.25)",
    },
  };

  const st = statusConfig[currentStatus];

  const card = {
    background: "var(--card)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "0.5px solid var(--border)",
    borderRadius: "14px",
    padding: "20px",
    fontFamily: "'Inter','Segoe UI',sans-serif",
  };

  const label = {
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    marginBottom: "6px",
  };

  const bigVal = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#fff",
    lineHeight: 1,
    margin: "4px 0",
  };

  const small = {
    fontSize: "12px",
    color: "rgba(255,255,255,0.4)",
  };

  const IconSvg = ({ d, d2, color = "currentColor" }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d={d}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {d2 && (
        <path
          d={d2}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
        fontFamily: "'Inter','Segoe UI',sans-serif",
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
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              width: "100%",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
                  Welcome back, {loading ? "..." : userName}
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.4)",
                    margin: "4px 0 0",
                  }}
                >
                  Live monitoring from your connected devices
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  background: sensorData.active
                    ? "rgba(74,222,128,0.12)"
                    : "rgba(255,255,255,0.06)",
                  border: `0.5px solid ${
                    sensorData.active
                      ? "rgba(74,222,128,0.3)"
                      : "rgba(255,255,255,0.1)"
                  }`,
                }}
              >
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: sensorData.active ? "#4ade80" : "#6b7280",
                    boxShadow: sensorData.active ? "0 0 6px #4ade80" : "none",
                    animation: sensorData.active
                      ? "pulse-dot 1.5s ease-in-out infinite"
                      : "none",
                  }}
                />

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    color: sensorData.active
                      ? "#4ade80"
                      : "rgba(255,255,255,0.4)",
                  }}
                >
                  {sensorData.active ? "Live" : "Connecting..."}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
              }}
            >
              <div style={{ ...card, borderColor: st.border, background: st.bg }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p style={label}>Air Quality</p>
                    <p style={{ ...bigVal, color: st.color }}>
                      {currentStatus}
                    </p>
                    <p style={small}>CO₂: {sensorData.co2} ppm</p>
                  </div>

                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: st.bg,
                      border: `0.5px solid ${st.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"
                        stroke={st.color}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    height: "3px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "2px",
                      background: st.color,
                      width: `${Math.min(100, (sensorData.co2 / 1023) * 100)}%`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              <div style={card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p style={label}>Temperature</p>
                    <p style={bigVal}>{sensorData.temp}°C</p>
                    <p style={small}>Humidity: {sensorData.humidity}%</p>
                  </div>

                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "rgba(251,191,36,0.1)",
                      border: "0.5px solid rgba(251,191,36,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"
                        stroke="#fbbf24"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    height: "3px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "2px",
                      background: "#fbbf24",
                      width: `${Math.min(100, (sensorData.temp / 50) * 100)}%`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              <div style={card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p style={label}>Toxins (MQ135)</p>
                    <p style={bigVal}>{sensorData.mq135}</p>
                    <p style={small}>Particulate level</p>
                  </div>

                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "rgba(167,139,250,0.1)",
                      border: "0.5px solid rgba(167,139,250,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="#a78bfa"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
                        stroke="#a78bfa"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    height: "3px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "2px",
                      background: "#a78bfa",
                      width: `${Math.min(100, (sensorData.mq135 / 1023) * 100)}%`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "16px",
              }}
            >
              <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                      stroke="#fbbf24"
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
                    Live Alerts
                  </span>
                </div>

                <div style={{ overflowY: "auto", maxHeight: "260px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 20px",
                      borderBottom: "0.5px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        flexShrink: 0,
                        background:
                          sensorData.co2 >= 800
                            ? "rgba(248,113,113,0.12)"
                            : "rgba(74,222,128,0.12)",
                        border: `0.5px solid ${
                          sensorData.co2 >= 800
                            ? "rgba(248,113,113,0.3)"
                            : "rgba(74,222,128,0.3)"
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconSvg
                        d={
                          sensorData.co2 >= 800
                            ? "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                            : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        }
                        color={sensorData.co2 >= 800 ? "#f87171" : "#4ade80"}
                      />
                    </div>

                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: "600",
                          color: sensorData.co2 >= 800 ? "#f87171" : "#fff",
                        }}
                      >
                        {sensorData.co2 >= 800
                          ? "Warning: High CO₂ Detected"
                          : "CO₂ Levels Normal"}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {sensorData.co2 >= 800
                          ? `Value is ${sensorData.co2} ppm — exceeds safe limit`
                          : `Current value (${sensorData.co2} ppm) is within safe range`}
                      </p>
                    </div>
                  </div>

                  {sensorData.temp > 45 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 20px",
                        borderBottom: "0.5px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          flexShrink: 0,
                          background: "rgba(251,191,36,0.12)",
                          border: "0.5px solid rgba(251,191,36,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconSvg
                          d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"
                          color="#fbbf24"
                        />
                      </div>

                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#fbbf24",
                          }}
                        >
                          High Temperature
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          Consider checking cooling systems ({sensorData.temp}
                          °C)
                        </p>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 20px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        flexShrink: 0,
                        background:
                          sensorData.mq135 >= 800
                            ? "rgba(251,191,36,0.12)"
                            : "rgba(74,222,128,0.12)",
                        border: `0.5px solid ${
                          sensorData.mq135 >= 800
                            ? "rgba(251,191,36,0.3)"
                            : "rgba(74,222,128,0.3)"
                        }`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconSvg
                        d={
                          sensorData.mq135 >= 800
                            ? "M17 8.5c.38.38.62.9.62 1.5 0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.6 0 1.12.24 1.5.62zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                            : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        }
                        color={sensorData.mq135 >= 800 ? "#fbbf24" : "#4ade80"}
                      />
                    </div>

                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: "600",
                          color: sensorData.mq135 >= 800 ? "#fbbf24" : "#fff",
                        }}
                      >
                        {sensorData.mq135 >= 800
                          ? "Poor Air Quality"
                          : "Air Quality Normal"}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {sensorData.mq135 >= 800
                          ? `MQ135 levels elevated (${sensorData.mq135})`
                          : "No significant toxins detected"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#fff",
                    }}
                  >
                    Quick Actions
                  </span>
                </div>

                <div
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {[
                    {
                      to: "/sensor-data",
                      color: "var(--dot)",
                      bg: "rgba(74,158,255,0.1)",
                      border: "rgba(74,158,255,0.2)",
                      title: "View Live Data",
                      sub: "Real-time streams",
                      icon: "M3 17l4-8 4 4 4-6 4 5",
                    },
                    {
                      to: "/google-map",
                      color: "#4ade80",
                      bg: "rgba(74,222,128,0.1)",
                      border: "rgba(74,222,128,0.2)",
                      title: "Map View",
                      sub: "Device locations",
                      icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
                    },
                    {
                      to: "/predictions",
                      color: "#a78bfa",
                      bg: "rgba(167,139,250,0.1)",
                      border: "rgba(167,139,250,0.2)",
                      title: "Run Predictions",
                      sub: "AI forecasting",
                      icon: "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v10l5 3",
                    },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 14px",
                        background: item.bg,
                        border: `0.5px solid ${item.border}`,
                        borderRadius: "10px",
                        textDecoration: "none",
                        transition: "opacity 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "8px",
                          background: item.bg,
                          border: `0.5px solid ${item.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
                            margin: 0,
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
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;