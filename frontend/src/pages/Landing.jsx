import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";

export default function Landing() {
  return (
    <Box
      minH="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, #0f1218 0%, #1a1f2e 100%)"
    >
      <VStack
        spacing={6}
        bg="rgba(30,38,51,0.7)"
        p={12}
        borderRadius="2xl"
        boxShadow="2xl"
        textAlign="center"
      >
        <Heading size="2xl" fontWeight="bold">
          Smart Screening for <br />
          <Text
            as="span"
            bgGradient="linear(to-r, #00d4ff, #10b981)"
            bgClip="text"
          >
            Blue Collar Jobs
          </Text>
        </Heading>
        <Text fontSize="xl" color="gray.300">
          Upload resume, take voice-enabled assessments, get hired faster.<br />
          <Text as="span" color="#00d4ff" fontWeight="semibold">
            AI evaluates your skills.
          </Text>
        </Text>
        <Button colorScheme="cyan" size="lg" as="a" href="/signup">
          Get Started →
        </Button>
        <Button variant="outline" colorScheme="cyan" size="lg" as="a" href="/login">
          Login
        </Button>
      </VStack>
    </Box>
  );
}
