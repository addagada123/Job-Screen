

import { Box, Heading, Text, Button, VStack, HStack, Tag, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea, useToast, Select, Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { evaluateAnswer, updateUserScore } from "../../api";
import { generateQuestion } from "../../api.question";



export default function Test() {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState({
    text: "",
    category: "",
    number: 1,
    total: 5,
    time: 20,
    switches: 0,
    maxSwitches: 5
  });
  const [loading, setLoading] = useState(false);
  const [aiModel, setAiModel] = useState("openai");
  const [evalResult, setEvalResult] = useState(null);
  const [qLoading, setQLoading] = useState(false);
  const [testBlocked, setTestBlocked] = useState(false);
  const toast = useToast();

  // Check if user already took test
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    if (user.testTaken === true) {
      setTestBlocked(true);
    }
    loadQuestion();
    // eslint-disable-next-line
  }, []);

  async function loadQuestion() {
    setQLoading(true);
    try {
      const q = await generateQuestion(aiModel);
      setQuestion(q0 => ({
        ...q0,
        text: q.text,
        category: q.category
      }));
      setEvalResult(null);
      setAnswer("");
    } catch {
      toast({ title: "Failed to load question", status: "error" });
    } finally {
      setQLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await evaluateAnswer(answer, aiModel);
      setEvalResult(result);
      toast({ title: "Evaluation Complete!", status: "success", duration: 2000, isClosable: true });
      // Mark test as taken after first submit and update score in DB
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && !user.testTaken) {
        await fetch("http://localhost:3000/api/mark-test-taken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email })
        });
        // Update score in MongoDB
        if (typeof result.score === "number") {
          try {
            await updateUserScore(user.email, result.score);
            user.score = result.score;
          } catch (err) {
            toast({ title: "Failed to save score", status: "error" });
          }
        }
        user.testTaken = true;
        localStorage.setItem("user", JSON.stringify(user));
        setTestBlocked(true);
      }
    } catch (err) {
      toast({ title: "API Error", description: err.message, status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setQuestion(q0 => ({ ...q0, number: q0.number + 1 }));
    await loadQuestion();
  };

  if (testBlocked) {
    return (
      <Box maxW="700px" mx="auto" mt={8}>
        <Alert status="info" borderRadius="md" mb={8}>
          <AlertIcon />
          You have already taken the test. You cannot take it again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="700px" mx="auto" mt={8}>
      <HStack justify="space-between" mb={4}>
        <Text>Question {question.number}/{question.total}</Text>
        <Text fontWeight="bold" color="cyan.300" fontSize="xl">00:{question.time.toString().padStart(2, '0')}</Text>
        <Text>Switches: {question.switches}/{question.maxSwitches}</Text>
      </HStack>
      <Box bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} mb={6} boxShadow="xl">
        <Heading size="lg" mb={2}>{qLoading ? "Loading..." : question.text}</Heading>
        <Tag colorScheme="cyan" mt={2}>{question.category}</Tag>
      </Box>
      <Select mb={4} value={aiModel} onChange={e => setAiModel(e.target.value)} maxW="250px" isDisabled={loading || qLoading}>
        <option value="openai">OpenAI</option>
        <option value="gemini">Gemini</option>
        <option value="deepseek">DeepSeek</option>
      </Select>
      <Tabs variant="soft-rounded" colorScheme="cyan" mb={4}>
        <TabList>
          <Tab>Type</Tab>
          <Tab>Voice</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="Type answer here... (any language)"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                mb={4}
                minH="100px"
                bg="rgba(15,18,24,0.8)"
                color="white"
                isDisabled={loading || qLoading || !!evalResult}
              />
              <Button colorScheme="cyan" type="submit" w="full" size="lg" isLoading={loading} isDisabled={qLoading || !!evalResult}>
                Submit Answer
              </Button>
            </form>
            {evalResult && (
              <VStack mt={6} spacing={4} align="stretch">
                <Alert status={evalResult.score === 1 ? "success" : "warning"} borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Feedback</AlertTitle>
                    <AlertDescription>
                      <Text><b>Context Relevancy:</b> {evalResult.relevancy !== null ? evalResult.relevancy + "%" : "N/A"}</Text>
                      <Text><b>Correctness:</b> {evalResult.correctness === true ? "Correct" : evalResult.correctness === false ? "Incorrect" : "N/A"}</Text>
                      <Text><b>Score:</b> {evalResult.score !== null ? evalResult.score : "N/A"}</Text>
                      <Text mt={2} color="gray.400" fontSize="sm">AI Feedback: {evalResult.aiText}</Text>
                    </AlertDescription>
                  </Box>
                </Alert>
                <Button colorScheme="cyan" onClick={handleNext} alignSelf="flex-end">
                  Next Question
                </Button>
              </VStack>
            )}
          </TabPanel>
          <TabPanel>
            <Text color="gray.400">Voice input coming soon!</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
