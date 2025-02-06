import React from 'react';
import { Box, Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import { ApproximateEquals } from '@phosphor-icons/react/dist/ssr/ApproximateEquals';
import { Asclepius } from '@phosphor-icons/react/dist/ssr/Asclepius';
import { AsteriskSimple } from '@phosphor-icons/react/dist/ssr/AsteriskSimple';
import { Atom } from '@phosphor-icons/react/dist/ssr/Atom';
import { Chalkboard } from '@phosphor-icons/react/dist/ssr/Chalkboard';
import { ChartLine } from '@phosphor-icons/react/dist/ssr/ChartLine';
import { FastForward } from '@phosphor-icons/react/dist/ssr/FastForward';

function About() {
  const services = [
    {
      icon: <Atom style={{ fontSize: 40, color: '#FFCC28' }} />,
      title: 'Pinjam dan Sewa Alat',
      description:
        'Layanan pinjam dan sewa berbagai peralatan laboratorium dengan sistem tracking dan manajemen yang efisien.',
    },
    {
      icon: <AsteriskSimple style={{ fontSize: 40, color: '#FFCC28' }} />,
      title: 'Reservasi Ruangan',
      description: 'Sistem pemesanan ruang laboratorium dengan penjadwalan dan manajemen penggunaan.',
    },
    {
      icon: <ApproximateEquals style={{ fontSize: 40, color: '#FFCC28' }} />,
      title: 'Status dan Tracking',
      description: 'Monitoring status peminjaman dan penggunaan fasilitas laboratorium secara real-time.',
    },
    {
      icon: <Asclepius style={{ fontSize: 40, color: '#FFCC28' }} />,
      title: 'Laporan Penggunaan',
      description: 'Dokumentasi dan pelaporan penggunaan alat serta ruangan laboratorium.',
    },
    {
      icon: <Asclepius style={{ fontSize: 40, color: '#FFCC28' }} />,
      title: 'Maintenance',
      description: 'Jadwal dan status pemeliharaan peralatan serta fasilitas laboratorium.',
    },
    {
      icon: <ChartLine style={{ fontSize: 40, color: '#FFCC28' }} />,
      title: 'Analisis Penggunaan',
      description: 'Statistik dan analisis penggunaan fasilitas untuk optimasi layanan.',
    },
  ];

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 10 }}>
        <Typography
          variant="h3"
          sx={{
            color: 'black',
            fontWeight: 600,
            mb: 2,
          }}
        >
          Sistem Manajemen
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#rgba(255,255,255,0.8)',
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          Kelola pinjam dan sewa alat dan reservasi ruangan laboratorium dengan efisien
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {services.map((service, index) => (
          <Grid
            item
            xs={12}
            md={6}
            lg={4}
            key={index}
            sx={{
              mb: { xs: 4, md: 6 },
            }}
          >
            <Card
              sx={{
                bgcolor: 'rgba(255, 204, 40, 0.05)',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
                position: 'relative',
                overflow: 'visible',
                border: '1px solid rgba(255, 204, 40, 0.2)',
                borderRadius: '20px',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 7 }}>{service.icon}</Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'black',
                    mb: 1,
                    fontWeight: 500,
                  }}
                >
                  {service.title}
                </Typography>
                <Typography
                  sx={{
                    color: 'black',
                    fontSize: '0.95rem',
                  }}
                >
                  {service.description}
                </Typography>
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    color: '#FFCC28',
                    opacity: 0.6,
                    '&:hover': {
                      opacity: 1,
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <FastForward />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default About;
