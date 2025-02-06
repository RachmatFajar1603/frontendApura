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
import { Controller, useForm } from 'react-hook-form';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUsers } from '@/hooks/use-user';

interface Values {
  noIdentitas: string;
  password: string;
}

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUsers();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = React.useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: {
      noIdentitas: '',
      password: '',
    },
  });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      try {
        const { error, user } = await authClient.signInWithPassword(values);

        if (error) {
          setError('root', { type: 'server', message: 'Login gagal. Silakan coba lagi.' });
          setSnackbarMessage('Login gagal. Silakan coba lagi.');
          setOpenSnackbar(true);
          setSnackbarSeverity('error');
          ('Daftar gagal. Silahkan Coba Lagi');
          return;
        }

        if (user) {
          setSnackbarMessage('Login berhasil');
          setOpenSnackbar(true);
          setSnackbarSeverity('success');
          setTimeout(async () => {
            await checkSession?.();
            router.refresh();
          }, 1000);
        } else {
          setError('root', { type: 'server', message: 'Login gagal. Silakan coba lagi.' });
          setSnackbarMessage('Login gagal. Silakan coba lagi.');
          setOpenSnackbar(true);
          setSnackbarSeverity('error');
        }
      } catch (err) {
        console.error('Kesalahan login:', err);
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
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ justifyContent: 'center', display: 'flex' }}>
          Selamat Datang
        </Typography>
        <Typography variant="subtitle2" sx={{ justifyContent: 'center', display: 'flex' }}>
          Silakan Masukkan Detail Anda Untuk Masuk
        </Typography>
        <Divider>Masuk</Divider>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="noIdentitas"
            rules={{
              required: 'NPM/NIP/NIK wajib diisi',
              validate: (value) => {
                return value.trim() !== '' || 'NPM/NIP/NIK tidak boleh kosong'; // Check for non-empty string
              },
            }}
            render={({ field: { onChange, value, ...field } }) => (
              <FormControl error={Boolean(errors.noIdentitas)}>
                <InputLabel>NPM/NIP/NIK</InputLabel>
                <OutlinedInput
                  {...field}
                  value={value === undefined ? '' : value} // Keep it as string
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange(val); // No need to convert to number
                  }}
                  label="NPM/NIP/NIK"
                  type="text" // Change to text
                />
                {errors.noIdentitas ? <FormHelperText>{errors.noIdentitas.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            rules={{ required: 'Password wajib diisi' }}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              Lupa password?
            </Link> */}
            <Typography color="text.secondary" variant="body2">
              Belum punya akun?{' '}
              <Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
                Daftar
              </Link>
            </Typography>
          </Box>
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button
            disabled={isPending}
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#FFCC28',
              color: '#000',
              '&:hover': { bgcolor: '#FFE082'}
            }}
          >
            {isPending ? 'Sedang Masuk...' : 'Masuk'}
          </Button>
        </Stack>
      </form>
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
