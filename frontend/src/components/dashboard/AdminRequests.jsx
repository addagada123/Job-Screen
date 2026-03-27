import { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, Text, useToast, HStack } from "@chakra-ui/react";
import { getAdminRequests, approveAdminRequest } from "../../api";
import { motion } from "framer-motion";

const MotionBox = motion.create ? motion.create(Box) : motion(Box);

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
      toast({ title: approve ? "Admin approved!" : "Request rejected", status: approve ? "success" : "info", duration: 1500 });
      fetchRequests();
    } catch (err) {
      toast({ title: "Operation failed", status: "error", duration: 1500 });
    }
  };

  return (
    <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} maxW="750px" mx="auto" mt={6} bg="rgba(20,25,35,0.8)" backdropFilter="blur(10px)" borderRadius="2xl" p={8} boxShadow="2xl" border="1px solid rgba(255,255,255,0.05)">
      <Heading size="lg" mb={8} textAlign="center" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">Admin Access Requests</Heading>
      {loading ? <Spinner size="xl" /> : error ? <Text color="red.300">{error}</Text> : (
        requests.length === 0 ? (
          <Text color="gray.400" textAlign="center" py={10} fontSize="lg">
            No pending admin access requests.
          </Text>
        ) : (
          <Table variant="simple" colorScheme="cyan">
            <Thead>
              <Tr>
                <Th color="gray.400" fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase">Name</Th>
                <Th color="gray.400" fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase">Email</Th>
                <Th color="gray.400" fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" textAlign="right">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {requests.map((r, i) => (
                <Tr key={i}>
                  <Td>{r.name}</Td>
                  <Td>{r.email}</Td>
                  <Td textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <Button colorScheme="cyan" size="sm" onClick={() => handleApprove(r.email, true)}>Approve</Button>
                      <Button colorScheme="red" size="sm" variant="outline" onClick={() => handleApprove(r.email, false)}>Reject</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )
      )}
    </MotionBox>
  );
}
