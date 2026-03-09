
import { Box, Text, Link, useToast } from "@chakra-ui/react";
import AuthForm from "../components/AuthForm";
// import GoogleAuthButton from "../components/GoogleAuthButton";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    try {
      const user = await login(email, password);
      localStorage.setItem("user", JSON.stringify(user));
      toast({ title: "Login successful!", status: "success" });
      navigate("/dashboard");
    } catch (err) {
      toast({ title: "Login failed", description: err.message, status: "error" });
    }
  };

  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center" position="relative" mt={20}>
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
        <AuthForm type="login" onSubmit={handleLogin} />
        <Text mt={4} textAlign="center" color="gray.400">
          No account? <Link color="#6366f1" href="/signup">Sign up</Link>
        </Text>
      </Box>
    </Box>
  );
}

