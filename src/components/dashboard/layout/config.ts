import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    href: paths.dashboard.dashboard,
    icon: 'chart-pie',
    roles: ['ADMIN', 'USER', 'MAHASISWA', 'DEKAN', 'KADEP', 'KALAB', 'PENGAWAS_LAB', 'WD2'],
  },
  {
    key: 'peminjaman',
    title: 'Peminjaman',
    href: paths.pemrosesan.peminjaman,
    icon: 'borrow',
    roles: ['ADMIN', 'USER', 'MAHASISWA', 'DEKAN', 'KADEP', 'KALAB', 'PENGAWAS_LAB', 'WD2'],
  },
  {
    key: 'penyewaan',
    title: 'Penyewaan',
    href: paths.pemrosesan.penyewaan,
    icon: 'plugs-connected',
    roles: ['ADMIN', 'USER', 'MAHASISWA', 'DEKAN', 'KADEP', 'KALAB', 'PENGAWAS_LAB', 'WD2'],
  },
  {
    key: 'pengembalian',
    title: 'Pengembalian',
    href: paths.pemrosesan.pengembalian,
    icon: 'return',
    roles: ['ADMIN', 'USER', 'MAHASISWA', 'PENGAWAS_LAB', 'KALAB', 'DEKAN', 'WD2', 'KADEP'],
  },
  {
    key: 'perbaikan',
    title: 'Perbaikan',
    href: paths.pemrosesan.perbaikan,
    icon: 'tool',
    roles: ['ADMIN', 'DEKAN', 'WD2', 'KALAB', 'KADEP', 'PENGAWAS_LAB'],
  },
  {
    key: 'aset',
    title: 'Aset',
    roles: ['ADMIN', 'PENGAWAS_LAB', 'KALAB', 'DEKAN', 'WD2', 'KADEP'],
    items: [
      {
        key: 'alat',
        title: 'Aset Alat',
        href: paths.aset.alat,
        icon: 'tool',
        roles: ['ADMIN', 'PENGAWAS_LAB', 'KALAB'],
      },
      {
        key: 'ruangan',
        title: 'Aset Ruangan',
        href: paths.aset.ruangan,
        icon: 'room',
        roles: ['ADMIN', 'PENGAWAS_LAB'],
      },
      {
        key: 'fasilitas',
        title: 'Fasilitas',
        href: paths.lainnya.fasilitas,
        icon: 'cards-thress',
        roles: ['ADMIN', 'PENGAWAS_LAB'],
      },
    ],
  },
  {
    key: 'pengelolaanPenguna',
    title: 'Pengelolaan Pengguna',
    href: paths.lainnya.pengelolaanPenguna,
    icon: 'users',
    roles: ['ADMIN'],
  },
  {
    key: 'riwayat',
    title: 'Riwayat',
    href: paths.lainnya.riwayat,
    icon: 'history',
    roles: ['ADMIN', 'PENGAWAS_LAB', 'KALAB'],
  },
  { key: 'not-found', href: paths.errors.notFound },
] satisfies NavItemConfig[];
