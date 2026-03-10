import { Box, Heading, Text, Button, VStack, HStack, Tag, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea, useToast, Select, Alert, AlertIcon, AlertTitle, AlertDescription, Icon } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { evaluateAnswer, updateUserScore } from "../../api";
import { generateQuestion } from "../../api.question";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "https://job-screen.onrender.com";

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
  const [currentScore, setCurrentScore] = useState(0);
  const [adminNotification, setAdminNotification] = useState("");
  const toast = useToast();
  const tabSwitches = useRef(0);
  const navigate = useNavigate();
  // Block access if resume is not uploaded
  useEffect(() => {
    const resumeUploaded = localStorage.getItem("resumeUploaded");
    if (!resumeUploaded) {
      toast({ title: "Please upload your resume first.", status: "warning", duration: 3000 });
      navigate("/dashboard/resume");
    }
  }, [navigate, toast]);

  // Simulate fetching admin notification (replace with real API call as needed)
  useEffect(() => {
    // Example: fetch admin notification for the user
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.adminMessage) {
      setAdminNotification(user.adminMessage);
    }
    // You can replace this with a real fetch to backend for admin messages/selection
  }, []);
  
  const handleSecurityViolation = async (reason) => {
    setForceExit(true);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && !user.testTaken) {
      try {
        // Submit 0 score and mark as taken
        await Promise.all([
          markTestTaken(user.email),
          updateUserScore(user.email, 0)
        ]);
        
        toast({
          title: "Security Violation",
          description: `Test terminated: ${reason}. Score: 0/15. Logging out...`,
          status: "error",
          duration: 5000,
          isClosable: true
        });

        // Delay logout slightly to show message
        setTimeout(() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 3000);
      } catch (err) {
        console.error("Failed to submit violation score", err);
        // Fallback: still redirect
        setTimeout(() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  // Fullscreen and tab switch enforcement
  useEffect(() => {
    // Request fullscreen on mount
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitches.current += 1;
        setQuestion(q => ({ ...q, switches: tabSwitches.current }));
        if (tabSwitches.current > 4) {
          handleSecurityViolation("Too many tab switches");
        } else {
          toast({ title: `Tab switch detected (${tabSwitches.current}/4 allowed)`, status: "warning", duration: 3000 });
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !forceExit) {
        handleSecurityViolation("Exited fullscreen mode");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen();
    };
    // eslint-disable-next-line
  }, []);

  // Check if user already took test
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    if (user.testTaken === true) {
      setTestBlocked(true);
      return;
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
    setEvalResult(null);
    setAnswer("");
    setVoiceAnswer("");
    try {
      const { skills } = getSkillsAndLanguage();
      const q = await generateQuestion(aiModel, skills, selectedLanguage);
      setQuestion(prev => ({
        ...prev,
        text: q.text || "No question available.",
        category: q.category || "General"
      }));
    } catch (err) {
      setQuestion(prev => ({
        ...prev,
        text: "Could not load question. Please check your connection.",
        category: "Error"
      }));
    } finally {
      setQLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { language } = getSkillsAndLanguage();
      const result = await evaluateAnswer(answer, aiModel, language, question.text);
      setEvalResult(result);
      toast({ title: "Evaluation Complete!", status: "success", duration: 2000, isClosable: true });
      // Enforce 70% context relevancy threshold
      const relevancy = typeof result.relevancy === "number" ? result.relevancy : 0;
      const isCorrect = relevancy >= 70;
      
      if (isCorrect) {
        setCurrentScore(prev => prev + 1);
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
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          // Finalize test in backend
          await Promise.all([
            markTestTaken(user.email),
            updateUserScore(user.email, currentScore)
          ]);
          
          user.testTaken = true;
          user.score = currentScore;
          localStorage.setItem("user", JSON.stringify(user));
        }

        toast({
          title: "Test Completed!",
          description: `You have scored ${currentScore}/${question.total}. Results will be reviewed by admin.`,
          status: "success",
          duration: 4000,
          isClosable: true
        });
        setTestBlocked(true);
      } catch (err) {
        toast({ title: "Error submitting test", status: "error" });
      } finally {
        setLoading(false);
      }
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
    recognition.onerror = (event) => {
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        toast({ title: "Microphone Access Denied", description: "Please allow microphone access in your browser settings.", status: "error", duration: 5000, isClosable: true });
      } else {
        toast({ title: "Microphone Error", description: event.error, status: "error", duration: 3000, isClosable: true });
      }
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
      const result = await evaluateAnswer(voiceAnswer, aiModel, language, question.text);
      setEvalResult(result);
      toast({ title: "Evaluation Complete!", status: "success", duration: 2000, isClosable: true });
      // Enforce 70% context relevancy threshold
      const relevancy = typeof result.relevancy === "number" ? result.relevancy : 0;
      const isCorrect = relevancy >= 70;
      
      if (isCorrect) {
        setCurrentScore(prev => prev + 1);
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
                  {question.number === question.total ? "Submit Test" : "Next Question"}
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
                      {question.number === question.total ? "Submit Test" : "Next Question"}
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
