import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';

// ----------------------------------------------------------------------

export default function ForgotPasswordView() {
  const theme = useTheme();

  const router = useRouter();
  
  /* eslint-disable */
  const [searchParams, setSearchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);

  const handleResponse = (data) => {
    if (data.code !== 200) {
      setError(true);
    } else {
      router.push('/login');
    }
  }

  /* eslint-disable */
  const handleClick = (keypressed) => {
    if (keypressed !== 'Enter') return;
    fetch("http://"+window.location.hostname+":5000/forgot-password", {
      method:'POST',
      mode:'cors',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        'email':email,
        'hostname':window.location.hostname
      })
    }).then(response => response.json())
    .then(data => handleResponse(data)).catch(e => {
      setError(true);
    });
  };


  const renderForm = (
    <>
      <Stack spacing={3}>

        
      <TextField name="email" error={error} label="Email address" onInput={e => setEmail(e.target.value)}/>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}/>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={(e) => {handleClick('Enter')}}
      >
        Send Reset Link
      </LoadingButton>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Reset Password</Typography>
          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            Enter your email address and if your account exists a reset password link will be sent to it. The link is only valid for 30 minutes. 
          </Typography>
          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
