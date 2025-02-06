import React from 'react';
import { Box, Container, Grid, Typography, IconButton, Stack, Link } from '@mui/material';
import { FacebookLogo } from '@phosphor-icons/react/dist/ssr/FacebookLogo';
import { XLogo } from '@phosphor-icons/react/dist/ssr/XLogo';
import { InstagramLogo } from '@phosphor-icons/react/dist/ssr/InstagramLogo';
import { LinkedinLogo } from '@phosphor-icons/react/dist/ssr/LinkedinLogo';


function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Layanan',
      links: [
        { name: 'Peminjaman Alat', href: '/peminjaman-alat' },
        { name: 'Reservasi Ruangan', href: '/reservasi-ruangan' },
        { name: 'Jadwal Lab', href: '/jadwal' },
        { name: 'Status Peminjaman', href: '/status' },
      ],
    },
    {
      title: 'Informasi',
      links: [
        { name: 'Panduan Peminjaman', href: '/panduan' },
        { name: 'Syarat & Ketentuan', href: '/terms' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Kontak', href: '/kontak' },
      ],
    },
    {
      title: 'Kontak',
      links: [
        { name: 'lab@university.ac.id', href: 'mailto:lab@university.ac.id' },
        { name: '(021) 1234-5678', href: 'tel:+62211234567' },
        { name: 'Gedung Lab Terpadu Lt.2', href: '/lokasi' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FacebookLogo />, href: '#', label: 'Facebook' },
    { icon: <XLogo />, href: '#', label: 'Twitter' },
    { icon: <InstagramLogo />, href: '#', label: 'Instagram' },
    { icon: <LinkedinLogo />, href: '#', label: 'LinkedIn' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        color: 'black',
        py: 6,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              APURA
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'black' }}>
              Sistem manajemen peminjaman dan penyewaan alat serta ruangan laboratorium yang efisien dan terintegrasi.
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  sx={{
                    color: 'black',
                    '&:hover': {
                      color: '#ffcc28',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <Grid item xs={12} sm={6} md={2.5} key={section.title}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link) => (
                  <Link
                    key={link.name}
                    // href={link.href}
                    underline="none"
                    sx={{
                      color: 'black',
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: '#ffcc28',
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: 'black' }}>
            © {currentYear} RachmatFajarAlifanNaufallyAtha. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;