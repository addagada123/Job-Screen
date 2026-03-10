import { Box, Heading, VStack, Text, Spinner, Center } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getUserStatus } from "../../api";

export default function Results() {
  const [resultMsg, setResultMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setLoading(false);
      return;
    }

    getUserStatus(user.email)
      .then(data => {
        if (data.selection === "selected") {
          setResultMsg("Congratulations u have been selected for next round");
        } else if (data.selection === "rejected") {
          setResultMsg("Better luck next time");
        } else {
          setResultMsg("Waiting for result");
        }
      })
      .catch(() => setResultMsg("Waiting for result"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box maxW="600px" mx="auto" mt={32} p={8}>
      <VStack spacing={8} align="center">
        <Heading size="xl" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">
          Application Status
        </Heading>
        
        {loading ? (
          <Spinner size="xl" color="cyan.400" thickness="4px" />
        ) : (
          <Center 
            p={10} 
            w="full" 
            bg="rgba(255, 255, 255, 0.03)" 
            borderRadius="3xl" 
            border="1px solid rgba(255,255,255,0.05)"
            boxShadow="0 8px 32px rgba(0,0,0,0.4)"
          >
            <Text 
              fontSize="2xl" 
              fontWeight="700" 
              textAlign="center" 
              color={resultMsg.includes("Congratulations") ? "green.300" : "gray.300"}
              textShadow="0 2px 10px rgba(0,0,0,0.5)"
            >
              {resultMsg}
            </Text>
          </Center>
        )}
      </VStack>
    </Box>
  );
}
