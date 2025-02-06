'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppBar, Box, Button, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CaretRight } from '@phosphor-icons/react/dist/csr/CaretRight';

import { paths } from '@/paths';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white' }}>
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ ml: 5 }}>
            <Image src="/assets/logo_fmipa.png" alt="logo" width={150} height={75} layout="fixed" />
          </IconButton>
          {isMobile ? (
            <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
              Nama Universitas
            </Typography>
          ) : (
            <Box sx={{ flexGrow: 1 }} />
          )}
          <Box sx={{ mr: 5 }}>
            <Link href={paths.auth.signIn}>
              <Button
                sx={{
                  color: 'black',
                  mr: 2,
                  '&:hover': {
                    bgcolor: '#FFCC28',
                    transform: 'translateY(-5px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Login
              </Button>
            </Link>
            <Link href={paths.auth.signUp}>
              <Button
                variant="contained"
                sx={{
                  color: 'black',
                  bgcolor: '#FFCC28',
                  '&:hover': {
                    bgcolor: '#FFCC28',
                    transform: 'translateY(-5px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                endIcon={<CaretRight />}
              >
                Register
              </Button>
            </Link>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
