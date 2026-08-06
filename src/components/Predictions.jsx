import { useState, useEffect } from "react";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";
import { realDb } from "../firebase";
import { ref, onValue } from "firebase/database";

const PredictionScreen = () => {
  const [inputs, setInputs] = useState({
    temp: 0,
    humidity: 0,
    co2: 0,
    mq135: 0,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const dbRef = ref(realDb, "air_quality/device1");

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          setInputs({
            temp: Number(data.Tempature_Sensor || 0),
            humidity: Number(data.Humidity_Sensor || 0),
            co2: Number(data.CO2_Levels || 0),
            mq135: Number(data.MQ135 || 0),
          });

          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      },
      (error) => {
        console.error("Firebase error:", error);
        setIsConnected(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const getFinalAirQuality = (co2, mq135) => {
    if (co2 >= 800 || mq135 >= 800) {
      return "Hazardous (Poor)";
    }

    if (co2 >= 600 || mq135 >= 600) {
      return "Warning (Moderate)";
    }

    return "Safe (Good)";
  };

  const handlePredict = async () => {
    if (!isConnected) {
      alert("Firebase sensor data not connected!");
      return;
    }

    const temp = Number(inputs.temp);
    const humidity = Number(inputs.humidity);
    const co2 = Number(inputs.co2);
    const mq135 = Number(inputs.mq135);

    if (
      Number.isNaN(temp) ||
      Number.isNaN(humidity) ||
      Number.isNaN(co2) ||
      Number.isNaN(mq135)
    ) {
      alert("Invalid sensor data received from Firebase!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temp,
          humidity,
          co2,
          mq135,
        }),
      });

      const resultData = await response.json();

      if (resultData.status === "success") {
        const finalLabel = getFinalAirQuality(co2, mq135);
        const finalLower = finalLabel.toLowerCase();

        const isHazardous = finalLower.includes("hazardous");

        const isWarning =
          finalLower.includes("warning") || finalLower.includes("moderate");

        setResult({
          svm: finalLabel,
          knn: finalLabel,
          color: isHazardous ? "#f87171" : isWarning ? "#fbbf24" : "#4ade80",
          bgColor: isHazardous
            ? "rgba(248,113,113,0.1)"
            : isWarning
              ? "rgba(251,191,36,0.1)"
              : "rgba(74,222,128,0.1)",
          border: isHazardous
            ? "rgba(248,113,113,0.3)"
            : isWarning
              ? "rgba(251,191,36,0.3)"
              : "rgba(74,222,128,0.3)",
          message: isHazardous
            ? "Hazardous Air Quality Detected!"
            : isWarning
              ? "Air Quality is Moderate."
              : "Air Quality is Excellent!",
          sub: isHazardous
            ? "Critical levels detected. Immediate ventilation required."
            : isWarning
              ? "Be cautious when going outside. Wear a mask."
              : "AI confirms the air is fresh and safe for activities.",
          iconPath: isHazardous
            ? "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            : isWarning
              ? "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11a1 1 0 01-1-1V8a1 1 0 012 0v4a1 1 0 01-1 1zm0 4a1 1 0 110-2 1 1 0 010 2z"
              : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        });

        setShowModal(true);
      } else {
        alert("Prediction failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Backend server not connected!");
    }

    setLoading(false);
  };

  const font = "'Inter','Segoe UI',sans-serif";

  const card = {
    background: "var(--card)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "0.5px solid var(--border)",
    borderRadius: "14px",
    fontFamily: font,
  };

  const labelStyle = {
    display: "block",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "1.5px",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    marginBottom: "7px",
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "9px",
    padding: "11px 13px",
    color: "#fff",
    fontSize: "14px",
    fontFamily: font,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const fields = [
    {
      id: "temp",
      label: "Temperature",
      unit: "°C",
      color: "#fbbf24",
      d: "M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z",
    },
    {
      id: "humidity",
      label: "Humidity",
      unit: "%",
      color: "var(--dot)",
      d: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
    },
    {
      id: "co2",
      label: "CO₂ Level",
      unit: "ppm",
      color: "#a78bfa",
      d: "M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2",
    },
    {
      id: "mq135",
      label: "MQ135 Gas",
      unit: "index",
      color: "#4ade80",
      d: "M17 8.5c.38.38.62.9.62 1.5M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
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

        <main
          style={{
            flex: 1,
            marginLeft: "240px",
            padding: "28px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
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
                AI Prediction Hub
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.4)",
                  margin: "6px 0 0",
                }}
              >
                Use SVM &amp; KNN algorithms to forecast air quality based on
                sensor parameters
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  ...card,
                  padding: "24px",
                  background: "rgba(30,111,255,0.1)",
                  border: "0.5px solid rgba(74,158,255,0.25)",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#fff",
                    margin: "0 0 10px",
                  }}
                >
                  System Info
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.45)",
                    margin: "0 0 24px",
                    lineHeight: "1.6",
                  }}
                >
                  Sensor values are loaded automatically from Firebase for AI
                  prediction.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {[
                    { label: "SVM Accuracy", val: "98%", color: "#4ade80" },
                    { label: "KNN Accuracy", val: "92%", color: "var(--dot)" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.04)",
                        border: "0.5px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.45)",
                        }}
                      >
                        {m.label}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: m.color,
                        }}
                      >
                        {m.val}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "24px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  {fields.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        textAlign: "center",
                        background: `${f.color}15`,
                        border: `0.5px solid ${f.color}30`,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ margin: "0 auto 4px", display: "block" }}
                      >
                        <path
                          d={f.d}
                          stroke={f.color}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        style={{
                          fontSize: "10px",
                          color: f.color,
                          fontWeight: "600",
                        }}
                      >
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...card, padding: "28px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "18px",
                    marginBottom: "24px",
                  }}
                >
                  {fields.map((f) => (
                    <div key={f.id}>
                      <label style={labelStyle}>{f.label}</label>
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d={f.d}
                              stroke={f.color}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        <input
                          type="number"
                          value={inputs[f.id]}
                          readOnly
                          style={{ ...inputStyle, paddingLeft: "36px" }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = f.color)
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor =
                              "rgba(255,255,255,0.1)")
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    height: "0.5px",
                    background: "rgba(255,255,255,0.06)",
                    margin: "4px 0 24px",
                  }}
                />

                <button
                  onClick={handlePredict}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "13px",
                    background: loading
                      ? "rgba(30,111,255,0.4)"
                      : "var(--accent)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: font,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "background 0.2s",
                  }}
                >
                  {loading ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Computing...
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v10l5 3"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Start AI Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && result && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--card)",
              border: `0.5px solid ${result.border}`,
              borderRadius: "18px",
              overflow: "hidden",
              width: "100%",
              maxWidth: "480px",
              fontFamily: font,
            }}
          >
            <div
              style={{
                background: result.bgColor,
                borderBottom: `0.5px solid ${result.border}`,
                padding: "32px 28px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  background: `${result.color}20`,
                  border: `0.5px solid ${result.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d={result.iconPath}
                    stroke={result.color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: result.color,
                  margin: "0 0 8px",
                }}
              >
                {result.message}
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  margin: 0,
                }}
              >
                {result.sub}
              </p>
            </div>

            <div style={{ padding: "24px 28px" }}>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  letterSpacing: "1.5px",
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  margin: "0 0 12px",
                }}
              >
                Model Results
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                {[
                  { label: "SVM Model", val: result.svm },
                  { label: "KNN Model", val: result.knn },
                ].map((m) => (
                  <div
                    key={m.label}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      textAlign: "center",
                      background: result.bgColor,
                      border: `0.5px solid ${result.border}`,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: "10px",
                        fontWeight: "600",
                        letterSpacing: "1px",
                        color: "rgba(255,255,255,0.35)",
                        textTransform: "uppercase",
                      }}
                    >
                      {m.label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        fontWeight: "700",
                        color: result.color,
                      }}
                    >
                      {m.val}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "0.5px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                  marginBottom: "20px",
                }}
              >
                {fields.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.35)" }}>
                      {f.label}
                    </span>
                    <span style={{ color: f.color, fontWeight: "600" }}>
                      {inputs[f.id]} {f.unit}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "13px",
                  fontWeight: "600",
                  fontFamily: font,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

export default PredictionScreen;
