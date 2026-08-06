import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";
import { realDb } from "../firebase";
import { ref, onValue } from "firebase/database";

const SensorData = () => {
  const [data, setData] = useState({
    temp: 0,
    humidity: 0,
    co2: 0,
    mq135: 0,
    isConnected: false,
  });

  const [graphData, setGraphData] = useState([]);
  const [prediction, setPrediction] = useState("Calculating...");

  const [healthAdvice, setHealthAdvice] = useState({
    msg: "Monitoring...",
    color: "var(--dot)",
    border: "rgba(74,158,255,0.3)",
    bg: "rgba(74,158,255,0.08)",
  });

  useEffect(() => {
    const dbRef = ref(realDb, "/air_quality/device1");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const dbData = snapshot.val();

        const newData = {
          temp: Number(dbData.Tempature_Sensor || 0),
          humidity: Number(dbData.Humidity_Sensor || 0),
          co2: Number(dbData.CO2_Levels || 0),
          mq135: Number(dbData.MQ135 || 0),
          isConnected: true,
        };

        setData(newData);

        if (newData.co2 >= 800 || newData.mq135 >= 800) {
          setHealthAdvice({
            msg: "Hazardous: Stay indoors and use air purifiers.",
            color: "#f87171",
            border: "rgba(248,113,113,0.3)",
            bg: "rgba(248,113,113,0.08)",
          });
        } else if (newData.co2 >= 600 || newData.mq135 >= 600) {
          setHealthAdvice({
            msg: "Unhealthy: Wear a mask if going outside.",
            color: "#fbbf24",
            border: "rgba(251,191,36,0.3)",
            bg: "rgba(251,191,36,0.08)",
          });
        } else {
          setHealthAdvice({
            msg: "Good: Air quality is healthy for outdoor activities.",
            color: "#4ade80",
            border: "rgba(74,222,128,0.3)",
            bg: "rgba(74,222,128,0.08)",
          });
        }

        setGraphData((prev) => {
          const newPoint = {
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            co2: newData.co2,
            mq135: newData.mq135,
            temp: newData.temp,
            humidity: newData.humidity,
          };

          const updated = [...prev, newPoint].slice(-20);

          if (updated.length > 5) {
            const last = updated.slice(-3);

            if (last[2].co2 > last[0].co2) {
              setPrediction("Pollution Increasing ↑");
            } else if (last[2].co2 < last[0].co2) {
              setPrediction("Condition Improving ↓");
            } else {
              setPrediction("Stable Conditions →");
            }
          }

          return updated;
        });
      } else {
        setData((prev) => ({ ...prev, isConnected: false }));
      }
    });

    return () => unsubscribe();
  }, []);

  const downloadCSV = () => {
    const rows = [["Time", "Temp", "Humidity", "CO2", "MQ135"]];
    graphData.forEach((r) =>
      rows.push([r.time, r.temp, r.humidity, r.co2, r.mq135])
    );

    const blob = new Blob([rows.map((e) => e.join(",")).join("\n")], {
      type: "text/csv",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "AQI_Report.csv";
    link.click();
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(graphData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AirQualityData");
    XLSX.writeFile(wb, "Environmental_Report.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Air Quality Intelligence Report", 15, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Time", "Temp (C)", "Hum (%)", "CO2 (ppm)", "MQ135"]],
      body: graphData.map((i) => [
        i.time,
        i.temp,
        i.humidity,
        i.co2,
        i.mq135,
      ]),
    });

    doc.save("AQI_Analytics.pdf");
  };

  const card = {
    background: "var(--card)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "0.5px solid var(--border)",
    borderRadius: "14px",
    fontFamily: "'Inter','Segoe UI',sans-serif",
  };

  const statColors = [
    {
      label: "CO2",
      unit: "ppm",
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.1)",
      border: "rgba(167,139,250,0.2)",
      key: "co2",
    },
    {
      label: "MQ135",
      unit: "idx",
      color: "#4ade80",
      bg: "rgba(74,222,128,0.1)",
      border: "rgba(74,222,128,0.2)",
      key: "mq135",
    },
    {
      label: "Temp",
      unit: "°C",
      color: "#f87171",
      bg: "rgba(248,113,113,0.1)",
      border: "rgba(248,113,113,0.2)",
      key: "temp",
    },
    {
      label: "Humidity",
      unit: "%",
      color: "var(--dot)",
      bg: "rgba(74,158,255,0.1)",
      border: "rgba(74,158,255,0.2)",
      key: "humidity",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div
        style={{
          background: "var(--card)",
          border: "0.5px solid var(--border)",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "12px",
          fontFamily: "'Inter',sans-serif",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.5)", margin: "0 0 6px" }}>
          {label}
        </p>

        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, margin: "3px 0" }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  };

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

        <main
          style={{
            flex: 1,
            marginLeft: "240px",
            padding: "24px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Header */}
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
                  Sensor Analytics
                </h2>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    marginTop: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: data.isConnected ? "#4ade80" : "#6b7280",
                      boxShadow: data.isConnected ? "0 0 6px #4ade80" : "none",
                    }}
                  />

                  <span
                    style={{
                      fontSize: "12px",
                      color: data.isConnected
                        ? "#4ade80"
                        : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {data.isConnected ? "Live Sensor Data" : "Offline"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  {
                    label: "PDF",
                    onClick: downloadPDF,
                    color: "#f87171",
                    border: "rgba(248,113,113,0.3)",
                    bg: "rgba(248,113,113,0.08)",
                  },
                  {
                    label: "Excel",
                    onClick: downloadExcel,
                    color: "#4ade80",
                    border: "rgba(74,222,128,0.3)",
                    bg: "rgba(74,222,128,0.08)",
                  },
                  {
                    label: "CSV",
                    onClick: downloadCSV,
                    color: "var(--dot)",
                    border: "rgba(74,158,255,0.3)",
                    bg: "rgba(74,158,255,0.08)",
                  },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    style={{
                      padding: "8px 16px",
                      background: btn.bg,
                      border: `0.5px solid ${btn.border}`,
                      borderRadius: "8px",
                      color: btn.color,
                      fontSize: "12px",
                      fontWeight: "600",
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Health Advisor + Prediction */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{
                  ...card,
                  padding: "20px",
                  background: healthAdvice.bg,
                  border: `0.5px solid ${healthAdvice.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "12px",
                      flexShrink: 0,
                      background: `${healthAdvice.color}20`,
                      border: `0.5px solid ${healthAdvice.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                        stroke={healthAdvice.color}
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
                        fontSize: "11px",
                        fontWeight: "600",
                        letterSpacing: "1px",
                        color: "rgba(255,255,255,0.4)",
                        textTransform: "uppercase",
                      }}
                    >
                      AI Health Advisor
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: "500",
                        color: healthAdvice.color,
                      }}
                    >
                      {healthAdvice.msg}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ ...card, padding: "20px" }}>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "11px",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                  }}
                >
                  Smog Prediction
                </p>

                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "var(--dot)",
                  }}
                >
                  {prediction}
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  Based on real-time trend analysis
                </p>
              </div>
            </div>

            {/* Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: "14px",
              }}
            >
              {statColors.map((s) => (
                <div
                  key={s.key}
                  style={{
                    ...card,
                    padding: "18px",
                    background: s.bg,
                    border: `0.5px solid ${s.border}`,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
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
                    {data[s.key]}
                    <span
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.4)",
                        marginLeft: "4px",
                        fontWeight: "400",
                      }}
                    >
                      {s.unit}
                    </span>
                  </p>

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
                        width: `${Math.min(
                          100,
                          (data[s.key] /
                            (s.key === "co2"
                              ? 1023
                              : s.key === "mq135"
                              ? 1023
                              : s.key === "temp"
                              ? 60
                              : 100)) *
                            100
                        )}%`,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{ ...card, padding: "24px" }}>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#fff",
                }}
              >
                Multi-Sensor Trend Analysis
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "CO2 (ppm)", color: "#a78bfa", axis: "Left axis" },
                  { label: "MQ135", color: "#4ade80", axis: "Left axis" },
                  {
                    label: "Humidity (%)",
                    color: "var(--dot)",
                    axis: "Right axis",
                  },
                  { label: "Temp (°C)", color: "#f87171", axis: "Right axis" },
                ].map((l) => (
                  <div
                    key={l.label}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: l.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}
                    >
                      {l.label}
                    </span>
                    <span
                      style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}
                    >
                      ({l.axis})
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData}>
                    <defs>
                      {[
                        { id: "co2", color: "#a78bfa" },
                        { id: "mq135", color: "#4ade80" },
                        { id: "humidity", color: "#4a9eff" },
                        { id: "temp", color: "#f87171" },
                      ].map((g) => (
                        <linearGradient
                          key={g.id}
                          id={`grad-${g.id}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor={g.color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="time"
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      yAxisId="left"
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="co2"
                      stroke="#a78bfa"
                      fill="url(#grad-co2)"
                      strokeWidth={2}
                      name="CO2 (ppm)"
                      dot={false}
                    />

                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="mq135"
                      stroke="#4ade80"
                      fill="url(#grad-mq135)"
                      strokeWidth={2}
                      name="MQ135"
                      dot={false}
                    />

                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="humidity"
                      stroke="#4a9eff"
                      fill="url(#grad-humidity)"
                      strokeWidth={2}
                      name="Humidity (%)"
                      dot={false}
                    />

                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="temp"
                      stroke="#f87171"
                      fill="url(#grad-temp)"
                      strokeWidth={2}
                      name="Temp (°C)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SensorData;