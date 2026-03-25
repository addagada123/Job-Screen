import { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, Text, useToast, HStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@chakra-ui/react";

export default function AdminRetakeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/retake-requests');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      setError("Failed to load retake requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`/api/admin/retake/${id}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      toast({ title: `Retake ${action}d`, status: "success" });
      fetchRequests();
    } catch (e) {
      toast({ title: "Operation failed", status: "error" });
    }
  };

  const viewReason = (reason) => {
    setSelectedReason(reason);
    onOpen();
  };

  if (loading) return <Spinner size="xl" />;
  if (error) return <Text color="red.300">{error}</Text>;

  return (
    <Box maxW="900px" mx="auto" mt={8} bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} boxShadow="xl">
      <Heading size="lg" mb={6} textAlign="center">🔄 Retake Test Requests</Heading>
      {requests.length === 0 ? (
        <Text color="gray.400" textAlign="center" py={10} fontSize="lg">
          No pending retake test requests.
        </Text>
      ) : (
        <Table variant="simple" colorScheme="cyan">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>REASON</Th>
              <Th>ACTIONS</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.map((r) => (
              <Tr key={r._id}>
                <Td>{r.name}</Td>
                <Td>{r.email}</Td>
                <Td>
                  <Button 
                    size="sm" 
                    colorScheme="purple" 
                    variant="outline"
                    onClick={() => viewReason(r.reason)}
                  >
                    View Reason
                  </Button>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Button size="sm" colorScheme="green" onClick={() => handleAction(r._id, 'accept')}>Accept</Button>
                    <Button size="sm" colorScheme="red" onClick={() => handleAction(r._id, 'reject')}>Reject</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reason for Retake Request</ModalHeader>
          <ModalBody whiteSpace="pre-wrap">
            {selectedReason}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
