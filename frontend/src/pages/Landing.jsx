import { Box, Heading, Text, Button, VStack, HStack, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { keyframes } from "@emotion/react";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function Landing() {
  return (
    <Box
      minH="100vh"
      width="100vw"
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      pb={20}
    >
      {/* Animated Background */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
        overflow="hidden"
      >
        {/* Gradient Base */}
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
          top="10%"
          left="15%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="rgba(99, 102, 241, 0.15)"
          filter="blur(100px)"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <MotionBox
          position="absolute"
          top="50%"
          right="10%"
          w="350px"
          h="350px"
          borderRadius="full"
          bg="rgba(139, 92, 246, 0.12)"
          filter="blur(100px)"
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <MotionBox
          position="absolute"
          bottom="15%"
          left="25%"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="rgba(34, 211, 238, 0.1)"
          filter="blur(80px)"
          animate={{
            x: [0, 30, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
        
        {/* Grid Pattern Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.03}
          backgroundImage="linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)"
          backgroundSize="60px 60px"
        />
        
        {/* Noise Texture */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.02}
          backgroundImage="url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')"
        />
      </Box>

      {/* Main Content */}
      <VStack
        spacing={8}
        zIndex={1}
        px={6}
        maxW="900px"
        textAlign="center"
      >
        {/* Logo Badge */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            display="inline-flex"
            alignItems="center"
            gap={2}
            px={4}
            py={2}
            borderRadius="full"
            bg="rgba(99, 102, 241, 0.1)"
            border="1px solid rgba(99, 102, 241, 0.3)"
            backdropFilter="blur(10px)"
          >
            <Box
              w={2}
              h={2}
              borderRadius="full"
              bg="#22d3ee"
              animation={`${pulse} 2s ease-in-out infinite`}
            />
            <Text fontSize="sm" fontWeight="500" color="gray.300">
              AI-Powered Hiring Platform
            </Text>
          </Box>
        </MotionBox>

        {/* Main Heading */}
        <MotionHeading
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          size="3xl"
          fontWeight="700"
          lineHeight="1.1"
          maxW="800px"
        >
          Smart Screening for{" "}
          <Text
            as="span"
            bgGradient="linear(to-r, #6366f1, #8b5cf6, #22d3ee)"
            bgClip="text"
            bgSize="200% 200%"
            animation={`${gradientMove} 5s ease infinite`}
          >
            Blue Collar Jobs
          </Text>
        </MotionHeading>

        {/* Description */}
        <MotionText
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          fontSize="xl"
          color="gray.400"
          maxW="600px"
          lineHeight="1.7"
        >
          Upload your resume, take voice-enabled assessments, and get hired faster.{" "}
          <Text as="span" color="#22d3ee" fontWeight="600">
            Our AI evaluates your skills
          </Text>{" "}
          to match you with the perfect opportunity.
        </MotionText>

        {/* Stats Row */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <HStack spacing={10} mt={6} flexWrap="wrap" justify="center">
            {[
              { number: "10K+", label: "Jobs Placed" },
              { number: "98%", label: "Success Rate" },
              { number: "500+", label: "Companies" },
            ].map((stat, i) => (
              <VStack key={i} spacing={1}>
                <Text
                  fontSize="3xl"
                  fontWeight="700"
                  bgGradient="linear(to-r, #6366f1, #8b5cf6)"
                  bgClip="text"
                >
                  {stat.number}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </HStack>
        </MotionBox>

        {/* CTA Buttons */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <HStack spacing={4} mt={8} flexWrap="wrap" justify="center">
            <Button
              as="a"
              href="/signup"
              size="lg"
              px={8}
              h={14}
              fontSize="md"
              fontWeight="600"
              bgGradient="linear(135deg, #6366f1 0%, #8b5cf6 100%)"
              color="white"
              borderRadius="xl"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                animation: `${shimmer} 3s infinite`,
              }}
              _hover={{
                transform: "translateY(-3px)",
                boxShadow: "0 20px 50px -15px rgba(99, 102, 241, 0.5)",
              }}
              _active={{
                transform: "translateY(-1px)",
              }}
              transition="all 0.3s ease"
            >
              Get Started Free
            </Button>
            <Button
              as="a"
              href="/login"
              size="lg"
              px={8}
              h={14}
              fontSize="md"
              fontWeight="500"
              variant="outline"
              borderColor="rgba(255,255,255,0.15)"
              color="gray.300"
              borderRadius="xl"
              bg="rgba(255,255,255,0.03)"
              _hover={{
                bg: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.25)",
                color: "white",
                transform: "translateY(-2px)",
              }}
              transition="all 0.3s ease"
            >
              Sign In
            </Button>
          </HStack>
        </MotionBox>

        {/* Features Pills */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <HStack spacing={3} mt={10} flexWrap="wrap" justify="center">
            {[
              "🎯 AI-Powered Screening",
              "📄 Resume Analysis",
              "🎤 Voice Assessments",
              "⚡ Instant Results",
            ].map((feature, i) => (
              <Box
                key={i}
                px={4}
                py={2}
                borderRadius="full"
                bg="rgba(255,255,255,0.03)"
                border="1px solid rgba(255,255,255,0.06)"
                fontSize="sm"
                color="gray.400"
                _hover={{
                  bg: "rgba(255,255,255,0.06)",
                  color: "gray.200",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
                transition="all 0.3s ease"
                cursor="default"
              >
                {feature}
              </Box>
            ))}
          </HStack>
        </MotionBox>
      </VStack>
    </Box>
  );
}

