import { useState } from "react";
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea, useToast, Alert, AlertIcon } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function RetakeRequestModal({ isOpen, onClose }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (reason.length < 10) {
      toast({ title: "Reason must be at least 10 characters", status: "warning", duration: 1500 });
      return;
    }

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "https://job-screen.onrender.com";
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_BASE}/api/retake-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email, reason })
      });
      
      if (!res.ok) throw new Error('Failed to submit');
      
      toast({ title: "Retake request submitted!", status: "success", duration: 1500 });
      onClose();
      navigate('/dashboard/results');
    } catch (err) {
      toast({ title: "Failed to submit request", status: "error", duration: 1500 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent bg="gray.800" border="1px solid rgba(255,255,255,0.1)">
        <ModalHeader>Request to Retake Test</ModalHeader>
        <ModalBody pb={6}>
          <Alert status="info" mb={4}>
            <AlertIcon />
            Provide a clear reason why you need to retake the test. Admin will review your request.
          </Alert>
          <Textarea
            placeholder="Please state your reason for requesting a test retake..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            minH="120px"
            resize="vertical"
            bg="rgba(15,18,24,0.8)"
            borderColor="rgba(255,255,255,0.2)"
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">Cancel</Button>
          <Button 
            colorScheme="purple" 
            onClick={handleSubmit} 
            isLoading={loading}
            isDisabled={reason.length < 10}
          >
            Submit Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
