import React from 'react';
import Link from 'next/link';
import { Box, Button, Typography } from '@mui/material';

import { paths } from '@/paths';
import { CaretRight } from '@phosphor-icons/react/dist/ssr/CaretRight';

function Card() {
  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: '#FFE082',
        minHeight: '60vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
          linear-gradient(45deg, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
          backgroundSize: '30px 30px',
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '800px',
          mx: 'auto',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: 'black',
            fontWeight: 700,
            mb: 3,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            lineHeight: 1.2,
          }}
        >
          Pinjam dan Sewa Alat Serta Ruangan Menjadi Lebih Mudah
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: 'black',
            mb: 5,
            maxWidth: '600px',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Percepat proses pinjam dan sewa dengan sistem kami. Kurangi waktu tunggu dan optimalkan penggunaan aset
          . Mulai sekarang!
        </Typography>

        <Link href={paths.auth.signIn}>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'black',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: '50px',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#2D2D2D',
                transform: 'translateY(-4px)',
              },
              transition: 'transform 0.2s',
              boxShadow: 'none',
            }}
            endIcon={<CaretRight />}
          >
            Mulai Pinjam atau Sewa
          </Button>
        </Link>
      </Box>

      {/* Decorative lines */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          zIndex: 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '200%',
            height: '200%',
            top: '-50%',
            left: '-50%',
            background: `
            linear-gradient(45deg, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
            backgroundSize: '40px 40px',
            transform: 'rotate(30deg)',
          },
        }}
      />
    </Box>
  );
}

export default Card;
