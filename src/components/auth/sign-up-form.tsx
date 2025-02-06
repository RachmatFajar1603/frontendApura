'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, set, useForm } from 'react-hook-form';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUsers } from '@/hooks/use-user';

import ResendVerification from './resend-verification';

interface FormValues {
  noIdentitas: string;
  namaLengkap: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUsers();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = React.useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  const [showVerification, setShowVerification] = React.useState<boolean>(false);
  const [registrationData, setRegistrationData] = React.useState<FormValues | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      noIdentitas: '',
      namaLengkap: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
  });

  const onSubmit = React.useCallback(
    async (values: FormValues): Promise<void> => {
      try {
        const { error, user, message } = await authClient.signUp(values);

        if (error) {
          setError('root', {
            type: 'success',
            message: 'Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.',
          });
          setSnackbarMessage('Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.');
          setOpenSnackbar(true);
          setSnackbarSeverity('success');
          setShowVerification(true);
          setRegistrationData(values);
          return;
        }

        if (user) {
          setSnackbarMessage('Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
          setShowVerification(true);
          setRegistrationData(values);
          await checkSession?.();
          router.refresh();
          router.push(paths.auth.signIn);
        } else {
          const errorMessage = 'Daftar gagal. Silahkan coba lagi.';
          setError('root', { type: 'server', message: errorMessage });
          setSnackbarMessage(errorMessage);
          setOpenSnackbar(true);
          setSnackbarSeverity('error');
        }
      } catch (err) {
        console.error('Kesalahan daftar:', err);
        setError('root', { type: 'server', message: 'Terjadi kesalahan tak terduga. Silakan coba lagi.' });
      } finally {
        setIsPending(false);
      }
    },
    [checkSession, router, setError]
  );

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ justifyContent: 'center', display: 'flex' }}>
          Selamat Datang
        </Typography>
        <Typography variant="subtitle2" sx={{ justifyContent: 'center', display: 'flex' }}>
          Silahkan Masukan Detail Anda Untuk Masuk
        </Typography>
        <Divider>Daftar</Divider>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="noIdentitas"
            rules={{ required: 'NIK is required' }}
            render={({ field }) => (
              <FormControl error={Boolean(errors.noIdentitas)}>
                <InputLabel>NIK/NPM</InputLabel>
                <OutlinedInput {...field} label="NIK" type="number" />
                {errors.noIdentitas ? <FormHelperText>{errors.noIdentitas.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="namaLengkap"
            rules={{ required: 'Full Name is required' }}
            render={({ field }) => (
              <FormControl error={Boolean(errors.namaLengkap)}>
                <InputLabel>Full Name</InputLabel>
                <OutlinedInput {...field} label="Full Name" />
                {errors.namaLengkap ? <FormHelperText>{errors.namaLengkap.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Entered value does not match email format',
              },
            }}
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            rules={{
              required: 'Phone Number is required',
              pattern: {
                value: /^[0-9\b]+$/,
                message: 'Entered value does not match phone number format',
              },
            }}
            render={({ field }) => (
              <FormControl error={Boolean(errors.phoneNumber)}>
                <InputLabel>Phone Number</InputLabel>
                <OutlinedInput {...field} label="Phone Number" type="tel" />
                {errors.phoneNumber ? <FormHelperText>{errors.phoneNumber.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password should be at least 6 characters',
              },
            }}
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary" variant="body2">
              Sudah punya akun?{' '}
              <Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
                Masuk
              </Link>
            </Typography>
          </Box>
          <Button
            disabled={isPending}
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#FFCC28',
              color: '#000',
              '&:hover': { bgcolor: '#FFE082' },
            }}
          >
            {isPending ? 'Sedang Daftar...' : 'Daftar'}
          </Button>
        </Stack>
      </form>

      {showVerification && registrationData ? <ResendVerification registrationData={registrationData} /> : null}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
