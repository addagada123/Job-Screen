import { Box, VStack, Avatar, Text, HStack, Icon, useToast, Button } from "@chakra-ui/react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../utils/auth";
import { RepeatIcon } from "@chakra-ui/icons";

// Use motion.create if available for forward compatibility
const MotionBox = motion.create ? motion.create(Box) : motion(Box);

const NavItem = ({ to, children, isAdmin = false, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.includes(to);
  return (
    <NavLink to={to} style={{ width: "100%", textDecoration: "none" }} onClick={onClick}>
      <MotionBox
        py={2}
        px={4}
        borderRadius="lg"
        cursor="pointer"
        position="relative"
        bg={isActive ? "rgba(99, 102, 241, 0.15)" : "transparent"}
        color={isActive ? "white" : "gray.400"}
        fontWeight={isActive ? "600" : "500"}
        transition="all 0.3s ease"
        _hover={{
          bg: isActive ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.05)",
          color: "white",
          transform: "translateX(4px)",
        }}
        whileHover={{ x: 4 }}
        overflow="hidden"
      >
        {isActive && (
          <Box
            position="absolute"
            left={0}
            top="50%"
            transform="translateY(-50%)"
            w={1}
            h="60%"
            bgGradient="linear(to-b, #6366f1, #8b5cf6)"
            borderRadius="full"
          />
        )}
        <HStack spacing={3}>
          <Text>{children}</Text>
        </HStack>
      </MotionBox>
    </NavLink>
  );
};


export default function Sidebar({ user, resumeUploaded: resumeUploadedProp }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [resumeUploaded, setResumeUploaded] = useState(() => {
    if (typeof resumeUploadedProp === "boolean") return resumeUploadedProp;
    return !!localStorage.getItem("resumeUploaded");
  });


  useEffect(() => {
    // Listen for resume upload changes
    const handler = () => {
      setResumeUploaded(typeof resumeUploadedProp === "boolean" ? resumeUploadedProp : !!localStorage.getItem("resumeUploaded"));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [resumeUploadedProp]);


  // Sync state if user object or prop changes
  useEffect(() => {
    if (typeof resumeUploadedProp === "boolean") {
      setResumeUploaded(resumeUploadedProp);
    } else if (user?.resumeUploaded) {
      setResumeUploaded(true);
    }
  }, [user, resumeUploadedProp]);

  const handleTestClick = (e) => {
    const isUploaded = resumeUploaded || user?.resumeUploaded;
    if (!isUploaded && !user?.testTaken) {
      e.preventDefault();
      toast({ 
        title: "Please upload your resume first.", 
        description: "You'll be redirected to the resume upload page.",
        status: "warning", 
        duration: 2500,
        isClosable: true
      });
      navigate("/dashboard/resume");
    }
  };

  return (
    <MotionBox
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      w={{ base: "full", md: 72 }}
      h="100vh"
      position="fixed"
      left={0}
      top={0}
      zIndex={100}
      bg="rgba(10, 10, 15, 0.8)"
      backdropFilter="blur(20px)"
      borderRight="1px solid rgba(255, 255, 255, 0.05)"
      display={{ base: "none", md: "block" }}
      overflow="hidden"
    >
      {/* Gradient Orbs in Sidebar */}
      <Box
        position="absolute"
        top="-100px"
        left="-100px"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="rgba(99, 102, 241, 0.08)"
        filter="blur(60px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-50px"
        right="-50px"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="rgba(139, 92, 246, 0.06)"
        filter="blur(60px)"
        pointerEvents="none"
      />

      <VStack spacing={0} h="100%" pt={6} pb={6} position="relative" zIndex={1}>
        {/* Logo in Sidebar */}
        <Box mb={10} px={4} w="100%">
          <HStack spacing={2}>
            <Box
              w={8}
              h={8}
              borderRadius="lg"
              bgGradient="linear(135deg, #6366f1, #8b5cf6)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 15px rgba(99, 102, 241, 0.3)"
            >
              <Text fontSize="md" fontWeight="bold">JS</Text>
            </Box>
            <Text
              fontFamily="'Space Grotesk', sans-serif"
              fontSize="lg"
              fontWeight="700"
              color="white"
              letterSpacing="-0.02em"
            >
              JobScreen
              <Text as="span" bgGradient="linear(to-r, #6366f1, #8b5cf6)" bgClip="text">
                Pro
              </Text>
            </Text>
          </HStack>
        </Box>
        {/* User Profile */}
          <VStack spacing={3} mb={8} px={4} w="100%">
          <Box
            p={1}
            borderRadius="full"
            bgGradient="linear(135deg, #6366f1, #8b5cf6, #22d3ee)"
          >
            <Avatar
              name={user?.name || "User"}
              size="lg"
              bg="rgba(10, 10, 15, 0.8)"
              color="white"
            />
          </Box>
          <VStack spacing={0}>
            <Text fontWeight="600" fontSize="lg" color="white">
              {user?.name || "User"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {user?.email || "user@example.com"}
            </Text>
          </VStack>
          {user?.isAdmin && (
            <Box
              px={3}
              py={1}
              borderRadius="full"
              bg="rgba(245, 158, 11, 0.15)"
              border="1px solid rgba(245, 158, 11, 0.3)"
            >
              <Text fontSize="xs" color="yellow.400" fontWeight="600">
                Admin
              </Text>
            </Box>
          )}
        </VStack>

        {/* Divider */}
        <Box w="80%" h="1px" bg="rgba(255, 255, 255, 0.05)" mb={6} />

        {/* Navigation */}
        <VStack
          align="stretch"
          spacing={1}
          px={4}
          pb={8}
          w="100%"
          flex={1}
          overflowY="auto"
          sx={{
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 'full' },
          }}
        >
          <Text
            fontSize="xs"
            fontWeight="600"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={1}
            px={4}
          >
            {user?.isAdmin ? "Administration" : "Menu"}
          </Text>
          {!user?.isAdmin && (
            <>
              <NavItem to="/dashboard/overview">📊 Overview</NavItem>
              <NavItem to="/dashboard/resume">📄 Resume</NavItem>
              <NavItem to="/dashboard/test" onClick={handleTestClick}>🧪 Test</NavItem>
              <NavItem to="/dashboard/results">📈 Results</NavItem>
            </>
          )}

          {user?.isAdmin && (
            <>
              <NavItem to="/dashboard/admin-scores" isAdmin>🏆 Scores</NavItem>
              <NavItem to="/dashboard/admin-analytics" isAdmin>📈 Analytics</NavItem>
              <NavItem to="/dashboard/admin-users" isAdmin>👥 Users</NavItem>
              <NavItem to="/dashboard/admin-requests" isAdmin>📋 Requests</NavItem>
              <NavItem to="/dashboard/admin-retake-requests" isAdmin>
                <RepeatIcon boxSize={4} mr={2} /> Retakes
              </NavItem>
            </>
          )}

          {/* Logout Button */}
          <Box w="100%" pt={4} mt="auto">
            <Button
              w="100%"
              variant="ghost"
              colorScheme="red"
              onClick={() => {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("resumeUploaded");
                navigate("/login");
                toast({ title: "Logged out", status: "info", duration: 1500 });
              }}
              _hover={{ bg: "rgba(245, 101, 101, 0.1)" }}
              justifyContent="flex-start"
              px={4}
            >
              🚪 Logout
            </Button>
          </Box>
        </VStack>

      </VStack>
    </MotionBox>
  );
}

