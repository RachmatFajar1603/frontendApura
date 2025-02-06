export const paths = {
  home: '/',
  auth: { signIn: '/sign-in', signUp: '/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    dashboard: '/dashboard',
  },
  pemrosesan:{
    peminjaman:'/peminjaman',
    penyewaan:'/penyewaan',
    pengembalian:'/pengembalian',
    perbaikan:'/perbaikan',
  },
  aset:{
    alat:'/alat',
    ruangan:'/ruangan'
  },
  lainnya:{
    pengelolaanPenguna:'/pengelolaan-pengguna',
    riwayat:'/riwayat',
    fasilitas: '/fasilitas',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
