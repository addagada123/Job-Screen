


import { Box, Heading, Text, Button, VStack, HStack, Tag, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea, useToast, Select, Alert, AlertIcon, AlertTitle, AlertDescription, Icon } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { evaluateAnswer, updateUserScore } from "../../api";
import { generateQuestion } from "../../api.question";
import { FaMicrophone, FaStop } from "react-icons/fa";



export default function Test() {
  const [answer, setAnswer] = useState("");
  const [voiceAnswer, setVoiceAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [question, setQuestion] = useState({
    text: "",
    category: "",
    number: 1,
    total: 15,
    time: 20,
    switches: 0,
    maxSwitches: 5
  });
  const [loading, setLoading] = useState(false);
  const [aiModel, setAiModel] = useState("openai");
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem("selectedLanguage") || "English");
  const [evalResult, setEvalResult] = useState(null);
  const [qLoading, setQLoading] = useState(false);
  const [testBlocked, setTestBlocked] = useState(false);
  const [forceExit, setForceExit] = useState(false);
  const [adminNotification, setAdminNotification] = useState("");
  const toast = useToast();
  const tabSwitches = useRef(0);

  // Simulate fetching admin notification (replace with real API call as needed)
  useEffect(() => {
    // Example: fetch admin notification for the user
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.adminMessage) {
      setAdminNotification(user.adminMessage);
    }
    // You can replace this with a real fetch to backend for admin messages/selection
  }, []);

  // Fullscreen and tab switch enforcement
  useEffect(() => {
    // Request fullscreen on mount
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();

    // Tab switch handler
    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitches.current += 1;
        setQuestion(q => ({ ...q, switches: tabSwitches.current }));
        if (tabSwitches.current >= 4) {
          setForceExit(true);
          toast({ title: "Test exited: Too many tab switches.", status: "error", duration: 4000 });
        } else {
          toast({ title: `Tab switch detected (${tabSwitches.current}/4)`, status: "warning", duration: 2000 });
        }
      }
    };
    // Fullscreen exit handler
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        setForceExit(true);
        toast({ title: "Test exited: Fullscreen exited.", status: "error", duration: 4000 });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      if (document.exitFullscreen) document.exitFullscreen();
    };
    // eslint-disable-next-line
  }, []);

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

  // Get detected skills and language from localStorage
  function getSkillsAndLanguage() {
    const skills = JSON.parse(localStorage.getItem("skills") || "[]");
    const language = selectedLanguage;
    return { skills, language };
  }

  async function loadQuestion() {
    setQLoading(true);
      <Box
        p={6}
        borderRadius="2xl"
        bg="rgba(255, 255, 255, 0.02)"
        border="1px solid rgba(255, 255, 255, 0.05)"
        mb={6}
      >
        <Text color="blue.400" fontWeight="bold" mb={1}>
          Note: All questions are always in English.
        </Text>
        <Text color="gray.400" mb={2}>
          Question {question.number} of {question.total}
        </Text>
        <Text fontWeight="600" fontSize="xl" mb={4}>
          {qLoading ? "Loading..." : question.text}
        </Text>
        <Tag colorScheme="purple" mb={2}>{question.category}</Tag>
      </Box>
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { language } = getSkillsAndLanguage();
      const result = await evaluateAnswer(answer, aiModel, language);
      setEvalResult(result);
      toast({ title: "Evaluation Complete!", status: "success", duration: 2000, isClosable: true });
      // Enforce 70% context relevancy threshold
      const relevancy = typeof result.relevancy === "number" ? result.relevancy : (typeof result.score === "number" ? result.score : 0);
      const isCorrect = relevancy >= 70;
      // Mark test as taken after first submit and update score in DB only if correct
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && !user.testTaken && isCorrect) {
        await fetch(`${import.meta.env.VITE_API_BASE}/api/mark-test-taken`, {
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
    // If last question, show completion toast
    if (question.number === question.total) {
      toast({
        title: "Test Completed!",
        description: "You have finished all questions. Results will be reviewed by admin.",
        status: "success",
        duration: 4000,
        isClosable: true
      });
      setTestBlocked(true);
      // Optionally, trigger any post-test logic here
      return;
    }
    setQuestion(q0 => ({ ...q0, number: q0.number + 1 }));
    await loadQuestion();
  };

  if (testBlocked || forceExit) {
    return (
      <Box maxW="700px" mx="auto" mt={8}>
        <Alert status={forceExit ? "error" : "info"} borderRadius="md" mb={8}>
          <AlertIcon />
          {forceExit
            ? "Test exited due to leaving fullscreen or too many tab switches. Please contact admin to retake."
            : "You have already taken the test. You cannot take it again."}
        </Alert>
        {adminNotification && (
          <Alert status="info" borderRadius="md" mt={4}>
            <AlertIcon />
            <Box>
              <AlertTitle>Admin Message</AlertTitle>
              <AlertDescription>{adminNotification}</AlertDescription>
            </Box>
          </Alert>
        )}
      </Box>
    );
  }

  // --- Speech-to-text logic ---
  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    // Try to use selected language code, fallback to en-US
    let langCode = 'en-US';
    if (selectedLanguage === 'Hindi') langCode = 'hi-IN';
    else if (selectedLanguage === 'Telugu') langCode = 'te-IN';
    else if (selectedLanguage === 'Tamil') langCode = 'ta-IN';
    else if (selectedLanguage === 'Kannada') langCode = 'kn-IN';
    else if (selectedLanguage === 'French') langCode = 'fr-FR';
    else if (selectedLanguage === 'Spanish') langCode = 'es-ES';
    else if (selectedLanguage === 'German') langCode = 'de-DE';
    else if (selectedLanguage === 'Chinese') langCode = 'zh-CN';
    else if (selectedLanguage === 'Japanese') langCode = 'ja-JP';
    else if (selectedLanguage === 'Arabic') langCode = 'ar-SA';
    recognition.lang = langCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceAnswer(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => {
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceSubmit = async (e) => {
    e.preventDefault();
    if (!voiceAnswer.trim()) return;
    setLoading(true);
    try {
      const { language } = getSkillsAndLanguage();
      const result = await evaluateAnswer(voiceAnswer, aiModel, language);
      setEvalResult(result);
      toast({ title: "Evaluation Complete!", status: "success", duration: 2000, isClosable: true });
      // Enforce 70% context relevancy threshold
      const relevancy = typeof result.relevancy === "number" ? result.relevancy : (typeof result.score === "number" ? result.score : 0);
      const isCorrect = relevancy >= 70;
      // Mark test as taken after first submit and update score in DB only if correct
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && !user.testTaken && isCorrect) {
        await fetch(`${import.meta.env.VITE_API_BASE}/api/mark-test-taken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email })
        });
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

  return (
    <Box maxW="700px" mx="auto" mt={20}>
      <HStack justify="space-between" mb={4}>
        <Text>Question {question.number}/{question.total}</Text>
        <Text fontWeight="bold" color="cyan.300" fontSize="xl">00:{question.time.toString().padStart(2, '0')}</Text>
        <Text>Switches: {question.switches}/{question.maxSwitches}</Text>
      </HStack>
      <Box bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} mb={6} boxShadow="xl">
        <Heading size="lg" mb={2}>{qLoading ? "Loading..." : question.text}</Heading>
        <Tag colorScheme="cyan" mt={2}>{question.category}</Tag>
      </Box>
      <HStack mb={4} spacing={4} align="start">
        <Box>
          <Text fontSize="sm" mb={1} color="gray.300">AI Model</Text>
          <Select value={aiModel} onChange={e => setAiModel(e.target.value)} maxW="200px" isDisabled={loading || qLoading}>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="deepseek">DeepSeek</option>
          </Select>
        </Box>
        <Box>
          <Text fontSize="sm" mb={1} color="gray.300">Language</Text>
          <Select value={selectedLanguage} onChange={e => {
            setSelectedLanguage(e.target.value);
            localStorage.setItem("selectedLanguage", e.target.value);
          }} maxW="200px" isDisabled={loading || qLoading}>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
            <option value="Russian">Russian</option>
            <option value="Arabic">Arabic</option>
            <option value="Portuguese">Portuguese</option>
            <option value="Bengali">Bengali</option>
            <option value="Other">Other</option>
          </Select>
        </Box>
      </HStack>
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
            <form onSubmit={handleVoiceSubmit}>
              <VStack align="stretch" spacing={4}>
                <Textarea
                  placeholder="Your answer will appear here... (any language)"
                  value={voiceAnswer}
                  onChange={e => setVoiceAnswer(e.target.value)}
                  minH="100px"
                  bg="rgba(15,18,24,0.8)"
                  color="white"
                  isDisabled={loading || qLoading || !!evalResult}
                />
                <HStack>
                  <Button
                    leftIcon={<Icon as={isRecording ? FaStop : FaMicrophone} />}
                    colorScheme={isRecording ? "red" : "cyan"}
                    onClick={isRecording ? stopRecognition : startRecognition}
                    isDisabled={loading || qLoading || !!evalResult}
                  >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Button>
                  <Button
                    colorScheme="cyan"
                    type="submit"
                    isLoading={loading}
                    isDisabled={qLoading || !!evalResult || !voiceAnswer.trim()}
                  >
                    Submit Answer
                  </Button>
                </HStack>
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
              </VStack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
