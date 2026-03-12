import { Box, VStack, Avatar, Text, HStack, Icon, useToast } from "@chakra-ui/react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../utils/auth";

const MotionBox = motion(Box);

const NavItem = ({ to, children, isAdmin = false, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.includes(to);
  return (
    <NavLink to={to} style={{ width: "100%", textDecoration: "none" }} onClick={onClick}>
      <MotionBox
        py={3}
        px={4}
        borderRadius="xl"
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

export default function Sidebar({ user }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [resumeUploaded, setResumeUploaded] = useState(!!localStorage.getItem("resumeUploaded"));

  useEffect(() => {
    // Listen for resume upload changes
    const handler = () => setResumeUploaded(!!localStorage.getItem("resumeUploaded"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleTestClick = () => {
    if (!resumeUploaded) {
      toast({ title: "Please upload your resume first.", status: "warning" });
      return;
    }
    if (user && user.testTaken) {
      toast({
        title: "Test already taken",
        description: "You have already completed the assessment.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    navigate("/dashboard/test");
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

      <VStack spacing={0} h="100%" py={6} pt={24} position="relative" zIndex={1}>
        {/* User Profile */}
        <VStack spacing={3} mb={8} px={4} w="100%">
          <Box
            p={1}
            borderRadius="full"
            bgGradient="linear(135deg, #6366f1, #8b5cf6, #22d3ee)"
          >
            <Avatar
              name={user?.name || "User"}
              size="xl"
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
        <Box w="80%" h="1px" bg="rgba(255, 255, 255, 0.05)" mb={4} />

        {/* Navigation */}
        <VStack
          align="stretch"
          spacing={1}
          px={4}
          w="100%"
          flex={1}
        >
          <Text
            fontSize="xs"
            fontWeight="600"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={2}
            px={4}
          >
            Menu
          </Text>
          <NavItem to="/dashboard/overview">📊 Overview</NavItem>
          {user?.isAdmin ? (
            <>
              <NavItem to="/dashboard/admin-requests">📋 Requests</NavItem>
              <NavItem to="/dashboard/admin-users">👥 User Management</NavItem>
              <NavItem to="/dashboard/results">📈 Results</NavItem>
            </>
          ) : (
            <>
              <NavItem to="/dashboard/results">📈 Results</NavItem>
              <NavItem to="/dashboard/resume">📄 Resume</NavItem>
              <NavItem to="/dashboard/test" onClick={handleTestClick}>🧪 Test</NavItem>
            </>
          )}
        </VStack>

        {/* Footer */}
        <Box px={4} w="100%">
          <Box
            p={4}
            borderRadius="xl"
            bg="rgba(255, 255, 255, 0.02)"
            border="1px solid rgba(255, 255, 255, 0.05)"
          >
            <Text fontSize="xs" color="gray.500" textAlign="center">
              JobScreen Pro v1.0
            </Text>
          </Box>
        </Box>
      </VStack>
    </MotionBox>
  );
}

