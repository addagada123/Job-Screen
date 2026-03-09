import { Flex, Box, Button, Spacer, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding={4}
      bg="rgba(15,18,24,0.9)"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Box>
        <Link to="/">
          <Text fontFamily="'Orbitron', sans-serif" fontSize="2xl" fontWeight="bold">
            ⚡ JobScreen
            <Text as="span" color="#00d4ff">
              Pro
            </Text>
          </Text>
        </Link>
      </Box>
      <Spacer />
      <Box>
        <Button as={Link} to="/login" variant="outline" colorScheme="cyan" mr={3}>
          Login
        </Button>
        <Button as={Link} to="/signup" colorScheme="cyan">
          Sign Up
        </Button>
      </Box>
    </Flex>
  );
}
