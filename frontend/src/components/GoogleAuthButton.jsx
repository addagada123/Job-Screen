import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function GoogleAuthButton({ mode = 'login' }) {
  const toast = useToast();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    // Send credentialResponse.credential (JWT) to backend for verification and user creation/login
    try {
      const res = await fetch(`http://localhost:3000/api/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential, mode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google Auth failed');
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Google Auth failed', description: err.message, status: 'error' });
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => toast({ title: 'Google Auth failed', status: 'error' })}
      width="100%"
    />
  );
}
