import { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, Text } from "@chakra-ui/react";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = () => {
    setLoading(true);
    fetch("http://localhost:3000/api/admin/requests")
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(e => {
        setError("Failed to load requests");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = (email, approve) => {
    fetch("http://localhost:3000/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, approve })
    }).then(() => fetchRequests());
  };

  return (
    <Box maxW="700px" mx="auto" mt={8} bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} boxShadow="xl">
      <Heading size="lg" mb={6} textAlign="center">Admin Access Requests</Heading>
      {loading ? <Spinner size="xl" /> : error ? <Text color="red.300">{error}</Text> : (
        <Table variant="simple" colorScheme="cyan">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map((r, i) => (
              <Tr key={i}>
                <Td>{r.name}</Td>
                <Td>{r.email}</Td>
                <Td>
                  <Button colorScheme="green" size="sm" mr={2} onClick={() => handleApprove(r.email, true)}>Approve</Button>
                  <Button colorScheme="red" size="sm" onClick={() => handleApprove(r.email, false)}>Reject</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
