import {
  Box,
  Heading,
  VStack,
  Text,
  Button,
  Input,
  useToast,
  Tag,
  Wrap,
  WrapItem
} from "@chakra-ui/react";

import { useRef, useState } from "react";
import { uploadResume } from "../../api";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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

      let resumeText = "";
      const fileType = file.name.split(".").pop().toLowerCase();

      // ================= PDF Parsing =================

      if (fileType === "pdf") {

        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let textContent = "";

        for (let i = 1; i <= pdf.numPages; i++) {

          const page = await pdf.getPage(i);

          const txt = await page.getTextContent();

          textContent += txt.items.map(item => item.str).join(" ") + "\n";

        }

        resumeText = textContent;

      }

      // ================= DOCX Parsing =================

      else if (fileType === "docx" || fileType === "doc") {

        const arrayBuffer = await file.arrayBuffer();

        const result = await mammoth.extractRawText({ arrayBuffer });

        resumeText = result.value;

      }

      else {

        toast({
          title: "Unsupported file type",
          description: "Upload PDF, DOC, or DOCX",
          status: "error",
          duration: 3000,
          isClosable: true
        });

        setLoading(false);
        return;
      }

      // ================= User Validation =================

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.email) {

        toast({
          title: "User not logged in",
          description: "Please login first",
          status: "error",
          duration: 3000,
          isClosable: true
        });

        setLoading(false);
        return;
      }

      // ================= Skill Extraction =================

      const SKILL_LIST = [

        // Languages
        "javascript","typescript","python","java","c++","c#","go","php","ruby","swift","kotlin",

        // Frameworks
        "react","angular","vue","node.js","express","django","flask","spring",".net",

        // Databases
        "sql","mysql","postgresql","mongodb","firebase",

        // Cloud
        "aws","azure","gcp",

        // DevOps
        "docker","kubernetes","git","linux","bash","shell",

        // Web
        "html","css","sass","less","graphql","rest","api",

        // Soft skills
        "leadership","communication","teamwork","problem solving",
        "critical thinking","adaptability","creativity",
        "time management","collaboration","project management"

      ];

      const textLower = resumeText.toLowerCase();

      const foundSkills = new Set();

      for (const skill of SKILL_LIST) {

        const escaped = skill.replace(/[.+*?^()|\[\]\\]/g, "\\$&");

        const regex = new RegExp("\\b" + escaped + "\\b", "i");

        if (regex.test(textLower)) {

          foundSkills.add(skill);

        }

      }

      const skillArray = [...foundSkills];

      setSkills(skillArray);

      localStorage.setItem("skills", JSON.stringify(skillArray));

      // ================= Upload to Backend =================

      await uploadResume(user.email, resumeText);

      setResumeName(file.name);

      setUploaded(true);

      toast({
        title: "Resume uploaded!",
        status: "success",
        duration: 2000,
        isClosable: true
      });

    }

    catch (err) {

      toast({
        title: "Upload failed",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <Box
      maxW="600px"
      mx="auto"
      mt={8}
      bg="rgba(30,38,51,0.7)"
      borderRadius="2xl"
      p={8}
      boxShadow="xl"
    >

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
            <Text color="green.300">
              Uploaded: {resumeName}
            </Text>

            {skills.length > 0 && (

              <Box mt={2}>

                <Text color="cyan.300" fontSize="sm" mb={1}>
                  Skills detected:
                </Text>

                <Wrap>

                  {skills.map(skill => (

                    <WrapItem key={skill}>
                      <Tag colorScheme="cyan">
                        {skill}
                      </Tag>
                    </WrapItem>

                  ))}

                </Wrap>

              </Box>

            )}

          </>
        )}

        <Text color="gray.400" fontSize="sm">
          Accepted formats: PDF, DOC, DOCX
        </Text>

      </VStack>

    </Box>

  );

}

export default Resume;