import { Box, Heading, VStack, Text, Button, Input, useToast, Tag, Wrap, WrapItem } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../../api";
import { getCurrentUser } from "../../utils/auth";
import { motion } from "framer-motion";

const MotionBox = motion.create ? motion.create(Box) : motion(Box);

function Resume({ onResumeUpload }) {
  const [resumeName, setResumeName] = useState("");
  const [uploaded, setUploaded] = useState(!!localStorage.getItem("resumeUploaded"));
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("skills") || "[]");
    } catch {
      return [];
    }
  });
  const [testTaken, setTestTaken] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return !!user.testTaken;
  });
  const fileInputRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();

  const handleTakeTest = () => {
    if (testTaken) {
      toast({
        title: "Test already taken",
        description: "You have already completed the assessment. Please wait for the results.",
        status: "info",
        duration: 1500,
        isClosable: true,
      });
      return;
    }
    navigate("/dashboard/test");
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast({ title: "No file selected", status: "error", duration: 1500, isClosable: true });
      return;
    }
    setLoading(true);
    try {
      const user = getCurrentUser();
      const data = await uploadResume(file, user?.email);
      if (!data.success) throw new Error(data.error || "Upload failed");

      const detectedSkills = data.skills || [];
      setResumeName(file.name);
      setSkills(detectedSkills);
      setUploaded(true);

      // Persist to localStorage so Test.jsx and Dashboard can read them
      localStorage.setItem("resumeUploaded", "true");
      localStorage.setItem("skills", JSON.stringify(detectedSkills));

      // Update user object as well for faster UI sync
      const updatedUser = { ...user, resumeUploaded: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast({ title: "Resume uploaded!", status: "success", duration: 1500, isClosable: true });
      if (onResumeUpload) onResumeUpload();
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, status: "error", duration: 1500, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} maxW="750px" mx="auto" mt={6} bg="rgba(20,25,35,0.8)" backdropFilter="blur(10px)" borderRadius="2xl" p={8} boxShadow="2xl" border="1px solid rgba(255,255,255,0.05)">
      <Heading size="lg" mb={8} textAlign="center" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">
        Resume Upload
      </Heading>
      <VStack spacing={6}>
        <Button
          colorScheme="cyan"
          onClick={() => fileInputRef.current.click()}
          w="full"
          isLoading={loading}
        >
          {uploaded ? "Replace Resume" : "Upload Resume"}
        </Button>
        <Input
          type="file"
          accept=".pdf,.doc,.docx"
          ref={fileInputRef}
          display="none"
          onChange={handleUpload}
        />
        {uploaded && (
          <>
            {resumeName && <Text color="green.300">Uploaded: {resumeName}</Text>}
            {skills.length > 0 && (
              <Box mt={2} w="full">
                <Text color="cyan.300" fontSize="sm" mb={1}>Skills detected</Text>
                <Wrap>
                  {skills.map(skill => (
                    <WrapItem key={skill}>
                      <Tag colorScheme="cyan">{skill}</Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
            {skills.length === 0 && (
              <Text color="yellow.300" fontSize="sm">
                No specific skills detected — generic questions will be used for your test.
              </Text>
            )}
            <Button
              mt={4}
              colorScheme="green"
              size="lg"
              w="full"
              onClick={handleTakeTest}
            >
              Take Test Now
            </Button>
          </>
        )}
        <Text color="gray.400" fontSize="sm">Accepted formats: PDF, DOC, DOCX</Text>
      </VStack>
    </MotionBox>
  );
}

export default Resume;