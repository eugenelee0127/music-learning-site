import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Scales from "./pages/Scales.jsx";
import Modes from "./pages/Modes.jsx";

export default function App() {
  return (
    <Router basename="/music-learning-site">
      <header style={{ background: "#333", padding: "1rem" }}>
        <h1 style={{ color: "#fff", margin: 0 }}>Music Theory Learning Site</h1>
        <nav>
          <ul style={{ display: "flex", listStyle: "none", gap: "1rem", margin: 0, padding: 0 }}>
            <li>
              <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>
            </li>
            <li>
              <Link to="/scales" style={{ color: "#fff", textDecoration: "none" }}>Scales</Link>
            </li>
            <li>
              <Link to="/modes" style={{ color: "#fff", textDecoration: "none" }}>Modes</Link>
            </li>
          </ul>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scales" element={<Scales />} />
        <Route path="/modes" element={<Modes />} />
      </Routes>
    </Router>
  );
}
