
import { Flex, Box, Button, Spacer, Text, HStack, IconButton } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const MotionFlex = motion(Flex);

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const u = localStorage.getItem("user");
    setUser(u ? JSON.parse(u) : null);
    window.addEventListener("storage", () => {
      const u2 = localStorage.getItem("user");
      setUser(u2 ? JSON.parse(u2) : null);
    });
    return () => window.removeEventListener("storage", () => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };
  return (
    <MotionFlex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      px={{ base: 4, md: 8 }}
      py={4}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      bg="rgba(10, 10, 15, 0.7)"
      backdropFilter="blur(20px)"
      borderBottom="1px solid rgba(255, 255, 255, 0.05)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: "linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, transparent 100%)",
        pointerEvents: "none",
      }}
    >
      <Box position="relative" zIndex={1}>
        <Link to="/">
          <HStack spacing={2}>
            <Box
              w={10}
              h={10}
              borderRadius="xl"
              bgGradient="linear(135deg, #6366f1, #8b5cf6)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 20px rgba(99, 102, 241, 0.4)"
            >
              <Text fontSize="xl">JS</Text>
            </Box>
            <Text
              fontFamily="'Space Grotesk', sans-serif"
              fontSize="xl"
              fontWeight="700"
              color="white"
              letterSpacing="-0.02em"
            >
              JobScreen
              <Text as="span" bgGradient="linear(to-r, #6366f1, #8b5cf6)" bgClip="text">
                Pro
              </Text>
            </Text>
          </HStack>
        </Link>
      </Box>

      <Spacer display={{ base: "none", md: "block" }} />

      <HStack position="relative" zIndex={1} spacing={3}>
        {user ? (
          <Button
            colorScheme="red"
            size="sm"
            fontWeight="600"
            px={6}
            borderRadius="xl"
            onClick={handleLogout}
            transition="all 0.3s ease"
          >
            Logout
          </Button>
        ) : (
          <>
            <Button
              as={Link}
              to="/login"
              variant="ghost"
              size="sm"
              fontWeight="500"
              color="gray.400"
              px={5}
              borderRadius="xl"
              _hover={{
                bg: "rgba(255, 255, 255, 0.08)",
                color: "white",
                transform: "translateY(-2px)",
              }}
              transition="all 0.3s ease"
            >
              Login
            </Button>
            <Button
              as={Link}
              to="/signup"
              size="sm"
              fontWeight="600"
              px={6}
              borderRadius="xl"
              bgGradient="linear(135deg, #6366f1 0%, #8b5cf6 100%)"
              color="white"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 8px 30px rgba(99, 102, 241, 0.4)",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              transition="all 0.3s ease"
            >
              Sign Up
            </Button>
          </>
        )}
      </HStack>
    </MotionFlex>
  );
}

