import { uploadResume } from "../../api";
import { getCurrentUser } from "../../utils/auth";

function Resume() {
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
  const fileInputRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast({ title: "No file selected", status: "error", duration: 2000, isClosable: true });
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

      toast({ title: "Resume uploaded!", status: "success", duration: 2000, isClosable: true });
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, status: "error", duration: 3000, isClosable: true });
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
              onClick={() => navigate("/dashboard/test")}
            >
              Take Test Now
            </Button>
          </>
        )}
        <Text color="gray.400" fontSize="sm">Accepted formats: PDF, DOC, DOCX</Text>
      </VStack>
    </Box>
  );
}

export default Resume;