import { Box, Flex, Text, VStack, Button, useToast, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, HStack } from "@chakra-ui/react";
import Sidebar from "../components/dashboard/Sidebar";
import Test from "../components/dashboard/Test";
import Results from "../components/dashboard/Results";
import Resume from "../components/dashboard/Resume";
import AdminScores from "../components/dashboard/AdminScores";
import AdminRequests from "../components/dashboard/AdminRequests";
import AdminUsers from "../components/dashboard/AdminUsers";
import AdminRetakeRequests from "../components/dashboard/AdminRetakeRequests";
import AdminAnalytics from "../components/dashboard/AdminAnalytics";
import { Outlet, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
function DashboardHome({ user, resumeUploaded, testTaken, onUploadResume, onTakeTest, onViewResults }) {
  // Ensure margin-top for navbar offset
  return (
    <Box mt={12} maxW="600px" mx="auto" p={6} borderRadius="2xl" bg="rgba(255,255,255,0.02)" border="1px solid rgba(255,255,255,0.05)">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="700" color="white">Welcome, {user?.name || user?.email || "User"}!</Text>
        {user?.isAdmin ? (
          <Box p={6} bg="rgba(99, 102, 241, 0.1)" borderRadius="xl" border="1px solid rgba(99, 102, 241, 0.2)">
            <Text color="cyan.300" fontWeight="600" mb={4}>Administrator Access Confirmed</Text>
            <Text color="gray.300" fontSize="sm" mb={6}>
              You have full recruiter permissions. You can view candidate scores, manage user accounts, 
              and approve retake requests using the sidebar menu.
            </Text>
            <Button colorScheme="cyan" w="full" onClick={onViewResults}>Go to Performance Scores</Button>
          </Box>
        ) : (
          <>
            {user?.selection && (
              <Box p={4} borderRadius="xl" bg={user.selection === "selected" ? "rgba(72, 187, 120, 0.1)" : "rgba(245, 101, 101, 0.1)"} border="1px solid" borderColor={user.selection === "selected" ? "green.500" : "red.500"} mb={2}>
                <HStack mb={2}>
                  <Text fontSize="lg" fontWeight="bold" color={user.selection === "selected" ? "green.300" : "red.300"}>
                    Status: {user.selection.toUpperCase()}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.300">
                  {user.selection === "selected" 
                    ? "Congratulations! You have been selected for the next round. Our team will contact you soon." 
                    : "Thank you for your interest. We have decided to move forward with other candidates at this time."}
                </Text>
              </Box>
            )}
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
          </>
        )}
      </VStack>
    </Box>
  );
}
import { getCurrentUser } from "../utils/auth";
import { getAuthMe } from "../api";
import { motion } from "framer-motion";

// Use motion.create if available for forward compatibility
const MotionBox = motion.create ? motion.create(Box) : motion(Box);

function Overview() {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={8}
      mt={12}
    >
      <VStack spacing={6} align="stretch">
        <Text
          fontSize="3xl"
          fontWeight="700"
          bgGradient="linear(to-r, #6366f1, #8b5cf6)"
          bgClip="text"
        >
          Welcome to your Dashboard!
        </Text>
        <Box
          p={6}
          borderRadius="2xl"
          bg="rgba(255, 255, 255, 0.02)"
          border="1px solid rgba(255, 255, 255, 0.05)"
        >
          <Text color="gray.400">
            Your journey to getting hired starts here. Upload your resume, 
            complete assessments, and track your progress all in one place.
          </Text>
        </Box>
      </VStack>
    </MotionBox>
  );
}


