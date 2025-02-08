// import * as React from 'react';
// import RouterLink from 'next/link';
// import Box from '@mui/material/Box';
// import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
// import { paths } from '@/paths';
// import { DynamicLogo } from '@/components/core/logo';
// export interface LayoutProps {
//   children: React.ReactNode;
// }
// export function Layout({ children }: LayoutProps): React.JSX.Element {
//   return (
//     <Box
//       sx={{
//         display: { xs: 'flex', lg: 'flex' },
//         flexDirection: '',
//         gridTemplateColumns: '1fr 1fr',
//         minHeight: '100%',
//       }}
//     >
//       <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
//         <Box sx={{ p: 3 }}>
//           <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}></Box>
//         </Box>
//         <Box
//           sx={{
//             alignItems: 'center',
//             display: 'flex',
//             flexDirection: 'column',
//             flex: '1 1 auto',
//             justifyContent: 'center',
//             p: 3,
//           }}
//         >
//           <DynamicLogo colorDark="light" colorLight="dark" height={150} width={350} />
//           <Box sx={{ maxWidth: '450px', width: '100%', mt: 3 }}>{children}</Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// }

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Building } from '@phosphor-icons/react/dist/ssr/Building';
import { Clipboard } from '@phosphor-icons/react/dist/ssr/Clipboard';
import { Shield } from '@phosphor-icons/react/dist/ssr/Shield';
import { Users } from '@phosphor-icons/react/dist/ssr/Users';

import { paths } from '@/paths';
import { DynamicLogo } from '@/components/core/logo';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  const features = [
    {
      icon: <Building size={24} />,
      title: 'Peminjaman & Penyewaan',
      description: 'Layanan peminjaman ruangan dan alat laboratorium.',
    },
    {
      icon: <Users size={24} />,
      title: 'Multi-Level Akses',
      description:
        'Sistem terintegrasi untuk mahasiswa (NPM), operator fakultas, kepala lab, kepala departemen, dan dekan (NIP). Serta masyarakat umum (NIK).',
    },
    {
      icon: <Clipboard size={24} />,
      title: 'Manajemen Aset',
      description: 'Pengelolaan inventaris laboratorium dan ruangan dengan sistem persetujuan bertingkat.',
    },
    {
      icon: <Shield size={24} />,
      title: 'Fitur Utama',
      description: 'Pengajuan online, tracking status, notifikasi persetujuan, dan laporan dalam format Excel.',
    },
  ];

  return (
    <Box
      sx={{
        display: { xs: 'flex', lg: 'grid' },
        flexDirection: 'column',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100%',
      }}
    >
      <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <Box sx={{ p: 3 }}>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}>
            <DynamicLogo colorDark="light" colorLight="dark" height={50} width={122} />
          </Box>
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}>
          <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE082 100%)',
          display: { xs: 'none', lg: 'flex' },
          justifyContent: 'center',
          p: 3,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255, 204, 40, 0.1) 0%, rgba(255, 204, 40, 0.05) 100%)',
            zIndex: 1,
          },
        }}
      >
        <Stack spacing={4} sx={{ maxWidth: '480px', position: 'relative', zIndex: 2 }}>
          <Box textAlign="center">
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: '#000000',
                textShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              APURA FMIPA
            </Typography>
            <Typography variant="h6" sx={{ color: '#333333', mb: 4, fontWeight: 500 }}>
              Sistem Peminjaman Penyewaan Ruangan dan Alat
              <br />
              FMIPA USK
            </Typography>
          </Box>

          <Stack spacing={3}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 204, 40, 0.3)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    color: '#FFAB00',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  {feature.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#000000' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#555555' }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#333333', fontWeight: 500 }}>
              © 2025 APURA USK. All rights reserved.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
