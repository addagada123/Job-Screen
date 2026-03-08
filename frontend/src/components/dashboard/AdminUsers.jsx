import { useEffect, useState } from "react";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Text, Link, Button, HStack, Tag } from "@chakra-ui/react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selecting, setSelecting] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    fetch("http://localhost:3000/api/admin/users?admin=1")
      .then(res => res.json())
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
    await fetch("http://localhost:3000/api/admin/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, selection })
    });
    setSelecting("");
    fetchUsers();
  };

  return (
    <Box maxW="1100px" mx="auto" mt={8} bg="rgba(30,38,51,0.7)" borderRadius="2xl" p={8} boxShadow="xl">
      <Heading size="lg" mb={6} textAlign="center">All Users</Heading>
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
              <Tr key={i}>
                <Td>
                  {u.email ? (
                    <Link href={`mailto:${u.email}`} color="cyan.300" _hover={{ textDecoration: "underline" }}>
                      {u.name || u.email}
                    </Link>
                  ) : (u.name || "-")}
                </Td>
                <Td>
                  {u.email ? (
                    <Link href={`mailto:${u.email}`} color="cyan.300" _hover={{ textDecoration: "underline" }}>
                      {u.email}
                    </Link>
                  ) : "-"}
                </Td>
                <Td>{u.isAdmin ? <Tag colorScheme="yellow">Admin</Tag> : "-"}</Td>
                <Td>{u.testTaken ? <Tag colorScheme="green">Yes</Tag> : <Tag colorScheme="gray">No</Tag>}</Td>
                <Td>
                  {u.selection === "selected" && <Tag colorScheme="green">Selected</Tag>}
                  {u.selection === "rejected" && <Tag colorScheme="red">Rejected</Tag>}
                  {!u.selection && <Tag colorScheme="gray">Pending</Tag>}
                </Td>
                <Td>
                  <HStack>
                    <Button size="xs" colorScheme="green" variant={u.selection === "selected" ? "solid" : "outline"} isLoading={selecting === (u.email + "selected")} onClick={() => handleSelect(u.email, "selected")}>Select</Button>
                    <Button size="xs" colorScheme="red" variant={u.selection === "rejected" ? "solid" : "outline"} isLoading={selecting === (u.email + "rejected")} onClick={() => handleSelect(u.email, "rejected")}>Reject</Button>
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
