

import { Box, Flex, Text } from "@chakra-ui/react";
import Sidebar from "../components/dashboard/Sidebar";
import Test from "../components/dashboard/Test";
import Results from "../components/dashboard/Results";
import Resume from "../components/dashboard/Resume";
import AdminScores from "../components/dashboard/AdminScores";
import AdminRequests from "../components/dashboard/AdminRequests";
import AdminUsers from "../components/dashboard/AdminUsers";
import { Outlet, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";

function Overview() {
  return <Box p={8}><h2>Welcome to your Dashboard!</h2></Box>;
}



export default function Dashboard({ hideSidebar }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (!u) {
      navigate("/login");
    }
  }, [navigate]);

  // Route protection
  if (!user) {
    return <Text p={8}>Loading...</Text>;
  }
  const isAdminRoute = location.pathname.includes("admin-scores") || location.pathname.includes("admin-requests");
  if (isAdminRoute && !user.isAdmin) {
    return <Text p={8} color="red.300">Access denied. Admins only.</Text>;
  }

  return (
    <Flex>
      {!hideSidebar && <Sidebar user={user} />}
      <Box ml={!hideSidebar ? { base: 0, md: 64 } : 0} flex="1" minH="100vh" bg="#0f1218">
        <Routes>
          <Route path="overview" element={<Overview />} />
          <Route path="resume" element={<Resume />} />
          <Route path="test" element={<Test />} />
          <Route path="results" element={<Results />} />
          <Route path="admin-scores" element={<AdminScores />} />
          <Route path="admin-requests" element={<AdminRequests />} />
          <Route path="admin-users" element={<AdminUsers />} />
        </Routes>
        <Outlet />
      </Box>
    </Flex>
  );
}
