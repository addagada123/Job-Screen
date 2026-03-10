import { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, Text, useToast } from "@chakra-ui/react";
import { getAdminRequests, approveAdminRequest } from "../../api";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchRequests = () => {
    setLoading(true);
    getAdminRequests()
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

  const handleApprove = async (email, approve) => {
    try {
      await approveAdminRequest(email, approve);
      toast({ title: approve ? "Admin approved!" : "Request rejected", status: approve ? "success" : "info" });
      fetchRequests();
    } catch (err) {
      toast({ title: "Operation failed", status: "error" });
    }
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
