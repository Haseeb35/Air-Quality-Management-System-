import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { realDb } from "../firebase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";

const HistoryScreen = () => {
  const [historyData, setHistoryData]   = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const historyRef = ref(realDb, "air_quality/device1/history");

    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        const formatted = Object.entries(data)
          .sort(([idA], [idB]) => idB.localeCompare(idA)) // latest first
          .map(([id, item]) => ({
            id,
            co2: Number(item.CO2_Levels || 0),
            humidity: Number(item.Humidity_Sensor || 0),
            mq135: Number(item.MQ135 || 0),
            temp: Number(item.Tempature_Sensor || 0),
            lat: Number(item.lat || 0),
            lon: Number(item.lon || 0),
            timestamp: item.timestamp || new Date().toLocaleString(),
            formattedDate:
              item.formattedDate || new Date().toISOString().split("T")[0],
          }));

        setHistoryData(formatted);
        setFilteredData(formatted);
      } else {
        setHistoryData([]);
        setFilteredData([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both dates.");
      return;
    }

    setFilteredData(
      historyData.filter(
        (item) => item.formattedDate >= startDate && item.formattedDate <= endDate
      )
    );
  };

  const resetFilter = () => {
    setFilteredData(historyData);
    setStartDate("");
    setEndDate("");
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HistoricalData");
    XLSX.writeFile(wb, `History_Report_${startDate || "all"}.xlsx`);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Historical Air Quality Report", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [["Date/Time", "Temp (°C)", "Humidity (%)", "CO2 (ppm)", "MQ135"]],
      body: filteredData.map((d) => [
        d.timestamp,
        d.temp,
        d.humidity,
        d.co2,
        d.mq135,
      ]),
    });
    doc.save("Historical_Data.pdf");
  };

  const getStatus = (co2, mq135) => {
  if (co2 >= 800 || mq135 >= 800) {
    return {
      label: "Poor",
      color: "#f87171",
      bg: "rgba(248,113,113,0.12)",
      border: "rgba(248,113,113,0.25)",
    };
  }

  if (co2 >= 600 || mq135 >= 600) {
    return {
      label: "Moderate",
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.12)",
      border: "rgba(251,191,36,0.25)",
    };
  }

  return {
    label: "Healthy",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.12)",
    border: "rgba(74,222,128,0.25)",
  };
};

  const font   = "'Inter','Segoe UI',sans-serif";
  const card   = { background: "var(--card)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "0.5px solid var(--border)", borderRadius: "14px", fontFamily: font };
  const lbl    = { display: "block", fontSize: "10px", fontWeight: "600", letterSpacing: "1.5px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "7px" };
  const dtInput = { background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "9px", padding: "10px 13px", color: "#fff", fontSize: "13px", fontFamily: font, outline: "none", colorScheme: "dark" };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
      background: "var(--bg)",
      fontFamily: font,
    }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />

        <main style={{ flex: 1, marginLeft: "240px", padding: "24px 28px", overflowY: "auto" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: 0 }}>Data History Logs</h2>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "5px 0 0" }}>
                  Historical sensor readings from connected devices
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { label: "Excel", onClick: downloadExcel, color: "#4ade80", border: "rgba(74,222,128,0.3)", bg: "rgba(74,222,128,0.08)" },
                  { label: "PDF",   onClick: downloadPDF,   color: "#f87171", border: "rgba(248,113,113,0.3)", bg: "rgba(248,113,113,0.08)" },
                ].map((b) => (
                  <button key={b.label} onClick={b.onClick} style={{
                    padding: "8px 18px", background: b.bg,
                    border: `0.5px solid ${b.border}`, borderRadius: "8px",
                    color: b.color, fontSize: "12px", fontWeight: "600",
                    fontFamily: font, cursor: "pointer",
                  }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Filter bar ── */}
            <div style={{ ...card, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <label style={lbl}>From Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={dtInput} />
                </div>
                <div>
                  <label style={lbl}>To Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={dtInput} />
                </div>
                <div style={{ display: "flex", gap: "8px", paddingBottom: "1px" }}>
                  <button onClick={handleFilter} style={{
                    padding: "10px 22px", background: "var(--accent)",
                    border: "none", borderRadius: "9px",
                    color: "#fff", fontSize: "13px", fontWeight: "600",
                    fontFamily: font, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "7px",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="1.5"/>
                      <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Filter
                  </button>
                  <button onClick={resetFilter} style={{
                    padding: "10px 18px",
                    background: "rgba(255,255,255,0.05)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: "9px", color: "rgba(255,255,255,0.6)",
                    fontSize: "13px", fontFamily: font, cursor: "pointer",
                  }}>
                    Reset
                  </button>
                </div>

                {/* Record count */}
                <div style={{ marginLeft: "auto", paddingBottom: "1px" }}>
                  <span style={{
                    padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                    background: "rgba(74,158,255,0.1)", border: "0.5px solid rgba(74,158,255,0.2)", color: "var(--dot)",
                  }}>
                    {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Table ── */}
            <div style={{ ...card, overflow: "hidden", padding: 0 }}>
              {/* Table header row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
                padding: "12px 20px",
                borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}>
                {["Timestamp", "Temp", "Humidity", "CO₂", "MQ135", "Status"].map((h) => (
                  <span key={h} style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "1.2px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => {
                  const st = getStatus(row.co2, row.mq135);
                  return (
                    <div key={row.id} style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
                      padding: "14px 20px",
                      borderBottom: i < filteredData.length - 1 ? "0.5px solid rgba(255,255,255,0.04)" : "none",
                      transition: "background 0.15s",
                      alignItems: "center",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Timestamp */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "28px", height: "28px", borderRadius: "7px",
                          background: "rgba(74,158,255,0.1)", border: "0.5px solid rgba(74,158,255,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="var(--dot)" strokeWidth="1.5"/>
                            <path d="M12 6v6l4 2" stroke="var(--dot)" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>
                          {row.timestamp || row.time}
                        </span>
                      </div>

                      {/* Temp */}
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#fbbf24" }}>
                        {row.temp}°C
                      </span>

                      {/* Humidity */}
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--dot)" }}>
                        {row.humidity}%
                      </span>

                      {/* CO2 */}
                      <span style={{
                        fontSize: "13px", fontWeight: "700",
                        color: row.co2 >= 800 ? "#f87171" : row.co2 >= 600 ? "#fbbf24" : "#4ade80",
                      }}>
                        {row.co2} <span style={{ fontSize: "10px", fontWeight: "400", opacity: 0.6 }}>ppm</span>
                      </span>

                      {/* MQ135 */}
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#a78bfa" }}>
                        {row.mq135}
                      </span>

                      {/* Status badge */}
                      <span style={{
                        display: "inline-block", padding: "3px 10px",
                        borderRadius: "5px", fontSize: "11px", fontWeight: "600",
                        background: st.bg, border: `0.5px solid ${st.border}`, color: st.color,
                        width: "fit-content",
                      }}>
                        {st.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  padding: "60px 20px", textAlign: "center",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.2 }}>
                    <path d="M9 17H5a2 2 0 00-2 2v0a2 2 0 002 2h14a2 2 0 002-2v0a2 2 0 00-2-2h-4M9 17V5a2 2 0 012-2h2a2 2 0 012 2v12M9 17h6"
                      stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>
                    No records found for the selected range
                  </span>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
      `}</style>
    </div>
  );
};

export default HistoryScreen;