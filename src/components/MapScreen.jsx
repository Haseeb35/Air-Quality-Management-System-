import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  InfoWindow,
  Marker,
  Polygon,
} from "@react-google-maps/api";
import axios from "axios";
import { ref, onValue } from "firebase/database";
import { realDb } from "../firebase";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 33.6844, lng: 73.0479 };

const getSeverity = (co2, mq135) => {
  if (co2 >= 800 || mq135 >= 800) {
    return { color: "#f87171", label: "High Risk" };
  }

  if (co2 >= 600 || mq135 >= 600) {
    return { color: "#fbbf24", label: "Medium Risk" };
  }

  return { color: "#4ade80", label: "Low Risk" };
};

const metersToLat = (m) => m / 111320;
const metersToLng = (m, lat) => m / (111320 * Math.cos((lat * Math.PI) / 180));

const getCirclePath = (lat, lng, r = 1000, pts = 60) =>
  Array.from({ length: pts }, (_, i) => {
    const a = (2 * Math.PI * i) / pts;
    return {
      lat: lat + metersToLat(r * Math.sin(a)),
      lng: lng + metersToLng(r * Math.cos(a), lat),
    };
  });

const getRectanglePath = (lat, lng, w = 1800, h = 1800) => {
  const dLat = metersToLat(h / 2);
  const dLng = metersToLng(w / 2, lat);

  return [
    { lat: lat + dLat, lng: lng - dLng },
    { lat: lat + dLat, lng: lng + dLng },
    { lat: lat - dLat, lng: lng + dLng },
    { lat: lat - dLat, lng: lng - dLng },
  ];
};

const getDiamondPath = (lat, lng, s = 1200) => [
  { lat: lat + metersToLat(s), lng },
  { lat, lng: lng + metersToLng(s, lat) },
  { lat: lat - metersToLat(s), lng },
  { lat, lng: lng - metersToLng(s, lat) },
];

const getTrianglePath = (lat, lng, s = 1300) => [
  { lat: lat + metersToLat(s), lng },
  {
    lat: lat - metersToLat(s * 0.8),
    lng: lng - metersToLng(s * 0.9, lat),
  },
  {
    lat: lat - metersToLat(s * 0.8),
    lng: lng + metersToLng(s * 0.9, lat),
  },
];

const getHexagonPath = (lat, lng, s = 1100) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return {
      lat: lat + metersToLat(s * Math.sin(a)),
      lng: lng + metersToLng(s * Math.cos(a), lat),
    };
  });

const ShapeOverlay = ({ sensor, severity, selectedShape }) => {
  const opts = {
    fillColor: severity.color,
    fillOpacity: 0.2,
    strokeColor: severity.color,
    strokeOpacity: 0.9,
    strokeWeight: 1.5,
    clickable: false,
  };

  const paths =
    {
      circle: getCirclePath(sensor.lat, sensor.lng),
      rectangle: getRectanglePath(sensor.lat, sensor.lng),
      diamond: getDiamondPath(sensor.lat, sensor.lng),
      triangle: getTrianglePath(sensor.lat, sensor.lng),
      hexagon: getHexagonPath(sensor.lat, sensor.lng),
    }[selectedShape] || getHexagonPath(sensor.lat, sensor.lng);

  return (
    <Polygon
      key={`${sensor.id}-${selectedShape}`}
      paths={paths}
      options={opts}
    />
  );
};

const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0a1628" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#042535" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#546e7a" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#0d2137" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#051523" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d5a6b" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#041830" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "var(--dot)" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#061d2e" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#071d25" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#051523" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "var(--accent)" }, { weight: 0.5 }],
  },
];

