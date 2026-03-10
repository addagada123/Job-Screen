
import { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Link, Button, HStack, Tag } from "@chakra-ui/react";


export default function AdminScores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selecting, setSelecting] = useState("");

  const fetchScores = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE}/api/scores?admin=1`)
      .then(res => res.json())
      .then(data => {
        // Sort by score descending for rank order
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
    await fetch(`${import.meta.env.VITE_API_BASE}/api/admin/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, selection })
    });
    setSelecting("");
    fetchScores();
  };

  return (
    <Box maxW="900px" mx="auto" mt={8} bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} boxShadow="xl">
      <Heading size="lg" mb={6} textAlign="center">Candidate Rankings</Heading>
      {loading ? <Spinner size="xl" /> : error ? <Text color="red.300">{error}</Text> : (
        <Table variant="simple" colorScheme="cyan">
          <Thead>
            <Tr>
              <Th>Rank</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Score</Th>
              <Th>Context Relevancy</Th>
              <Th>Correctness</Th>
              <Th>Date</Th>
              <Th>Selection</Th>
            </Tr>
          </Thead>
          <Tbody>
            {scores.map((s, i) => (
              <Tr key={i}>
                <Td>{i + 1}</Td>
                <Td>
                  {s.email ? (
                    <Link href={`mailto:${s.email}`} color="cyan.300" _hover={{ textDecoration: "underline" }}>
                      {s.name || s.email}
                    </Link>
                  ) : (s.name || "-")}
                </Td>
                <Td>
                  {s.email ? (
                    <Link href={`mailto:${s.email}`} color="cyan.300" _hover={{ textDecoration: "underline" }}>
                      {s.email}
                    </Link>
                  ) : "-"}
                </Td>
                <Td>{s.score}</Td>
                <Td>{s.relevancy !== undefined ? s.relevancy + "%" : "-"}</Td>
                <Td>{s.correctness !== undefined ? (s.correctness ? "Yes" : "No") : "-"}</Td>
                <Td>{new Date(s.date).toLocaleString()}</Td>
                <Td>
                  <HStack>
                    <Button size="xs" colorScheme="green" variant={s.selection === "selected" ? "solid" : "outline"} isLoading={selecting === (s.email + "selected")} onClick={() => handleSelect(s.email, "selected")}>Select</Button>
                    <Button size="xs" colorScheme="red" variant={s.selection === "rejected" ? "solid" : "outline"} isLoading={selecting === (s.email + "rejected")} onClick={() => handleSelect(s.email, "rejected")}>Reject</Button>
                    {s.selection && (
                      <Tag colorScheme={s.selection === "selected" ? "green" : "red"}>{s.selection === "selected" ? "Selected" : "Rejected"}</Tag>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