export default function Dashboard({ user, setUser, hideSidebar, testTaken, setTestTaken }) {
  const [resumeUploaded, setResumeUploaded] = useState(!!localStorage.getItem("resumeUploaded"));
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingTest, setPendingTest] = useState(false);

  // Only hide sidebar/navbar if on /test route AND test is not already taken
  // This allows the "Assessment Completed" view to be framed within the dashboard
  const isTestRoute = location.pathname.includes("/test") && !testTaken;

  // Sync session with backend to detect role updates (e.g. admin approval)
  useEffect(() => {
    if (user) {
      getAuthMe()
        .then(updatedUser => {
          // If role, admin status, resume status, or selection status changed, update local state
          const hasChanged = updatedUser.role !== user.role || 
                             updatedUser.isAdmin !== user.isAdmin || 
                             updatedUser.testTaken !== user.testTaken ||
                             updatedUser.resumeUploaded !== user.resumeUploaded ||
                             updatedUser.selection !== user.selection;

          if (hasChanged) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
            if (updatedUser.resumeUploaded) localStorage.setItem("resumeUploaded", "true");
            setUser(updatedUser);
            if (updatedUser.testTaken !== undefined) setTestTaken(!!updatedUser.testTaken);
          }
        })
        .catch(err => {
          console.warn("Session sync failed:", err.message);
          if (err.message.includes("401") || err.message.includes("403")) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
          }
        });
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      const u = getCurrentUser();
      if (!u) {
        navigate("/login");
        return;
      }
      setUser(u);
      setTestTaken(!!u.testTaken);
    }
    setResumeUploaded(!!localStorage.getItem("resumeUploaded"));
    
    // If admin lands on root dashboard, redirect to admin-scores
    if (user?.isAdmin && location.pathname === "/dashboard") {
      navigate("/dashboard/admin-scores");
    }
  }, [user, navigate, location.pathname, setUser, setTestTaken]);

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Text color="gray.400">Loading...</Text>
      </Flex>
    );
  }

  const isAdminRoute = location.pathname.includes("admin-scores") || 
                       location.pathname.includes("admin-requests") || 
                       location.pathname.includes("admin-users") || 
                       location.pathname.includes("admin-retake-requests") || 
                       location.pathname.includes("admin-analytics");
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

      {!hideSidebar && !isTestRoute && <Sidebar user={user} resumeUploaded={resumeUploaded} />}

      <Box
        ml={!hideSidebar && !isTestRoute ? { base: 0, md: 72 } : 0}
        flex="1"
        minH="100vh"
        position="relative"
        zIndex={1}
        mt={isTestRoute ? 0 : 20} // Ensures content is always below the navbar
        px={{ base: 4, md: 10 }} // Responsive side padding to allow more room on smaller screens
      >
        <Routes>
          <Route path="" element={
            <DashboardHome
              user={user}
              resumeUploaded={resumeUploaded}
              testTaken={testTaken}
              onUploadResume={() => navigate("/dashboard/resume")}
              onTakeTest={() => {
                if (!resumeUploaded) {
                  toast({ title: "Please upload your resume first.", status: "warning", duration: 1500 });
                  return;
                }
                if (testTaken) {
                  toast({ title: "You have already taken the test.", status: "info", duration: 1500 });
                  return;
                }
                setPendingTest(true);
                onOpen();
              }}
              onViewResults={() => navigate("/dashboard/results")}
            />
          } />
          <Route path="overview" element={<Overview />} />
          <Route path="resume" element={<Resume onResumeUpload={() => setResumeUploaded(true)} />} />
          <Route path="test" element={
            <Test user={user} onComplete={() => {
              setTestTaken(true);
              const u = getCurrentUser();
              if (u) setUser({ ...u, testTaken: true });
            }} />
          } />
          <Route path="results" element={<Results />} />
          <Route path="admin-scores" element={<AdminScores />} />
          <Route path="admin-analytics" element={<AdminAnalytics />} />
          <Route path="admin-requests" element={<AdminRequests />} />
          <Route path="admin-users" element={<AdminUsers />} />
          <Route path="admin-retake-requests" element={<AdminRetakeRequests />} />
        </Routes>
        <Outlet />

        {/* Modal for test confirmation */}
        <Modal isOpen={isOpen} onClose={() => { setPendingTest(false); onClose(); }} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Take Test</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to take the test now? You can only take it once. Microphone permission will be requested.
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => { setPendingTest(false); onClose(); }} mr={3} variant="ghost">Cancel</Button>
              <Button colorScheme="green" onClick={async () => {
                try {
                  await navigator.mediaDevices.getUserMedia({ audio: true });
                  onClose();
                  navigate("/dashboard/test");
                } catch {
                  toast({ title: "Microphone permission denied.", status: "error", duration: 1500 });
                  onClose();
                }
                setPendingTest(false);
              }}>Start Test</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Flex>
  );
}

