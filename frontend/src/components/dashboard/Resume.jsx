
import { Box, Heading, VStack, Text, Button, Input, useToast } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { uploadResume } from "../../api";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import mammoth from "mammoth";

export default function Resume() {
  const [resumeName, setResumeName] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const toast = useToast();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast({ title: "No file selected", status: "error", duration: 2000, isClosable: true });
      return;
    }
    setLoading(true);
    try {
      let resumeText = "";
      const fileType = file.name.split('.').pop().toLowerCase();
      if (fileType === "pdf") {
        // PDF extraction
        const arrayBuffer = await file.arrayBuffer();
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let textContent = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const txt = await page.getTextContent();
          textContent += txt.items.map(item => item.str).join(" ") + "\n";
        }
        resumeText = textContent;
      } else if (fileType === "docx" || fileType === "doc") {
        // DOC/DOCX extraction
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        resumeText = result.value;
      } else {
        toast({ title: "Unsupported file type", description: "Please upload a PDF, DOC, or DOCX file.", status: "error", duration: 3000, isClosable: true });
        setLoading(false);
        return;
      }

      // Get user email from localStorage (assumes user is logged in)
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) {
        toast({ title: "User not logged in", description: "Please log in to upload your resume.", status: "error", duration: 3000, isClosable: true });
        setLoading(false);
        return;
      }

      const result = await uploadResume(user.email, resumeText);
      setResumeName(file.name);
      setUploaded(true);
      toast({ title: "Resume uploaded!", status: "success", duration: 2000, isClosable: true });
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, status: "error", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
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
