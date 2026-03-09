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
          }
          toast({ title: 'Google Auth Success', status: 'success' });
          navigate('/dashboard');
        } catch (err) {
          toast({ title: 'Google Auth Failed', description: err.message, status: 'error' });
        }
      }}
      onError={() => {
        toast({ title: 'Google Auth Failed', status: 'error' });
      }}
      width={300}
    />
  );
}

