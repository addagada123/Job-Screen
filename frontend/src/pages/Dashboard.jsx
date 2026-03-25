import { Box, Flex, Text, VStack, Button, useToast, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import Sidebar from "../components/dashboard/Sidebar";
import Test from "../components/dashboard/Test";
import Results from "../components/dashboard/Results";
import Resume from "../components/dashboard/Resume";
import AdminScores from "../components/dashboard/AdminScores";
import AdminRequests from "../components/dashboard/AdminRequests";
import AdminUsers from "../components/dashboard/AdminUsers";
import AdminRetakeRequests from "../components/dashboard/AdminRetakeRequests";
import { Outlet, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
function DashboardHome({ user, resumeUploaded, testTaken, onUploadResume, onTakeTest, onViewResults }) {
  // Ensure margin-top for navbar offset
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
import { getCurrentUser } from "../utils/auth";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

function Overview() {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={8}
      mt={20}
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
    setTestTaken(u && u.testTaken);
  }, [navigate]);

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Text color="gray.400">Loading...</Text>
      </Flex>
    );
  }

  const isAdminRoute = location.pathname.includes("admin-scores") || location.pathname.includes("admin-requests");
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
              onTakeTest={() => {
                if (!resumeUploaded) {
                  toast({ title: "Please upload your resume first.", status: "warning" });
                  return;
                }
                if (testTaken) {
                  toast({ title: "You have already taken the test.", status: "info" });
                  return;
                }
                setPendingTest(true);
                onOpen();
              }}
              onViewResults={() => navigate("/dashboard/results")}
            />
          } />
          <Route path="overview" element={<Overview />} />
          <Route path="resume" element={<Resume />} />
          <Route path="test" element={<Test />} />
          <Route path="results" element={<Results />} />
          <Route path="admin-scores" element={<AdminScores />} />
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
                  toast({ title: "Microphone permission denied.", status: "error" });
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

