import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { googleAuth } from '../api';

export default function GoogleAuthButton({ mode = 'login' }) {
  const toast = useToast();
  const navigate = useNavigate();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const result = await googleAuth(credentialResponse.credential, mode);
          if (result && result.user) {
            localStorage.setItem("user", JSON.stringify(result.user));
            if (result.token) localStorage.setItem("token", result.token);
          }
          toast({ title: 'Google Auth Success', status: 'success', duration: 1500 });
          navigate('/dashboard');
        } catch (err) {
          toast({ title: 'Google Auth Failed', description: err.message, status: 'error', duration: 1500 });
        }
      }}
      onError={() => {
        toast({ title: 'Google Auth Failed', status: 'error', duration: 1500 });
      }}
      width={300}
    />
  );
}
