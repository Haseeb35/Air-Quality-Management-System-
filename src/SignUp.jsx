import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const navigate = useNavigate();

  // Same canvas background as SignIn
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.65,
      r: Math.random() * 1.4 + 0.3,
      o: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight * (0.4 + Math.random() * 0.6),
      r: Math.random() * 2 + 1,
      vy: -(Math.random() * 0.4 + 0.2),
      vx: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.2,
      maxY: window.innerHeight * (Math.random() * 0.3 + 0.05),
    }));

    let t = 0;
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      stars.forEach((s) => {
        const twinkle = s.o + Math.sin(t * s.speed * 60 + s.phase) * 0.2;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, twinkle)})`;
        ctx.fill();
      });

      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.o -= 0.0015;
        if (p.y < p.maxY || p.o <= 0) {
          p.y = canvas.height * (0.5 + Math.random() * 0.5);
          p.x = Math.random() * canvas.width;
          p.o = Math.random() * 0.5 + 0.2;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,158,255,${p.o})`;
        ctx.fill();
      });

      t++;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: username,
        email: email,
        role: "User",
        createdAt: new Date().toISOString(),
      });

      navigate("/user-dashboard");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "9px",
    padding: "11px 13px",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    marginBottom: "16px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    color: "rgba(255,255,255,0.45)",
    marginBottom: "6px",
  };

  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter','Segoe UI',sans-serif",
      overflow: "hidden",
      background: "linear-gradient(180deg, #020d1f 0%, #041830 25%, #062545 50%, #0a3a6e 75%, #1a5599 100%)",
    }}>

      {/* Animated canvas */}
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
      }} />

      {/* Atmosphere glow */}
      <div style={{
        position: "absolute", bottom: "-40px", left: "-10%", right: "-10%",
        height: "200px", borderRadius: "50%",
        background: "rgba(30,111,255,0.18)", filter: "blur(40px)",
        zIndex: 0, pointerEvents: "none",
      }} />

      {/* Earth curve */}
      <div style={{
        position: "absolute", bottom: "-80px", left: "-10%", right: "-10%",
        height: "160px", borderRadius: "50%",
        background: "rgba(10,25,55,0.85)",
        borderTop: "0.5px solid rgba(74,158,255,0.25)",
        zIndex: 1, pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 2,
        background: "rgba(4,18,40,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "0.5px solid rgba(74,158,255,0.2)",
        borderRadius: "16px",
        padding: "36px 32px",
        width: "360px",
      }}>

        {/* Top glow line */}
        <div style={{
          position: "absolute", top: 0, left: "25%", right: "25%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(74,158,255,0.6), transparent)",
          borderRadius: "1px",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{
            width: "36px", height: "36px", background: "var(--accent)",
            borderRadius: "9px", display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4C9.5 4 7 5.8 6.2 8.2C4.4 8.6 3 10.1 3 12C3 14.2 4.8 16 7 16H17C19.2 16 21 14.2 21 12C21 10.1 19.6 8.6 17.8 8.2C17 5.8 14.5 4 12 4Z"
                stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.15)"
              />
              <line x1="12" y1="16" x2="12" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="20.5" r="1" fill="white" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#fff", lineHeight: "1.1", margin: 0 }}>
              AirSense
            </p>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px" }}>
              AIR QUALITY SYSTEM
            </span>
          </div>
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", margin: "0 0 6px" }}>
          Sign Up
        </h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "0 0 26px" }}>
          Create your account
        </p>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.12)",
            border: "0.5px solid rgba(239,68,68,0.3)",
            borderRadius: "8px", padding: "10px 14px",
            color: "#f87171", fontSize: "13px",
            marginBottom: "16px", textAlign: "center",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username" style={labelStyle}>Username</label>
          <input
            type="text"
            id="username"
            placeholder="John Doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={inputStyle}
          />

          <label htmlFor="email" style={labelStyle}>Email</label>
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label htmlFor="password" style={labelStyle}>Password</label>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, marginBottom: 0, paddingRight: "40px" }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: "13px", top: "50%",
                transform: "translateY(-50%)", cursor: "pointer",
                color: "rgba(255,255,255,0.35)", fontSize: "13px",
                userSelect: "none",
              }}
            >
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", background: "var(--accent)",
              border: "none", borderRadius: "9px", color: "#fff",
              fontSize: "14px", fontWeight: "500", fontFamily: "inherit",
              cursor: "pointer", opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
          Already have an account?{" "}
          <Link to="/signin" style={{ color: "var(--dot)", textDecoration: "none" }}>
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignUp;