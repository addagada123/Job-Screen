import { Box, Heading, Input, Button, VStack, Text, Checkbox, InputGroup } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import GoogleAuthButton from "./GoogleAuthButton";

const MotionBox = motion(Box);

export default function AuthForm({ type = "login", onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      bg="rgba(255, 255, 255, 0.03)"
      backdropFilter="blur(20px)"
      p={{ base: 6, md: 10 }}
      borderRadius="2xl"
      border="1px solid rgba(255, 255, 255, 0.08)"
      boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      maxW="420px"
      w="100%"
      mx="auto"
      position="relative"
      overflow="hidden"
    >
      {/* Gradient Glow Effect */}
      <Box
        position="absolute"
        top="-100px"
        left="-100px"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="rgba(99, 102, 241, 0.1)"
        filter="blur(60px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-100px"
        right="-100px"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="rgba(139, 92, 246, 0.08)"
        filter="blur(60px)"
        pointerEvents="none"
      />

      <Box position="relative" zIndex={1}>
        {/* Header */}
        <VStack spacing={2} mb={8}>
          <Box
            w={14}
            h={14}
            borderRadius="xl"
            bgGradient="linear(135deg, #6366f1, #8b5cf6)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 8px 30px rgba(99, 102, 241, 0.3)"
            mb={4}
          >
            <Text fontSize="2xl" fontWeight="bold">JS</Text>
          </Box>
          <Heading
            size="lg"
            fontWeight="700"
            color="white"
            fontFamily="'Space Grotesk', sans-serif"
          >
            {type === "login" ? "Welcome Back" : "Create Account"}
          </Heading>
          <Text color="gray.500" fontSize="sm" textAlign="center">
            {type === "login"
              ? "Sign in to continue your journey"
              : "Start your journey with us today"}
          </Text>
        </VStack>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <VStack spacing={4}>
            {type === "signup" && (
              <MotionBox
                w="100%"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Input
                  name="name"
                  placeholder="Full Name"
                  required
                  size="lg"
                  borderRadius="xl"
                  bg="rgba(255, 255, 255, 0.03)"
                  border="1px solid rgba(255, 255, 255, 0.08)"
                  _placeholder={{ color: "gray.500" }}
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.05)",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                  }}
                  _focus={{
                    bg: "rgba(255, 255, 255, 0.05)",
                    borderColor: "#6366f1",
                    boxShadow: "0 0 0 1px #6366f1",
                  }}
                />
              </MotionBox>
            )}
            <MotionBox
              w="100%"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: type === "login" ? 0.1 : 0.2 }}
            >
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                size="lg"
                borderRadius="xl"
                bg="rgba(255, 255, 255, 0.03)"
                border="1px solid rgba(255, 255, 255, 0.08)"
                _placeholder={{ color: "gray.500" }}
                _hover={{
                  bg: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
                _focus={{
                  bg: "rgba(255, 255, 255, 0.05)",
                  borderColor: "#6366f1",
                  boxShadow: "0 0 0 1px #6366f1",
                }}
              />
            </MotionBox>
            <MotionBox
              w="100%"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: type === "login" ? 0.2 : 0.3 }}
            >
              <InputGroup size="lg">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  borderRadius="xl"
                  bg="rgba(255, 255, 255, 0.03)"
                  border="1px solid rgba(255, 255, 255, 0.08)"
                  _placeholder={{ color: "gray.500" }}
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.05)",
                    borderColor: "rgba(255, 255, 255, 0.15)",
                  }}
                  _focus={{
                    bg: "rgba(255, 255, 255, 0.05)",
                    borderColor: "#6366f1",
                    boxShadow: "0 0 0 1px #6366f1",
                  }}
                />
              </InputGroup>
            </MotionBox>

            {type === "signup" && (
              <MotionBox
                w="100%"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Checkbox
                  name="admin"
                  colorScheme="purple"
                  sx={{
                    ".chakra-checkbox__control": {
                      borderRadius: "md",
                      borderColor: "rgba(255,255,255,0.2)",
                      _checked: {
                        bg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        borderColor: "transparent",
                      },
                    },
                  }}
                >
                  <Text fontSize="sm" color="gray.400">
                    Request for Admin Access
                  </Text>
                </Checkbox>
              </MotionBox>
            )}

            <MotionBox
              w="100%"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              pt={2}
            >
              <Button
                type="submit"
                w="100%"
                size="lg"
                h={12}
                fontWeight="600"
                borderRadius="xl"
                bgGradient="linear(135deg, #6366f1 0%, #8b5cf6 100%)"
                color="white"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 40px -10px rgba(99, 102, 241, 0.5)",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                transition="all 0.3s ease"
              >
                {type === "login" ? "Sign In" : "Create Account"}
              </Button>
            </MotionBox>
          </VStack>
        </form>

        {/* Divider */}
        <Box position="relative" my={6}>
          <Box
            h="1px"
            bg="rgba(255, 255, 255, 0.08)"
            position="relative"
          >
            <Text
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="rgba(10, 10, 15, 0.8)"
              px={3}
              fontSize="xs"
              color="gray.500"
            >
              or continue with
            </Text>
          </Box>
        </Box>

        {/* Google Auth Button */}
        <MotionBox
          w="100%"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GoogleAuthButton mode={type} />
        </MotionBox>
      </Box>
    </MotionBox>
  );
}

