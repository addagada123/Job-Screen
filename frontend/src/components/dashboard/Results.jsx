import { Box, Heading, VStack, Progress, Text, Alert, AlertIcon, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://job-screen.onrender.com";

export default function Results() {
  const [resultMsg, setResultMsg] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setLoading(false);
      return;
    }
    // Read score from localStorage (saved after test)
    setScore(user.score ?? null);

    // Fetch selection status from backend
    fetch(`${API_BASE}/api/user-status?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.selection === "selected") setResultMsg("🎉 Congratulations! You are selected for the next round.");
        else if (data.selection === "rejected") setResultMsg("Better luck next time.");
        else setResultMsg("Result will be announced soon — stay tuned!");
      })
      .catch(() => setResultMsg("Could not fetch status. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box maxW="600px" mx="auto" mt={20} bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} boxShadow="xl">
      <Heading size="lg" mb={6} textAlign="center">Test Results</Heading>
      {loading ? (
        <VStack><Spinner size="xl" color="cyan.400" /></VStack>
      ) : (
        <VStack spacing={6}>
          {resultMsg && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              {resultMsg}
            </Alert>
          )}
          <Box w="100%">
            <Text fontWeight="bold" mb={1}>Your Score</Text>
            {score !== null ? (
              <>
                <Progress value={score} colorScheme="cyan" size="lg" borderRadius="md" mb={2} />
                <Text color="gray.400">{score} / 100</Text>
              </>
            ) : (
              <Text color="gray.500">Score not available yet — check back after your test is reviewed.</Text>
            )}
          </Box>
        </VStack>
      )}
    </Box>
  );
}
