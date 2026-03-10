import { useEffect, useState } from "react";
import { 
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Link, 
  Button, HStack, Tag, useToast 
} from "@chakra-ui/react";
import { getAdminUsers, selectCandidate } from "../../api";

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

  const handleSelect = async (email, selection) => {
    setSelecting(email + selection);
    try {
      await selectCandidate(email, selection);
      fetchUsers();
      toast({ title: "Selection updated", status: "success" });
    } catch (err) {
      toast({ title: "Operation failed", status: "error" });
    } finally {
      setSelecting("");
    }
  };

  return (
    <Box maxW="1100px" mx="auto" mt={8} bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} boxShadow="xl">
      <Heading size="lg" mb={6} textAlign="center">All Users Management</Heading>
      {loading ? <Spinner size="xl" /> : error ? <Text color="red.300">{error}</Text> : (
        <Table variant="simple" colorScheme="cyan">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Admin</Th>
              <Th>Test Taken</Th>
              <Th>Selection</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((u, i) => (
              <Tr key={u.email + i}>
                <Td>
                  <Text fontWeight="600">{u.name || "-"}</Text>
                </Td>
                <Td>
                  <Link href={`mailto:${u.email}`} color="cyan.300">{u.email}</Link>
                </Td>
                <Td>{u.isAdmin ? <Tag colorScheme="yellow">Admin</Tag> : "User"}</Td>
                <Td>{u.testTaken ? <Tag colorScheme="green">Taken</Tag> : <Tag colorScheme="gray">Pending</Tag>}</Td>
                <Td>
                  {u.selection === "selected" && <Tag colorScheme="green">Selected</Tag>}
                  {u.selection === "rejected" && <Tag colorScheme="red">Rejected</Tag>}
                  {!u.selection && <Tag colorScheme="gray">None</Tag>}
                </Td>
                <Td>
                  <HStack>
                    <Button 
                      size="xs" colorScheme="green" 
                      variant={u.selection === "selected" ? "solid" : "outline"} 
                      isLoading={selecting === (u.email + "selected")} 
                      onClick={() => handleSelect(u.email, "selected")}
                    >
                      Select
                    </Button>
                    <Button 
                      size="xs" colorScheme="red" 
                      variant={u.selection === "rejected" ? "solid" : "outline"} 
                      isLoading={selecting === (u.email + "rejected")} 
                      onClick={() => handleSelect(u.email, "rejected")}
                    >
                      Reject
                    </Button>
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
