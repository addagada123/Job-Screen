import { Box, Heading, Input, Button, VStack, Text, Checkbox } from "@chakra-ui/react";

export default function AuthForm({ type = "login", onSubmit }) {
  return (
    <Box
      bg="rgba(30,38,51,0.7)"
      p={8}
      borderRadius="xl"
      boxShadow="2xl"
      maxW="400px"
      w="100%"
      mx="auto"
    >
      <Heading mb={6} textAlign="center" size="lg">
        {type === "login" ? "Welcome Back" : "Create Account"}
      </Heading>
      <form onSubmit={onSubmit}>
        <VStack spacing={4}>
          {type === "signup" && (
            <Input name="name" placeholder="Full Name" required />
          )}
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Password" required />
          {type === "signup" && (
            <Checkbox name="admin" colorScheme="cyan">Request for Admin Access</Checkbox>
          )}
          <Button colorScheme="cyan" type="submit" w="100%">
            {type === "login" ? "Sign In" : "Create Account"}
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
