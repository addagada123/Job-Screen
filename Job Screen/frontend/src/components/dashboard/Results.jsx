

import { Box, Heading, VStack, Progress, Text, Alert, AlertIcon } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function Results() {
  // Example data (replace with real data from backend if needed)
  const contextRelevancy = 76;
  const totalQuestions = 5;
  const correctAnswers = 4;
  const [resultMsg, setResultMsg] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    fetch(`${import.meta.env.VITE_API_BASE}/api/user-status?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.selection === "selected") setResultMsg("Congratulations! you are selected for the next round.");
        else if (data.selection === "rejected") setResultMsg("Better Luck next Time");
        else setResultMsg("Result will be announced soon");
      });
  }, []);

  return (
    <Box maxW="600px" mx="auto" mt={8} bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} boxShadow="xl">
      <Heading size="lg" mb={6} textAlign="center">Test Results</Heading>
      {resultMsg && (
        <Alert status="info" borderRadius="md" mb={6}>
          <AlertIcon />
          {resultMsg}
        </Alert>
      )}
      <VStack spacing={6}>
        <Box w="100%">
          <Text fontWeight="bold">Context Relevancy</Text>
          <Progress value={contextRelevancy} colorScheme="cyan" size="lg" borderRadius="md" mb={2} />
          <Text color="gray.400">{contextRelevancy}%</Text>
        </Box>
        <Box w="100%">
          <Text fontWeight="bold">Correct Answers</Text>
          <Progress value={(correctAnswers/totalQuestions)*100} colorScheme="green" size="lg" borderRadius="md" mb={2} />
          <Text color="gray.400">{correctAnswers} / {totalQuestions}</Text>
        </Box>
      </VStack>
    </Box>
  );
}
