'use client';

import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle, Eye, EyeSlash, Phone, X } from '@phosphor-icons/react/dist/ssr';
import { Buildings } from '@phosphor-icons/react/dist/ssr/Buildings';
import { Envelope } from '@phosphor-icons/react/dist/ssr/Envelope';
import axios from 'axios';

import { authClient } from '@/lib/auth/client';
import { useDepartemen } from '@/lib/departemen/departemen';
import { useUsers } from '@/hooks/use-user';

const Profile: React.FC = () => {
  const { user } = useUsers();
  const { departemen } = useDepartemen();
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  console.log('user', user);

  const getDepartemenName = (departemenId: string) => {
    const foundDepartemen = departemen.find((d) => d.id === departemenId);
    return foundDepartemen ? foundDepartemen.nama : 'Unknown';
  };

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.id) {
      setError('User ID tidak ditemukan.');
      return;
    }

    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      setError('Token tidak ditemukan. Harap login kembali.');
      return;
    }

    try {
      const response = await authClient.updatePassword({
        id: user.id,
        oldPassword,
        newPassword,
      });

      if (response.error) {
        setError(response.error);
        setSuccess(false);
      } else {
        setSuccess(true);
        setError('');
        setOldPassword('');
        setNewPassword('');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('custom-auth-token');
        localStorage.removeItem('user');
        setError('Sesi Anda telah berakhir. Harap login kembali.');
      } else {
        setError('Terjadi kesalahan saat mengupdate password.');
      }
      setSuccess(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card
        sx={{
          borderRadius: 4,
          p: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        }}
      >
        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  background: 'linear-gradient(135deg, #FFCC28 0%, #FFB800 100%)',
                  boxShadow: '0 4px 20px rgba(255, 204, 40, 0.2)',
                  color: '#000',
                }}
              >
                {getInitials(user?.namaLengkap || '')}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {user?.namaLengkap}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {user?.noIdentitas || ''}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 3 }}>
              Informasi Profile
            </Typography>

            {/* Info Cards */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: 2,
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Envelope size={24} weight="light" />
                <Typography>{user?.email}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: user?.isVerified ? '#405DE6' : '#FF4D4D', 
                  border: user?.isVerified ? '2px solid #405DE6' : '2px solid #FF4D4D',
                }}
              >
                {user?.isVerified ? (
                  <CheckCircle size={20} weight="bold" color="white" />
                ) : (
                  <X size={20} weight="bold" color="white" />
                )}
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                },
              }}
            >
              <Phone size={24} weight="light" />
              <Typography>{user?.phoneNumber}</Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(245, 245, 245, 0.6)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                },
              }}
            >
              <Buildings size={24} weight="light" />
              <Typography>{getDepartemenName(user?.departemenId || '')}</Typography>
            </Box>
          </Grid>

          {/* Password Change Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 3 }}>
              Change Password
            </Typography>
            <form onSubmit={handleUpdatePassword}>
              <TextField
                fullWidth
                name="oldPassword"
                label="Current Password"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => { setOldPassword(e.target.value); }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => { setShowOldPassword(!showOldPassword); }}>
                        {showOldPassword ? <EyeSlash /> : <Eye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                name="newPassword"
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => { setShowNewPassword(!showNewPassword); }}>
                        {showNewPassword ? <EyeSlash /> : <Eye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              {error ? <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert> : null}

              {success ? <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                  Password successfully updated!
                </Alert> : null}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                Update Password
              </Button>
            </form>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default Profile;
