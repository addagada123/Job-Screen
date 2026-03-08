import { Box, Heading, VStack, Text, Button, Input, useToast } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { uploadResume } from "../../api";

export default function Resume() {
  const [resumeName, setResumeName] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const toast = useToast();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const result = await uploadResume(file);
        setResumeName(result.originalname);
        setUploaded(true);
        toast({ title: "Resume uploaded!", status: "success", duration: 2000, isClosable: true });
      } catch (err) {
        toast({ title: "Upload failed", description: err.message, status: "error", duration: 3000, isClosable: true });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box maxW="600px" mx="auto" mt={8} bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} boxShadow="xl">
      <Heading size="lg" mb={6} textAlign="center">Resume Upload</Heading>
      <VStack spacing={6}>
        <Button colorScheme="cyan" onClick={() => fileInputRef.current.click()} w="full" isLoading={loading}>
          {uploaded ? "Replace Resume" : "Upload Resume"}
        </Button>
        <Input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef} display="none" onChange={handleUpload} />
        {uploaded && (
          <Text color="green.300">Uploaded: {resumeName}</Text>
        )}
        <Text color="gray.400" fontSize="sm">Accepted formats: PDF, DOC, DOCX</Text>
      </VStack>
    </Box>
  );
}
