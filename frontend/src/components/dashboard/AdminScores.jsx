import { useEffect, useState } from "react";
import { 
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Link, 
  Button, HStack, Tag, Tabs, TabList, Tab, TabPanels, TabPanel, 
  Input, InputGroup, InputLeftElement, useToast, VStack, Flex 
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { getAllScores, selectCandidate } from "../../api";

export default function AdminScores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selecting, setSelecting] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSelect = async (email, selection) => {
    setSelecting(email + selection);
    try {
      await selectCandidate(email, selection);
      fetchScores();
      toast({ title: "Updated!", status: "success", duration: 2000 });
    } catch (err) {
      toast({ title: "Selection failed", description: err.message, status: "error" });
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

  const ScoreTable = ({ data }) => (
    <Table variant="simple" colorScheme="cyan" size="sm">
      <Thead>
        <Tr>
          <Th>Rank</Th>
          <Th>Name</Th>
          <Th>Score</Th>
          <Th>Date</Th>
          <Th>Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((s, i) => (
          <Tr key={s.email + i}>
            <Td fontWeight="bold">#{scores.indexOf(s) + 1}</Td>
            <Td>
              <VStack align="start" spacing={0}>
                <Text fontWeight="600">{s.name || "Unknown"}</Text>
                <Link href={`mailto:${s.email}`} fontSize="xs" color="cyan.400">{s.email}</Link>
              </VStack>
            </Td>
            <Td>
              <Tag colorScheme="purple">{s.score}/15</Tag>
            </Td>
            <Td fontSize="xs">{s.date ? new Date(s.date).toLocaleDateString() : 'N/A'}</Td>
            <Td>
              <HStack spacing={2}>
                <Button 
                  size="xs" colorScheme="green" 
                  isDisabled={s.selection === "selected"} 
                  isLoading={selecting === (s.email + "selected")} 
                  onClick={() => handleSelect(s.email, "selected")}
                >
                  {s.selection === "selected" ? "Selected" : "Select"}
                </Button>
                <Button 
                  size="xs" colorScheme="red" 
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
  );

  return (
    <Box maxW="1000px" mx="auto" mt={8} bg="rgba(20,25,35,0.8)" backdropFilter="blur(10px)" borderRadius="2xl" p={8} boxShadow="2xl" border="1px solid rgba(255,255,255,0.05)">
      <Heading size="lg" mb={8} textAlign="center" bgGradient="linear(to-r, cyan.400, purple.400)" bgClip="text">
        Talent Acquisition Dashboard
      </Heading>
      
      {loading ? (
        <Flex justify="center" p={10}><Spinner size="xl" color="cyan.400" /></Flex>
      ) : error ? (
        <Text color="red.300" textAlign="center">{error}</Text>
      ) : (
        <>
          <InputGroup mb={8} maxW="400px" mx="auto">
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

          <Tabs variant="soft-rounded" colorScheme="cyan">
            <TabList mb={6} justifyContent="center" bg="rgba(255,255,255,0.03)" p={2} borderRadius="full">
              <Tab px={8}>Pending Review ({filteredScores("pending").length})</Tab>
              <Tab px={8}>Selected ({filteredScores("selected").length})</Tab>
              <Tab px={8}>Rejected ({filteredScores("rejected").length})</Tab>
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
    </Box>
  );
}
