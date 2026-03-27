import { useEffect, useState } from "react";
import { 
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Link, 
  Button, HStack, Tag, useToast, Tabs, TabList, Tab, TabPanels, TabPanel, VStack, Flex, Center 
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { getAdminUsers, selectCandidate, approveAdminRequest } from "../../api";
import { motion } from "framer-motion";

const MotionBox = motion.create ? motion.create(Box) : motion(Box);

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selecting, setSelecting] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();

  const fetchUsers = () => {
    setLoading(true);
    getAdminUsers()
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(e => {
        setError("Failed to load users");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tabIndex]);

  const handleRevoke = async (email) => {
    setSelecting(email + "revoke");
    try {
      await approveAdminRequest(email, false);
      fetchUsers();
      toast({ title: "Admin access revoked", status: "success", duration: 1500 });
    } catch (err) {
      toast({ title: "Operation failed", status: "error", duration: 1500 });
    } finally {
      setSelecting("");
    }
  };

  const handleSelect = async (email, selection) => {
    setSelecting(email + selection);
    try {
      await selectCandidate(email, selection);
      fetchUsers();
      toast({ title: "Selection updated", status: "success", duration: 1500 });
    } catch (err) {
      toast({ title: "Operation failed", status: "error", duration: 1500 });
    } finally {
      setSelecting("");
    }
  };

  const UserTable = ({ data, type }) => {
    if (data.length === 0) {
      return (
        <Center py={10}>
          <Text color="gray.400" fontSize="lg">
            {type === 'admin' ? "No administrators found." : "No candidates found."}
          </Text>
        </Center>
      );
    }
    return (
      <Box overflowX="auto" w="full">
        <Table variant="simple" colorScheme="cyan" size="sm">
          <Thead>
            <Tr>
              <Th color="gray.400" fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" px={2}>Name</Th>
            <Th color="gray.400" fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" px={2}>Email</Th>
            <Th color="gray.400" fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" px={2}>{type === 'admin' ? 'Role' : 'Test Status'}</Th>
            <Th color="gray.400" fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" px={2}>Selection</Th>
            <Th color="gray.400" fontSize="xs" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" textAlign="right" px={2}>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((u, i) => (
              <Tr key={u.email + i}>
                <Td px={2}><Text fontWeight="600" noOfLines={1}>{u.name || "-"}</Text></Td>
              <Td px={2}><Link href={`mailto:${u.email}`} color="cyan.300" fontSize="sm">{u.email}</Link></Td>
              <Td px={2}>
                {type === 'admin' ? (
                  <Tag colorScheme="yellow" size="sm">Admin</Tag>
                ) : (
                  u.testTaken ? <Tag colorScheme="green" size="sm">Taken</Tag> : <Tag colorScheme="gray" size="sm">Pending</Tag>
                )}
              </Td>
              <Td px={2}>
                {u.selection === "selected" && <Tag colorScheme="green" size="sm">Selected</Tag>}
                {u.selection === "rejected" && <Tag colorScheme="red" size="sm">Rejected</Tag>}
                {!u.selection && <Tag colorScheme="gray" size="sm">None</Tag>}
              </Td>
              <Td textAlign="right" px={2}>
                  {type === 'admin' ? (
                    <Button 
                      size="xs" colorScheme="red" variant="outline"
                      isLoading={selecting === (u.email + "revoke")}
                      onClick={() => handleRevoke(u.email)}
                    >
                      Revoke Access
                    </Button>
                  ) : (
                    <HStack justify="flex-end">
                      <Button 
                        size="xs" colorScheme="cyan" variant={u.selection === "selected" ? "solid" : "outline"}
                        isLoading={selecting === (u.email + "selected")}
                        onClick={() => handleSelect(u.email, "selected")}
                      >
                        Select
                      </Button>
                      <Button 
                        size="xs" colorScheme="red" variant={u.selection === "rejected" ? "solid" : "outline"}
                        isLoading={selecting === (u.email + "rejected")}
                        onClick={() => handleSelect(u.email, "rejected")}
                      >
                        Reject
                      </Button>
                    </HStack>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  };

  const filteredUsers = (isAdmin) => users.filter(u => !!u.isAdmin === isAdmin);

  return (
    <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} maxW="950px" mx="auto" mt={6} bg="rgba(20,25,35,0.8)" backdropFilter="blur(10px)" borderRadius="2xl" p={8} boxShadow="2xl" border="1px solid rgba(255,255,255,0.05)">
      <HStack justify="space-between" mb={8}>
        <Box w="100px" /> {/* Spacer */}
        <Heading size="lg" textAlign="center" bgGradient="linear(to-r, cyan.400, purple.500)" bgClip="text">User Management</Heading>
        <Button 
            leftIcon={<RepeatIcon />} 
            onClick={fetchUsers} 
            isLoading={loading}
            variant="ghost"
            colorScheme="cyan"
            size="sm"
        >
            Refresh
        </Button>
      </HStack>
      
      {loading ? (
        <Flex justify="center" p={10}><Spinner size="xl" color="cyan.400" /></Flex>
      ) : error ? (
        <Text color="red.300" textAlign="center">{error}</Text>
      ) : (
        <Tabs variant="soft-rounded" colorScheme="cyan" index={tabIndex} onChange={(index) => setTabIndex(index)}>
          <TabList mb={6} justifyContent="center" bg="rgba(255,255,255,0.03)" p={2} borderRadius="full">
            <Tab px={8}>Users ({filteredUsers(false).length})</Tab>
            <Tab px={8}>Admins ({filteredUsers(true).length})</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel p={0}>
              <UserTable data={filteredUsers(false)} type="user" />
            </TabPanel>
            <TabPanel p={0}>
              <UserTable data={filteredUsers(true)} type="admin" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </MotionBox>
  );
}
