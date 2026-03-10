
import { Box, Heading, VStack, Text, Button, Input, useToast, Tag, Wrap, WrapItem } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { uploadResume } from "../../api";
import mammoth from "mammoth";


function Resume() {
  const [resumeName, setResumeName] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const fileInputRef = useRef();
  const toast = useToast();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast({
        title: "No file selected",
        status: "error",
        duration: 2000,
        isClosable: true
      });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await fetch("https://job-screen-backend.onrender.com/upload-resume", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");
      setResumeName(file.name);
      setSkills(data.skills || []);
      setUploaded(true);
      toast({
        title: "Resume uploaded!",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

          return (
            <Box maxW="600px" mx="auto" mt={20} bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} boxShadow="xl">
              <Heading size="lg" mb={6} textAlign="center">
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
                    <Text color="green.300">Uploaded: {resumeName}</Text>
                    {skills.length > 0 && (
                      <Box mt={2}>
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
                  </>
                )}
                <Text color="gray.400" fontSize="sm">Accepted formats: PDF, DOC, DOCX</Text>
              </VStack>
            </Box>
          );
        }

      export default Resume;