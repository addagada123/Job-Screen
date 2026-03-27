import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [testTaken, setTestTaken] = useState(() => {
    return !!user?.testTaken;
  });

  const location = useLocation();

  useEffect(() => {
    const syncAuth = () => {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      setUser(u);
      setTestTaken(!!u?.testTaken);
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);
  const hideNavbar = location.pathname.startsWith("/dashboard/test") && !testTaken;

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <>
      <ScrollToTop />
      {!hideNavbar && <Navbar user={user} setUser={setUser} setTestTaken={setTestTaken} />}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login setUser={setUser} setTestTaken={setTestTaken} />} />
        <Route path="/signup" element={<Signup setUser={setUser} setTestTaken={setTestTaken} />} />
        <Route
          path="/dashboard/*"
          element={<Dashboard user={user} setUser={setUser} hideSidebar={hideNavbar} testTaken={testTaken} setTestTaken={setTestTaken} />}
        />
      </Routes>
    </>
  );
}

export default App;