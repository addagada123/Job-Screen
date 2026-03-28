import { Box, Text, Link as ChakraLink, useToast } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import AuthForm from "../components/AuthForm";
// import GoogleAuthButton from "../components/GoogleAuthButton";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signup } from "../api";

export default function Signup({ setUser, setTestTaken }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [waitMsg, setWaitMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const isAdminRequest = form.isAdminRequest?.checked;
    setLoading(true);
    try {
      const data = await signup(name, email, password, isAdminRequest);
      // data is { user, token }
      if (data.isPending || data.user?.role === 'pending_admin') {
        setWaitMsg("Your admin access request is pending approval. Please contact a master administrator.");
        toast({ title: "Request Submitted", description: "Admin access is pending approval.", status: "info", duration: 3000 });
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) localStorage.setItem("token", data.token);
        setUser(data.user);
        setTestTaken(!!data.user?.testTaken);
        toast({ title: "Signup successful!", status: "success", duration: 1500 });
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        toast({ title: "Account already exists", description: "You already have an account with this email. Please Sign In.", status: "warning", duration: 1500 });
      } else {
        toast({ title: "Signup failed", description: err.message || "Something went wrong", status: "error", duration: 1500 });
      }
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
        right="10%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="rgba(139, 92, 246, 0.1)"
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="20%"
        left="10%"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="rgba(34, 211, 238, 0.08)"
        filter="blur(60px)"
        pointerEvents="none"
      />
      
      <Box position="relative" zIndex={1}>
        <AuthForm type="signup" onSubmit={handleSignup} isLoading={loading} />
        {waitMsg && <Text mt={4} textAlign="center" color="yellow.300">{waitMsg}</Text>}
        <Text mt={4} textAlign="center" color="gray.400">
          Already have an account? <ChakraLink as={Link} color="#6366f1" to="/login">Sign In</ChakraLink>
        </Text>
      </Box>
    </Box>
  );
}
