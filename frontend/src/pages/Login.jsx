import { Box, Text, Link as ChakraLink, useToast } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthForm from "../components/AuthForm";
import { login } from "../api";

export default function Login({ setUser, setTestTaken }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    setLoading(true);
    try {
      const data = await login(email, password);
      // data is { user, token }
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("token", data.token);
      
      setUser(data.user);
      setTestTaken(!!data.user.testTaken);
      toast({ title: "Sign in successful!", status: "success", duration: 1500 });
      
      // Automatic role redirection
      if (data.user.role === 'admin' || data.user.isAdmin) {
        navigate("/dashboard/admin-scores"); // Ensure admin lands on admin route inside dashboard
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const isPending = err.message && err.message.includes('pending approval');
      toast({ 
        title: isPending ? "Access Pending" : "Sign in failed", 
        description: err.message, 
        status: isPending ? "warning" : "error", 
        duration: 3000 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center" position="relative" mt={28}>
      {/* Background Effects */}
      <Box
        position="absolute"
        top="20%"
        left="10%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="rgba(99, 102, 241, 0.1)"
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="20%"
        right="10%"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="rgba(139, 92, 246, 0.08)"
        filter="blur(60px)"
        pointerEvents="none"
      />
      
      <Box position="relative" zIndex={1}>
        <AuthForm type="login" onSubmit={handleLogin} isLoading={loading} />
        <Text mt={4} textAlign="center" color="gray.400">
          No account? <ChakraLink as={Link} color="#6366f1" to="/signup">Sign up</ChakraLink>
        </Text>
      </Box>
    </Box>
  );
}
