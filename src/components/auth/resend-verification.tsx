'use client';

import React from 'react';
import { Alert, AlertTitle } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { EnvelopeSimple } from '@phosphor-icons/react';

import { authClient } from '@/lib/auth/client';
import type { SignUpParams } from '@/lib/auth/client';

interface ResendVerificationProps {
  registrationData: SignUpParams;
}

const ResendVerification: React.FC<ResendVerificationProps> = ({ registrationData }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const { error, message } = await authClient.resendVerification(registrationData);

      if (error) {
        setSnackbarMessage(error);
        setSnackbarSeverity('error');
      } else {
        setSnackbarMessage(message || 'Email verifikasi telah dikirim ulang!');
        setSnackbarSeverity('success');
      }
    } catch (error) {
      setSnackbarMessage('Terjadi kesalahan. Silakan coba lagi nanti.');
      setSnackbarSeverity('error');
    } finally {
      setIsLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Alert
        severity="info"
        sx={{
          mb: 2,
          backgroundColor: 'rgba(229, 246, 253, 0.5)',
          '& .MuiAlert-icon': {
            color: '#0288d1',
          },
        }}
      >
        <AlertTitle>Verifikasi Email</AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Silakan periksa email Anda untuk verifikasi akun. Tidak menerima email? Klik tombol di bawah untuk mengirim
          ulang.
        </Typography>
        <Button
          variant="outlined"
          color="info"
          startIcon={<EnvelopeSimple weight="bold" />}
          onClick={handleResend}
          disabled={isLoading || registrationData.isVerified}
          sx={{
            mt: 1,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(2, 136, 209, 0.04)',
            },
          }}
        >
          {isLoading ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
        </Button>
      </Alert>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResendVerification;
