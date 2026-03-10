import { Box, Heading, Text, Button, VStack, HStack, Tag, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea, useToast, Select, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, List, ListItem, ListIcon, Spinner } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { evaluateAnswer, updateUserScore, markTestTaken } from "../../api";
import { generateQuestion } from "../../api.question";
import { FaMicrophone, FaStop, FaCheckCircle, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "https://job-screen.onrender.com";

export default function Test() {
  const [testStarted, setTestStarted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [voiceAnswer, setVoiceAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [question, setQuestion] = useState({
    text: "",
    category: "",
    number: 1,
    total: 10,
    time: 20,
    switches: 0,
    maxSwitches: 4
  });
  const [loading, setLoading] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const scoreRef = useRef(0);
  const [aiModel, setAiModel] = useState("openai");
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem("selectedLanguage") || "English");
  const [evalResult, setEvalResult] = useState(null);
  const [qLoading, setQLoading] = useState(false);
  const [testBlocked, setTestBlocked] = useState(false);
  const [forceExit, setForceExit] = useState(false);
  const [adminNotification, setAdminNotification] = useState("");
  const toast = useToast();
  const tabSwitches = useRef(0);
  const navigate = useNavigate();

  // Block access if resume is not uploaded
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const resumeUploaded = localStorage.getItem("resumeUploaded");

    if (!user) {
      navigate("/login");
      return;
    }

    if (!resumeUploaded) {
      toast({ title: "Please upload your resume first.", status: "warning", duration: 3000 });
      navigate("/dashboard/resume");
    }
  }, [navigate, toast]);

  // Handle Security Violation
  const handleSecurityViolation = async (reason) => {
    setForceExit(true);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && !user.testTaken) {
      try {
        await Promise.all([
          markTestTaken(user.email),
          updateUserScore(user.email, 0)
        ]);
        
        toast({
          title: "Security Violation",
          description: `Test terminated: ${reason}. Score: 0. Logging out...`,
          status: "error",
          duration: 5000,
          isClosable: true
        });

        setTimeout(() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 3000);
      } catch (err) {
        console.error("Failed to submit violation score", err);
        setTimeout(() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  // Fullscreen and tab switch enforcement (only active when testStarted is true)
  useEffect(() => {
    if (!testStarted || forceExit) return;

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
      if (!document.fullscreenElement && !forceExit && testStarted) {
        handleSecurityViolation("Exited fullscreen mode");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testStarted, forceExit]);

  // Check if user already took test
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    if (user.testTaken === true) {
      setTestBlocked(true);
    }
  }, []);

  const handleStartTest = async () => {
    setLoading(true);
    try {
      // 1. Request Mic & Camera Permissions
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      
      // 2. Request Fullscreen
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();

      // 3. Start Test
      setTestStarted(true);
      await loadQuestion();
    } catch (err) {
      toast({
        title: "Hardware Access Required",
        description: "Please allow camera and microphone access to proceed with the test.",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

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
        scoreRef.current += 1;
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
            updateUserScore(user.email, scoreRef.current)
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
      <Box maxW="700px" mx="auto" mt={20}>
        <Alert status={forceExit ? "error" : "info"} borderRadius="md" mb={8} variant="solid" bg={forceExit ? "red.900" : "blue.900"}>
          <AlertIcon />
          <Box>
            <AlertTitle>{forceExit ? "Security Violation" : "Assessment Completed"}</AlertTitle>
            <AlertDescription>
              {forceExit
                ? "Test terminated due to leaving fullscreen or too many tab switches. Please contact admin."
                : "You have already completed the test. Please wait for the admin to review your results."}
            </AlertDescription>
          </Box>
        </Alert>
        <Button onClick={() => navigate("/dashboard/results")} colorScheme="cyan" mt={6}>
          View My Results
        </Button>
      </Box>
    );
  }

  // --- Speech-to-text logic with 3.5s Silence Timeout & Auto-Restart ---
  const silenceTimerRef = useRef(null);
  const lastPartialTranscriptRef = useRef("");

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      console.log("3.5s Silence detected, stopping recognition...");
      stopRecognition();
    }, 3500);
  };

  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    let langCode = 'en-US';
    if (selectedLanguage === 'Hindi') langCode = 'hi-IN';
    else if (selectedLanguage === 'Telugu') langCode = 'te-IN';
    else if (selectedLanguage === 'Tamil') langCode = 'ta-IN';
    else if (selectedLanguage === 'Spanish') langCode = 'es-ES';
    else if (selectedLanguage === 'French') langCode = 'fr-FR';
    
    recognition.lang = langCode;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
      resetSilenceTimer();
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setVoiceAnswer(prev => prev + (prev ? ' ' : '') + transcript);
          lastPartialTranscriptRef.current = "";
        } else {
          interimTranscript += transcript;
        }
      }
      resetSilenceTimer();
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Keep listening
      } else {
        console.error("Speech error:", event.error);
        stopRecognition();
      }
    };

    recognition.onend = () => {
      // Restart if we haven't manually stopped it or silence timer hasn't fired
      if (isRecording && !silenceTimerRef.current) {
        try { recognition.start(); } catch(e) {}
      } else if (isRecording) {
        // Just keep waiting for silence timer or more results
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecognition = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
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
      const relevancy = typeof result.relevancy === "number" ? result.relevancy : 0;
      if (relevancy >= 70) {
        setCurrentScore(prev => prev + 1);
        scoreRef.current += 1;
      }
    } catch (err) {
      toast({ title: "API Error", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!testStarted) {
    return (
      <Box maxW="800px" mx="auto" mt={20} p={8} bg="rgba(30,38,51,0.7)" borderRadius="2xl" boxShadow="2xl" border="1px solid rgba(255,255,255,0.1)">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={4} bgGradient="linear(to-r, cyan.400, purple.400)" bgClip="text">
              Ready to Start?
            </Heading>
            <Text color="gray.400" fontSize="lg">
              This AI-powered assessment will evaluate your profile based on your resume.
            </Text>
          </Box>

          <Box bg="rgba(0,0,0,0.2)" p={6} borderRadius="xl">
            <Heading size="md" mb={4} color="cyan.300">📋 Instructions</Heading>
            <List spacing={3}>
              <ListItem color="gray.300">
                <ListIcon as={FaCheckCircle} color="green.400" />
                The test contains <strong>10 questions</strong> tailored to your skills.
              </ListItem>
              <ListItem color="gray.300">
                <ListIcon as={FaCheckCircle} color="green.400" />
                You will have <strong>20 seconds</strong> to answer each question.
              </ListItem>
              <ListItem color="gray.300">
                <ListIcon as={FaCheckCircle} color="green.400" />
                Leaving fullscreen or switching tabs (max 4 times) will <strong>auto-submit</strong> your test with a score of 0.
              </ListItem>
              <ListItem color="gray.300">
                <ListIcon as={FaCheckCircle} color="green.400" />
                Ensure you are in a quiet, well-lit environment.
              </ListItem>
            </List>
          </Box>

          <HStack spacing={6} align="start">
            <Box flex={1}>
              <Text fontSize="sm" mb={2} fontWeight="bold" color="gray.400">SELECT AI MODEL</Text>
              <Select 
                value={aiModel} 
                onChange={e => setAiModel(e.target.value)} 
                bg="gray.800" 
                borderColor="rgba(255,255,255,0.1)"
                _hover={{ borderColor: "cyan.400" }}
              >
                <option value="openai">OpenAI (Recommended)</option>
                <option value="gemini">Google Gemini</option>
                <option value="deepseek">DeepSeek AI</option>
              </Select>
            </Box>
            <Box flex={1}>
              <Text fontSize="sm" mb={2} fontWeight="bold" color="gray.400">ANSWERING LANGUAGE</Text>
              <Select 
                value={selectedLanguage} 
                onChange={e => {
                  setSelectedLanguage(e.target.value);
                  localStorage.setItem("selectedLanguage", e.target.value);
                }}
                bg="gray.800"
                borderColor="rgba(255,255,255,0.1)"
                _hover={{ borderColor: "cyan.400" }}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </Select>
            </Box>
          </HStack>

          <Box>
             <Alert status="warning" borderRadius="md" mb={6} bg="orange.900" color="orange.100">
              <AlertIcon />
              Clicking "Start Assessment" will request Camera and Microphone permissions.
            </Alert>
            <HStack spacing={4} w="full">
              <Button 
                variant="outline" 
                size="lg" 
                flex={1} 
                h="16"
                onClick={() => navigate("/dashboard")}
                borderColor="rgba(255,255,255,0.2)"
                _hover={{ bg: "rgba(255,255,255,0.05)" }}
              >
                Back
              </Button>
              <Button 
                colorScheme="cyan" 
                size="lg" 
                flex={2} 
                h="16" 
                fontSize="xl"
                onClick={handleStartTest}
                isLoading={loading}
                leftIcon={<Icon as={FaCamera} />}
                bgGradient="linear(to-r, cyan.500, blue.500)"
                _hover={{ bgGradient: "linear(to-r, cyan.400, blue.400)", transform: "translateY(-2px)" }}
                transition="all 0.3s"
                boxShadow="0 4px 20px rgba(0, 255, 255, 0.3)"
              >
                Start Assessment Now
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Box>
    );
  }

  return (
    <Box maxW="700px" mx="auto" mt={20}>
      <HStack justify="space-between" mb={4}>
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" color="gray.400">QUESTION</Text>
          <Heading size="md" color="white">{question.number}/{question.total}</Heading>
        </VStack>
        <VStack align="center" spacing={0}>
           <Text fontSize="sm" color="gray.400">TIME LEFT</Text>
           <Text fontWeight="bold" color="cyan.300" fontSize="2xl" fontFamily="mono">
            00:{question.time.toString().padStart(2, '0')}
          </Text>
        </VStack>
        <VStack align="end" spacing={0}>
          <Text fontSize="sm" color="gray.400">WARNINGS</Text>
          <Text fontWeight="bold" color={question.switches > 2 ? "red.400" : "white"}>
            {question.switches}/{question.maxSwitches} Switches
          </Text>
        </VStack>
      </HStack>

      <Box bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} mb={6} boxShadow="xl" border="1px solid rgba(0,255,255,0.1)">
        <Heading size="lg" mb={2} lineHeight="1.4">
          {qLoading ? <Spinner size="sm" mr={2} /> : null}
          {qLoading ? "AI is generating your question..." : question.text}
        </Heading>
        {!qLoading && <Tag colorScheme="cyan" mt={2} variant="subtle">{question.category}</Tag>}
      </Box>

      <Tabs variant="solid-rounded" colorScheme="cyan" mb={4}>
        <TabList bg="rgba(255,255,255,0.05)" p={1} borderRadius="full">
          <Tab borderRadius="full" px={8}>Type Answer</Tab>
          <Tab borderRadius="full" px={8}>Voice Answer</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0} pt={6}>
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="Type your answer here in your selected language..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                mb={4}
                minH="120px"
                bg="rgba(15,18,24,0.8)"
                color="white"
                borderRadius="xl"
                borderColor="rgba(255,255,255,0.1)"
                _focus={{ borderColor: "cyan.400" }}
                isDisabled={loading || qLoading || !!evalResult}
              />
              <Button colorScheme="cyan" type="submit" w="full" size="lg" h="14" isLoading={loading} isDisabled={qLoading || !!evalResult || !answer.trim()}>
                Submit Answer
              </Button>
            </form>
          </TabPanel>
          <TabPanel px={0} pt={6}>
            <form onSubmit={handleVoiceSubmit}>
              <VStack align="stretch" spacing={4}>
                <Textarea
                  placeholder="Your voice transcript will appear here..."
                  value={voiceAnswer}
                  onChange={e => setVoiceAnswer(e.target.value)}
                  minH="120px"
                  bg="rgba(15,18,24,0.8)"
                  color="white"
                  borderRadius="xl"
                  borderColor="rgba(255,255,255,0.1)"
                  _focus={{ borderColor: "cyan.400" }}
                  isDisabled={loading || qLoading || !!evalResult}
                />
                <HStack spacing={4}>
                  <Button
                    leftIcon={<Icon as={isRecording ? FaStop : FaMicrophone} />}
                    colorScheme={isRecording ? "red" : "cyan"}
                    variant={isRecording ? "solid" : "outline"}
                    onClick={isRecording ? stopRecognition : startRecognition}
                    isDisabled={loading || qLoading || !!evalResult}
                    flex={1}
                    h="14"
                  >
                    {isRecording ? "Stop Recording" : "Start Voice Input"}
                  </Button>
                  <Button
                    colorScheme="cyan"
                    type="submit"
                    isLoading={loading}
                    isDisabled={qLoading || !!evalResult || !voiceAnswer.trim()}
                    flex={1}
                    h="14"
                  >
                    Submit Voice Answer
                  </Button>
                </HStack>
              </VStack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {evalResult && (
        <VStack mt={6} spacing={4} align="stretch" animation="fadeIn 0.5s">
          <Alert status={evalResult.score === 1 ? "success" : "warning"} borderRadius="xl" bg={evalResult.score === 1 ? "green.900" : "orange.900"} color="white">
            <AlertIcon />
            <Box>
              <AlertTitle>Candidate Feedback</AlertTitle>
              <AlertDescription>
                <HStack spacing={4} mt={1}>
                  <Text><strong>Relevancy:</strong> {evalResult.relevancy}%</Text>
                  <Text><strong>Status:</strong> {evalResult.correctness ? "Passed" : "Needs Improvement"}</Text>
                </HStack>
                <Text mt={2} color="gray.300" fontSize="sm">{evalResult.aiText}</Text>
              </AlertDescription>
            </Box>
          </Alert>
          <Button colorScheme="cyan" onClick={handleNext} alignSelf="flex-end" size="lg" px={10} borderRadius="full">
            {question.number === question.total ? "Finish Assessment" : "Move to Next Question"}
          </Button>
        </VStack>
      )}
    </Box>
  );
}
