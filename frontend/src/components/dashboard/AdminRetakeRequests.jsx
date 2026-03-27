import { useEffect, useState } from "react";
import { 
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, Text, 
  useToast, HStack, Popover, PopoverTrigger, PopoverContent, PopoverBody, 
  PopoverArrow, PopoverCloseButton, Portal 
} from "@chakra-ui/react";
import { getAdminRetakeRequests, handleRetakeRequestAction } from "../../api";
import { motion } from "framer-motion";
import { RepeatIcon } from "@chakra-ui/icons";

const MotionBox = motion.create ? motion.create(Box) : motion(Box);

export default function AdminRetakeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const toast = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getAdminRetakeRequests();
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
      await handleRetakeRequestAction(id, action);
      toast({ title: `Retake ${action}d`, status: "success", duration: 1500 });
      fetchRequests();
    } catch (e) {
      toast({ title: "Operation failed", status: "error", duration: 1500 });
    }
  };


  if (loading) return <Spinner size="xl" />;
  if (error) return <Text color="red.300">{error}</Text>;

  return (
    <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} maxW="900px" mx="auto" mt={6} bg="rgba(20,25,35,0.8)" backdropFilter="blur(10px)" borderRadius="2xl" p={8} boxShadow="2xl" border="1px solid rgba(255,255,255,0.05)">
      <Heading size="lg" mb={8} textAlign="center" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">
        <RepeatIcon boxSize={6} color="cyan.400" mr={2} /> Retake Test Requests
      </Heading>
      {requests.length === 0 ? (
        <Text color="gray.400" textAlign="center" py={10} fontSize="lg">
          No pending retake test requests.
        </Text>
      ) : (
        <Box overflowX="auto" w="full">
          <Table variant="simple" colorScheme="cyan" size="sm">
            <Thead>
              <Tr>
                <Th px={2} color="gray.400">Name</Th>
                <Th px={2} color="gray.400">Email</Th>
                <Th px={2} color="gray.400">Reason</Th>
                <Th px={2} color="gray.400" textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {requests.map((r) => (
                <Tr key={r._id}>
                  <Td px={2}><Text noOfLines={1} fontSize="xs">{r.name}</Text></Td>
                  <Td px={2} fontSize="sm">{r.email}</Td>
                  <Td px={2}>
                    <Popover placement="top-start" closeOnBlur={true}>
                      <PopoverTrigger>
                        <Button 
                          size="sm" 
                          colorScheme="purple" 
                          variant="ghost"
                          _hover={{ bg: "rgba(128, 90, 213, 0.2)" }}
                        >
                          View Reason
                        </Button>
                      </PopoverTrigger>
                      <Portal>
                        <PopoverContent 
                          bg="rgba(45, 55, 72, 0.95)" 
                          backdropFilter="blur(10px)"
                          borderColor="purple.500"
                          borderRadius="xl"
                          boxShadow="0 10px 30px rgba(0,0,0,0.5)"
                          p={2}
                          w="300px"
                        >
                          <PopoverArrow bg="rgba(45, 55, 72, 0.95)" />
                          <PopoverCloseButton size="xs" />
                          <PopoverBody color="white" fontSize="sm" py={4} whiteSpace="pre-wrap">
                            <Text fontWeight="bold" fontSize="xs" mb={2} color="purple.300">CANDIDATE REASON:</Text>
                            {r.reason}
                          </PopoverBody>
                        </PopoverContent>
                      </Portal>
                    </Popover>
                  </Td>
                  <Td px={2} textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <Button size="sm" colorScheme="cyan" onClick={() => handleAction(r._id, "accept")}>Accept</Button>
                      <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleAction(r._id, "reject")}>Reject</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </MotionBox>
  );
}
