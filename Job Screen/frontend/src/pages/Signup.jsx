
import { Box, Text, Link, useToast } from "@chakra-ui/react";
import AuthForm from "../components/AuthForm";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


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
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, requestAdmin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      if (data.pending) {
        setWaitMsg("Wait for admin to approve you.");
      } else {
        toast({ title: "Signup successful!", status: "success" });
        navigate("/login");
      }
    } catch (err) {
      toast({ title: "Signup failed", description: err.message, status: "error" });
    }
  };

  return (
    <Box minH="80vh" display="flex" alignItems="center" justifyContent="center">
      <Box>
        <AuthForm type="signup" onSubmit={handleSignup} />
        {waitMsg && <Text mt={4} textAlign="center" color="yellow.300">{waitMsg}</Text>}
        <GoogleAuthButton mode="signup" />
        <Text mt={4} textAlign="center" color="gray.400">
          Already have an account? <Link color="cyan.300" href="/login">Login</Link>
        </Text>
      </Box>
    </Box>
  );
}
