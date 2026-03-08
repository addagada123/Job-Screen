import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';


import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  // Hide Navbar on /dashboard/test
  const hideNavbar = location.pathname.startsWith("/dashboard/test");
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ChakraProvider theme={theme}>
        <Router>
          {!hideNavbar && <Navbar />}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard/*" element={<Dashboard hideSidebar={hideNavbar} />} />
          </Routes>
        </Router>
      </ChakraProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
