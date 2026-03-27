import { useEffect, useState } from "react";
import { 
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Link, 
  Button, HStack, Tag, Tabs, TabList, Tab, TabPanels, TabPanel, 
  Input, InputGroup, InputLeftElement, useToast, VStack, Flex,
  IconButton, Tooltip
} from "@chakra-ui/react";
import { SearchIcon, RepeatIcon, DownloadIcon } from "@chakra-ui/icons";
import { getAllScores, selectCandidate } from "../../api";
import { motion } from "framer-motion";

const MotionBox = motion.create ? motion.create(Box) : motion(Box);

export default function AdminScores({ embedMode = false, onStatusChange }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selecting, setSelecting] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();

  const fetchScores = () => {
    setLoading(true);
    getAllScores()
      .then(data => {
        const sorted = Array.isArray(data) ? [...data].sort((a, b) => (b.score || 0) - (a.score || 0)) : [];
        setScores(sorted);
        setLoading(false);
      })
      .catch(e => {
        setError("Failed to load scores");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tabIndex]);

  const handleSelect = async (email, selection) => {
    setSelecting(email + selection);
    try {
      await selectCandidate(email, selection);
      fetchScores();
      if (onStatusChange) onStatusChange();
      toast({ title: "Updated!", status: "success", duration: 1500 });
    } catch (err) {
      toast({ title: "Selection failed", description: err.message, status: "error", duration: 1500 });
    } finally {
      setSelecting("");
    }
  };

  const filteredScores = (status) => {
    return scores.filter(s => {
      const matchesSearch = (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (status === "pending") return !s.selection;
      return s.selection === status;
    });
  };

  const downloadCSV = () => {
    if (!scores.length) return;
    const headers = ["Name", "Email", "Score", "Date", "Selection"];
    const rows = scores.map(s => [
      s.name || "Unknown",
      s.email,
      `${s.score}/15`,
      s.date ? new Date(s.date).toLocaleDateString() : "N/A",
      s.selection || "Pending"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `candidate_scores_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ScoreTable = ({ data }) => (
    <Box overflowX="auto" w="full">
      <Table variant="simple" colorScheme="cyan" size="sm">
        <Thead>
          <Tr>
            <Th color="gray.400" fontSize="10px" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" px={1}>Rank</Th>
            <Th color="gray.400" fontSize="10px" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" px={1}>Name</Th>
            <Th color="gray.400" fontSize="10px" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" px={1}>Score</Th>
            <Th color="gray.400" fontSize="10px" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" px={1}>Date</Th>
            <Th color="gray.400" fontSize="10px" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" textAlign="right" px={1}>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((s, i) => (
            <Tr key={s.email + i}>
              <Td fontWeight="bold" px={1}>#{scores.indexOf(s) + 1}</Td>
              <Td px={1}>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="600" fontSize="sm" noOfLines={1}>{s.name || "Unknown"}</Text>
                  <Link href={`mailto:${s.email}`} fontSize="10px" color="cyan.400">{s.email}</Link>
                </VStack>
              </Td>
              <Td px={1}>
                <Tag colorScheme="purple" size="xs" fontSize="10px">{s.score}/15</Tag>
              </Td>
              <Td fontSize="10px" px={1}>{s.date ? new Date(s.date).toLocaleDateString() : 'N/A'}</Td>
              <Td textAlign="right" px={1}>
                <HStack spacing={2} justify="flex-end">
                  <Button 
                    size="xs" colorScheme="cyan" variant={s.selection === "selected" ? "solid" : "outline"}
                    isDisabled={s.selection === "selected"} 
                    isLoading={selecting === (s.email + "selected")} 
                    onClick={() => handleSelect(s.email, "selected")}
                  >
                    {s.selection === "selected" ? "Selected" : "Select"}
                  </Button>
                  <Button 
                    size="xs" colorScheme="red" variant={s.selection === "rejected" ? "solid" : "outline"}
                    isDisabled={s.selection === "rejected"} 
                    isLoading={selecting === (s.email + "rejected")} 
                    onClick={() => handleSelect(s.email, "rejected")}
                  >
                    {s.selection === "rejected" ? "Rejected" : "Reject"}
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );

  return (
    <MotionBox 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      maxW={embedMode ? "100%" : "950px"} 
      mx="auto" 
      mt={embedMode ? 0 : 6} 
      bg={embedMode ? "transparent" : "rgba(20,25,35,0.8)"} 
      backdropFilter={embedMode ? "none" : "blur(10px)"} 
      borderRadius="2xl" 
      p={embedMode ? 0 : 8} 
      boxShadow={embedMode ? "none" : "2xl"} 
      border={embedMode ? "none" : "1px solid rgba(255,255,255,0.05)"}
    >
      {!embedMode && (
        <VStack spacing={2} mb={8} align="center">
          <Tag colorScheme="cyan" variant="subtle" borderRadius="full" px={4}>RECRUITER ACCESS ONLY</Tag>
          <Heading size="lg" textAlign="center" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">
            Candidate Performance Results
          </Heading>
          <Tooltip label="Export to CSV" placement="top">
            <Button 
              leftIcon={<DownloadIcon />} 
              onClick={downloadCSV} 
              variant="outline" 
              colorScheme="cyan" 
              size="sm"
              borderRadius="full"
              fontSize="xs"
              px={4}
            >
              Download CSV
            </Button>
          </Tooltip>
        </VStack>
      )}
      
      {loading ? (
        <Flex justify="center" p={10}><Spinner size="xl" color="cyan.400" /></Flex>
      ) : error ? (
        <Text color="red.300" textAlign="center">{error}</Text>
      ) : (
        <>
          <HStack mb={8} spacing={4} maxW="600px" mx="auto">
            <InputGroup flex="1">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.500" />
              </InputLeftElement>
              <Input 
                placeholder="Search by name or email..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                bg="rgba(255,255,255,0.05)"
                border="1px solid rgba(255,255,255,0.1)"
                _focus={{ borderColor: "cyan.400", boxShadow: "0 0 10px rgba(0, 255, 255, 0.2)" }}
              />
            </InputGroup>
            <Button 
                leftIcon={<RepeatIcon />} 
                onClick={fetchScores} 
                isLoading={loading}
                variant="ghost"
                colorScheme="cyan"
            >
                Refresh
            </Button>
          </HStack>

          <Tabs variant="soft-rounded" colorScheme="cyan" index={tabIndex} onChange={(index) => setTabIndex(index)}>
            <TabList mb={6} justifyContent="center" bg="rgba(255,255,255,0.03)" p={2} borderRadius="full">
              <Tab px={8}>Pending Candidates ({filteredScores("pending").length})</Tab>
              <Tab px={8}>Selected Candidates ({filteredScores("selected").length})</Tab>
              <Tab px={8}>Rejected Candidates ({filteredScores("rejected").length})</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={0}>
                <ScoreTable data={filteredScores("pending")} />
              </TabPanel>
              <TabPanel p={0}>
                <ScoreTable data={filteredScores("selected")} />
              </TabPanel>
              <TabPanel p={0}>
                <ScoreTable data={filteredScores("rejected")} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </MotionBox>
  );
}
