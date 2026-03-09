import { Box, Text, Link, VStack } from "@chakra-ui/react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useState } from "react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

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
    <Box
      minH="100vh"
      width="100vw"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Animated Background */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-br, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)"
        />
        
        {/* Animated Orbs */}
        <MotionBox
          position="absolute"
          top="20%"
          right="10%"
          w="350px"
          h="350px"
          borderRadius="full"
          bg="rgba(139, 92, 246, 0.12)"
          filter="blur(80px)"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <MotionBox
          position="absolute"
          bottom="20%"
          left="10%"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="rgba(34, 211, 238, 0.1)"
          filter="blur(80px)"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        {/* Grid Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.02}
          backgroundImage="linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)"
          backgroundSize="50px 50px"
        />
      </Box>

      {/* Content */}
      <VStack spacing={6} zIndex={1} px={4} w="100%" maxW="450px" pt={24}>
        <AuthForm type="signup" onSubmit={handleSignup} />
        
        {waitMsg && (
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            p={4}
            borderRadius="xl"
            bg="rgba(245, 158, 11, 0.1)"
            border="1px solid rgba(245, 158, 11, 0.3)"
            maxW="420px"
            w="100%"
          >
            <Text textAlign="center" color="yellow.400" fontSize="sm">
              {waitMsg}
            </Text>
          </MotionBox>
        )}
        
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Text textAlign="center" color="gray.500" fontSize="sm">
            Already have an account?{" "}
            <Link 
              color="#8b5cf6" 
              fontWeight="600"
              _hover={{ color: "#a78bfa" }}
              href="/login"
            >
              Sign in
            </Link>
          </Text>
        </MotionBox>
      </VStack>
    </Box>
  );
}