const MapScreen = () => {
  const [sensors, setSensors] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [weatherPoint, setWeatherPoint] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedShape, setSelectedShape] = useState("hexagon");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const dbRef = ref(realDb, "air_quality/device1");

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data || data.lat === undefined || data.lon === undefined) {
          setSensors([]);
          return;
        }

        setSensors([
          {
            id: "sensor-1",
            name: "Live Sensor",
            lat: Number(data.lat),
            lng: Number(data.lon),

            CO2_Levels: Number(data.CO2_Levels ?? 0),
            Humidity_Sensor: Number(data.Humidity_Sensor ?? 0),
            Tempature_Sensor: Number(data.Tempature_Sensor ?? 0),
            MQ135: Number(data.MQ135 ?? 0),
          },
        ]);
      },
      (err) => console.error("Realtime DB error:", err),
    );

    return () => unsubscribe();
  }, []);

  const onMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setWeatherPoint({ lat, lng });
    setSelectedSensor(null);
    setWeatherLoading(true);
    setWeather(null);

    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`,
      );
      setWeather(res.data);
    } catch (err) {
      console.error("Weather error:", err);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const mapCenter =
    sensors.length > 0
      ? { lat: sensors[0].lat, lng: sensors[0].lng }
      : DEFAULT_CENTER;

  const font = "'Inter','Segoe UI',sans-serif";

  const infoCard = {
    background: "var(--card)",
    borderRadius: "10px",
    padding: "14px",
    minWidth: "220px",
    fontFamily: font,
    color: "#fff",
  };

  const infoRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
    fontSize: "13px",
  };

  const shapes = ["circle", "rectangle", "diamond", "triangle", "hexagon"];

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
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            gap: "16px",
            overflow: "hidden",
          }}
        >
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
                Live Map
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.4)",
                  margin: "4px 0 0",
                }}
              >
                Real-time sensor location &amp; region risk overlay
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.45)",
                  whiteSpace: "nowrap",
                }}
              >
                Risk Shape:
              </span>

              <div style={{ display: "flex", gap: "6px" }}>
                {shapes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedShape(s)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "7px",
                      fontSize: "11px",
                      fontWeight: "600",
                      fontFamily: font,
                      textTransform: "capitalize",
                      cursor: "pointer",
                      border:
                        selectedShape === s
                          ? "0.5px solid rgba(74,158,255,0.6)"
                          : "0.5px solid rgba(255,255,255,0.1)",
                      background:
                        selectedShape === s
                          ? "var(--border)"
                          : "rgba(255,255,255,0.04)",
                      color:
                        selectedShape === s
                          ? "var(--dot)"
                          : "rgba(255,255,255,0.45)",
                      transition: "all 0.2s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              borderRadius: "14px",
              overflow: "hidden",
              border: "0.5px solid rgba(74,158,255,0.2)",
              position: "relative",
              minHeight: 0,
            }}
          >
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={12}
                onClick={onMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                  zoomControlOptions: { position: 3 },
                  styles: MAP_STYLES,
                }}
              >
                {sensors.map((sensor) => {
                  const severity = getSeverity(sensor.CO2_Levels, sensor.MQ135);

                  return (
                    <React.Fragment key={sensor.id}>
                      <Marker
                        position={{ lat: sensor.lat, lng: sensor.lng }}
                        onClick={() => setSelectedSensor(sensor)}
                        icon={{
                          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                          fillColor: "var(--dot)",
                          fillOpacity: 1,
                          strokeColor: "#fff",
                          strokeWeight: 1.5,
                          scale: 1.4,
                          anchor: { x: 12, y: 22 },
                        }}
                      />

                      <ShapeOverlay
                        sensor={sensor}
                        severity={severity}
                        selectedShape={selectedShape}
                      />
                    </React.Fragment>
                  );
                })}

                {selectedSensor && (
                  <InfoWindow
                    position={{
                      lat: selectedSensor.lat,
                      lng: selectedSensor.lng,
                    }}
                    onCloseClick={() => setSelectedSensor(null)}
                    options={{ pixelOffset: { width: 0, height: -32 } }}
                  >
                    <div style={infoCard}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#4ade80",
                            boxShadow: "0 0 6px #4ade80",
                          }}
                        />

                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#fff",
                          }}
                        >
                          {selectedSensor.name}
                        </span>
                      </div>

                      {[
                        {
                          label: "CO₂",
                          val: `${selectedSensor.CO2_Levels} ppm`,
                          color: "#a78bfa",
                        },
                        {
                          label: "Humidity",
                          val: `${selectedSensor.Humidity_Sensor}%`,
                          color: "var(--dot)",
                        },
                        {
                          label: "Temperature",
                          val: `${selectedSensor.Tempature_Sensor}°C`,
                          color: "#fbbf24",
                        },
                        {
                          label: "MQ135",
                          val: `${selectedSensor.MQ135}`,
                          color: "#4ade80",
                        },
                      ].map((r) => (
                        <div key={r.label} style={infoRow}>
                          <span style={{ color: "rgba(255,255,255,0.45)" }}>
                            {r.label}
                          </span>
                          <span style={{ fontWeight: "600", color: r.color }}>
                            {r.val}
                          </span>
                        </div>
                      ))}

                      <div
                        style={{
                          marginTop: "10px",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "600",
                          textAlign: "center",
                          background: `${
                            getSeverity(
                              selectedSensor.CO2_Levels,
                              selectedSensor.MQ135,
                            ).color
                          }20`,
                          border: `0.5px solid ${
                            getSeverity(
                              selectedSensor.CO2_Levels,
                              selectedSensor.MQ135,
                            ).color
                          }50`,
                          color: getSeverity(
                            selectedSensor.CO2_Levels,
                            selectedSensor.MQ135,
                          ).color,
                        }}
                      >
                        {
                          getSeverity(
                            selectedSensor.CO2_Levels,
                            selectedSensor.MQ135,
                          ).label
                        }
                      </div>
                    </div>
                  </InfoWindow>
                )}

                {weatherPoint && (
                  <Marker
                    position={weatherPoint}
                    icon={{
                      path: "M12 2a10 10 0 100 20A10 10 0 0012 2z",
                      fillColor: "#fbbf24",
                      fillOpacity: 0.9,
                      strokeColor: "#fff",
                      strokeWeight: 1.5,
                      scale: 0.9,
                      anchor: { x: 12, y: 12 },
                    }}
                  />
                )}

                {weatherPoint && (
                  <InfoWindow
                    position={weatherPoint}
                    onCloseClick={() => {
                      setWeatherPoint(null);
                      setWeather(null);
                    }}
                    options={{ pixelOffset: { width: 0, height: -20 } }}
                  >
                    <div style={infoCard}>
                      {weatherLoading ? (
                        <div style={{ textAlign: "center", padding: "12px 0" }}>
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              border: "2px solid rgba(74,158,255,0.3)",
                              borderTopColor: "var(--dot)",
                              animation: "spin 0.8s linear infinite",
                              margin: "0 auto 8px",
                            }}
                          />
                          <p
                            style={{
                              fontSize: "12px",
                              color: "rgba(255,255,255,0.4)",
                              margin: 0,
                            }}
                          >
                            Fetching weather...
                          </p>
                        </div>
                      ) : weather ? (
                        <>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "12px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "#fff",
                              }}
                            >
                              {weather.name || "Unknown"}
                            </span>

                            <img
                              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                              alt="icon"
                              style={{ width: "36px", height: "36px" }}
                            />
                          </div>

                          {[
                            {
                              label: "Temperature",
                              val: `${Math.round(weather.main.temp)}°C`,
                              color: "#fbbf24",
                            },
                            {
                              label: "Feels Like",
                              val: `${Math.round(weather.main.feels_like)}°C`,
                              color: "#f87171",
                            },
                            {
                              label: "Humidity",
                              val: `${weather.main.humidity}%`,
                              color: "var(--dot)",
                            },
                            {
                              label: "Wind Speed",
                              val: `${weather.wind.speed} m/s`,
                              color: "#4ade80",
                            },
                          ].map((r) => (
                            <div key={r.label} style={infoRow}>
                              <span style={{ color: "rgba(255,255,255,0.45)" }}>
                                {r.label}
                              </span>
                              <span
                                style={{ fontWeight: "600", color: r.color }}
                              >
                                {r.val}
                              </span>
                            </div>
                          ))}

                          <div
                            style={{
                              marginTop: "10px",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              background: "rgba(74,158,255,0.1)",
                              border: "0.5px solid rgba(74,158,255,0.2)",
                              fontSize: "11px",
                              fontWeight: "600",
                              textAlign: "center",
                              color: "var(--dot)",
                              textTransform: "capitalize",
                            }}
                          >
                            {weather.weather[0].description}
                          </div>
                        </>
                      ) : (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#f87171",
                            margin: 0,
                          }}
                        >
                          Weather data not available.
                        </p>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "2px solid rgba(74,158,255,0.3)",
                    borderTopColor: "var(--dot)",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Loading Maps...
                </span>
              </div>
            )}

            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: "var(--card)",
                backdropFilter: "blur(12px)",
                border: "0.5px solid rgba(74,158,255,0.2)",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}
              >
                Risk Level
              </span>

              {[
                { color: "#4ade80", label: "Low Risk  (< 600)" },
                { color: "#fbbf24", label: "Medium Risk (600–799)" },
                { color: "#f87171", label: "High Risk  (>= 800)" },
              ].map((l) => (
                <div
                  key={l.label}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
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
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    {l.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                background: "rgba(4,18,40,0.75)",
                backdropFilter: "blur(12px)",
                border: "0.5px solid var(--border)",
                borderRadius: "8px",
                padding: "7px 12px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Click map for weather info
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .gm-style-iw { background: transparent !important; padding: 0 !important; box-shadow: none !important; }
        .gm-style-iw-d { overflow: visible !important; }
        .gm-style-iw-c { background: transparent !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
        .gm-style-iw-tc::after { display: none; }
        .gm-ui-hover-effect { filter: invert(1) !important; top: 4px !important; right: 4px !important; }
      `}</style>
    </div>
  );
};

export default MapScreen;
