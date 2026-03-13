import { Box, Heading, Text, Button, VStack, HStack, Tag, Tabs, TabList, TabPanels, Tab, TabPanel, Textarea, useToast, Select, Alert, AlertIcon, AlertTitle, AlertDescription, Icon, List, ListItem, ListIcon, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, useDisclosure } from "@chakra-ui/react";
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
  const [currentScore, setCurrentScore] = useState(0);
  const scoreRef = useRef(0);
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem("selectedLanguage") || "English");
  const [evalResult, setEvalResult] = useState(null);
  const [qLoading, setQLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testBlocked, setTestBlocked] = useState(false);
  const [forceExit, setForceExit] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60);
  const [totalTimeLeft, setTotalTimeLeft] = useState(15 * 60);
  const [adminNotification, setAdminNotification] = useState("");
  const timerIntervalRef = useRef(null);
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

  // Assessment Timers Logic
  useEffect(() => {
    if (!testStarted || forceExit || testBlocked) return;

    const interval = setInterval(() => {
      setQuestionTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setTotalTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [testStarted, forceExit, testBlocked]);

  useEffect(() => {
    if (testStarted && questionTimeLeft === 0 && !testBlocked && !forceExit) {
      handleNext();
    }
  }, [questionTimeLeft]);

  useEffect(() => {
    if (testStarted && totalTimeLeft === 0 && !testBlocked && !forceExit) {
      handleNext(); // Finish assessment
    }
  }, [totalTimeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
      const q = await generateQuestion("openai", skills, selectedLanguage);
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
      const result = await evaluateAnswer(answer, "openai", language, question.text);
      toast({ title: "Answer Submitted!", status: "success", duration: 1500, isClosable: true });
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
        setTestCompleted(true);
        onConfirmClose();
      } catch (err) {
        toast({ title: "Error submitting test", status: "error" });
      } finally {
        setLoading(false);
      }
      return;
    }
    setQuestion(q0 => ({ ...q0, number: q0.number + 1 }));
    setQuestionTimeLeft(60);
    await loadQuestion();
  };

  if (testCompleted) {
    return (
      <Box maxW="600px" mx="auto" mt={20} p={10} bg="rgba(30,38,51,0.7)" borderRadius="2xl" boxShadow="2xl" border="1px solid rgba(0,255,255,0.2)" textAlign="center">
        <Icon as={FaCheckCircle} w={16} h={16} color="green.400" mb={6} />
        <Heading size="xl" mb={4} color="white">Thank you for submitting the test!</Heading>
        <Text color="gray.400" fontSize="lg" mb={8}>
          Your assessment has been recorded successfully. Our team will review your results.
        </Text>
        <Button size="lg" colorScheme="cyan" onClick={() => navigate("/dashboard")} px={10}>
          Go to Dashboard
        </Button>
      </Box>
    );
  }

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
      console.log("6.0s Silence detected, stopping recognition...");
      stopRecognition();
    }, 6000);
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
      const result = await evaluateAnswer(voiceAnswer, "openai", language, question.text);
      toast({ title: "Answer Submitted!", status: "success", duration: 1500, isClosable: true });
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

          <HStack spacing={6} align="start" justify="center">
            <Box flex={1} maxW="300px">
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
      <HStack justify="space-between" mb={4} p={4} bg="rgba(0,0,0,0.2)" borderRadius="xl">
        <VStack align="start" spacing={0}>
          <Text fontSize="xs" color="gray.400" textTransform="uppercase">Question</Text>
          <Heading size="md" color="white">{question.number}/{question.total}</Heading>
        </VStack>
        <VStack align="center" spacing={0}>
           <Text fontSize="xs" color="gray.400" textTransform="uppercase">Question Timer</Text>
           <Text fontWeight="bold" color={questionTimeLeft < 10 ? "red.400" : "cyan.300"} fontSize="2xl" fontFamily="mono">
            {formatTime(questionTimeLeft)}
          </Text>
        </VStack>
        <VStack align="center" spacing={0}>
           <Text fontSize="xs" color="gray.400" textTransform="uppercase">Total Time Remaining</Text>
           <Text fontWeight="bold" color="purple.300" fontSize="2xl" fontFamily="mono">
            {formatTime(totalTimeLeft)}
          </Text>
        </VStack>
        <VStack align="end" spacing={0}>
          <Text fontSize="xs" color="gray.400" textTransform="uppercase">Warnings</Text>
          <Text fontWeight="bold" color={question.switches > 2 ? "red.400" : "white"}>
            {question.switches}/{question.maxSwitches}
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

      <Box mb={6}>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="bold" color="gray.400" textTransform="uppercase">Select Answering Language</Text>
          <Tag colorScheme="purple" variant="subtle" size="sm">{selectedLanguage}</Tag>
        </HStack>
        <Select 
          size="sm"
          value={selectedLanguage} 
          onChange={e => {
            setSelectedLanguage(e.target.value);
            localStorage.setItem("selectedLanguage", e.target.value);
          }}
          bg="rgba(15,18,24,0.8)"
          borderColor="rgba(255,255,255,0.1)"
          borderRadius="lg"
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
                isDisabled={loading || qLoading}
              />
              <HStack spacing={4}>
                <Button colorScheme="cyan" type="submit" flex={1} size="lg" h="14" isLoading={loading} isDisabled={qLoading || !answer.trim()}>
                  Submit Answer
                </Button>
                {question.number === question.total ? (
                  <Button colorScheme="green" onClick={onConfirmOpen} flex={1} size="lg" h="14" isDisabled={loading || qLoading}>
                    Submit Test
                  </Button>
                ) : (
                  <Button variant="outline" colorScheme="cyan" onClick={handleNext} flex={1} size="lg" h="14" isDisabled={loading || qLoading}>
                    Next Question
                  </Button>
                )}
              </HStack>
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
                  isDisabled={loading || qLoading}
                />
                <HStack spacing={4}>
                  <Button
                    leftIcon={<Icon as={isRecording ? FaStop : FaMicrophone} />}
                    colorScheme={isRecording ? "red" : "cyan"}
                    variant={isRecording ? "solid" : "outline"}
                    onClick={isRecording ? stopRecognition : startRecognition}
                    isDisabled={loading || qLoading}
                    flex={1}
                    h="14"
                  >
                    {isRecording ? "Stop Recording" : "Start Voice Input"}
                  </Button>
                  <Button
                    colorScheme="cyan"
                    type="submit"
                    isLoading={loading}
                    isDisabled={qLoading || !voiceAnswer.trim()}
                    flex={1}
                    h="14"
                  >
                    Submit Answer
                  </Button>
                </HStack>
                <HStack spacing={4} mt={4}>
                  {question.number === question.total ? (
                    <Button colorScheme="green" onClick={onConfirmOpen} w="full" size="lg" h="14" isDisabled={loading || qLoading}>
                      Submit Test
                    </Button>
                  ) : (
                    <Button variant="outline" colorScheme="cyan" onClick={handleNext} w="full" size="lg" h="14" isDisabled={loading || qLoading}>
                      Next Question
                    </Button>
                  )}
                </HStack>
              </VStack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.800" border="1px solid rgba(255,255,255,0.1)">
          <ModalHeader>Submit Test?</ModalHeader>
          <ModalBody>
            <Text color="gray.300">Are you sure you want to submit your final assessment? You won't be able to change your answers.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfirmClose}>No</Button>
            <Button colorScheme="cyan" onClick={handleNext} isLoading={loading}>Submit Test</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
