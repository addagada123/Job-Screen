import { 
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Link, 
  Button, HStack, Tag, useToast, Tabs, TabList, Tab, TabPanels, TabPanel, VStack, Flex 
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { getAdminUsers, selectCandidate, approveAdminRequest } from "../../api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selecting, setSelecting] = useState("");
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

  const handleRevoke = async (email) => {
    setSelecting(email + "revoke");
    try {
      await approveAdminRequest(email, false);
      fetchUsers();
      toast({ title: "Admin access revoked", status: "success" });
    } catch (err) {
      toast({ title: "Operation failed", status: "error" });
    } finally {
      setSelecting("");
    }
  };

  const UserTable = ({ data, type }) => (
    <Table variant="simple" colorScheme="cyan">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>{type === 'admin' ? 'Role' : 'Test Status'}</Th>
          <Th>Selection</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((u, i) => (
          <Tr key={u.email + i}>
            <Td><Text fontWeight="600">{u.name || "-"}</Text></Td>
            <Td><Link href={`mailto:${u.email}`} color="cyan.300">{u.email}</Link></Td>
            <Td>
              {type === 'admin' ? (
                <Tag colorScheme="yellow">Admin</Tag>
              ) : (
                u.testTaken ? <Tag colorScheme="green">Taken</Tag> : <Tag colorScheme="gray">Pending</Tag>
              )}
            </Td>
            <Td>
              {u.selection === "selected" && <Tag colorScheme="green">Selected</Tag>}
              {u.selection === "rejected" && <Tag colorScheme="red">Rejected</Tag>}
              {!u.selection && <Tag colorScheme="gray">None</Tag>}
            </Td>
            <Td>
              {type === 'admin' ? (
                <Button 
                  size="xs" colorScheme="orange" variant="outline"
                  isLoading={selecting === (u.email + "revoke")}
                  onClick={() => handleRevoke(u.email)}
                >
                  Revoke Access
                </Button>
              ) : (
                <HStack>
                  <Button 
                    size="xs" colorScheme="green" variant={u.selection === "selected" ? "solid" : "outline"}
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
  );

  const filteredUsers = (isAdmin) => users.filter(u => !!u.isAdmin === isAdmin);

  return (
    <Box maxW="1100px" mx="auto" mt={8} bg="rgba(20,25,35,0.8)" backdropFilter="blur(10px)" borderRadius="2xl" p={8} boxShadow="2xl" border="1px solid rgba(255,255,255,0.05)">
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
        <Tabs variant="soft-rounded" colorScheme="cyan">
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
    </Box>
  );
}
