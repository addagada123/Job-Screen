
import { Box, Text, Link, useToast } from "@chakra-ui/react";
import AuthForm from "../components/AuthForm";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      // Save user info to localStorage/session (for demo)
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/dashboard");
    } catch (err) {
      toast({ title: "Login failed", description: err.message, status: "error" });
    }
  };

  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
      <Box>
        <AuthForm type="login" onSubmit={handleLogin} />
        <GoogleAuthButton mode="login" />
        <Text mt={4} textAlign="center" color="gray.400">
          No account? <Link color="cyan.300" href="/signup">Sign up</Link>
        </Text>
      </Box>
    </Box>
  );
}
