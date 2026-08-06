import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const themes = {
  "Deep Blue": {
    name: "Deep Blue",
    bg: "linear-gradient(180deg,#020d1f 0%,#041830 25%,#062545 50%,#0a3a6e 75%,#1a5599 100%)",
    card: "rgba(4,18,40,0.7)",
    border: "rgba(74,158,255,0.15)",
    accent: "#1e6fff",
    dot: "#4a9eff",
    preview: ["#020d1f", "#062545", "#1a5599"],
  },
  "Pure Black": {
    name: "Pure Black",
    bg: "#000000",
    card: "rgba(15,15,15,0.85)",
    border: "rgba(255,255,255,0.08)",
    accent: "#1e6fff",
    dot: "#4a9eff",
    preview: ["#000000", "#111111", "#1a1a1a"],
  },
  "Green Forest": {
    name: "Green Forest",
    bg: "linear-gradient(180deg,#010f01 0%,#051a05 25%,#0a2e0a 50%,#0f4a1a 75%,#1a6b2a 100%)",
    card: "rgba(4,20,4,0.75)",
    border: "rgba(74,222,128,0.15)",
    accent: "#16a34a",
    dot: "#4ade80",
    preview: ["#010f01", "#0a2e0a", "#1a6b2a"],
  },
  "Purple Dark": {
    name: "Purple Dark",
    bg: "linear-gradient(180deg,#0a0414 0%,#130a2e 25%,#1e0f4a 50%,#2d1869 75%,#3d2280 100%)",
    card: "rgba(15,8,30,0.75)",
    border: "rgba(167,139,250,0.15)",
    accent: "#7c3aed",
    dot: "#a78bfa",
    preview: ["#0a0414", "#1e0f4a", "#3d2280"],
  },
  "Teal Ocean": {
    name: "Teal Ocean",
    bg: "linear-gradient(180deg,#00080a 0%,#011418 25%,#012530 50%,#013d4e 75%,#016b7a 100%)",
    card: "rgba(0,12,18,0.75)",
    border: "rgba(20,184,166,0.15)",
    accent: "#0d9488",
    dot: "#2dd4bf",
    preview: ["#00080a", "#012530", "#016b7a"],
  },
  "Red Alert": {
    name: "Red Alert",
    bg: "linear-gradient(180deg,#0f0000 0%,#1a0404 25%,#2d0808 50%,#450a0a 75%,#5c0f0f 100%)",
    card: "rgba(20,4,4,0.75)",
    border: "rgba(248,113,113,0.15)",
    accent: "#dc2626",
    dot: "#f87171",
    preview: ["#0f0000", "#2d0808", "#5c0f0f"],
  },
  "Sunset Orange": {
    name: "Sunset Orange",
    bg: "linear-gradient(180deg,#0f0800 0%,#1f1000 25%,#3d2000 50%,#6b3800 75%,#8b4e00 100%)",
    card: "rgba(25,15,0,0.75)",
    border: "rgba(251,146,60,0.15)",
    accent: "#ea580c",
    dot: "#fb923c",
    preview: ["#0f0800", "#3d2000", "#8b4e00"],
  },

  Cyberpunk: {
    name: "Cyberpunk",
    bg: "linear-gradient(180deg,#000a0f 0%,#000f1a 25%,#001428 50%,#00234a 75%,#003366 100%)",
    card: "rgba(0,10,20,0.8)",
    border: "rgba(0,255,255,0.15)",
    accent: "#00b4d8",
    dot: "#00ffff",
    preview: ["#000a0f", "#001428", "#003366"],
  },

  "Rose Gold": {
    name: "Rose Gold",
    bg: "linear-gradient(180deg,#0f0508 0%,#1f0a10 25%,#3d1020 50%,#6b1535 75%,#8b1a42 100%)",
    card: "rgba(25,5,12,0.75)",
    border: "rgba(251,113,133,0.15)",
    accent: "#e11d6a",
    dot: "#fb7185",
    preview: ["#0f0508", "#3d1020", "#8b1a42"],
  },

  "Golden Hour": {
    name: "Golden Hour",
    bg: "linear-gradient(180deg,#0a0800 0%,#1a1400 25%,#2e2200 50%,#4a3800 75%,#6b5200 100%)",
    card: "rgba(18,14,0,0.75)",
    border: "rgba(234,179,8,0.15)",
    accent: "#ca8a04",
    dot: "#facc15",
    preview: ["#0a0800", "#2e2200", "#6b5200"],
  },
  "Midnight Purple": {
    name: "Midnight Purple",
    bg: "linear-gradient(180deg, #0d0015 0%, #160025 30%, #1e0035 60%, #2a0050 100%)",
    card: "rgba(20,0,35,0.75)",
    border: "rgba(180,100,255,0.15)",
    accent: "#9333ea",
    dot: "#c084fc",
    preview: ["#0d0015", "#1e0035", "#2a0050"],
  },

  "Dark Emerald": {
    name: "Dark Emerald",
    bg: "linear-gradient(180deg, #001a12 0%, #002a1c 30%, #003d28 60%, #005235 100%)",
    card: "rgba(0,22,15,0.75)",
    border: "rgba(52,211,153,0.15)",
    accent: "#059669",
    dot: "#34d399",
    preview: ["#001a12", "#003d28", "#005235"],
  },

  Charcoal: {
    name: "Charcoal",
    bg: "linear-gradient(180deg, #0f0f0f 0%, #161616 30%, #1c1c1c 60%, #242424 100%)",
    card: "rgba(22,22,22,0.85)",
    border: "rgba(255,255,255,0.08)",
    accent: "#6366f1",
    dot: "#818cf8",
    preview: ["#0f0f0f", "#1c1c1c", "#242424"],
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem("aqsTheme") || "Deep Blue",
  );

  const theme = themes[themeName] || themes["Deep Blue"];

  const setTheme = (name) => {
    setThemeName(name);
    localStorage.setItem("aqsTheme", name);
  };

  // Apply CSS vars to :root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--card", theme.card);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--dot", theme.dot);
    document.body.style.background = theme.bg;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
