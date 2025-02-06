'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useAlat } from '@/lib/aset/alat/useAlat';
import { useRuanganLab } from '@/lib/aset/RuanganLab/useRuanganLab';
import { useRuanganUmum } from '@/lib/aset/RuanganUmum/useRuanganUmum';
import { useFasilitas } from '@/lib/fasilitas/fasilitas';
import { usePeminjaman } from '@/lib/pemrosesan/peminjaman';
import { usePenyewaan } from '@/lib/pemrosesan/penyewaan';
import { useUsers } from '@/hooks/use-user';

import SummaryCard from './SummaryCard';

const PeminjamanStatusChart = dynamic(() => import('./PeminjamanStatusChart'), { ssr: false });
const AssetDistributionChart = dynamic(() => import('./AssetDistributionChart'), { ssr: false });

export default function DashboardPage() {
  const { user } = useUsers();
  const { peminjaman = [] } = usePeminjaman();
  const { penyewaan = [] } = usePenyewaan();
  const { alat = [] } = useAlat();
  const { ruanganUmum = [] } = useRuanganUmum();
  const { ruanganLab = [] } = useRuanganLab();
  const { fasilitas = [] } = useFasilitas();

  const isUserRole = user?.role === 'USER' || user?.role === 'MAHASISWA';
  const userPeminjaman = useMemo(
    () => (isUserRole && user?.id ? peminjaman.filter((p) => p.namaPeminjamId === user.id) : peminjaman),
    [isUserRole, user?.id, peminjaman]
  );

  const userPenyewaan = useMemo(
    () => (isUserRole && user?.id ? penyewaan.filter((p) => p.namaPenyewaId === user.id) : penyewaan),
    [isUserRole, user?.id, penyewaan]
  );

  const peminjamanStats = useMemo(() => {
    return userPeminjaman.reduce(
      (acc, p) => {
        if (p?.statusPengajuan && ['DISETUJUI', 'DITOLAK', 'PENDING'].includes(p.statusPengajuan)) {
          acc[p.statusPengajuan as keyof typeof acc] = (acc[p.statusPengajuan as keyof typeof acc] || 0) + 1;
        }
        return acc;
      },
      { DISETUJUI: 0, DITOLAK: 0, PENDING: 0 }
    );
  }, [userPeminjaman]);

  const penyewaanStats = useMemo(() => {
    return userPenyewaan.reduce(
      (acc, p) => {
        const status = p?.statusPengajuan as keyof typeof acc;
        if (status) {
          acc[status] = (acc[status] || 0) + 1;
        }
        return acc;
      },
      { DISETUJUI: 0, DITOLAK: 0, PENDING: 0 }
    );
  }, [userPenyewaan]);

  const monthlyStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthlyData = Array(12)
      .fill(0)
      .map((_, idx) => ({
        name: new Date(currentYear, idx).toLocaleString('default', { month: 'short' }),
        peminjaman: 0,
        penyewaan: 0,
      }));

    userPeminjaman.forEach((p) => {
      const month = new Date(p?.tanggalMulai).getMonth();
      if (month >= 0 && month < 12) monthlyData[month].peminjaman++;
    });

    userPenyewaan.forEach((p) => {
      const month = new Date(p?.tanggalMulai).getMonth();
      if (month >= 0 && month < 12) monthlyData[month].penyewaan++;
    });

    return monthlyData;
  }, [userPeminjaman, userPenyewaan]);

  const assetStats = [
    { name: 'Alat', value: alat.length },
    { name: 'Ruangan Umum', value: ruanganUmum.length },
    { name: 'Ruangan Lab', value: ruanganLab.length },
    { name: 'Fasilitas', value: fasilitas.length },
  ];

  return (
    <Stack sx={{ p: 3 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <SummaryCard title="Total Peminjaman" value={userPeminjaman.length} />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard title="Total Penyewaan" value={userPenyewaan.length} />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard title="Peminjaman Disetujui" value={peminjamanStats.DISETUJUI} />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard title="Penyewaan Disetujui" value={penyewaanStats.DISETUJUI} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="overline" mb={2}>
                Status Pengajuan
              </Typography>
              <PeminjamanStatusChart peminjamanStats={peminjamanStats} penyewaanStats={penyewaanStats} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="overline" mb={2}>
                Distribusi Aset
              </Typography>
              <AssetDistributionChart assetStats={assetStats} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="overline" mb={2}>
                Aktivitas Bulanan
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="peminjaman" stroke="#8884d8" />
                  <Line type="monotone" dataKey="penyewaan" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
