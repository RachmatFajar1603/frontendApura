import Image from 'next/image';
import Link from 'next/link';
import { Box, Button, Grid, Paper, Typography, useTheme } from '@mui/material';
import { Building } from '@phosphor-icons/react/dist/ssr/Building';
import { Desktop } from '@phosphor-icons/react/dist/ssr/Desktop';
import { Users } from '@phosphor-icons/react/dist/ssr/Users';

import { paths } from '@/paths';
import { CaretRight } from '@phosphor-icons/react/dist/ssr/CaretRight';

function HeroSection() {
  const primaryYellow = '#FFCC28';
  const secondaryYellow = '#FFE082';
  const darkText = '#2D2D2D';

  return (
    <Box
      sx={{
        background: '#FFFFFF',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background Decoration */}
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${primaryYellow} 30%, ${secondaryYellow} 90%)`,
          filter: 'blur(60px)',
          opacity: 0.1,
          top: '-100px',
          right: '-100px',
        }}
      />

      <Box
        sx={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: { xs: '40px 20px', md: '60px 40px' },
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Grid container spacing={6} alignItems="center">
          {/* Left Side Content */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  backgroundColor: primaryYellow,
                  color: darkText,
                  display: 'inline-block',
                  px: 3,
                  py: 1,
                  borderRadius: '30px',
                  mb: 4,
                  boxShadow: '0 4px 14px 0 rgba(255, 204, 40, 0.25)',
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  SISTEM PEMINJAMAN DAN PENYEWAAN
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  mb: 3,
                  color: darkText,
                }}
              >
                Peminjaman{' '}
                <Box
                  component="span"
                  sx={{
                    color: primaryYellow,
                    fontStyle: 'italic',
                  }}
                >
                  Alat & Ruangan
                </Box>{' '}
                Jadi Lebih Mudah
              </Typography>

              <Typography
                sx={{
                  fontSize: '1.2rem',
                  color: 'text.secondary',
                  mb: 6,
                  lineHeight: 1.6,
                }}
              >
                Sistem manajemen peminjaman dan penyewaan yang efisien untuk alat laboratorium dan ruangan. Ajukan,
                pantau, dan kelola peminjaman Anda dengan mudah.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 6 }}>
                <Link href={paths.auth.signIn}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: primaryYellow,
                      color: darkText,
                      px: 4,
                      py: 1.5,
                      borderRadius: '30px',
                      boxShadow: '0 4px 14px 0 rgba(255, 204, 40, 0.25)',
                      '&:hover': {
                        bgcolor: secondaryYellow,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(255, 204, 40, 0.3)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                    endIcon={<CaretRight />}
                  >
                    Ajukan Peminjaman dan Penyewaan
                  </Button>
                </Link>
              </Box>

              {/* Stats Section */}
              <Grid container spacing={4}>
                {[
                  { number: '100+', label: 'Alat Tersedia' },
                  { number: '25+', label: 'Ruangan' },
                  { number: '1000+', label: 'Peminjaman Sukses' },
                ].map((stat, index) => (
                  <Grid item xs={4} key={index}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: primaryYellow,
                          mb: 1,
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Right Side - Feature Cards */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              {/* Equipment Card */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: 'rgba(255, 204, 40, 0.05)',
                    borderRadius: '20px',
                    p: 4,
                    height: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 204, 40, 0.2)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                >
                  <Desktop size={40} color={primaryYellow} />
                  <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 600, color: darkText }}>
                    Peralatan Laboratorium
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Berbagai peralatan modern tersedia untuk mendukung kegiatan praktikum dan penelitian Anda
                  </Typography>
                </Paper>
              </Grid>

              {/* Room Booking Card */}
              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: 'rgba(255, 204, 40, 0.05)',
                    borderRadius: '20px',
                    p: 3,
                    height: '200px',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                    border: '1px solid rgba(255, 204, 40, 0.2)',
                  }}
                >
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Building size={32} color={primaryYellow} />
                    <Typography variant="h6" sx={{ mt: 2, color: darkText, fontWeight: 600 }}>
                      Ruang Lab
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      25+ ruangan yang dapat digunakan untuk kegiatan praktikum
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Usage Stats Card */}
              <Grid item xs={6}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: 'rgba(255, 204, 40, 0.05)',
                    borderRadius: '20px',
                    p: 3,
                    height: '200px',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                    border: '1px solid rgba(255, 204, 40, 0.2)',
                  }}
                >
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Users size={32} color={primaryYellow} />
                    <Typography variant="h6" sx={{ mt: 2, color: darkText, fontWeight: 600 }}>
                      Pengguna Aktif
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                      500+ mahasiswa dan dosen aktif menggunakan layanan
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Status Card */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: primaryYellow,
                    borderRadius: '20px',
                    p: 3,
                    height: '180px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      bgcolor: secondaryYellow,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: darkText }}>
                      Status Peminjaman
                    </Typography>
                    <Box>
                      <Typography variant="h4" sx={{ color: darkText, fontWeight: 'bold' }}>
                        85%
                      </Typography>
                      <Typography sx={{ color: darkText }}>Tingkat Ketersediaan Alat</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default HeroSection;