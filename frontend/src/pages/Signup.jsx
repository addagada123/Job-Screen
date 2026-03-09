
import { Box, Text, Link, useToast } from "@chakra-ui/react";
import AuthForm from "../components/AuthForm";
// import GoogleAuthButton from "../components/GoogleAuthButton";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signup } from "../api";

export default function Signup() {
  const navigate = useNavigate();
  const toast = useToast();
  const [waitMsg, setWaitMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const requestAdmin = form.admin?.checked;
    try {
      const data = await signup(name, email, password, requestAdmin);
      if (data.pending) {
        setWaitMsg("Wait for admin to approve you.");
        toast({ title: "Admin request submitted", description: "Please wait for approval", status: "info" });
      } else {
        toast({ title: "Signup successful!", status: "success" });
        navigate("/login");
      }
    } catch (err) {
      if (err.message && err.message.includes('User already exists')) {
        toast({ title: "Signup failed", description: "An account with this email already exists.", status: "error" });
      } else {
        toast({ title: "Signup failed", description: err.message, status: "error" });
      }
    }
  };

  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center" position="relative" mt={20}>
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
        <AuthForm type="signup" onSubmit={handleSignup} />
        {waitMsg && <Text mt={4} textAlign="center" color="yellow.300">{waitMsg}</Text>}
        <Text mt={4} textAlign="center" color="gray.400">
          Already have an account? <Link color="#6366f1" href="/login">Login</Link>
        </Text>
      </Box>
    </Box>
  );
}

