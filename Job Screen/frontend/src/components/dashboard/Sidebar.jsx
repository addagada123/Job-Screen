import { Box, VStack, Avatar, Text, Link } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";


export default function Sidebar({ user }) {
  return (
    <Box
      w={{ base: "full", md: 64 }}
      bg="rgba(30,38,51,0.7)"
      h="100vh"
      p={6}
      position="fixed"
      left={0}
      top={0}
      zIndex={100}
      borderRight="1px solid rgba(255,255,255,0.08)"
      display={{ base: "none", md: "block" }}
    >
      <VStack spacing={4} mb={8}>
        <Avatar name={user?.name || "User"} size="xl" bgGradient="linear(to-br, #00d4ff, #10b981)" color="#1a1f2e" />
        <Text fontWeight="bold" fontSize="lg">{user?.name || "User"}</Text>
      </VStack>
      <VStack align="stretch" spacing={2}>
        <NavLink to="overview" style={({ isActive }) => ({ color: isActive ? "#00d4ff" : "#94a3b8", fontWeight: isActive ? 700 : 500 })}>Overview</NavLink>
        <NavLink to="resume" style={({ isActive }) => ({ color: isActive ? "#00d4ff" : "#94a3b8", fontWeight: isActive ? 700 : 500 })}>Resume</NavLink>
        <NavLink to="test" style={({ isActive }) => ({ color: isActive ? "#00d4ff" : "#94a3b8", fontWeight: isActive ? 700 : 500 })}>Test</NavLink>
        <NavLink to="results" style={({ isActive }) => ({ color: isActive ? "#00d4ff" : "#94a3b8", fontWeight: isActive ? 700 : 500 })}>Results</NavLink>
        {user?.isAdmin && (
          <>
            <NavLink to="admin-scores" style={({ isActive }) => ({ color: isActive ? "#00d4ff" : "#fbbf24", fontWeight: isActive ? 700 : 500 })}>Admin Scores</NavLink>
            <NavLink to="admin-users" style={({ isActive }) => ({ color: isActive ? "#00d4ff" : "#fbbf24", fontWeight: isActive ? 700 : 500 })}>All Users</NavLink>
            <NavLink to="admin-requests" style={({ isActive }) => ({ color: isActive ? "#00d4ff" : "#fbbf24", fontWeight: isActive ? 700 : 500 })}>Requests</NavLink>
          </>
        )}
      </VStack>
    </Box>
  );
}
