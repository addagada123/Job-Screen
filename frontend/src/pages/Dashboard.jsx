import { Box, Flex, Text, VStack, Button, useToast, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Heading, Spinner, Wrap, HStack } from "@chakra-ui/react";
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
import { getAdminUsers, getAdminRequests, getResume } from "../api";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

function DashboardHome({ user, resumeUploaded, testTaken, onUploadResume, onTakeTest, onViewResults }) {
  if (user?.isAdmin) {
    return <Overview user={user} resumeUploaded={resumeUploaded} testTaken={testTaken} />;
  }

  return (
    <Box mt={20} maxW="600px" mx="auto" p={6} borderRadius="2xl" bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.05)">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="700" color="white">Welcome, {user?.name || user?.email || "User"}!</Text>
        <Box>
          <Text color="gray.300" mb={2}>Resume:</Text>
          {resumeUploaded ? (
            <Alert status="success" borderRadius="md" mb={2}><AlertIcon />Resume uploaded</Alert>
          ) : (
            <Button colorScheme="purple" onClick={onUploadResume}>Upload Resume</Button>
          )}
        </Box>
        <Box>
          <Text color="gray.300" mb={2}>Test Status:</Text>
          {testTaken ? (
            <Alert status="info" borderRadius="md" mb={2}><AlertIcon />Test already taken</Alert>
          ) : (
            <Button colorScheme="green" onClick={onTakeTest} isDisabled={!resumeUploaded}>Take Test</Button>
          )}
        </Box>
        <Box>
          <Text color="gray.300" mb={2}>Results:</Text>
          {testTaken ? (
            <Button colorScheme="blue" onClick={onViewResults}>View Results</Button>
          ) : (
            <Text color="gray.500">Results available after test</Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
function Overview({ user, resumeUploaded, testTaken }) {
  const [stats, setStats] = useState({ total: 0, pending: 0, selected: 0, rejected: 0, requests: 0 });
  const [loading, setLoading] = useState(user?.isAdmin);

  useEffect(() => {
    if (user?.isAdmin) {
      // Fetch stats for admin
      Promise.all([
        getAdminUsers(),
        getAdminRequests()
      ]).then(([users, requests]) => {
        const counts = {
          total: users.length,
          pending: users.filter(u => !u.selection && u.testTaken).length,
          selected: users.filter(u => u.selection === "selected").length,
          rejected: users.filter(u => u.selection === "rejected").length,
          requests: requests.length
        };
        setStats(counts);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  if (user?.isAdmin) {
    const navigate = useNavigate();
    return (
      <VStack spacing={8} align="stretch" p={8}>
        <HStack justify="space-between">
          <Heading size="lg" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">
            Recruiter Command Center
          </Heading>
          <HStack spacing={4}>
             <Button size="sm" colorScheme="cyan" variant="outline" onClick={() => navigate("/dashboard/results")}>Rankings</Button>
             <Button size="sm" colorScheme="purple" variant="outline" onClick={() => navigate("/dashboard/admin-requests")}>Requests</Button>
          </HStack>
        </HStack>
        
        {loading ? <Spinner /> : (
          <Wrap spacing={6} justify="start">
            <StatCard label="Total Applicants" value={stats.total} icon="👥" color="blue.400" />
            <StatCard label="Pending Review" value={stats.pending} icon="⏳" color="orange.400" />
            <StatCard label="Selected" value={stats.selected} icon="✅" color="green.400" />
            <StatCard label="Rejected" value={stats.rejected} icon="❌" color="red.400" />
            <StatCard label="Access Requests" value={stats.requests} icon="🔑" color="purple.400" />
          </Wrap>
        )}

        <Box>
           <Heading size="md" mb={4} color="white">Top Ranking Candidates</Heading>
           <AdminScores embedMode={true} />
        </Box>

        <Box bg="rgba(255,255,255,0.02)" p={6} borderRadius="2xl" border="1px solid rgba(255,255,255,0.05)">
          <Heading size="sm" mb={4}>Quick Tips</Heading>
          <VStack align="start" spacing={2} color="gray.400" fontSize="sm">
            <Text>• Review 'Admin Requests' to grant new recruiters access.</Text>
            <Text>• Check 'Candidate Rankings' to evaluate test results and mark selections.</Text>
            <Text>• High context relevancy ({">= 70%"}) indicates a strong candidate match.</Text>
          </VStack>
        </Box>
      </VStack>
    );
  }

  // User Overview
  return (
    <VStack spacing={10} align="stretch" p={8}>
      <VStack align="start" spacing={2}>
        <Heading size="xl">Hello, {user?.firstName || "Candidate"}! 👋</Heading>
        <Text color="gray.400">Track your application progress below.</Text>
      </VStack>

      <Flex justify="space-between" position="relative" px={4}>
        <StepIndicator active={true} label="Resume" done={resumeUploaded} />
        <StepIndicator active={resumeUploaded} label="AI Test" done={testTaken} />
        <StepIndicator active={testTaken} label="Result" done={false} />
        <Box position="absolute" top="15px" left="10%" right="10%" h="2px" bg="rgba(255,255,255,0.1)" zIndex={0} />
      </Flex>

      <Box bg="rgba(255,255,255,0.02)" p={8} borderRadius="3xl" border="1px solid rgba(255,255,255,0.05)" boxShadow="xl">
        {!resumeUploaded ? (
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="600">Step 1: Upload your Resume</Text>
            <Text color="gray.400" textAlign="center">Our AI will analyze your skills to generate custom interview questions.</Text>
            <Button colorScheme="purple" size="lg" px={10} onClick={() => window.location.href="/dashboard/resume"}>Get Started</Button>
          </VStack>
        ) : !testTaken ? (
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="600">Step 2: Take the AI Screening Test</Text>
            <Text color="gray.400" textAlign="center">A 15-question voice & text assessment tailored to your skills.</Text>
            <Button colorScheme="green" size="lg" px={10} onClick={() => window.location.href="/dashboard"}>Go to Test Portal</Button>
          </VStack>
        ) : (
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="600">Step 3: Awaiting Decision</Text>
            <Text color="gray.400" textAlign="center">Your test has been submitted. The hiring team will review your results shortly.</Text>
            <Button colorScheme="cyan" variant="outline" size="lg" px={10} onClick={() => window.location.href="/dashboard/results"}>Check Status</Button>
          </VStack>
        )}
      </Box>
    </VStack>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <Box bg="rgba(255,255,255,0.03)" p={6} borderRadius="2xl" borderLeft={`4px solid`} borderLeftColor={color} minW="180px" shadow="md">
      <HStack spacing={4}>
        <Text fontSize="3xl">{icon}</Text>
        <VStack align="start" spacing={0}>
          <Text fontSize="2xl" fontWeight="bold">{value}</Text>
          <Text fontSize="xs" color="gray.400" textTransform="uppercase">{label}</Text>
        </VStack>
      </HStack>
    </Box>
  );
}

function StepIndicator({ active, label, done }) {
  return (
    <VStack zIndex={1} bg="transparent">
      <Box 
        w="34px" h="34px" borderRadius="full" 
        bg={done ? "green.400" : active ? "cyan.500" : "gray.700"} 
        display="flex" alignItems="center" justifyContent="center"
        boxShadow={active ? "0 0 15px rgba(0, 255, 255, 0.3)" : "none"}
      >
        {done ? "✓" : ""}
      </Box>
      <Text fontSize="xs" fontWeight={active ? "600" : "400"} color={active ? "white" : "gray.500"}>{label}</Text>
    </VStack>
  );
}


export default function Dashboard({ hideSidebar }) {
  const [user, setUser] = useState(null);
  const [resumeUploaded, setResumeUploaded] = useState(!!localStorage.getItem("resumeUploaded"));
  const [testTaken, setTestTaken] = useState(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    return u && u.testTaken;
  });
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingTest, setPendingTest] = useState(false);

  // Hide sidebar/navbar if on /test route
  const isTestRoute = location.pathname.includes("/test");

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (!u) {
      navigate("/login");
    }
    setResumeUploaded(!!localStorage.getItem("resumeUploaded"));
    if (u) {
      getResume(u.email).then(data => {
        if (data && data.resume) {
          setResumeUploaded(true);
          localStorage.setItem("resumeUploaded", "true");
        } else {
          setResumeUploaded(false);
          localStorage.removeItem("resumeUploaded");
        }
      }).catch(() => {});
    }
    setTestTaken(u && u.testTaken);
  }, [navigate]);

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Text color="gray.400">Loading...</Text>
      </Flex>
    );
  }

  const isAdminRoute = location.pathname.includes("admin-scores") || 
                       location.pathname.includes("admin-requests") || 
                       location.pathname.includes("admin-users");
  if (isAdminRoute && !user.isAdmin) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Box
          p={8}
          borderRadius="2xl"
          bg="rgba(244, 63, 94, 0.1)"
          border="1px solid rgba(244, 63, 94, 0.3)"
        >
          <Text color="red.300" fontWeight="600">
            Access denied. Admins only.
          </Text>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" position="relative" overflow="hidden">
      {/* Background Effects */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
        pointerEvents="none"
      >
        <Box
          position="absolute"
          top="10%"
          right="20%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="rgba(99, 102, 241, 0.05)"
          filter="blur(100px)"
        />
        <Box
          position="absolute"
          bottom="20%"
          left="10%"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="rgba(139, 92, 246, 0.04)"
          filter="blur(80px)"
        />
      </Box>

      {!hideSidebar && !isTestRoute && <Sidebar user={user} />}

      <Box
        ml={!hideSidebar && !isTestRoute ? { base: 0, md: 72 } : 0}
        flex="1"
        minH="100vh"
        position="relative"
        zIndex={1}
        mt={28} // Ensures content is always below the navbar
      >
        <Routes>
          <Route path="" element={
            <DashboardHome
              user={user}
              resumeUploaded={resumeUploaded}
              testTaken={testTaken}
              onUploadResume={() => navigate("/dashboard/resume")}
              onTakeTest={() => navigate("/dashboard/test")}
              onViewResults={() => navigate("/dashboard/results")}
            />
          } />
          <Route path="overview" element={<Overview user={user} resumeUploaded={resumeUploaded} testTaken={testTaken} />} />
          <Route path="resume" element={<Resume />} />
          <Route path="test" element={<Test />} />
          <Route path="results" element={user.isAdmin ? <AdminScores /> : <Results />} />
          <Route path="admin-requests" element={<AdminRequests />} />
          <Route path="admin-users" element={<AdminUsers />} />
        </Routes>
        <Outlet />
      </Box>
    </Flex>
  );
}

