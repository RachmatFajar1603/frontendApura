'use client';

import React from 'react';
import Image from 'next/image';
import { Box } from '@mui/material';

export default function ScanQRLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Box
        sx={{
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Image
          src="/assets/logo_fmipa_hitam.webp"
          alt="FMIPA Logo"
          width={150}
          height={60}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Box>
      {children}
    </Box>
  );
}
